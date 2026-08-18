import { renderHook, act, waitFor } from "@testing-library/react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useCvProjectsPage } from "./use-cv-projects-page";
import { makeCv, makeCvProject } from "@/test-utils/cv-fixtures";

jest.mock("@apollo/client/react", () => ({ useQuery: jest.fn(), useMutation: jest.fn() }));
jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("@/lib/auth/permissions", () => ({
  usePermissions: () => ({ canEdit: mockCanEditValue() }),
}));

const mockUseQuery = useQuery as unknown as jest.Mock;
const mockUseMutation = useMutation as unknown as jest.Mock;
const mockRefetch = jest.fn();

const mockCanEditValue = jest.fn(() => true);

function operationName(doc: unknown): string {
  return (
    (doc as { definitions?: Array<{ name?: { value?: string } }> }).definitions?.[0]?.name?.value ??
    ""
  );
}

const alpha = makeCvProject({
  id: "cp1",
  name: "Alpha",
  internal_name: "alpha",
  project: { id: "prj1", name: "Alpha", internal_name: "alpha" },
});
const beta = makeCvProject({
  id: "cp2",
  name: "Beta",
  internal_name: "beta",
  domain: "Mobile",
  start_date: "2024-02-01",
  project: { id: "prj2", name: "Beta", internal_name: "beta" },
});

const allProjectsOptions = [
  {
    id: "prj1",
    name: "Alpha",
    internal_name: "alpha",
    domain: "Web",
    start_date: "",
    end_date: null,
    description: "",
    environment: [],
  },
  {
    id: "prj2",
    name: "Beta",
    internal_name: "beta",
    domain: "Mobile",
    start_date: "",
    end_date: null,
    description: "",
    environment: [],
  },
  {
    id: "prj3",
    name: "Gamma",
    internal_name: "gamma",
    domain: "AI",
    start_date: "",
    end_date: null,
    description: "",
    environment: [],
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockCanEditValue.mockReturnValue(true);
  mockUseQuery.mockImplementation((doc: unknown) => {
    const name = operationName(doc);
    if (name === "Cv") {
      return {
        data: { cv: makeCv({ projects: [alpha, beta] }) },
        loading: false,
        refetch: mockRefetch,
      };
    }
    return { data: { projects: allProjectsOptions }, loading: false, refetch: jest.fn() };
  });
  mockUseMutation.mockReturnValue([jest.fn(), { loading: false }]);
});

