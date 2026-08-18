import { render, screen } from "@testing-library/react";
import { flexRender, type SortingState, type Table } from "@tanstack/react-table";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { createLanguagesColumns } from "./columns";
import type { LanguageItem } from "./types";

jest.mock("lucide-react", () => require("@/test-utils/mocks").mockLucide());
jest.mock("@/components/shared/row-actions", () => require("@/test-utils/mocks").mockRowActions());
jest.mock("@/components/shared/sortable-header", () =>
  require("@/test-utils/mocks").mockSortableHeader(),
);
jest.mock("@/components/ui/button", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/ui/dropdown-menu", () => require("@/test-utils/ui-mock"));

const mockUsePermissions = jest.fn<{ isAdmin: boolean; currentUserId: string | undefined }, []>(
  () => ({ isAdmin: true, currentUserId: "u1" }),
);
jest.mock("@/lib/auth/permissions", () => ({ usePermissions: () => mockUsePermissions() }));

const languages: LanguageItem[] = [
  { id: "1", created_at: "", iso2: "en", name: "English", native_name: "English" },
  { id: "2", created_at: "", iso2: "de", name: "German", native_name: "Deutsch" },
];

const t = (key: string) => `columns.languages.${key}`;
const tb = (key: string) => `buttons.${key}`;

function buildTableWithColumns(
  isAdmin: boolean,
  state?: { globalFilter?: string; sorting?: SortingState },
) {
  mockUsePermissions.mockReturnValue({ isAdmin, currentUserId: isAdmin ? "u1" : undefined });
  const columns = createLanguagesColumns(t, tb, {
    onOpen: jest.fn(),
    onUpdate: jest.fn(),
    onDelete: jest.fn(),
  });

  let captured: Table<LanguageItem> | undefined;
  function TableBuilder() {
    const table = useReactTable({
      data: languages,
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
  const { table } = buildTableWithColumns(isAdmin);
  const row = table.getRowModel().rows[0];
  const actionsCell = row.getVisibleCells().find((cell) => cell.column.id === "actions")!;
  return flexRender(actionsCell.column.columnDef.cell, actionsCell.getContext());
}

describe("createLanguagesColumns", () => {
  it("exposes name, native_name and iso2 columns", () => {
    const { columns } = buildTableWithColumns(true);
    expect(columns.map((c) => c.id)).toEqual([
      "id",
      "created_at",
      "name",
      "native_name",
      "iso2",
      "actions",
    ]);
  });

  it("sorts rows by name", () => {
    const { table } = buildTableWithColumns(true, { sorting: [{ id: "name", desc: false }] });
    expect(table.getRowModel().rows.map((r) => r.original.name)).toEqual(["English", "German"]);
  });

  it("filters rows by name via global filter", () => {
    const { table } = buildTableWithColumns(true, { globalFilter: "germ" });
    expect(table.getRowModel().rows.map((r) => r.original.name)).toEqual(["German"]);
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
