import { renderHook, act, waitFor } from "@testing-library/react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useSkillsPage } from "./use-skills-page";
import type { SkillItem } from "../types";

jest.mock("@apollo/client/react", () => ({ useQuery: jest.fn(), useMutation: jest.fn() }));
jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("lucide-react", () => require("@/test-utils/mocks").mockLucide());
jest.mock("@/lib/auth/permissions", () => ({
  usePermissions: () => ({ isAdmin: mockIsAdmin(), user: { id: "admin-1", role: "Admin" } }),
}));

const mockIsAdmin = jest.fn(() => true);

jest.mock("@/components/ui/button", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/ui/dropdown-menu", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/shared/row-actions", () => require("@/test-utils/mocks").mockRowActions());
jest.mock("@/components/shared/sortable-header", () =>
  require("@/test-utils/mocks").mockSortableHeader(),
);

const mockUseQuery = useQuery as unknown as jest.Mock;
const mockUseMutation = useMutation as unknown as jest.Mock;

const skills: SkillItem[] = [
  {
    id: "1",
    created_at: "2024-01-01T00:00:00Z",
    name: "TypeScript",
    category_name: "Programming Language",
    category_parent_name: "Development",
    category: { id: "c1", name: "Programming Language", order: 1, parent: null },
  },
  {
    id: "2",
    created_at: "2024-01-02T00:00:00Z",
    name: "Figma",
    category_name: "Design",
    category_parent_name: null,
    category: null,
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockIsAdmin.mockReturnValue(true);
  mockUseMutation.mockReturnValue([jest.fn(), { loading: false }]);
  mockUseQuery.mockImplementation((doc: unknown) => {
    if (String(doc).includes("SkillCategories")) {
      return { data: { skillCategories: [] } };
    }
    return { data: { skills }, loading: false };
  });
});

describe("useSkillsPage", () => {
  it("hydrates the list from the query result", async () => {
    const { result } = renderHook(() => useSkillsPage([], null, []));
    await waitFor(() => expect(result.current.skillsList).toHaveLength(2));
    expect(result.current.skillsList.map((s) => s.name)).toEqual(["TypeScript", "Figma"]);
  });

  it("falls back to initial skills when the query returns no data", () => {
    mockUseQuery.mockReturnValue({ data: undefined, loading: false });
    const { result } = renderHook(() => useSkillsPage([skills[0]], null, []));
    expect(result.current.skillsList.map((s) => s.id)).toEqual(["1"]);
  });

  it("exposes isAdmin from permissions", () => {
    const { result } = renderHook(() => useSkillsPage([], null, []));
    expect(result.current.isAdmin).toBe(true);
    mockIsAdmin.mockReturnValue(false);
    const { result: employeeResult } = renderHook(() => useSkillsPage([], null, []));
    expect(employeeResult.current.isAdmin).toBe(false);
  });

  it("filters rows by name via the global filter", async () => {
    const { result } = renderHook(() => useSkillsPage([], null, []));
    await waitFor(() => expect(result.current.skillsList).toHaveLength(2));
    act(() => result.current.setGlobalFilter("figma"));
    expect(result.current.table.getRowModel().rows.map((r) => r.original.name)).toEqual(["Figma"]);
  });

  it("sorts rows by name", async () => {
    const { result } = renderHook(() => useSkillsPage([], null, []));
    await waitFor(() => expect(result.current.skillsList).toHaveLength(2));
    act(() => result.current.table.setSorting([{ id: "name", desc: false }]));
    expect(result.current.table.getRowModel().rows.map((r) => r.original.name)).toEqual([
      "Figma",
      "TypeScript",
    ]);
  });

  it("appends a skill on create, matching its category", async () => {
    mockUseQuery.mockReturnValue({ data: { skills: [] }, loading: false });
    const category = {
      id: "c1",
      name: "Programming Language",
      order: 1,
      parent: null,
      children: [] as { id: string; name: string; order: number }[],
    };
    const { result } = renderHook(() => useSkillsPage([], null, [category]));
    await waitFor(() => expect(result.current.skillsList).toHaveLength(0));

    act(() =>
      result.current.handleCreated({
        id: "3",
        created_at: "2024-01-03T00:00:00Z",
        name: "Go",
        category_name: "Programming Language",
        category_parent_name: "Development",
      }),
    );

    const created = result.current.skillsList.find((s) => s.id === "3");
    expect(created?.category?.name).toBe("Programming Language");
  });

  it("replaces a skill on update", async () => {
    const { result } = renderHook(() => useSkillsPage([], null, []));
    await waitFor(() => expect(result.current.skillsList).toHaveLength(2));
    act(() =>
      result.current.handleUpdated({
        id: "1",
        created_at: "2024-01-01T00:00:00Z",
        name: "Typescript",
        category_name: "Programming Language",
        category_parent_name: "Development",
      }),
    );
    expect(result.current.skillsList.find((s) => s.id === "1")?.name).toBe("Typescript");
  });

  it("removes a skill on delete", async () => {
    const { result } = renderHook(() => useSkillsPage([], null, []));
    await waitFor(() => expect(result.current.skillsList).toHaveLength(2));
    act(() => result.current.handleDeleted("1"));
    expect(result.current.skillsList.map((s) => s.id)).toEqual(["2"]);
  });
});
