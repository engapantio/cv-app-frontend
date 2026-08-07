import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ForgotPasswordForm } from "./forgot-password-form";

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

jest.mock("lucide-react", () => ({
  MailCheck: () => <span data-testid="mail-check" />,
}));

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());

let fetchMock: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  fetchMock = jest.fn();
  global.fetch = fetchMock;
});

describe("ForgotPasswordForm", () => {
  it("renders the form with title, email field, submit button, and cancel link", () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByRole("heading", { name: "title" })).toBeInTheDocument();
    expect(screen.getByText("subtitle")).toBeInTheDocument();
    expect(screen.getByLabelText("emailLabel")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "submit" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "cancel" })).toHaveAttribute("href", "/auth/login");
  });

  it("shows validation errors when email is empty", async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);
    await user.click(screen.getByRole("button", { name: "submit" }));
    expect(screen.getByText("emailRequired")).toBeInTheDocument();
  });

  it("shows invalid email error for an invalid email", async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);
    await user.type(screen.getByLabelText("emailLabel"), "not-an-email");
    await user.click(screen.getByRole("button", { name: "submit" }));
    expect(await screen.findByText("emailInvalid")).toBeInTheDocument();
  });

  it("sends the email on submit", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const user = userEvent.setup();
    render(<ForgotPasswordForm />);
    await user.type(screen.getByLabelText("emailLabel"), "test@example.com");
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com" }),
      }),
    );
  });

  it("shows the success state after a successful submit", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const user = userEvent.setup();
    render(<ForgotPasswordForm />);
    await user.type(screen.getByLabelText("emailLabel"), "test@example.com");
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(screen.getByTestId("mail-check")).toBeInTheDocument();
      expect(screen.getByText("sentTitle")).toBeInTheDocument();
      expect(screen.getByText("sentText")).toBeInTheDocument();
      expect(screen.getByText("sentSpam")).toBeInTheDocument();
    });
    expect(screen.getByRole("link", { name: "cancel" })).toHaveAttribute("href", "/auth/login");
  });

  it("shows the unavailable error for a 503 response", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({}),
    });

    const user = userEvent.setup();
    render(<ForgotPasswordForm />);
    await user.type(screen.getByLabelText("emailLabel"), "test@example.com");
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("unavailable");
    });
  });

  it("shows the failed error for a non-503 error response", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({}),
    });

    const user = userEvent.setup();
    render(<ForgotPasswordForm />);
    await user.type(screen.getByLabelText("emailLabel"), "test@example.com");
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("failed");
    });
  });

  it("shows the failed message from the API when provided", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: "Rate limited" }),
    });

    const user = userEvent.setup();
    render(<ForgotPasswordForm />);
    await user.type(screen.getByLabelText("emailLabel"), "test@example.com");
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Rate limited");
    });
  });

  it("shows the unexpected error when fetch fails", async () => {
    fetchMock.mockRejectedValue(new Error("Network error"));

    const user = userEvent.setup();
    render(<ForgotPasswordForm />);
    await user.type(screen.getByLabelText("emailLabel"), "test@example.com");
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("unexpectedError");
    });
  });
});
