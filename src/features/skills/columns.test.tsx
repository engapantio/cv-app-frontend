import { render, screen } from "@testing-library/react";
import {
  flexRender,
  type SortingState,
  type Table,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { createSkillsColumns } from "./columns";
import type { SkillItem } from "./types";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("lucide-react", () => require("@/test-utils/mocks").mockLucide());
jest.mock("@/components/shared/row-actions", () => require("@/test-utils/mocks").mockRowActions());
jest.mock("@/components/shared/sortable-header", () =>
  require("@/test-utils/mocks").mockSortableHeader(),
);
jest.mock("@/components/ui/button", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/ui/dropdown-menu", () => require("@/test-utils/ui-mock"));

const skills: SkillItem[] = [
  {
    id: "1",
    created_at: "",
    name: "TypeScript",
    category_name: "Programming Language",
    category_parent_name: "Development",
    category: { id: "c1", name: "Programming Language", order: 1, parent: null },
  },
  {
    id: "2",
    created_at: "",
    name: "Figma",
    category_name: "Design",
    category_parent_name: null,
    category: null,
  },
];

const t = (key: string) => `columns.skills.${key}`;
const tb = (key: string) => `buttons.${key}`;

function buildTableWithColumns(
  isAdmin: boolean,
  state?: { globalFilter?: string; sorting?: SortingState },
) {
  const columns = createSkillsColumns(t, tb, isAdmin, {
    onOpen: jest.fn(),
    onUpdate: jest.fn(),
    onDelete: jest.fn(),
  });

  let captured: Table<SkillItem> | undefined;
  function TableBuilder() {
    const table = useReactTable({
      data: skills,
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

describe("createSkillsColumns", () => {
  it("exposes name, type and category columns", () => {
    const { columns } = buildTableWithColumns(true);
    expect(columns.map((c) => c.id)).toEqual(["id", "name", "type", "category", "actions"]);
  });

  it("sorts rows by name", () => {
    const { table } = buildTableWithColumns(true, { sorting: [{ id: "name", desc: false }] });
    expect(table.getRowModel().rows.map((r) => r.original.name)).toEqual(["Figma", "TypeScript"]);
  });

  it("filters rows by category via global filter", () => {
    const { table } = buildTableWithColumns(true, { globalFilter: "design" });
    expect(table.getRowModel().rows.map((r) => r.original.name)).toEqual(["Figma"]);
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
