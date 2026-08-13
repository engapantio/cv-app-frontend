import { renderHook, act, waitFor } from "@testing-library/react";
import { useQuery } from "@apollo/client/react";
import { useCvSkillsPage } from "./use-cv-skills-page";
import { useSkillsPageState } from "@/lib/skills/use-skills-page-state";
import { useSkillMutations } from "@/lib/skills/use-skill-mutations";
import type { CvQuery } from "@/gql/generated/graphql";

jest.mock("@apollo/client/react", () => ({ useQuery: jest.fn() }));
jest.mock("@/lib/auth/permissions", () => ({
  usePermissions: () => ({ canEdit: mockCanEditValue() }),
}));
jest.mock("@/lib/skills/use-skills-page-state", () => ({
  useSkillsPageState: jest.fn(),
}));
jest.mock("@/lib/skills/use-skill-mutations", () => ({
  useSkillMutations: jest.fn(),
}));

const mockUseQuery = useQuery as unknown as jest.Mock;
const mockUseSkillsPageState = useSkillsPageState as unknown as jest.Mock;
const mockUseSkillMutations = useSkillMutations as unknown as jest.Mock;

const mockCanEditValue = jest.fn(() => true);

const skills = [
  { name: "TypeScript", mastery: "Proficient" as const, categoryId: "c1" },
  { name: "Figma", mastery: "Competent" as const, categoryId: "c2" },
];

const cv: CvQuery["cv"] = {
  id: "cv1",
  created_at: "2024-01-01T00:00:00Z",
  name: "Senior CV",
  education: "BSc",
  description: "Backend CV",
  user: {
    id: "owner-1",
    email: "owner@b.com",
    position_name: "Developer",
    profile: {
      id: "p1",
      full_name: "Owner One",
      avatar: null,
      languages: [],
    },
  },
  projects: [],
  skills,
  languages: [],
};

const stateReturn = {
  skillCategoryMap: new Map([["TypeScript", "c1"]]),
  skillsByCategory: [{ categoryId: "g", categoryName: "Group", skills }],
  availableSkills: ["React"],
  removeMode: false,
  selectedSkills: new Set<string>(),
  addDialogOpen: false,
  setAddDialogOpen: jest.fn(),
  updateSkillTarget: null,
  setUpdateSkillTarget: jest.fn(),
  toggleSkillSelection: jest.fn(),
  enterRemoveMode: jest.fn(),
  cancelRemove: jest.fn(),
  setSelectedSkills: jest.fn(),
  setRemoveMode: jest.fn(),
};

const mutationsReturn = {
  handleAddSkill: jest.fn(),
  handleUpdateSkill: jest.fn(),
  handleDeleteSkills: jest.fn(),
  addingSkill: false,
  updatingSkill: false,
  deletingSkill: false,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockCanEditValue.mockReturnValue(true);
  mockUseQuery.mockReturnValue({ data: { cv }, loading: false, refetch: jest.fn() });
  mockUseSkillsPageState.mockReturnValue(stateReturn);
  mockUseSkillMutations.mockReturnValue(mutationsReturn);
});

