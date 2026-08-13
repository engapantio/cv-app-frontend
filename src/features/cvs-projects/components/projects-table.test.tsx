import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectsTable } from "./projects-table";
import { makeCvProject } from "@/test-utils/cv-fixtures";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("lucide-react", () => require("@/test-utils/mocks").mockLucide());
jest.mock("@/components/ui/button", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/ui/dropdown-menu", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/shared/row-actions", () => require("@/test-utils/mocks").mockRowActions());
jest.mock("@/components/shared/pill", () => require("@/test-utils/mocks").mockPill());
jest.mock("@/components/shared/table-pagination", () =>
  require("@/test-utils/mocks").mockTablePagination(),
);

const projects = [
  makeCvProject({
    id: "cp1",
    name: "Alpha",
    domain: "Web",
    start_date: "2024-01-01",
    description: "First project",
    roles: ["Lead"],
    responsibilities: ["Ship it"],
  }),
  makeCvProject({
    id: "cp2",
    name: "Beta",
    domain: "Mobile",
    start_date: "2024-02-01",
    end_date: "2024-08-01",
    description: "Second project",
    environment: ["Swift"],
    roles: ["Architect"],
    responsibilities: ["Design system"],
  }),
];

function renderTable({
  canMutate = true,
  loading = false,
  data = projects,
  serverError,
}: {
  canMutate?: boolean;
  loading?: boolean;
  data?: typeof projects;
  serverError?: string | null;
}) {
  const actions = { onAdd: jest.fn(), onOpen: jest.fn(), onUpdate: jest.fn(), onRemove: jest.fn() };

  function Harness() {
    const [globalFilter, setGlobalFilter] = useState("");
    return (
      <ProjectsTable
        loading={loading}
        projects={data}
        canMutate={canMutate}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        onAdd={actions.onAdd}
        onOpen={actions.onOpen}
        onUpdate={actions.onUpdate}
        onRemove={actions.onRemove}
        serverError={serverError}
      />
    );
  }
  const view = render(<Harness />);
  return { actions, view };
}

describe("CvProjectsTable", () => {
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
    expect(screen.getByText("Web")).toBeInTheDocument();
    expect(screen.getByText("First project")).toBeInTheDocument();
    expect(screen.getByText("Lead")).toBeInTheDocument();
    expect(screen.getByText("Ship it")).toBeInTheDocument();
  });

  it("shows the add action when the viewer can mutate", () => {
    renderTable({ canMutate: true });
    expect(screen.getByText("addProject")).toBeInTheDocument();
  });

  it("hides the add action for read-only viewers", () => {
    renderTable({ canMutate: false });
    expect(screen.queryByText("addProject")).not.toBeInTheDocument();
  });

  it("shows only the read-only open action for read-only viewers", () => {
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
    renderTable({ serverError: "Failed to load CV" });
    expect(screen.getByText("Failed to load CV")).toBeInTheDocument();
  });
});
