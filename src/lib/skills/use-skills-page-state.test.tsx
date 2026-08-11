import { renderHook, act } from "@testing-library/react";
import { useSkillsPageState } from "./use-skills-page-state";
import { useSkillsCatalog } from "./use-skills-catalog";

jest.mock("./use-skills-catalog", () => ({
  useSkillsCatalog: jest.fn(),
}));

const mockUseSkillsCatalog = useSkillsCatalog as unknown as jest.Mock;

const skills = [
  { name: "TypeScript", mastery: "Proficient" as const, categoryId: "c1" },
  { name: "Figma", mastery: "Competent" as const, categoryId: "c2" },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockUseSkillsCatalog.mockReturnValue({
    groupSkillsByCategory: jest.fn((items: unknown[]) => [
      { categoryId: "g", categoryName: "Group", skills: items },
    ]),
    availableSkills: jest.fn(() => []),
    skillCategoryMap: new Map([["TypeScript", "c1"]]),
  });
});

describe("useSkillsPageState", () => {
  it("groups skills by category and computes available skills", () => {
    const { result } = renderHook(() => useSkillsPageState(skills));
    expect(result.current.skillsByCategory).toEqual([
      { categoryId: "g", categoryName: "Group", skills: skills },
    ]);
    expect(result.current.availableSkills).toEqual([]);
    expect(result.current.removeMode).toBe(false);
    expect(result.current.selectedSkills.size).toBe(0);
  });

  it("toggles skill selection on and off", () => {
    const { result } = renderHook(() => useSkillsPageState(skills));
    act(() => result.current.toggleSkillSelection("TypeScript"));
    expect(result.current.selectedSkills.has("TypeScript")).toBe(true);
    act(() => result.current.toggleSkillSelection("TypeScript"));
    expect(result.current.selectedSkills.has("TypeScript")).toBe(false);
  });

  it("enters and cancels remove mode clearing the selection", () => {
    const { result } = renderHook(() => useSkillsPageState(skills));
    act(() => result.current.toggleSkillSelection("TypeScript"));
    act(() => result.current.enterRemoveMode());
    expect(result.current.removeMode).toBe(true);
    expect(result.current.selectedSkills.size).toBe(0);

    act(() => result.current.toggleSkillSelection("Figma"));
    act(() => result.current.cancelRemove());
    expect(result.current.removeMode).toBe(false);
    expect(result.current.selectedSkills.size).toBe(0);
  });

  it("exposes dialog open state setters and update target setters", () => {
    const { result } = renderHook(() => useSkillsPageState(skills));
    act(() => result.current.setAddDialogOpen(true));
    expect(result.current.addDialogOpen).toBe(true);
    act(() => result.current.setUpdateSkillTarget(skills[0]));
    expect(result.current.updateSkillTarget).toBe(skills[0]);
    act(() => result.current.setRemoveMode(true));
    expect(result.current.removeMode).toBe(true);
    act(() => result.current.setSelectedSkills(new Set(["TypeScript"])));
    expect(result.current.selectedSkills.has("TypeScript")).toBe(true);
  });
});
