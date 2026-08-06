import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { PositionsTable } from "./positions-table";
import { createPositionsColumns } from "../columns";
import type { PositionItem } from "../types";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("lucide-react", () => require("@/test-utils/mocks").mockLucide());
jest.mock("@/components/ui/button", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/ui/input", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/ui/dropdown-menu", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/shared/row-actions", () => require("@/test-utils/mocks").mockRowActions());
jest.mock("@/components/shared/sortable-header", () =>
  require("@/test-utils/mocks").mockSortableHeader(),
);
jest.mock("@/components/shared/table-pagination", () =>
  require("@/test-utils/mocks").mockTablePagination(),
);

const positions: PositionItem[] = [
  { id: "1", created_at: "", name: "Backend Developer" },
  { id: "2", created_at: "", name: "Frontend Developer" },
];

function renderTable({
  isAdmin = true,
  loading = false,
  data = positions,
  serverError,
}: {
  isAdmin?: boolean;
  loading?: boolean;
  data?: PositionItem[];
  serverError?: string | null;
}) {
  const t = (key: string) => key.split(".").pop() ?? key;
  const actions = { onOpen: jest.fn(), onUpdate: jest.fn(), onDelete: jest.fn() };

  function Harness() {
    const [globalFilter, setGlobalFilter] = useState("");
    const columns = createPositionsColumns(t, t, isAdmin, actions);
    const table = useReactTable({
      data,
      columns,
      state: { globalFilter },
      onGlobalFilterChange: setGlobalFilter,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
    });
    return (
      <PositionsTable
        loading={loading}
        table={table}
        columnCount={columns.length}
        isAdmin={isAdmin}
        createOpen={false}
        setCreateOpen={jest.fn()}
        deleteTarget={null}
        setDeleteTarget={jest.fn()}
        updateTarget={null}
        setUpdateTarget={jest.fn()}
        openTarget={null}
        setOpenTarget={jest.fn()}
        handleCreated={jest.fn()}
        handleUpdated={jest.fn()}
        handleDeleted={jest.fn()}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        serverError={serverError}
      />
    );
  }
  const view = render(<Harness />);
  return { actions, view };
}

describe("PositionsTable", () => {
  it("renders the name column header", () => {
    renderTable({});
    expect(screen.getByText("name")).toBeInTheDocument();
  });

  it("renders each position row", () => {
    renderTable({});
    expect(screen.getByText("Backend Developer")).toBeInTheDocument();
    expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
  });

  it("shows the create action for admins", () => {
    renderTable({ isAdmin: true });
    expect(screen.getByText("createPosition")).toBeInTheDocument();
  });

  it("hides the create action for non-admins", () => {
    renderTable({ isAdmin: false });
    expect(screen.queryByText("createPosition")).not.toBeInTheDocument();
  });

  it("filters rows as the search box is typed into", async () => {
    const user = userEvent.setup();
    renderTable({});
    await user.type(screen.getByPlaceholderText("search"), "frontend");
    expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
    expect(screen.queryByText("Backend Developer")).not.toBeInTheDocument();
  });

  it("renders the empty state when there are no rows", () => {
    renderTable({ data: [] });
    expect(screen.getByText("noPositionsFound")).toBeInTheDocument();
  });

  it("renders the loading message while loading", () => {
    renderTable({ data: [], loading: true });
    expect(screen.getByText("loading")).toBeInTheDocument();
  });

  it("renders the server error instead of rows", () => {
    renderTable({ serverError: "Failed to load positions" });
    expect(screen.getByText("Failed to load positions")).toBeInTheDocument();
  });
});
