import { render, screen } from "@testing-library/react";
import CvProjectsClient from "./projects-client";
import { useCvProjectsPage } from "@/features/cvs-projects/hooks/use-cv-projects-page";
import { makeCvProject } from "@/test-utils/cv-fixtures";

jest.mock("@/features/cvs-projects/hooks/use-cv-projects-page", () => ({
  useCvProjectsPage: jest.fn(),
}));
jest.mock("@/features/cvs-projects/components/projects-table", () => ({
  ProjectsTable: () => <div data-testid="projects-table" />,
}));
jest.mock("@/features/cvs-projects/components/create-project-dialog", () => ({
  CreateProjectDialog: () => <div data-testid="create-project-dialog" />,
}));
jest.mock("@/features/cvs-projects/components/update-project-dialog", () => ({
  UpdateProjectDialog: () => <div data-testid="update-project-dialog" />,
}));
jest.mock("@/features/cvs-projects/components/delete-project-dialog", () => ({
  DeleteProjectDialog: () => <div data-testid="delete-project-dialog" />,
}));
jest.mock("@/features/cvs-projects/components/open-project-overlay", () => ({
  OpenProjectOverlay: () => <div data-testid="open-project-overlay" />,
}));

const mockUseCvProjectsPage = useCvProjectsPage as unknown as jest.Mock;
const project = makeCvProject();

const defaultReturn = {
  loading: false,
  projects: [project],
  allProjects: [],
  canMutate: true,
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
  mockUseCvProjectsPage.mockReturnValue(defaultReturn);
});

describe("CvProjectsClient", () => {
  it("renders the projects table", () => {
    render(<CvProjectsClient cvId="cv1" initialCv={null} serverError={null} />);
    expect(screen.getByTestId("projects-table")).toBeInTheDocument();
  });

  it("passes the cv id and initial data to the hook", () => {
    const initialCv = { id: "cv1", projects: [project] };
    render(<CvProjectsClient cvId="cv1" initialCv={initialCv as never} serverError={null} />);
    expect(mockUseCvProjectsPage).toHaveBeenCalledWith("cv1", initialCv, null);
  });

  it("renders the server error instead of the table", () => {
    render(<CvProjectsClient cvId="cv1" initialCv={null} serverError="Failed to load CV" />);
    expect(screen.getByText("Failed to load CV")).toBeInTheDocument();
    expect(screen.queryByTestId("projects-table")).not.toBeInTheDocument();
  });

  it("opens the create project dialog when requested", async () => {
    mockUseCvProjectsPage.mockReturnValue({ ...defaultReturn, createOpen: true });
    render(<CvProjectsClient cvId="cv1" initialCv={null} serverError={null} />);
    expect(await screen.findByTestId("create-project-dialog")).toBeInTheDocument();
  });

  it("opens the update project dialog when a target is set", async () => {
    mockUseCvProjectsPage.mockReturnValue({ ...defaultReturn, updateTarget: project });
    render(<CvProjectsClient cvId="cv1" initialCv={null} serverError={null} />);
    expect(await screen.findByTestId("update-project-dialog")).toBeInTheDocument();
  });

  it("opens the delete project dialog when a target is set", async () => {
    mockUseCvProjectsPage.mockReturnValue({ ...defaultReturn, deleteTarget: project });
    render(<CvProjectsClient cvId="cv1" initialCv={null} serverError={null} />);
    expect(await screen.findByTestId("delete-project-dialog")).toBeInTheDocument();
  });

  it("opens the project overlay when a project is set", async () => {
    mockUseCvProjectsPage.mockReturnValue({ ...defaultReturn, openProject: project });
    render(<CvProjectsClient cvId="cv1" initialCv={null} serverError={null} />);
    expect(await screen.findByTestId("open-project-overlay")).toBeInTheDocument();
  });
});
