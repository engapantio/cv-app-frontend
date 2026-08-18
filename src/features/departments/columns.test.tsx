import { type ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import {
  flexRender,
  type ColumnDef,
  type SortingState,
  type Table,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { DepartmentItem } from "./types";

jest.mock("lucide-react", () => ({
  MoreVertical: () => null,
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

const mockUsePermissions = jest.fn<{ isAdmin: boolean; currentUserId: string | undefined }, []>(
  () => ({ isAdmin: true, currentUserId: "u1" }),
);
jest.mock("@/lib/auth/permissions", () => ({ usePermissions: () => mockUsePermissions() }));

const departments: DepartmentItem[] = [
  { id: "1", created_at: "2024-01-01T00:00:00Z", name: "Engineering" },
  { id: "2", created_at: "2024-01-02T00:00:00Z", name: "Marketing" },
  { id: "3", created_at: "2024-01-03T00:00:00Z", name: "HR" },
];

const t = (key: string) => `columns.departments.${key}`;
const tb = (key: string) => `buttons.${key}`;

let createDepartmentsColumns: (
  t: (key: string) => string,
  tb: (key: string) => string,
  actions: {
    onOpen: (department: DepartmentItem) => void;
    onUpdate: (department: DepartmentItem) => void;
    onDelete: (department: DepartmentItem) => void;
  },
) => ColumnDef<DepartmentItem>[];

beforeAll(async () => {
  const mod = await import("./columns");
  createDepartmentsColumns = mod.createDepartmentsColumns;
});

function buildTable(
  isAdmin: boolean,
  state?: { globalFilter?: string; sorting?: SortingState },
): Table<DepartmentItem> {
  return buildTableWithColumns(isAdmin, state).table;
}

function buildTableWithColumns(
  isAdmin: boolean,
  state?: { globalFilter?: string; sorting?: SortingState },
): { columns: ColumnDef<DepartmentItem>[]; table: Table<DepartmentItem> } {
  mockUsePermissions.mockReturnValue({ isAdmin, currentUserId: isAdmin ? "u1" : undefined });
  const columns = createDepartmentsColumns(t, tb, {
    onOpen: jest.fn(),
    onUpdate: jest.fn(),
    onDelete: jest.fn(),
  });

  let captured: Table<DepartmentItem> | undefined;

  function TableBuilder() {
    const table = useReactTable({
      data: departments,
      columns,
      state: state ?? {},
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getSortedRowModel: getSortedRowModel(),
    });
    captured = table;
    return null;
  }

  render(<TableBuilder />);
  return { columns, table: captured! };
}

function renderActionsCell(isAdmin: boolean) {
  const table = buildTable(isAdmin);
  const row = table.getRowModel().rows[0];
  const actionsCell = row.getVisibleCells().find((cell) => cell.column.id === "actions")!;
  return flexRender(actionsCell.column.columnDef.cell, actionsCell.getContext());
}

describe("createDepartmentsColumns", () => {
  it("defines a sortable, filterable name column", () => {
    const { columns } = buildTableWithColumns(true);
    const nameColumn = columns.find((c) => c.id === "name") as {
      accessorKey?: string;
      enableGlobalFilter?: boolean;
      enableSorting?: boolean;
    };
    expect(nameColumn).toBeDefined();
    expect(nameColumn.accessorKey).toBe("name");
    expect(nameColumn.enableGlobalFilter).toBe(true);
    expect(nameColumn.enableSorting).not.toBe(false);
  });

  it("sorts rows by name", () => {
    const table = buildTable(true, { sorting: [{ id: "name", desc: false }] });
    expect(table.getRowModel().rows.map((r) => r.original.name)).toEqual([
      "Engineering",
      "HR",
      "Marketing",
    ]);
  });

  it("filters rows by name via global filter", () => {
    const table = buildTable(true, { globalFilter: "marketing" });
    expect(table.getRowModel().rows.map((r) => r.original.name)).toEqual(["Marketing"]);
  });

  it("returns all rows when filter is empty", () => {
    const table = buildTable(true, { globalFilter: "" });
    expect(table.getRowModel().rows).toHaveLength(3);
  });

  it("renders admin actions with open, update and delete menu items", () => {
    render(<>{renderActionsCell(true)}</>);
    expect(screen.getByText("buttons.open")).toBeInTheDocument();
    expect(screen.getByText("buttons.update")).toBeInTheDocument();
    expect(screen.getByText("buttons.delete")).toBeInTheDocument();
  });

  it("renders read-only open action for non-admin users", () => {
    render(<>{renderActionsCell(false)}</>);
    expect(screen.queryByText("buttons.update")).not.toBeInTheDocument();
    expect(screen.queryByText("buttons.delete")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open" })).toBeInTheDocument();
  });
});
