import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useMutation } from "@apollo/client/react";
import { DeleteUserDialog } from "./delete-user-dialog";
import type { UserItem } from "@/features/users/types";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("@/components/ui", () => require("@/test-utils/ui-mock"));
jest.mock("@apollo/client/react", () => ({ useMutation: jest.fn() }));

const mockUseMutation = useMutation as unknown as jest.Mock;

const target = {
  id: "u1",
  created_at: "2024-01-01T00:00:00Z",
  email: "alice@example.com",
  is_verified: true,
  role: "Employee",
  profile: {
    id: "p1",
    created_at: "2024-01-01T00:00:00Z",
    first_name: "Alice",
    last_name: "Smith",
    full_name: "Alice Smith",
    avatar: null,
  },
} as unknown as UserItem;

const mockOnClose = jest.fn();

let actionDeleteUser: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  actionDeleteUser = jest.fn();
  mockUseMutation.mockReturnValue([actionDeleteUser, { loading: false }]);
});

describe("DeleteUserDialog", () => {
  it("calls onDeleted with the target id and closes after a successful deletion", async () => {
    const user = userEvent.setup();
    const onDeleted = jest.fn();
    actionDeleteUser.mockResolvedValue({ data: { deleteUser: { id: "u1" } } });

    render(<DeleteUserDialog target={target} onClose={mockOnClose} onDeleted={onDeleted} />);

    await user.click(screen.getByRole("button", { name: "confirm" }));

    await waitFor(() =>
      expect(actionDeleteUser).toHaveBeenCalledWith({ variables: { userId: "u1" } }),
    );
    await waitFor(() => expect(onDeleted).toHaveBeenCalledWith("u1"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("closes the dialog as soon as the mutation resolves, before onDeleted settles", async () => {
    const user = userEvent.setup();
    let resolveDeleted: (value: unknown) => void = () => {};
    const onDeleted = jest.fn(() => new Promise((res) => (resolveDeleted = res)));
    actionDeleteUser.mockResolvedValue({ data: { deleteUser: { id: "u1" } } });

    render(<DeleteUserDialog target={target} onClose={mockOnClose} onDeleted={onDeleted} />);

    await user.click(screen.getByRole("button", { name: "confirm" }));

    await waitFor(() => expect(actionDeleteUser).toHaveBeenCalled());
    await waitFor(() => expect(mockOnClose).toHaveBeenCalled());
    expect(onDeleted).toHaveBeenCalledWith("u1");
    resolveDeleted(undefined);
  });
});
