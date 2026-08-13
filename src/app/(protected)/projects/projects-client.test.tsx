import { render, screen } from "@testing-library/react";
import ProjectsClient from "./projects-client";
import { useProjectsPage } from "@/features/projects/hooks/use-projects-page";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("@/features/projects/hooks/use-projects-page", () => ({
  useProjectsPage: jest.fn(),
}));
jest.mock("@/features/projects/components/projects-table", () => ({
  ProjectsTable: () => <div data-testid="projects-table" />,
}));
jest.mock("@/features/projects/components/create-project-dialog", () => ({
  CreateProjectDialog: () => <div data-testid="create-project-dialog" />,
}));
jest.mock("@/features/projects/components/update-project-dialog", () => ({
  UpdateProjectDialog: () => <div data-testid="update-project-dialog" />,
}));
jest.mock("@/features/projects/components/delete-project-dialog", () => ({
  DeleteProjectDialog: () => <div data-testid="delete-project-dialog" />,
}));
jest.mock("@/features/projects/components/open-project-overlay", () => ({
  OpenProjectOverlay: () => <div data-testid="open-project-overlay" />,
}));

const mockUseProjectsPage = useProjectsPage as unknown as jest.Mock;
const project = {
  id: "1",
  created_at: "2024-01-01",
  name: "Alpha",
  internal_name: "alpha",
  domain: "Web",
  start_date: "2024-01-01",
  end_date: null,
  description: "Description",
  environment: [],
} as never;

const defaultReturn = {
  loading: false,
  projects: [project],
  globalFilter: "",
  setGlobalFilter: jest.fn(),
  openProject: null,
  setOpenProject: jest.fn(),
  createOpen: false,
  setCreateOpen: jest.fn(),
  updateTarget: null,
  setUpdateTarget: jest.fn(),
  deleteTarget: null,
  setDeleteTarget: jest.fn(),
  handleCreate: jest.fn(),
  handleUpdate: jest.fn(),
  handleDelete: jest.fn(),
  creating: false,
  updating: false,
  deleting: false,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseProjectsPage.mockReturnValue(defaultReturn);
});

describe("ProjectsClient", () => {
  it("renders the page title and the projects table", () => {
    render(<ProjectsClient initialProjects={[]} serverError={null} />);
    expect(screen.getByText("projects")).toBeInTheDocument();
    expect(screen.getByTestId("projects-table")).toBeInTheDocument();
  });

  it("passes the initial rows to the hook", () => {
    const projects = [project];
    render(<ProjectsClient initialProjects={projects} serverError={null} />);
    expect(mockUseProjectsPage).toHaveBeenCalledWith(projects);
  });

  it("opens the create dialog when createOpen is set", async () => {
    mockUseProjectsPage.mockReturnValue({ ...defaultReturn, createOpen: true });
    render(<ProjectsClient initialProjects={[]} serverError={null} />);
    expect(await screen.findByTestId("create-project-dialog")).toBeInTheDocument();
  });

  it("opens the update dialog when a target is set", async () => {
    mockUseProjectsPage.mockReturnValue({ ...defaultReturn, updateTarget: project });
    render(<ProjectsClient initialProjects={[]} serverError={null} />);
    expect(await screen.findByTestId("update-project-dialog")).toBeInTheDocument();
  });

  it("opens the delete dialog when a target is set", async () => {
    mockUseProjectsPage.mockReturnValue({ ...defaultReturn, deleteTarget: project });
    render(<ProjectsClient initialProjects={[]} serverError={null} />);
    expect(await screen.findByTestId("delete-project-dialog")).toBeInTheDocument();
  });

  it("opens the overlay when a project is selected", async () => {
    mockUseProjectsPage.mockReturnValue({ ...defaultReturn, openProject: project });
    render(<ProjectsClient initialProjects={[]} serverError={null} />);
    expect(await screen.findByTestId("open-project-overlay")).toBeInTheDocument();
  });
});
