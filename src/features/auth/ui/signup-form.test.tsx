import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignupForm } from "./signup-form";

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

jest.mock("@/lib/auth/session", () => ({
  setAuthenticatedSession: jest.fn(),
  useSession: () => ({ user: null, loading: false, isAuthenticated: false }),
}));

jest.mock("@/lib/auth/token-store", () => ({
  setTokens: jest.fn(),
}));

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());

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
  usePathname: () => "/auth/signup",
  useSearchParams: () => new URLSearchParams(),
}));

const VALID_PAYLOAD = {
  accessToken: "at",
  refreshToken: "rt",
  user: { id: "42", email: "test@example.com", profile: { full_name: "Test" } },
};

let fetchMock: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  fetchMock = jest.fn();
  global.fetch = fetchMock;
});

describe("SignupForm", () => {
  it("renders the form with title, fields, submit button, and link to login", () => {
    render(<SignupForm />);
    expect(screen.getByRole("heading", { name: "title" })).toBeInTheDocument();
    expect(screen.getByText("subtitle")).toBeInTheDocument();
    expect(screen.getByLabelText("emailLabel")).toBeInTheDocument();
    expect(screen.getByLabelText("passwordLabel")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "submit" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "hasAccount" })).toHaveAttribute("href", "/auth/login");
  });

  it("shows validation errors when fields are empty on submit", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);
    await user.click(screen.getByRole("button", { name: "submit" }));
    expect(screen.getByText("emailRequired")).toBeInTheDocument();
    expect(screen.getByText("passwordMin")).toBeInTheDocument();
  });

  it("shows invalid email error for an invalid email", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);
    await user.type(screen.getByLabelText("emailLabel"), "not-an-email");
    await user.type(screen.getByLabelText("passwordLabel"), "password123");
    await user.click(screen.getByRole("button", { name: "submit" }));
    expect(await screen.findByText("emailInvalid")).toBeInTheDocument();
  });

  it("shows min password error when password is too short", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);
    await user.type(screen.getByLabelText("emailLabel"), "test@example.com");
    await user.type(screen.getByLabelText("passwordLabel"), "short");
    await user.click(screen.getByRole("button", { name: "submit" }));
    expect(await screen.findByText("passwordMin")).toBeInTheDocument();
  });

  it("calls fetch with the correct payload on submit", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => VALID_PAYLOAD,
    });

    const user = userEvent.setup();
    render(<SignupForm />);
    await user.type(screen.getByLabelText("emailLabel"), "test@example.com");
    await user.type(screen.getByLabelText("passwordLabel"), "password123");
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: "test@example.com", password: "password123" }),
      }),
    );
  });

  it("shows the global loader and navigates on success", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => VALID_PAYLOAD,
    });

    const { setAuthenticatedSession } = await import("@/lib/auth/session");
    const { setTokens } = await import("@/lib/auth/token-store");

    const user = userEvent.setup();
    render(<SignupForm />);
    await user.type(screen.getByLabelText("emailLabel"), "test@example.com");
    await user.type(screen.getByLabelText("passwordLabel"), "password123");
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(setTokens).toHaveBeenCalledWith("at", "rt");
      expect(setAuthenticatedSession).toHaveBeenCalledWith(VALID_PAYLOAD.user);
      expect(screen.getByTestId("global-loader")).toBeInTheDocument();
      expect(mockReplace).toHaveBeenCalledWith("/verify-email");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("shows the root error when the API returns an error", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    const user = userEvent.setup();
    render(<SignupForm />);
    await user.type(screen.getByLabelText("emailLabel"), "test@example.com");
    await user.type(screen.getByLabelText("passwordLabel"), "password123");
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("failed");
    });
  });

  it("shows the root error when fetch fails", async () => {
    fetchMock.mockRejectedValue(new Error("Network error"));

    const user = userEvent.setup();
    render(<SignupForm />);
    await user.type(screen.getByLabelText("emailLabel"), "test@example.com");
    await user.type(screen.getByLabelText("passwordLabel"), "password123");
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("unexpectedError");
    });
  });

  it("shows the API message when payload.user is not an object", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Account creation blocked" }),
    });

    const user = userEvent.setup();
    render(<SignupForm />);
    await user.type(screen.getByLabelText("emailLabel"), "test@example.com");
    await user.type(screen.getByLabelText("passwordLabel"), "password123");
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Account creation blocked");
    });
  });
});