describe("useCvSkillsPage", () => {
  it("fetches the cv and exposes loading state", async () => {
    const { result } = renderHook(() => useCvSkillsPage("cv1"));
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ variables: { cvId: "cv1" }, fetchPolicy: "cache-and-network" }),
    );
    await waitFor(() => expect(result.current.hasCv).toBe(true));
    expect(result.current.loading).toBe(false);
    expect(mockUseSkillsPageState).toHaveBeenCalledWith(skills, undefined);
  });

  it("derives cv skills from the initial cv when the query has no data", () => {
    mockUseQuery.mockReturnValue({ data: undefined, loading: false, refetch: jest.fn() });
    const initialCv: CvQuery["cv"] = {
      ...cv,
      skills: [{ name: "GraphQL", mastery: "Expert", categoryId: "c9" }],
    };
    renderHook(() => useCvSkillsPage("cv1", initialCv));
    expect(mockUseSkillsPageState).toHaveBeenCalledWith(
      [{ name: "GraphQL", mastery: "Expert", categoryId: "c9" }],
      undefined,
    );
  });

  it("falls back to an empty skill list when the cv has no skills", () => {
    mockUseQuery.mockReturnValue({
      data: { cv: { ...cv, skills: [] } },
      loading: false,
      refetch: jest.fn(),
    });
    renderHook(() => useCvSkillsPage("cv1"));
    expect(mockUseSkillsPageState).toHaveBeenCalledWith([], undefined);
  });

  it("passes the initial catalog through to the skills page state", () => {
    renderHook(() => useCvSkillsPage("cv1", cv, { categories: [], skills: [] }));
    expect(mockUseSkillsPageState).toHaveBeenCalledWith(skills, { categories: [], skills: [] });
  });

  it("reports loading when the query is loading and no cv is available yet", () => {
    mockUseQuery.mockReturnValue({ data: undefined, loading: true, refetch: jest.fn() });
    const { result } = renderHook(() => useCvSkillsPage("cv1"));
    expect(result.current.loading).toBe(true);
    expect(result.current.hasCv).toBe(false);
  });

  it("wires the skill mutations with the cv id, cvId idField and refetch", () => {
    const refetch = jest.fn();
    mockUseQuery.mockReturnValue({ data: { cv }, loading: false, refetch });
    renderHook(() => useCvSkillsPage("cv1"));
    expect(mockUseSkillMutations).toHaveBeenCalledWith(
      expect.objectContaining({
        entityId: "cv1",
        idField: "cvId",
        refetch,
        skillCategoryMap: stateReturn.skillCategoryMap,
      }),
    );
  });

  it("deletes the selected skills and clears the selection on success", async () => {
    const setSelectedSkills = jest.fn();
    const setRemoveMode = jest.fn();
    mockUseSkillsPageState.mockReturnValue({
      ...stateReturn,
      selectedSkills: new Set(["TypeScript"]),
      setSelectedSkills,
      setRemoveMode,
    });
    const deleteSkills = jest.fn().mockResolvedValue(true);
    mockUseSkillMutations.mockReturnValue({ ...mutationsReturn, handleDeleteSkills: deleteSkills });

    const { result } = renderHook(() => useCvSkillsPage("cv1"));
    await act(async () => {
      await result.current.handleDeleteSkills();
    });
    expect(deleteSkills).toHaveBeenCalledWith(["TypeScript"]);
    expect(setSelectedSkills).toHaveBeenCalledWith(new Set());
    expect(setRemoveMode).toHaveBeenCalledWith(false);
  });

  it("keeps the selection and remove mode when deletion fails", async () => {
    const setSelectedSkills = jest.fn();
    const setRemoveMode = jest.fn();
    mockUseSkillsPageState.mockReturnValue({
      ...stateReturn,
      selectedSkills: new Set(["TypeScript"]),
      setSelectedSkills,
      setRemoveMode,
    });
    const deleteSkills = jest.fn().mockResolvedValue(false);
    mockUseSkillMutations.mockReturnValue({ ...mutationsReturn, handleDeleteSkills: deleteSkills });

    const { result } = renderHook(() => useCvSkillsPage("cv1"));
    await act(async () => {
      await result.current.handleDeleteSkills();
    });
    expect(setSelectedSkills).not.toHaveBeenCalled();
    expect(setRemoveMode).not.toHaveBeenCalled();
  });

  it("derives canMutate from the cv owner permissions", () => {
    mockCanEditValue.mockReturnValue(false);
    const { result } = renderHook(() => useCvSkillsPage("cv1"));
    expect(result.current.canMutate).toBe(false);
  });

  it("exposes the skills page state and mutation helpers", async () => {
    const { result } = renderHook(() => useCvSkillsPage("cv1"));
    await waitFor(() => expect(result.current.hasCv).toBe(true));
    expect(result.current.skillsByCategory).toEqual(stateReturn.skillsByCategory);
    expect(result.current.availableSkills).toEqual(stateReturn.availableSkills);
    expect(result.current.removeMode).toBe(false);
    expect(result.current.addDialogOpen).toBe(false);
    expect(result.current.handleAddSkill).toBe(mutationsReturn.handleAddSkill);
    expect(result.current.handleUpdateSkill).toBe(mutationsReturn.handleUpdateSkill);
    expect(result.current.addingSkill).toBe(false);
    expect(result.current.updatingSkill).toBe(false);
    expect(result.current.deletingSkill).toBe(false);
    act(() => result.current.toggleSkillSelection("TypeScript"));
    expect(stateReturn.toggleSkillSelection).toHaveBeenCalledWith("TypeScript");
  });
});
