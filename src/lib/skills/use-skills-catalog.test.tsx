import { renderHook } from "@testing-library/react";
import { useQuery } from "@apollo/client/react";
import { useSkillsCatalog } from "./use-skills-catalog";

jest.mock("@apollo/client/react", () => ({ useQuery: jest.fn() }));

const mockUseQuery = useQuery as unknown as jest.Mock;

const skills = [
  {
    id: "s1",
    created_at: "",
    name: "TypeScript",
    category_name: "Programming Language",
    category_parent_name: "Development",
    category: { id: "c1", name: "Programming Language", order: 1, parent: null },
  },
];

const categories = [
  { id: "c1", name: "Programming Language", order: 1, parent: null, children: [] },
];

describe("useSkillsCatalog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQuery.mockReturnValue({ data: { skills }, loading: false });
  });

  it("returns grouped categories and available skills from query data", () => {
    const { result } = renderHook(() => useSkillsCatalog());
    expect(
      result.current.groupSkillsByCategory([
        { name: "TypeScript", mastery: "Expert" as const, categoryId: "c1" },
      ]),
    ).toEqual([
      {
        categoryId: "Development",
        categoryName: "Development",
        skills: [{ name: "TypeScript", mastery: "Expert", categoryId: "c1" }],
      },
    ]);
    expect(result.current.skillCategoryMap.get("TypeScript")).toBe("c1");
    expect(result.current.availableSkills([])).toEqual(skills);
  });

  it("falls back to the initial catalog when queries have no data", () => {
    mockUseQuery.mockReturnValue({ data: undefined, loading: false });
    const initialCatalog = { skills, categories };
    const { result } = renderHook(() => useSkillsCatalog(initialCatalog));
    expect(
      result.current.availableSkills([
        { name: "TypeScript", mastery: "Novice" as const, categoryId: null },
      ]),
    ).toEqual([]);
  });

  it("exposes loading while either query is loading", () => {
    mockUseQuery.mockReturnValue({ data: { skills }, loading: true });
    const { result } = renderHook(() => useSkillsCatalog());
    expect(result.current.loading).toBe(true);
  });
});
