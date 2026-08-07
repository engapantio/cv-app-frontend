import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useMutation } from "@apollo/client/react";
import { VerifyEmailForm } from "./verify-email-form";

jest.mock("@apollo/client/react", () => ({ useMutation: jest.fn() }));

jest.mock("@/gql/generated/graphql", () => ({
  VerifyMailDocument: { kind: "Document", definitions: [] },
}));

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

jest.mock("@/lib/auth/session", () => ({
  markUserVerified: jest.fn(),
  useSession: jest.fn(),
}));

jest.mock("lucide-react", () => ({
  CheckCircle2: () => <span data-testid="check-circle" />,
  Loader2: () => <span data-testid="loader" />,
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
  usePathname: () => "/verify-email",
  useSearchParams: () => new URLSearchParams(),
}));

const mockUseMutation = useMutation as unknown as jest.Mock;
const { markUserVerified, useSession } = jest.requireMock("@/lib/auth/session");

beforeEach(() => {
  jest.clearAllMocks();
  mockUseMutation.mockReturnValue([jest.fn(), { loading: false, error: undefined }]);
  useSession.mockReturnValue({ user: null, loading: false, isAuthenticated: false });
});

describe("VerifyEmailForm", () => {
  it("renders the form with title, otp field, submit button, and skip link", () => {
    render(<VerifyEmailForm userId="42" />);
    expect(screen.getByRole("heading", { name: "title" })).toBeInTheDocument();
    expect(screen.getByText("subtitle")).toBeInTheDocument();
    expect(screen.getByLabelText("otpLabel")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "submit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "skip" })).toBeInTheDocument();
  });

  it("shows validation errors when otp is empty", async () => {
    const user = userEvent.setup();
    render(<VerifyEmailForm userId="42" />);
    await user.click(screen.getByRole("button", { name: "submit" }));
    expect(screen.getByText("otpRequired")).toBeInTheDocument();
  });

  it("shows digit-only error for a non-numeric otp", async () => {
    const user = userEvent.setup();
    render(<VerifyEmailForm userId="42" />);
    await user.type(screen.getByLabelText("otpLabel"), "abc");
    await user.click(screen.getByRole("button", { name: "submit" }));
    expect(screen.getByText("otpDigits")).toBeInTheDocument();
  });

  it("calls the verify mutation with the otp on submit", async () => {
    const verifyMail = jest.fn().mockResolvedValue({});
    mockUseMutation.mockReturnValue([verifyMail, { loading: false, error: undefined }]);

    const user = userEvent.setup();
    render(<VerifyEmailForm userId="42" />);
    await user.type(screen.getByLabelText("otpLabel"), "123456");
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() =>
      expect(verifyMail).toHaveBeenCalledWith({
        variables: { mail: { otp: "123456" } },
      }),
    );
  });

  it("shows the verified screen and marks the user verified after a successful submit", async () => {
    const verifyMail = jest.fn().mockResolvedValue({});
    mockUseMutation.mockReturnValue([verifyMail, { loading: false, error: undefined }]);

    const user = userEvent.setup();
    render(<VerifyEmailForm userId="42" />);
    await user.type(screen.getByLabelText("otpLabel"), "123456");
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(markUserVerified).toHaveBeenCalled();
      expect(screen.getByTestId("check-circle")).toBeInTheDocument();
      expect(screen.getByText("verifiedTitle")).toBeInTheDocument();
      expect(screen.getByText("verifiedText")).toBeInTheDocument();
    });
  });

  it("shows the failed error when the mutation rejects", async () => {
    const verifyMail = jest.fn().mockRejectedValue(new Error("invalid"));
    mockUseMutation.mockReturnValue([verifyMail, { loading: false, error: undefined }]);

    const user = userEvent.setup();
    render(<VerifyEmailForm userId="42" />);
    await user.type(screen.getByLabelText("otpLabel"), "123456");
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("failed");
    });
  });

  it("navigates to the user profile when skipping with a session user id", async () => {
    useSession.mockReturnValue({
      user: { id: "99", email: "a@b.com" },
      loading: false,
      isAuthenticated: true,
    });

    const user = userEvent.setup();
    render(<VerifyEmailForm userId="42" />);
    await user.click(screen.getByRole("button", { name: "skip" }));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/users/99/profile");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("falls back to the userId prop when the session user is missing", async () => {
    useSession.mockReturnValue({ user: null, loading: true, isAuthenticated: false });

    const user = userEvent.setup();
    render(<VerifyEmailForm userId="42" />);
    await user.click(screen.getByRole("button", { name: "skip" }));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/users/42/profile");
    });
  });

  it("falls back to /users when neither session user nor userId is available", async () => {
    useSession.mockReturnValue({ user: null, loading: true, isAuthenticated: false });

    const user = userEvent.setup();
    render(<VerifyEmailForm />);
    await user.click(screen.getByRole("button", { name: "skip" }));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/users");
    });
  });
});
