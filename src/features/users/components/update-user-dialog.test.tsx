import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UpdateUserDialog } from "./update-user-dialog";
import type { UserItem } from "@/features/users/types";
import type { UpdateUserPayload } from "@/features/users/hooks/use-users-page";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("@/components/ui", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/ui/input", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/ui/button", () => require("@/test-utils/ui-mock"));

const mockUseQuery = jest.fn();
jest.mock("@apollo/client/react", () => ({ useQuery: () => mockUseQuery() }));

const mockUsePermissions = jest.fn(() => ({ currentUserId: "u1" }));
jest.mock("@/lib/auth/permissions", () => ({
  usePermissions: () => mockUsePermissions(),
}));

const mockOnConfirm = jest.fn();
const mockOnClose = jest.fn();

const target = {
  id: "u1",
  created_at: "2024-01-01T00:00:00Z",
  email: "alice@example.com",
  is_verified: true,
  role: "Employee",
  department_name: "Engineering",
  position_name: "Engineer",
  profile: {
    id: "p1",
    created_at: "2024-01-01T00:00:00Z",
    first_name: "Alice",
    last_name: "Smith",
    full_name: "Alice Smith",
    avatar: null,
  },
  department: { id: "d1", created_at: "", name: "Engineering" },
  position: { id: "pos1", created_at: "", name: "Engineer" },
  cvs: [],
} as unknown as UserItem;

type DialogProps = Partial<Parameters<typeof UpdateUserDialog>[0]>;

function renderDialog(props: DialogProps = {}) {
  return render(
    <UpdateUserDialog
      target={target}
      onClose={mockOnClose}
      onConfirm={mockOnConfirm}
      loading={false}
      {...props}
    />,
  ).container;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseQuery.mockReturnValue({ data: { departments: [{ id: "d1", name: "Engineering" }], positions: [{ id: "pos1", name: "Engineer" }] } });
});

describe("UpdateUserDialog pre-fill", () => {
  it("prefills all editable fields with the selected user's data", () => {
    const container = renderDialog();

    expect((container.querySelector("#email") as HTMLInputElement).value).toBe("alice@example.com");
    expect((container.querySelector("#first_name") as HTMLInputElement).value).toBe("Alice");
    expect((container.querySelector("#last_name") as HTMLInputElement).value).toBe("Smith");

    const selects = container.querySelectorAll('[data-testid="select"]');
    expect(selects[0].getAttribute("data-value")).toBe("d1");
    expect(selects[1].getAttribute("data-value")).toBe("pos1");
    expect(selects[2].getAttribute("data-value")).toBe("Employee");
  });

  it("leaves the password field empty, disabled and accompanied by an explanatory note", () => {
    const container = renderDialog();

    const passwordInput = container.querySelector("#password") as HTMLInputElement;
    expect(passwordInput).toBeDisabled();
    expect(passwordInput.value).toBe("");
    expect(screen.getByText("updateUserPasswordUnavailable")).toBeInTheDocument();
  });
});

describe("UpdateUserDialog email field", () => {
  it("renders the email as read-only and disabled", () => {
    const container = renderDialog();

    const emailInput = container.querySelector("#email") as HTMLInputElement;
    expect(emailInput).toHaveAttribute("readonly");
    expect(emailInput).toBeDisabled();
    expect(emailInput.value).toBe("alice@example.com");
  });
});

describe("UpdateUserDialog submit gating", () => {
  it("disables UPDATE while nothing changed", () => {
    renderDialog();
    expect(screen.getByRole("button", { name: "update" })).toBeDisabled();
  });

  it("enables UPDATE once a field differs and submits the changed values", async () => {
    const user = userEvent.setup();
    const container = renderDialog();

    expect(screen.getByRole("button", { name: "update" })).toBeDisabled();

    const firstNameInput = container.querySelector("#first_name") as HTMLInputElement;
    await user.clear(firstNameInput);
    await user.type(firstNameInput, "Alicia");

    expect(screen.getByRole("button", { name: "update" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "update" }));

    await waitFor(() =>
      expect(mockOnConfirm).toHaveBeenCalledWith({
        userId: "u1",
        first_name: "Alicia",
        last_name: "Smith",
        departmentId: "d1",
        positionId: "pos1",
        role: "Employee",
      } satisfies UpdateUserPayload),
    );
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("submits a role change selected via the role dropdown", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByText("admin"));
    await user.click(screen.getByRole("button", { name: "update" }));

    await waitFor(() =>
      expect(mockOnConfirm).toHaveBeenCalledWith(expect.objectContaining({ role: "Admin" })),
    );
  });

  it("keeps the dialog open when the update fails", async () => {
    const user = userEvent.setup();
    const container = renderDialog();

    mockOnConfirm.mockRejectedValue(new Error("updateUserFailed"));

    const firstNameInput = container.querySelector("#first_name") as HTMLInputElement;
    await user.clear(firstNameInput);
    await user.type(firstNameInput, "Alicia");
    await user.click(screen.getByRole("button", { name: "update" }));

    await waitFor(() => expect(mockOnConfirm).toHaveBeenCalled());
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});

describe("UpdateUserDialog role field for current user", () => {
  it("disables the role select when editing the current user", () => {
    mockUsePermissions.mockReturnValue({ currentUserId: "u1" });
    const container = renderDialog();

    const selects = container.querySelectorAll('[data-testid="select"]');
    expect(selects[2].getAttribute("data-disabled")).toBe("true");
  });

  it("keeps the role select enabled when editing another user", () => {
    mockUsePermissions.mockReturnValue({ currentUserId: "u2" });
    const container = renderDialog();

    const selects = container.querySelectorAll('[data-testid="select"]');
    expect(selects[2].getAttribute("data-disabled")).toBeNull();
  });
});

describe("UpdateUserDialog buttons row", () => {
  it("renders exactly CANCEL and UPDATE", () => {
    renderDialog();
    expect(screen.getByRole("button", { name: "cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "update" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "delete" })).not.toBeInTheDocument();
  });
});
