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
jest.mock("@/features/cvs-projects/components/add-project-dialog", () => ({
  AddProjectDialog: () => <div data-testid="add-project-dialog" />,
}));
jest.mock("@/features/cvs-projects/components/update-project-dialog", () => ({
  UpdateProjectDialog: () => <div data-testid="update-project-dialog" />,
}));
jest.mock("@/features/cvs-projects/components/remove-project-dialog", () => ({
  RemoveProjectDialog: () => <div data-testid="remove-project-dialog" />,
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
  addOpen: false,
  setAddOpen: jest.fn(),
  updateTarget: null,
  setUpdateTarget: jest.fn(),
  removeTarget: null,
  setRemoveTarget: jest.fn(),
  handleAdd: jest.fn(),
  handleUpdate: jest.fn(),
  handleRemove: jest.fn(),
  adding: false,
  updating: false,
  removing: false,
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

  it("opens the add project dialog when requested", async () => {
    mockUseCvProjectsPage.mockReturnValue({ ...defaultReturn, addOpen: true });
    render(<CvProjectsClient cvId="cv1" initialCv={null} serverError={null} />);
    expect(await screen.findByTestId("add-project-dialog")).toBeInTheDocument();
  });

  it("opens the update project dialog when a target is set", async () => {
    mockUseCvProjectsPage.mockReturnValue({ ...defaultReturn, updateTarget: project });
    render(<CvProjectsClient cvId="cv1" initialCv={null} serverError={null} />);
    expect(await screen.findByTestId("update-project-dialog")).toBeInTheDocument();
  });

  it("opens the remove project dialog when a target is set", async () => {
    mockUseCvProjectsPage.mockReturnValue({ ...defaultReturn, removeTarget: project });
    render(<CvProjectsClient cvId="cv1" initialCv={null} serverError={null} />);
    expect(await screen.findByTestId("remove-project-dialog")).toBeInTheDocument();
  });

  it("opens the project overlay when a project is set", async () => {
    mockUseCvProjectsPage.mockReturnValue({ ...defaultReturn, openProject: project });
    render(<CvProjectsClient cvId="cv1" initialCv={null} serverError={null} />);
    expect(await screen.findByTestId("open-project-overlay")).toBeInTheDocument();
  });
});
