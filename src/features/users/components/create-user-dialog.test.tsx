import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateUserDialog } from "./create-user-dialog";
import { DuplicateEmailError } from "@/features/users/errors";
import type { CreateUserPayload } from "@/features/users/hooks/use-users-page";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("@/components/ui", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/ui/input", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/ui/button", () => require("@/test-utils/ui-mock"));

const mockUseQuery = jest.fn();
jest.mock("@apollo/client/react", () => ({ useQuery: () => mockUseQuery() }));

const mockToastError = jest.fn();

jest.mock("sonner", () => ({
  toast: { error: (...args: unknown[]) => mockToastError(...args) },
}));

const mockOnConfirm = jest.fn();
const mockOnOpenChange = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mockUseQuery.mockReturnValue({ data: { departments: [], positions: [] } });
});

function renderDialog() {
  const view = render(
    <CreateUserDialog
      open
      onOpenChange={mockOnOpenChange}
      onConfirm={mockOnConfirm}
      loading={false}
    />,
  );
  return view.container;
}

async function fillRequiredFields(container: Element, email = "new@example.com") {
  const user = userEvent.setup();
  const emailInput = container.querySelector("#email") as HTMLInputElement;
  const passwordInput = container.querySelector("#password") as HTMLInputElement;
  await user.type(emailInput, email);
  await user.type(passwordInput, "Password123");
  await user.click(screen.getByText("employee"));
  return { emailInput, passwordInput };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("CreateUserDialog password visibility toggle", () => {
  it("masks the password by default and toggles to visible using the eye icon", async () => {
    const user = userEvent.setup();
    const container = renderDialog();

    const passwordInput = container.querySelector("#password") as HTMLInputElement;
    expect(passwordInput.type).toBe("password");

    await user.click(screen.getByRole("button", { name: "show" }));
    expect(passwordInput.type).toBe("text");

    await user.click(screen.getByRole("button", { name: "hide" }));
    expect(passwordInput.type).toBe("password");
  });

  it("disables the toggle while the dialog is loading", () => {
    render(
      <CreateUserDialog
        open
        onOpenChange={jest.fn()}
        onConfirm={jest.fn()}
        loading
      />,
    );
    expect(screen.getByRole("button", { name: "show" })).toBeDisabled();
  });
});

describe("CreateUserDialog duplicate email handling", () => {
  it("shows an inline email error and keeps the dialog open when the email is already registered", async () => {
    const user = userEvent.setup();
    const container = renderDialog();

    mockOnConfirm.mockRejectedValue({
      graphQLErrors: [{ message: "duplicate key value violates unique constraint" }],
    });

    await fillRequiredFields(container);
    await user.click(screen.getByRole("button", { name: "create" }));

    expect(await screen.findByText("emailInUse")).toBeInTheDocument();
    expect(mockToastError).not.toHaveBeenCalled();
    expect(mockOnOpenChange).not.toHaveBeenCalled();
  });

  it("recognises the signup-style duplicate email message", async () => {
    const user = userEvent.setup();
    const container = renderDialog();

    mockOnConfirm.mockRejectedValue(new Error("User already exists"));

    await fillRequiredFields(container);
    await user.click(screen.getByRole("button", { name: "create" }));

    expect(await screen.findByText("emailInUse")).toBeInTheDocument();
  });

  it("recognises the DuplicateEmailError thrown by the page hook", async () => {
    const user = userEvent.setup();
    const container = renderDialog();

    mockOnConfirm.mockRejectedValue(new DuplicateEmailError());

    await fillRequiredFields(container);
    await user.click(screen.getByRole("button", { name: "create" }));

    expect(await screen.findByText("emailInUse")).toBeInTheDocument();
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("clears the inline email error when the admin edits the email", async () => {
    const user = userEvent.setup();
    const container = renderDialog();

    mockOnConfirm.mockRejectedValue({
      graphQLErrors: [{ message: "duplicate key value violates unique constraint" }],
    });

    await fillRequiredFields(container);
    await user.click(screen.getByRole("button", { name: "create" }));
    expect(await screen.findByText("emailInUse")).toBeInTheDocument();

    await user.type(container.querySelector("#email") as HTMLInputElement, "x");
    expect(screen.queryByText("emailInUse")).not.toBeInTheDocument();
  });

  it("shows a generic toast when creation fails for another reason", async () => {
    const user = userEvent.setup();
    const container = renderDialog();

    mockOnConfirm.mockRejectedValue(new Error("network error"));

    await fillRequiredFields(container);
    await user.click(screen.getByRole("button", { name: "create" }));

    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("createUserFailed"));
    expect(screen.queryByText("emailInUse")).not.toBeInTheDocument();
  });
});

describe("CreateUserDialog submission", () => {
  it("submits the payload, resets the form and closes on success", async () => {
    const user = userEvent.setup();
    const container = renderDialog();

    mockOnConfirm.mockResolvedValue(undefined);

    await fillRequiredFields(container);
    await user.click(screen.getByRole("button", { name: "create" }));

    await waitFor(() =>
      expect(mockOnConfirm).toHaveBeenCalledWith({
        email: "new@example.com",
        password: "Password123",
        first_name: "",
        last_name: "",
        departmentId: null,
        positionId: null,
        role: "Employee",
      } satisfies CreateUserPayload),
    );
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("CreateUserDialog zod credentials validation", () => {
  it("shows an inline email format error and does not submit for an invalid email", async () => {
    const user = userEvent.setup();
    const container = renderDialog();

    const emailInput = container.querySelector("#email") as HTMLInputElement;
    const passwordInput = container.querySelector("#password") as HTMLInputElement;
    await user.type(emailInput, "not-an-email");
    await user.type(passwordInput, "Password123");
    await user.click(screen.getByText("employee"));
    await user.click(screen.getByRole("button", { name: "create" }));

    expect(await screen.findByText("emailInvalid")).toBeInTheDocument();
    expect(mockOnConfirm).not.toHaveBeenCalled();
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("shows an inline password-minimum error and does not submit for a short password", async () => {
    const user = userEvent.setup();
    const container = renderDialog();

    const emailInput = container.querySelector("#email") as HTMLInputElement;
    const passwordInput = container.querySelector("#password") as HTMLInputElement;
    await user.type(emailInput, "new@example.com");
    await user.type(passwordInput, "short");
    await user.click(screen.getByText("employee"));
    await user.click(screen.getByRole("button", { name: "create" }));

    expect(await screen.findByText("passwordMin")).toBeInTheDocument();
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it("clears the password error once the admin types a valid password", async () => {
    const user = userEvent.setup();
    const container = renderDialog();

    const emailInput = container.querySelector("#email") as HTMLInputElement;
    const passwordInput = container.querySelector("#password") as HTMLInputElement;
    await user.type(emailInput, "new@example.com");
    await user.type(passwordInput, "short");
    await user.click(screen.getByText("employee"));
    await user.click(screen.getByRole("button", { name: "create" }));
    expect(await screen.findByText("passwordMin")).toBeInTheDocument();

    await user.clear(passwordInput);
    await user.type(passwordInput, "Password123");
    expect(screen.queryByText("passwordMin")).not.toBeInTheDocument();
  });
});
