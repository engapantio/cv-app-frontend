import { renderHook, act, waitFor } from "@testing-library/react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useDepartmentsPage } from "./use-departments-page";

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

const departments = [
  { id: "1", created_at: "2024-01-01T00:00:00Z", name: "Engineering" },
  { id: "2", created_at: "2024-01-02T00:00:00Z", name: "Marketing" },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockUseMutation.mockReturnValue([jest.fn(), { loading: false }]);
  mockUseQuery.mockReturnValue({ data: { departments }, loading: false });
});

describe("useDepartmentsPage", () => {
  it("hydrates the list in server order (no local sort)", async () => {
    mockUseQuery.mockReturnValue({
      data: { departments: [departments[1], departments[0]] },
      loading: false,
    });
    const { result } = renderHook(() => useDepartmentsPage([]));
    await waitFor(() => expect(result.current.departmentsList).toHaveLength(2));
    expect(result.current.departmentsList.map((d) => d.name)).toEqual(["Marketing", "Engineering"]);
  });

  it("falls back to initial departments when the query returns no data", () => {
    mockUseQuery.mockReturnValue({ data: undefined, loading: false });
    const { result } = renderHook(() => useDepartmentsPage([departments[0]]));
    expect(result.current.departmentsList.map((d) => d.id)).toEqual(["1"]);
  });

  it("filters rows by name via the global filter", async () => {
    const { result } = renderHook(() => useDepartmentsPage([]));
    await waitFor(() => expect(result.current.departmentsList).toHaveLength(2));
    act(() => result.current.setGlobalFilter("engineering"));
    expect(result.current.table.getRowModel().rows.map((r) => r.original.name)).toEqual([
      "Engineering",
    ]);
  });

  it("sorts rows by name", async () => {
    const { result } = renderHook(() => useDepartmentsPage([]));
    await waitFor(() => expect(result.current.departmentsList).toHaveLength(2));
    act(() => result.current.table.setSorting([{ id: "name", desc: false }]));
    expect(result.current.table.getRowModel().rows.map((r) => r.original.name)).toEqual([
      "Engineering",
      "Marketing",
    ]);
  });

  it("does not mutate local state on create (cache.modify + useEffect handle it)", () => {
    const { result } = renderHook(() => useDepartmentsPage([]));
    expect(result.current.departmentsList).toHaveLength(2);
    act(() =>
      result.current.handleCreated({
        id: "3",
        created_at: "2024-01-03T00:00:00Z",
        name: "HR",
      }),
    );
    expect(result.current.departmentsList).toHaveLength(2);
  });

  it("replaces a department on update", async () => {
    const { result } = renderHook(() => useDepartmentsPage([]));
    await waitFor(() => expect(result.current.departmentsList).toHaveLength(2));
    act(() =>
      result.current.handleUpdated({
        id: "1",
        created_at: "2024-01-01T00:00:00Z",
        name: "Core Engineering",
      }),
    );
    expect(result.current.departmentsList.find((d) => d.id === "1")?.name).toBe("Core Engineering");
  });

  it("removes a department on delete", async () => {
    const { result } = renderHook(() => useDepartmentsPage([]));
    await waitFor(() => expect(result.current.departmentsList).toHaveLength(2));
    act(() => result.current.handleDeleted("1"));
    expect(result.current.departmentsList.map((d) => d.id)).toEqual(["2"]);
  });
});
