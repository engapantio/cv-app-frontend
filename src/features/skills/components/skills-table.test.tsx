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
import { SkillsTable } from "./skills-table";
import { createSkillsColumns } from "../columns";
import type { SkillItem } from "../types";
import type { SkillCategoriesQuery } from "@/gql/generated/graphql";

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

const categories: SkillCategoriesQuery["skillCategories"] = [
  { id: "c1", name: "Programming Language", order: 1, parent: null, children: [] },
  { id: "c2", name: "Design", order: 2, parent: null, children: [] },
];

function renderTable({
  isAdmin = true,
  loading = false,
  data = skills,
  serverError,
}: {
  isAdmin?: boolean;
  loading?: boolean;
  data?: SkillItem[];
  serverError?: string | null;
}) {
  const t = (key: string) => key.split(".").pop() ?? key;
  const actions = { onOpen: jest.fn(), onUpdate: jest.fn(), onDelete: jest.fn() };

  function Harness() {
    const [globalFilter, setGlobalFilter] = useState("");
    const columns = createSkillsColumns(t, t, isAdmin, actions);
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
      <SkillsTable
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
        categories={categories}
      />
    );
  }
  const view = render(<Harness />);
  return { actions, view };
}

describe("SkillsTable", () => {
  it("renders the sortable column headers", () => {
    renderTable({});
    expect(screen.getByText("name")).toBeInTheDocument();
    expect(screen.getByText("type")).toBeInTheDocument();
    expect(screen.getByText("category")).toBeInTheDocument();
  });

  it("renders each skill row with its fields", () => {
    renderTable({});
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("Development")).toBeInTheDocument();
    expect(screen.getByText("Design")).toBeInTheDocument();
  });

  it("shows the create action for admins", () => {
    renderTable({ isAdmin: true });
    expect(screen.getByText("createSkill")).toBeInTheDocument();
  });

  it("hides the create action for non-admins", () => {
    renderTable({ isAdmin: false });
    expect(screen.queryByText("createSkill")).not.toBeInTheDocument();
  });

  it("filters rows as the search box is typed into", async () => {
    const user = userEvent.setup();
    renderTable({});
    await user.type(screen.getByPlaceholderText("search"), "figma");
    expect(screen.getByText("Figma")).toBeInTheDocument();
    expect(screen.queryByText("TypeScript")).not.toBeInTheDocument();
  });

  it("renders the empty state when there are no rows", () => {
    renderTable({ data: [] });
    expect(screen.getByText("noSkillsFound")).toBeInTheDocument();
  });

  it("renders the loading message while loading", () => {
    renderTable({ data: [], loading: true });
    expect(screen.getByText("loading")).toBeInTheDocument();
  });

  it("renders the server error instead of rows", () => {
    renderTable({ serverError: "Failed to load skills" });
    expect(screen.getByText("Failed to load skills")).toBeInTheDocument();
  });
});
