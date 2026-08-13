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
import { LanguagesTable } from "./languages-table";
import { createLanguagesColumns } from "../columns";
import type { LanguageItem } from "../types";

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

const languages: LanguageItem[] = [
  { id: "1", created_at: "", iso2: "en", name: "English", native_name: "English" },
  { id: "2", created_at: "", iso2: "de", name: "German", native_name: "Deutsch" },
];

function renderTable({
  isAdmin = true,
  loading = false,
  data = languages,
  serverError,
  initialFilter = "",
}: {
  isAdmin?: boolean;
  loading?: boolean;
  data?: LanguageItem[];
  serverError?: string | null;
  initialFilter?: string;
}) {
  mockUsePermissions.mockReturnValue({ isAdmin, currentUserId: isAdmin ? "u1" : undefined });
  const t = (key: string) => key.split(".").pop() ?? key;
  const actions = { onOpen: jest.fn(), onUpdate: jest.fn(), onDelete: jest.fn() };

  function Harness() {
    const [globalFilter, setGlobalFilter] = useState(initialFilter);
    const columns = createLanguagesColumns(t, t, actions);
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
      <LanguagesTable
        loading={loading}
        table={table}
        columnCount={columns.length}
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

describe("LanguagesTable", () => {
  it("renders the sortable column headers", () => {
    renderTable({});
    expect(screen.getByText("name")).toBeInTheDocument();
    expect(screen.getByText("nativeName")).toBeInTheDocument();
    expect(screen.getByText("iso2")).toBeInTheDocument();
  });

  it("renders each language row with its fields", () => {
    renderTable({});
    expect(screen.getAllByText("English").length).toBeGreaterThan(0);
    expect(screen.getByText("Deutsch")).toBeInTheDocument();
    expect(screen.getByText("de")).toBeInTheDocument();
  });

  it("shows the create action for admins", () => {
    renderTable({ isAdmin: true });
    expect(screen.getByText("createLanguage")).toBeInTheDocument();
  });

  it("hides the create action for non-admins", () => {
    renderTable({ isAdmin: false });
    expect(screen.queryByText("createLanguage")).not.toBeInTheDocument();
  });

  it("filters rows as the search box is typed into", async () => {
    const user = userEvent.setup();
    renderTable({});
    await user.type(screen.getByPlaceholderText("search"), "germ");
    expect(screen.getByText("German")).toBeInTheDocument();
    expect(screen.queryByText("English")).not.toBeInTheDocument();
  });

  it("renders the empty state when there are no rows", () => {
    renderTable({ data: [] });
    expect(screen.getByText("noLanguagesFound")).toBeInTheDocument();
  });

  it("renders the loading message while loading", () => {
    renderTable({ data: [], loading: true });
    expect(screen.getByText("loading")).toBeInTheDocument();
  });

  it("renders the server error instead of rows", () => {
    renderTable({ serverError: "Failed to load languages" });
    expect(screen.getByText("Failed to load languages")).toBeInTheDocument();
  });

  it("opens a row through the non-admin read-only action", async () => {
    const user = userEvent.setup();
    const { actions } = renderTable({ isAdmin: false });
    await user.click(screen.getAllByRole("button", { name: "Open" })[0]);
    expect(actions.onOpen).toHaveBeenCalledTimes(1);
  });
});
