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
import { CvsTable } from "./cvs-table";
import { createCvsColumns } from "../columns";

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

const mockUsePermissions = jest.fn<{ isAdmin: boolean; currentUserId: string | undefined }, []>(
  () => ({ isAdmin: true, currentUserId: "u1" }),
);
jest.mock("@/lib/auth/permissions", () => ({ usePermissions: () => mockUsePermissions() }));

const cvs = [
  {
    id: "c1",
    created_at: "2024-01-01T00:00:00Z",
    name: "First CV",
    education: "BSc",
    description: "First description",
    user: { id: "u1", email: "u1@b.com", profile: { id: "p1", full_name: "A B", avatar: null } },
  },
  {
    id: "c2",
    created_at: "2024-02-01T00:00:00Z",
    name: "Second CV",
    education: null,
    description: "Second description",
    user: { id: "u2", email: "u2@b.com", profile: { id: "p2", full_name: "C D", avatar: null } },
  },
];

function renderTable({
  isAdmin = true,
  canCreate = true,
  loading = false,
  data = cvs,
  serverError,
}: {
  isAdmin?: boolean;
  canCreate?: boolean;
  loading?: boolean;
  data?: typeof cvs;
  serverError?: string | null;
}) {
  mockUsePermissions.mockReturnValue({ isAdmin, currentUserId: isAdmin ? "u1" : undefined });
  const t = (key: string) => key.split(".").pop() ?? key;
  const actions = { onOpen: jest.fn(), onDelete: jest.fn() };

  function Harness() {
    const [globalFilter, setGlobalFilter] = useState("");
    const columns = createCvsColumns(t, t, actions, "u1@b.com", "u1");
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
      <CvsTable
        loading={loading}
        table={table}
        columnCount={columns.length}
        canCreate={canCreate}
        createOpen={false}
        setCreateOpen={jest.fn()}
        deleteTarget={null}
        handleCreated={jest.fn()}
        handleDeleted={jest.fn()}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        handleOpen={actions.onOpen}
        setDeleteTarget={jest.fn()}
        serverError={serverError}
        createUserId="u1"
        tableClassName="w-full"
      />
    );
  }
  const view = render(<Harness />);
  return { actions, view };
}

describe("CvsTable", () => {
  it("renders the sortable column headers", () => {
    renderTable({});
    expect(screen.getByText("name")).toBeInTheDocument();
    expect(screen.getByText("education")).toBeInTheDocument();
    expect(screen.getByText("employee")).toBeInTheDocument();
  });

  it("renders each cv row with its fields", () => {
    renderTable({});
    expect(screen.getByText("First CV")).toBeInTheDocument();
    expect(screen.getByText("Second CV")).toBeInTheDocument();
    expect(screen.getByText("First description")).toBeInTheDocument();
    expect(screen.getByText("Second description")).toBeInTheDocument();
  });

  it("shows the create action when canCreate is true", () => {
    renderTable({ canCreate: true });
    expect(screen.getByText("createCv")).toBeInTheDocument();
  });

  it("hides the create action when canCreate is false", () => {
    renderTable({ canCreate: false });
    expect(screen.queryByText("createCv")).not.toBeInTheDocument();
  });

  it("shows only the read-only open action for non-mutators", () => {
    renderTable({ isAdmin: false });
    expect(screen.getAllByRole("button", { name: "Open" })).toHaveLength(cvs.length);
  });

  it("filters rows as the search box is typed into", async () => {
    const user = userEvent.setup();
    renderTable({});
    await user.type(screen.getByPlaceholderText("search"), "second");
    expect(screen.getByText("Second CV")).toBeInTheDocument();
    expect(screen.queryByText("First CV")).not.toBeInTheDocument();
  });

  it("renders the empty state when there are no rows", () => {
    renderTable({ data: [] });
    expect(screen.getByText("noCvsFound")).toBeInTheDocument();
  });

  it("renders the loading message while loading", () => {
    renderTable({ data: [], loading: true });
    expect(screen.getByText("loading")).toBeInTheDocument();
  });

  it("renders the server error instead of rows", () => {
    renderTable({ serverError: "Failed to load CVs" });
    expect(screen.getByText("Failed to load CVs")).toBeInTheDocument();
  });

  it("aligns the colgroup with every rendered row (4 cols, 4 header cells, 4 body cells per main row, description row spans all)", () => {
    const { view } = renderTable({});
    const table = view.container.querySelector("table")!;

    const cols = Array.from(table.querySelectorAll("colgroup > col"));
    expect(cols).toHaveLength(4);
    expect(cols.map((c) => c.getAttribute("class") ?? "")).toEqual([
      "",
      "max-md:hidden max-md:w-0",
      "",
      "w-12",
    ]);

    const heads = Array.from(table.querySelectorAll("thead th"));
    expect(heads).toHaveLength(4);

    const bodies = Array.from(table.querySelectorAll("tbody"));
    expect(bodies).toHaveLength(cvs.length);

    for (const tbody of bodies) {
      const rows = Array.from(tbody.querySelectorAll("tr"));
      expect(rows).toHaveLength(2);
      expect(rows[0].querySelectorAll("td")).toHaveLength(4);
      const descriptionCells = rows[1].querySelectorAll("td");
      expect(descriptionCells).toHaveLength(1);
      expect(descriptionCells[0]).toHaveAttribute("colspan", "4");
    }
  });
});
