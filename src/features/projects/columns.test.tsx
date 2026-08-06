import { render } from "@testing-library/react";
import {
  type ColumnDef,
  type SortingState,
  type Table,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { createProjectColumns } from "./columns";
import type { ProjectItem } from "./hooks/use-projects-page";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("lucide-react", () => require("@/test-utils/mocks").mockLucide());

const projects: ProjectItem[] = [
  {
    id: "1",
    created_at: "2024-01-01T00:00:00Z",
    name: "Alpha",
    internal_name: "alpha",
    domain: "Web",
    start_date: "2024-01-01",
    end_date: null,
    description: "First",
    environment: [],
  },
  {
    id: "2",
    created_at: "2024-02-01T00:00:00Z",
    name: "Beta",
    internal_name: "beta",
    domain: "Mobile",
    start_date: "2024-02-01",
    end_date: null,
    description: "Second",
    environment: [],
  },
];

function buildTable(state?: { globalFilter?: string; sorting?: SortingState }) {
  const t = (key: string) => key.split(".").pop() ?? key;
  const columns = createProjectColumns(t);
  let captured: Table<ProjectItem> | undefined;
  function Builder() {
    const table = useReactTable({
      data: projects,
      columns,
      state: state ?? {},
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getSortedRowModel: getSortedRowModel(),
    });
    captured = table;
    return null;
  }
  render(<Builder />);
  return { columns, table: captured! };
}

describe("createProjectColumns", () => {
  it("exposes name, domain, date and actions columns", () => {
    const { columns } = buildTable();
    expect(columns.map((c) => c.id)).toEqual([
      "name",
      "domain",
      "start_date",
      "end_date",
      "actions",
    ]);
  });

  it("sorts rows by name", () => {
    const { table } = buildTable({ sorting: [{ id: "name", desc: false }] });
    expect(table.getRowModel().rows.map((r) => r.original.name)).toEqual(["Alpha", "Beta"]);
  });

  it("filters rows by name via global filter", () => {
    const { table } = buildTable({ globalFilter: "beta" });
    expect(table.getRowModel().rows.map((r) => r.original.name)).toEqual(["Beta"]);
  });

  it("marks name as filterable and sortable", () => {
    const { columns } = buildTable();
    const name = columns.find((c) => c.id === "name") as ColumnDef<ProjectItem> & {
      enableSorting?: boolean;
      enableGlobalFilter?: boolean;
    };
    expect(name?.enableSorting).toBeTruthy();
    expect(name?.enableGlobalFilter).toBeTruthy();
  });
});
