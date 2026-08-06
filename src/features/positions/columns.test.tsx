/**
 * Unit tests for createPositionsColumns.
 *
 * The shared UI components and third-party ESM dependencies are mocked below so
 * that the column factory can be exercised without pulling in untranspiled
 * node_modules (next-intl, @base-ui, lucide-react) that Jest cannot compile.
 */

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
import type { PositionItem } from "./types";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

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
  DropdownMenuItem: ({ children, onClick }: { children: ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

const positions: PositionItem[] = [
  { id: "1", created_at: "2024-01-01T00:00:00Z", name: "Backend Developer" },
  { id: "2", created_at: "2024-01-02T00:00:00Z", name: "Frontend Developer" },
  { id: "3", created_at: "2024-01-03T00:00:00Z", name: "QA Engineer" },
];

const t = (key: string) => `columns.positions.${key}`;
const tb = (key: string) => `buttons.${key}`;

let createPositionsColumns: (
  t: (key: string) => string,
  tb: (key: string) => string,
  isAdmin: boolean,
  actions: {
    onOpen: (position: PositionItem) => void;
    onUpdate: (position: PositionItem) => void;
    onDelete: (position: PositionItem) => void;
  },
) => ColumnDef<PositionItem>[];

beforeAll(async () => {
  const mod = await import("./columns");
  createPositionsColumns = mod.createPositionsColumns;
});

function buildTable(
  isAdmin: boolean,
  state?: { globalFilter?: string; sorting?: SortingState },
): Table<PositionItem> {
  return buildTableWithColumns(isAdmin, state).table;
}

function buildTableWithColumns(
  isAdmin: boolean,
  state?: { globalFilter?: string; sorting?: SortingState },
): { columns: ColumnDef<PositionItem>[]; table: Table<PositionItem> } {
  const columns = createPositionsColumns(t, tb, isAdmin, {
    onOpen: jest.fn(),
    onUpdate: jest.fn(),
    onDelete: jest.fn(),
  });

  let captured: Table<PositionItem> | undefined;

  function TableBuilder() {
    const table = useReactTable({
      data: positions,
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

describe("createPositionsColumns", () => {
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
      "Backend Developer",
      "Frontend Developer",
      "QA Engineer",
    ]);
  });

  it("filters rows by name via global filter", () => {
    const table = buildTable(true, { globalFilter: "frontend" });
    expect(table.getRowModel().rows.map((r) => r.original.name)).toEqual(["Frontend Developer"]);
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
