import { type ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  flexRender,
  type ColumnDef,
  type Table,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { UserItem } from "./types";

jest.mock("lucide-react", () => ({
  MoreVertical: () => null,
}));

jest.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children }: { children: ReactNode }) => <>{children}</>,
  AvatarImage: () => null,
  AvatarFallback: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: ReactNode }) => <>{children}</>,
  DropdownMenuTrigger: ({ render }: { render?: ReactNode }) => render ?? null,
  DropdownMenuContent: ({ children }: { children: ReactNode }) => <>{children}</>,
  DropdownMenuItem: ({
    children,
    onClick,
    disabled,
  }: {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/shared/row-actions", () => ({
  RowActions: ({
    canMutate,
    onOpen,
    children,
  }: {
    canMutate: boolean;
    onOpen: () => void;
    children: ReactNode;
  }) => (canMutate ? <>{children}</> : <button aria-label="Open" onClick={onOpen} />),
}));

jest.mock("@/components/shared/sortable-header", () => ({
  SortableHeader: ({ label }: { label: string }) => <span>{label}</span>,
}));

const mockUsePermissions = jest.fn<{ isAdmin: boolean; currentUserId: string | undefined }, []>(
  () => ({ isAdmin: true, currentUserId: "u1" }),
);
jest.mock("@/lib/auth/permissions", () => ({ usePermissions: () => mockUsePermissions() }));

const baseUser = {
  created_at: "2024-01-01T00:00:00Z",
  is_verified: true,
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
  cvs: [],
};

const users: UserItem[] = [
  {
    ...baseUser,
    id: "u1",
    email: "alice@example.com",
    role: "Employee",
    department: { id: "d1", created_at: "", name: "Engineering" },
    position: { id: "pos1", created_at: "", name: "Engineer" },
  },
  {
    ...baseUser,
    id: "u2",
    email: "bob@example.com",
    role: "Employee",
    department: null,
    position: null,
  },
];

const t = (key: string) => `columns.users.${key}`;
const tb = (key: string) => `buttons.${key}`;

interface UsersActionsShape {
  onOpen: (user: UserItem) => void;
  onUpdate: (user: UserItem) => void;
  onDelete: (user: UserItem) => void;
}

let createUsersColumns: (
  t: (key: string) => string,
  tb: (key: string) => string,
  actions: UsersActionsShape,
) => ColumnDef<UserItem, unknown>[];

beforeAll(async () => {
  const mod = await import("./columns");
  createUsersColumns = mod.createUsersColumns;
});

function buildTable(
  isAdmin: boolean,
  currentUserId: string | undefined,
  actions: UsersActionsShape,
): Table<UserItem> {
  mockUsePermissions.mockReturnValue({ isAdmin, currentUserId: currentUserId ?? undefined });
  const columns = createUsersColumns(t, tb, actions);
  let captured: Table<UserItem> | undefined;

  function TableBuilder() {
    const table = useReactTable<UserItem>({
      data: users,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getSortedRowModel: getSortedRowModel(),
    });
    captured = table;
    return null;
  }

  render(<TableBuilder />);
  return captured!;
}

function renderActionsCell(
  isAdmin: boolean,
  currentUserId: string | undefined,
  rowUserId: string,
  actions: UsersActionsShape,
) {
  const table = buildTable(isAdmin, currentUserId, actions);
  const row = table.getRowModel().rows.find((r) => r.original.id === rowUserId)!;
  const actionsCell = row.getVisibleCells().find((cell) => cell.column.id === "actions")!;
  return flexRender(actionsCell.column.columnDef.cell, actionsCell.getContext());
}

const targetUser = (id: string) => users.find((u) => u.id === id)!;

describe("createUsersColumns actions", () => {
  it("shows Open, Update and Delete on the owner's own row for a non-admin viewer", () => {
    render(
      <>
        {renderActionsCell(false, "u1", "u1", {
          onOpen: jest.fn(),
          onUpdate: jest.fn(),
          onDelete: jest.fn(),
        })}
      </>,
    );
    expect(screen.getByText("buttons.open")).toBeInTheDocument();
    expect(screen.getByText("buttons.update")).toBeInTheDocument();
    expect(screen.getByText("buttons.delete")).toBeInTheDocument();
  });

  it("shows only Open on another user's row for a non-admin viewer", () => {
    render(
      <>
        {renderActionsCell(false, "u1", "u2", {
          onOpen: jest.fn(),
          onUpdate: jest.fn(),
          onDelete: jest.fn(),
        })}
      </>,
    );
    expect(screen.getByRole("button", { name: "Open" })).toBeInTheDocument();
    expect(screen.queryByText("buttons.update")).not.toBeInTheDocument();
    expect(screen.queryByText("buttons.delete")).not.toBeInTheDocument();
  });

  it("shows Open, Update and Delete on every row for an admin viewer, including their own", () => {
    const actions = { onOpen: jest.fn(), onUpdate: jest.fn(), onDelete: jest.fn() };
    render(<>{renderActionsCell(true, "u1", "u2", actions)}</>);
    expect(screen.getByText("buttons.open")).toBeInTheDocument();
    expect(screen.getByText("buttons.update")).toBeInTheDocument();
    expect(screen.getByText("buttons.delete")).toBeInTheDocument();
  });

  it("shows Open, Update and Delete on the admin's own row", () => {
    render(
      <>
        {renderActionsCell(true, "u1", "u1", {
          onOpen: jest.fn(),
          onUpdate: jest.fn(),
          onDelete: jest.fn(),
        })}
      </>,
    );
    expect(screen.getByText("buttons.open")).toBeInTheDocument();
    expect(screen.getByText("buttons.update")).toBeInTheDocument();
    expect(screen.getByText("buttons.delete")).toBeInTheDocument();
  });

  it("navigates via Open on a non-admin's other-user row", async () => {
    const user = userEvent.setup();
    const onOpen = jest.fn();
    render(
      <>
        {renderActionsCell(false, "u1", "u2", { onOpen, onUpdate: jest.fn(), onDelete: jest.fn() })}
      </>,
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(onOpen).toHaveBeenCalledWith(targetUser("u2"));
  });

  it("navigates via Open on an admin's row", async () => {
    const user = userEvent.setup();
    const onOpen = jest.fn();
    render(
      <>
        {renderActionsCell(true, "u1", "u2", { onOpen, onUpdate: jest.fn(), onDelete: jest.fn() })}
      </>,
    );
    await user.click(screen.getByText("buttons.open"));
    expect(onOpen).toHaveBeenCalledWith(targetUser("u2"));
  });

  it("opens the update flow via Update on an editable row", async () => {
    const user = userEvent.setup();
    const onUpdate = jest.fn();
    render(
      <>
        {renderActionsCell(true, "u1", "u2", { onOpen: jest.fn(), onUpdate, onDelete: jest.fn() })}
      </>,
    );
    await user.click(screen.getByText("buttons.update"));
    expect(onUpdate).toHaveBeenCalledWith(targetUser("u2"));
  });

  it("keeps Delete disabled for verified users even for admins", () => {
    const actions = { onOpen: jest.fn(), onUpdate: jest.fn(), onDelete: jest.fn() };
    render(<>{renderActionsCell(true, "u1", "u2", actions)}</>);
    expect(screen.getByRole("button", { name: "buttons.delete" })).toBeDisabled();
  });
});
