import { renderHook, act, waitFor } from "@testing-library/react";
import { useQuery } from "@apollo/client/react";
import { useCvsPage } from "./use-cvs-page";
import { useCvsListPage } from "./use-cvs-list";

jest.mock("@apollo/client/react", () => ({ useQuery: jest.fn() }));
jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("next/navigation", () => ({ useRouter: () => mockUseRouter() }));
jest.mock("@/lib/auth/permissions", () => ({
  usePermissions: () => mockUsePermissions(),
}));
jest.mock("@/features/cvs/columns", () => ({
  createCvsColumns: jest.fn(() => [
    { id: "name", accessorKey: "name", enableGlobalFilter: true, header: () => null },
    { id: "actions", header: () => null, cell: () => null },
  ]),
}));

const mockUseQuery = useQuery as unknown as jest.Mock;
const mockUseRouter = jest.fn(() => ({ push: jest.fn() }));
const mockUsePermissions = jest.fn(() => ({
  currentUserId: "u1",
  isAdmin: false,
  user: { id: "u1", email: "u1@b.com", role: "Employee" },
}));

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
    education: "MSc",
    description: "Second description",
    user: { id: "u2", email: "u2@b.com", profile: { id: "p2", full_name: "C D", avatar: null } },
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockUseQuery.mockReturnValue({ data: undefined, loading: true, refetch: jest.fn() });
});

describe("useCvsPage", () => {
  it("renders the initial SSR rows before the network query resolves", () => {
    const { result } = renderHook(() =>
      useCvsPage({ userId: "u1", initialCvs: [cvs[0] as never] }),
    );
    expect(result.current.rows.map((r) => r.original.id)).toEqual(["c1"]);
    expect(result.current.loading).toBe(false);
  });

  it("replaces the initial rows with the server list once loaded", async () => {
    mockUseQuery.mockReturnValue({
      data: { user: { cvs } },
      loading: false,
      refetch: jest.fn(),
    });
    const { result } = renderHook(() =>
      useCvsPage({ userId: "u1", initialCvs: [cvs[0] as never] }),
    );
    await waitFor(() => expect(result.current.rows).toHaveLength(2));
    expect(result.current.rows.map((r) => r.original.id)).toEqual(["c1", "c2"]);
  });

  it("keeps the initial rows when the server list is empty", () => {
    mockUseQuery.mockReturnValue({
      data: { user: { cvs: [] } },
      loading: false,
      refetch: jest.fn(),
    });
    const { result } = renderHook(() =>
      useCvsPage({ userId: "u1", initialCvs: [cvs[0] as never] }),
    );
    expect(result.current.rows.map((r) => r.original.id)).toEqual(["c1"]);
  });

  it("queries the user cv data for the page owner", () => {
    renderHook(() => useCvsPage({ userId: "u1", initialCvs: [] }));
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        variables: { userId: "u1" },
        fetchPolicy: "cache-and-network",
      }),
    );
  });

  it("allows the page owner to create cvs", () => {
    mockUsePermissions.mockReturnValue({
      currentUserId: "u1",
      isAdmin: false,
      user: { id: "u1", email: "u1@b.com", role: "Employee" },
    });
    const { result } = renderHook(() => useCvsPage({ userId: "u1", initialCvs: [] }));
    expect(result.current.canCreate).toBe(true);
  });

  it("allows admins to create cvs for any user", () => {
    mockUsePermissions.mockReturnValue({
      currentUserId: "admin-1",
      isAdmin: true,
      user: { id: "admin-1", email: "a@b.com", role: "Admin" },
    });
    const { result } = renderHook(() => useCvsPage({ userId: "u9", initialCvs: [] }));
    expect(result.current.canCreate).toBe(true);
  });

  it("blocks a regular user from creating cvs for another user", () => {
    mockUsePermissions.mockReturnValue({
      currentUserId: "u3",
      isAdmin: false,
      user: { id: "u3", email: "u3@b.com", role: "Employee" },
    });
    const { result } = renderHook(() => useCvsPage({ userId: "u1", initialCvs: [] }));
    expect(result.current.canCreate).toBe(false);
  });

  it("prepends a locally created cv with the owner resolved from the page", async () => {
    const { result } = renderHook(() =>
      useCvsPage({ userId: "u1", initialCvs: [cvs[0] as never] }),
    );
    act(() => {
      result.current.handleCreated({
        id: "c3",
        created_at: "",
        name: "New CV",
        education: null,
        description: "New",
      } as never);
    });
    expect(result.current.rows.map((r) => r.original.id)).toEqual(["c3", "c1"]);
  });

  it("removes a cv from the list on handleDeleted", () => {
    const { result } = renderHook(() =>
      useCvsPage({ userId: "u1", initialCvs: [cvs[0] as never, cvs[1] as never] }),
    );
    act(() => {
      result.current.handleDeleted("c1");
    });
    expect(result.current.rows.map((r) => r.original.id)).toEqual(["c2"]);
  });

  it("filters rows by the global filter", () => {
    const { result } = renderHook(() =>
      useCvsPage({ userId: "u1", initialCvs: [cvs[0] as never, cvs[1] as never] }),
    );
    act(() => {
      result.current.setGlobalFilter("second");
    });
    expect(result.current.rows.map((r) => r.original.id)).toEqual(["c2"]);
  });

  it("navigates to the cv details page on open", () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push });
    const { result } = renderHook(() => useCvsPage({ userId: "u1", initialCvs: [] }));
    act(() => {
      result.current.handleOpen("c1");
    });
    expect(push).toHaveBeenCalledWith("/cvs/c1/details");
  });
});

describe("useCvsListPage", () => {
  it("reads the global cv list from the Cvs query", async () => {
    mockUseQuery.mockReturnValue({
      data: { cvs },
      loading: false,
      refetch: jest.fn(),
    });
    const { result } = renderHook(() => useCvsListPage([]));
    await waitFor(() => expect(result.current.rows).toHaveLength(2));
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ fetchPolicy: "cache-and-network" }),
    );
  });

  it("allows any signed-in user to create on the global list", () => {
    mockUseQuery.mockReturnValue({ data: { cvs }, loading: false, refetch: jest.fn() });
    mockUsePermissions.mockReturnValue({
      currentUserId: "u3",
      isAdmin: false,
      user: { id: "u3", email: "u3@b.com", role: "Employee" },
    });
    const { result } = renderHook(() => useCvsListPage([]));
    expect(result.current.canCreate).toBe(true);
  });
});
