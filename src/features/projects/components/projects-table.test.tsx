import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectsTable } from "./projects-table";
import type { ProjectItem } from "../hooks/use-projects-page";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("lucide-react", () => require("@/test-utils/mocks").mockLucide());
jest.mock("@/components/ui/button", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/ui/input", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/ui/dropdown-menu", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/shared/row-actions", () => require("@/test-utils/mocks").mockRowActions());
jest.mock("@/components/shared/pill", () => require("@/test-utils/mocks").mockPill());
jest.mock("@/components/shared/table-pagination", () =>
  require("@/test-utils/mocks").mockTablePagination(),
);

const projects: ProjectItem[] = [
  {
    id: "1",
    created_at: "",
    name: "Alpha",
    internal_name: "alpha",
    domain: "Web",
    start_date: "2024-01-01",
    end_date: null,
    description: "First project",
    environment: ["React"],
  },
  {
    id: "2",
    created_at: "",
    name: "Beta",
    internal_name: "beta",
    domain: "Mobile",
    start_date: "2024-02-01",
    end_date: "2024-08-01",
    description: "Second project",
    environment: ["Swift"],
  },
];

function renderTable({
  canMutate = true,
  loading = false,
  data = projects,
  serverError,
}: {
  canMutate?: boolean;
  loading?: boolean;
  data?: ProjectItem[];
  serverError?: string | null;
}) {
  const actions = { onOpen: jest.fn(), onUpdate: jest.fn(), onDelete: jest.fn() };

  function Harness() {
    const [globalFilter, setGlobalFilter] = useState("");
    return (
      <ProjectsTable
        loading={loading}
        projects={data}
        canMutate={canMutate}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        onCreate={jest.fn()}
        onOpen={actions.onOpen}
        onUpdate={actions.onUpdate}
        onDelete={actions.onDelete}
        serverError={serverError}
      />
    );
  }
  const view = render(<Harness />);
  return { actions, view };
}

describe("ProjectsTable", () => {
  it("renders the column headers", () => {
    renderTable({});
    expect(screen.getByText("name")).toBeInTheDocument();
    expect(screen.getByText("domain")).toBeInTheDocument();
    expect(screen.getByText("startDate")).toBeInTheDocument();
  });

  it("renders each project row with its fields", () => {
    renderTable({});
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText("First project")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("shows the create action for admins", () => {
    renderTable({ canMutate: true });
    expect(screen.getByText("createProject")).toBeInTheDocument();
  });

  it("hides the create action for non-admins", () => {
    renderTable({ canMutate: false });
    expect(screen.queryByText("createProject")).not.toBeInTheDocument();
  });

  it("shows only the read-only open action for non-admins", () => {
    renderTable({ canMutate: false });
    expect(screen.getAllByRole("button", { name: "Open" })).toHaveLength(projects.length);
  });

  it("filters rows as the search box is typed into", async () => {
    const user = userEvent.setup();
    renderTable({});
    await user.type(screen.getByPlaceholderText("search"), "beta");
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
  });

  it("renders the empty state when there are no rows", () => {
    renderTable({ data: [] });
    expect(screen.getByText("noProjectsFound")).toBeInTheDocument();
  });

  it("renders the loading message while loading", () => {
    renderTable({ data: [], loading: true });
    expect(screen.getByText("loading")).toBeInTheDocument();
  });

  it("renders the server error instead of rows", () => {
    renderTable({ serverError: "Failed to load projects" });
    expect(screen.getByText("Failed to load projects")).toBeInTheDocument();
  });
});