describe("useCvProjectsPage", () => {
  it("renders the initial SSR rows before the network query resolves", () => {
    mockUseQuery.mockReturnValue({ data: undefined, loading: true, refetch: mockRefetch });
    const { result } = renderHook(() => useCvProjectsPage("cv1", makeCv({ projects: [alpha] })));
    expect(result.current.projects.map((p) => p.id)).toEqual(["cp1"]);
    expect(result.current.loading).toBe(true);
  });

  it("replaces the initial rows with the server list once loaded", async () => {
    const { result } = renderHook(() => useCvProjectsPage("cv1", makeCv({ projects: [alpha] })));
    await waitFor(() => expect(result.current.projects.map((p) => p.id)).toEqual(["cp1", "cp2"]));
  });

  it("excludes already assigned projects from the available options", () => {
    const { result } = renderHook(() =>
      useCvProjectsPage("cv1", makeCv({ projects: [alpha, beta] })),
    );
    expect(result.current.allProjects.map((p) => p.id)).toEqual(["prj3"]);
  });

  it("merges a created project into the local list, closes the dialog and refetches", async () => {
    const addCvProject = jest.fn().mockResolvedValue({
      data: {
        addCvProject: {
          ...makeCv(),
          projects: [
            makeCvProject({
              id: "cp3",
              name: "Gamma",
              internal_name: "gamma",
              project: { id: "prj3", name: "Gamma", internal_name: "gamma" },
            }),
            alpha,
            beta,
          ],
        },
      },
    });
    mockUseMutation.mockImplementation((doc: unknown) => {
      const name = operationName(doc);
      if (name === "AddCvProject") return [addCvProject, { loading: false }];
      return [jest.fn(), { loading: false }];
    });

    const { result } = renderHook(() =>
      useCvProjectsPage("cv1", makeCv({ projects: [alpha, beta] })),
    );
    await waitFor(() => expect(result.current.projects).toHaveLength(2));

    await act(async () => {
      await result.current.handleCreate({
        projectId: "prj3",
        start_date: "2024-03-01",
        end_date: null,
        roles: ["Lead"],
        responsibilities: ["Ship"],
      });
    });

    expect(addCvProject).toHaveBeenCalledWith({
      variables: {
        project: {
          cvId: "cv1",
          projectId: "prj3",
          start_date: "2024-03-01",
          end_date: null,
          roles: ["Lead"],
          responsibilities: ["Ship"],
        },
      },
    });
    expect(result.current.projects.map((p) => p.id)).toEqual(["cp3", "cp1", "cp2"]);
    expect(result.current.createOpen).toBe(false);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it("updates the local list on handleUpdate and clears the update target", async () => {
    const updateCvProject = jest.fn().mockResolvedValue({
      data: {
        updateCvProject: {
          ...makeCv(),
          projects: [alpha, beta],
        },
      },
    });
    mockUseMutation.mockImplementation((doc: unknown) => {
      const name = operationName(doc);
      if (name === "UpdateCvProject") return [updateCvProject, { loading: false }];
      return [jest.fn(), { loading: false }];
    });

    const { result } = renderHook(() =>
      useCvProjectsPage("cv1", makeCv({ projects: [alpha, beta] })),
    );
    await waitFor(() => expect(result.current.projects).toHaveLength(2));

    await act(async () => {
      await result.current.handleUpdate({
        projectId: "prj1",
        start_date: "2024-01-01",
        end_date: null,
        roles: ["Lead"],
        responsibilities: [],
      });
    });

    expect(result.current.projects.map((p) => p.id)).toEqual(["cp1", "cp2"]);
    expect(result.current.updateTarget).toBeNull();
  });

  it("deletes a project from the local list on handleDelete", async () => {
    const removeCvProject = jest.fn().mockResolvedValue({
      data: {
        removeCvProject: {
          ...makeCv(),
          projects: [beta],
        },
      },
    });
    mockUseMutation.mockImplementation((doc: unknown) => {
      const name = operationName(doc);
      if (name === "RemoveCvProject") return [removeCvProject, { loading: false }];
      return [jest.fn(), { loading: false }];
    });

    const { result } = renderHook(() =>
      useCvProjectsPage("cv1", makeCv({ projects: [alpha, beta] })),
    );
    await waitFor(() => expect(result.current.projects).toHaveLength(2));

    await act(async () => {
      await result.current.handleDelete("prj1");
    });

    expect(removeCvProject).toHaveBeenCalledWith({
      variables: { project: { cvId: "cv1", projectId: "prj1" } },
    });
    expect(result.current.projects.map((p) => p.id)).toEqual(["cp2"]);
  });

  it("derives canMutate from the cv owner permissions", () => {
    mockCanEditValue.mockReturnValue(false);
    const { result } = renderHook(() => useCvProjectsPage("cv1", makeCv({ projects: [] })));
    expect(result.current.canMutate).toBe(false);
  });

  it("exposes dialog targets and filtering state", () => {
    const { result } = renderHook(() => useCvProjectsPage("cv1", makeCv({ projects: [alpha] })));
    act(() => result.current.setGlobalFilter("al"));
    expect(result.current.globalFilter).toBe("al");
    act(() => result.current.setOpenProject(alpha));
    expect(result.current.openProject).toBe(alpha);
    act(() => result.current.setCreateOpen(true));
    expect(result.current.createOpen).toBe(true);
    act(() => result.current.setUpdateTarget(alpha));
    expect(result.current.updateTarget).toBe(alpha);
    act(() => result.current.setDeleteTarget(beta));
    expect(result.current.deleteTarget).toBe(beta);
  });
});
