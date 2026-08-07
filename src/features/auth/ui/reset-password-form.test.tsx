import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResetPasswordForm } from "./reset-password-form";

jest.mock("@/components/auth/auth-field", () => ({
  AuthField: ({
    id,
    label,
    ...props
  }: { id: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} {...props} type="text" />
    </div>
  ),
}));

jest.mock("@/components/auth/auth-form-header", () => ({
  AuthFormHeader: ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  ),
}));

jest.mock("@/components/auth/auth-form-submit-button", () => ({
  AuthFormSubmitButton: ({
    children,
    loading,
    loadingText,
  }: {
    children: React.ReactNode;
    loading?: boolean;
    loadingText?: string;
  }) => (
    <button type="submit" disabled={loading}>
      {loading ? loadingText : children}
    </button>
  ),
}));

jest.mock("@/components/auth/auth-form-root-error", () => ({
  AuthFormRootError: ({ message }: { message?: string }) =>
    message ? <p role="alert">{message}</p> : null,
}));

jest.mock("@/components/auth/global-loader", () => ({
  GlobalLoader: () => <div data-testid="global-loader" />,
}));

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());

const mockToastSuccess = jest.fn();
jest.mock("sonner", () => ({
  toast: { success: (...args: unknown[]) => mockToastSuccess(...args) },
}));

const mockReplace = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    refresh: mockRefresh,
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/auth/reset-password",
  useSearchParams: () => new URLSearchParams(),
}));

let fetchMock: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  fetchMock = jest.fn();
  global.fetch = fetchMock;
});

describe("ResetPasswordForm", () => {
  it("renders the form with title, fields, submit button, and back-to-login link", () => {
    render(<ResetPasswordForm token="test-token" />);
    expect(screen.getByRole("heading", { name: "title" })).toBeInTheDocument();
    expect(screen.getByText("subtitle")).toBeInTheDocument();
    expect(screen.getByLabelText("newPasswordLabel")).toBeInTheDocument();
    expect(screen.getByLabelText("confirmLabel")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "submit" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "backToLogin" })).toHaveAttribute(
      "href",
      "/auth/login",
    );
  });

  it("shows validation errors when fields are empty", async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm token="test-token" />);
    await user.click(screen.getByRole("button", { name: "submit" }));
    expect(screen.getByText("passwordMin")).toBeInTheDocument();
    expect(screen.getByText("confirmRequired")).toBeInTheDocument();
  });

  it("shows password mismatch error when passwords do not match", async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm token="test-token" />);
    await user.type(screen.getByLabelText("newPasswordLabel"), "password123");
    await user.type(screen.getByLabelText("confirmLabel"), "different456");
    await user.click(screen.getByRole("button", { name: "submit" }));
    expect(screen.getByText("passwordMismatch")).toBeInTheDocument();
  });

  it("calls fetch with the token and new password", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const user = userEvent.setup();
    render(<ResetPasswordForm token="test-token" />);
    await user.type(screen.getByLabelText("newPasswordLabel"), "newpass123");
    await user.type(screen.getByLabelText("confirmLabel"), "newpass123");
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: "newpass123", token: "test-token" }),
      }),
    );
  });

  it("shows a toast and navigates to login on success", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const user = userEvent.setup();
    render(<ResetPasswordForm token="test-token" />);
    await user.type(screen.getByLabelText("newPasswordLabel"), "newpass123");
    await user.type(screen.getByLabelText("confirmLabel"), "newpass123");
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith("success");
      expect(screen.getByTestId("global-loader")).toBeInTheDocument();
      expect(mockReplace).toHaveBeenCalledWith("/auth/login");
    });
  });

  it("shows the root error when the API returns an error", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    const user = userEvent.setup();
    render(<ResetPasswordForm token="test-token" />);
    await user.type(screen.getByLabelText("newPasswordLabel"), "newpass123");
    await user.type(screen.getByLabelText("confirmLabel"), "newpass123");
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("failed");
    });
  });

  it("shows the API message when provided with error", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Reset link is invalid" }),
    });

    const user = userEvent.setup();
    render(<ResetPasswordForm token="test-token" />);
    await user.type(screen.getByLabelText("newPasswordLabel"), "newpass123");
    await user.type(screen.getByLabelText("confirmLabel"), "newpass123");
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Reset link is invalid");
    });
  });

  it("shows the unexpected error when fetch fails", async () => {
    fetchMock.mockRejectedValue(new Error("Network error"));

    const user = userEvent.setup();
    render(<ResetPasswordForm token="test-token" />);
    await user.type(screen.getByLabelText("newPasswordLabel"), "newpass123");
    await user.type(screen.getByLabelText("confirmLabel"), "newpass123");
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("unexpectedError");
    });
  });
});
