import { renderHook, act, waitFor } from "@testing-library/react";
import { useQuery, useMutation } from "@apollo/client/react";
import { usePositionsPage } from "./use-positions-page";

jest.mock("@apollo/client/react", () => ({ useQuery: jest.fn(), useMutation: jest.fn() }));
jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("lucide-react", () => require("@/test-utils/mocks").mockLucide());
jest.mock("@/lib/auth/permissions", () => ({
  usePermissions: () => ({ isAdmin: true, user: { id: "admin-1", role: "Admin" } }),
}));

jest.mock("@/components/ui/button", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/ui/dropdown-menu", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/shared/row-actions", () => require("@/test-utils/mocks").mockRowActions());
jest.mock("@/components/shared/sortable-header", () =>
  require("@/test-utils/mocks").mockSortableHeader(),
);

const mockUseQuery = useQuery as unknown as jest.Mock;
const mockUseMutation = useMutation as unknown as jest.Mock;

const positions = [
  { id: "1", created_at: "2024-01-01T00:00:00Z", name: "Backend Developer" },
  { id: "2", created_at: "2024-01-02T00:00:00Z", name: "Frontend Developer" },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockUseMutation.mockReturnValue([jest.fn(), { loading: false }]);
  mockUseQuery.mockReturnValue({ data: { positions }, loading: false });
});

describe("usePositionsPage", () => {
  it("hydrates the list in server order (no local sort)", async () => {
    mockUseQuery.mockReturnValue({
      data: { positions: [positions[1], positions[0]] },
      loading: false,
    });
    const { result } = renderHook(() => usePositionsPage([]));
    await waitFor(() => expect(result.current.positionsList).toHaveLength(2));
    expect(result.current.positionsList.map((p) => p.name)).toEqual([
      "Frontend Developer",
      "Backend Developer",
    ]);
  });

  it("falls back to initial positions when the query returns no data", () => {
    mockUseQuery.mockReturnValue({ data: undefined, loading: false });
    const { result } = renderHook(() => usePositionsPage([positions[0]]));
    expect(result.current.positionsList.map((p) => p.id)).toEqual(["1"]);
  });

  it("filters rows by name via the global filter", async () => {
    const { result } = renderHook(() => usePositionsPage([]));
    await waitFor(() => expect(result.current.positionsList).toHaveLength(2));
    act(() => result.current.setGlobalFilter("backend"));
    expect(result.current.table.getRowModel().rows.map((r) => r.original.name)).toEqual([
      "Backend Developer",
    ]);
  });

  it("sorts rows by name", async () => {
    const { result } = renderHook(() => usePositionsPage([]));
    await waitFor(() => expect(result.current.positionsList).toHaveLength(2));
    act(() => result.current.table.setSorting([{ id: "name", desc: false }]));
    expect(result.current.table.getRowModel().rows.map((r) => r.original.name)).toEqual([
      "Backend Developer",
      "Frontend Developer",
    ]);
  });

  it("does not mutate local state on create (cache.modify + useEffect handle it)", () => {
    const { result } = renderHook(() => usePositionsPage([]));
    expect(result.current.positionsList).toHaveLength(2);
    act(() =>
      result.current.handleCreated({
        id: "3",
        created_at: "2024-01-03T00:00:00Z",
        name: "QA Engineer",
      }),
    );
    expect(result.current.positionsList).toHaveLength(2);
  });

  it("replaces a position on update", async () => {
    const { result } = renderHook(() => usePositionsPage([]));
    await waitFor(() => expect(result.current.positionsList).toHaveLength(2));
    act(() =>
      result.current.handleUpdated({
        id: "1",
        created_at: "2024-01-01T00:00:00Z",
        name: "Backend Engineer",
      }),
    );
    expect(result.current.positionsList.find((p) => p.id === "1")?.name).toBe("Backend Engineer");
  });

  it("removes a position on delete", async () => {
    const { result } = renderHook(() => usePositionsPage([]));
    await waitFor(() => expect(result.current.positionsList).toHaveLength(2));
    act(() => result.current.handleDeleted("1"));
    expect(result.current.positionsList.map((p) => p.id)).toEqual(["2"]);
  });
});
