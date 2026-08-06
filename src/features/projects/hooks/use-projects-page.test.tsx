import { renderHook, act, waitFor } from "@testing-library/react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useProjectsPage } from "./use-projects-page";

jest.mock("@apollo/client/react", () => ({ useQuery: jest.fn(), useMutation: jest.fn() }));
jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("@/lib/auth/permissions", () => ({
  usePermissions: () => ({ isAdmin: mockIsAdmin(), user: { id: "admin-1", role: "Admin" } }),
}));

const mockIsAdmin = jest.fn(() => true);

const mockUseQuery = useQuery as unknown as jest.Mock;
const mockUseMutation = useMutation as unknown as jest.Mock;
const mockRefetch = jest.fn();

const projects = [
  {
    id: "1",
    created_at: "2024-01-01T00:00:00Z",
    name: "Alpha",
    internal_name: "alpha",
    domain: "Web",
    start_date: "2024-01-01",
    end_date: null,
    description: "First",
    environment: ["React"],
  },
  {
    id: "2",
    created_at: "2024-02-01T00:00:00Z",
    name: "Beta",
    internal_name: "beta",
    domain: "Mobile",
    start_date: "2024-02-01",
    end_date: null,
    description: "Second",
    environment: ["Swift"],
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockIsAdmin.mockReturnValue(true);
  mockUseMutation.mockReturnValue([jest.fn(), { loading: false }]);
  mockUseQuery.mockReturnValue({
    data: { projects, skills: [{ name: "React" }] },
    loading: false,
    refetch: mockRefetch,
  });
});

describe("useProjectsPage", () => {
  it("renders the initial SSR rows before the network query resolves", () => {
    mockUseQuery.mockReturnValue({ data: undefined, loading: true, refetch: mockRefetch });
    const { result } = renderHook(() => useProjectsPage([projects[0]]));
    expect(result.current.projects.map((p) => p.id)).toEqual(["1"]);
    expect(result.current.loading).toBe(false);
  });

  it("replaces the initial rows with the sorted server list once loaded", async () => {
    const { result } = renderHook(() => useProjectsPage([projects[0]]));
    await waitFor(() => expect(result.current.projects).toHaveLength(2));
    expect(result.current.projects.map((p) => p.id)).toEqual(["2", "1"]);
  });

  it("sorts projects by created_at descending", async () => {
    const { result } = renderHook(() => useProjectsPage([]));
    await waitFor(() => expect(result.current.projects).toHaveLength(2));
    expect(result.current.projects.map((p) => p.name)).toEqual(["Beta", "Alpha"]);
  });

  it("exposes canMutate from admin permissions", () => {
    const { result } = renderHook(() => useProjectsPage([]));
    expect(result.current.canMutate).toBe(true);
    mockIsAdmin.mockReturnValue(false);
    const { result: employeeResult } = renderHook(() => useProjectsPage([]));
    expect(employeeResult.current.canMutate).toBe(false);
  });

  it("merges a locally created project on top of server rows", async () => {
    const createProject = jest.fn().mockResolvedValue({
      data: {
        createProject: {
          id: "3",
          created_at: "2024-03-01T00:00:00Z",
          name: "Gamma",
          internal_name: "gamma",
          domain: "AI",
          start_date: "2024-03-01",
          end_date: null,
          description: "Third",
          environment: [],
        },
      },
    });
    mockUseMutation
      .mockReturnValueOnce([createProject, { loading: false }])
      .mockReturnValue([jest.fn(), { loading: false }]);

    const { result } = renderHook(() => useProjectsPage([]));
    await waitFor(() => expect(result.current.projects).toHaveLength(2));

    act(() => {
      void result.current.handleCreate({
        name: "Gamma",
        domain: "AI",
        start_date: "2024-03-01",
        end_date: null,
        description: "Third",
        environment: [],
      });
    });

    await waitFor(() =>
      expect(result.current.projects.map((p) => p.name)).toEqual(["Gamma", "Beta", "Alpha"]),
    );
    expect(mockRefetch).toHaveBeenCalled();
  });

  it("removes a locally created project on delete and refetches", async () => {
    const createProject = jest.fn().mockResolvedValue({
      data: {
        createProject: {
          id: "3",
          created_at: "2024-03-01T00:00:00Z",
          name: "Gamma",
          internal_name: "gamma",
          domain: "AI",
          start_date: "2024-03-01",
          end_date: null,
          description: "Third",
          environment: [],
        },
      },
    });
    const deleteProject = jest.fn().mockResolvedValue({ data: { deleteProject: { affected: 1 } } });
    mockUseMutation.mockImplementation((doc: unknown) =>
      String(doc).includes("Delete")
        ? [deleteProject, { loading: false }]
        : [createProject, { loading: false }],
    );

    const { result } = renderHook(() => useProjectsPage([]));
    await waitFor(() => expect(result.current.projects).toHaveLength(2));

    await act(async () => {
      await result.current.handleCreate({
        name: "Gamma",
        domain: "AI",
        start_date: "2024-03-01",
        end_date: null,
        description: "Third",
        environment: [],
      });
    });
    expect(result.current.projects.map((p) => p.id)).toEqual(["3", "2", "1"]);

    await act(async () => {
      await result.current.handleDelete("3");
    });

    expect(result.current.projects.map((p) => p.id)).toEqual(["2", "1"]);
    expect(mockRefetch).toHaveBeenCalled();
  });
});
