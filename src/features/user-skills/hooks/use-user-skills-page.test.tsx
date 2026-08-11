import { renderHook, act, waitFor } from "@testing-library/react";
import { useQuery } from "@apollo/client/react";
import { useUserSkillsPage } from "./use-user-skills-page";
import { useSkillsPageState } from "@/lib/skills/use-skills-page-state";
import { useSkillMutations } from "@/lib/skills/use-skill-mutations";
import type { UserQuery } from "@/gql/generated/graphql";

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

const user: UserQuery["user"] = {
  id: "u1",
  created_at: "2024-01-01T00:00:00Z",
  email: "a@b.com",
  is_verified: true,
  role: "Employee",
  department_name: null,
  position_name: null,
  profile: {
    id: "p1",
    created_at: "2024-01-01T00:00:00Z",
    first_name: "A",
    last_name: "B",
    full_name: "A B",
    avatar: null,
    skills,
    languages: [],
  },
  department: null,
  position: null,
  cvs: [],
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
  mockUseQuery.mockReturnValue({ data: { user }, loading: false, refetch: jest.fn() });
  mockUseSkillsPageState.mockReturnValue(stateReturn);
  mockUseSkillMutations.mockReturnValue(mutationsReturn);
});

describe("useUserSkillsPage", () => {
  it("uses the fetched user and exposes loading state", async () => {
    const { result } = renderHook(() => useUserSkillsPage("u1"));
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ variables: { userId: "u1" }, fetchPolicy: "network-only" }),
    );
    await waitFor(() => expect(result.current.hasUser).toBe(true));
    expect(result.current.loading).toBe(false);
    expect(mockUseSkillsPageState).toHaveBeenCalledWith(skills, undefined);
  });

  it("derives profile skills from the initial user when the query has no data", () => {
    mockUseQuery.mockReturnValue({ data: undefined, loading: false, refetch: jest.fn() });
    const initialUser: UserQuery["user"] = {
      ...user,
      profile: {
        ...user.profile,
        skills: [{ name: "GraphQL", mastery: "Expert", categoryId: "c9" }],
      },
    };
    renderHook(() => useUserSkillsPage("u1", initialUser));
    expect(mockUseSkillsPageState).toHaveBeenCalledWith(
      [{ name: "GraphQL", mastery: "Expert", categoryId: "c9" }],
      undefined,
    );
  });

  it("falls back to an empty skill list when user has no profile skills", () => {
    mockUseQuery.mockReturnValue({
      data: { user: { ...user, profile: { ...user.profile, skills: [] } } },
      loading: false,
      refetch: jest.fn(),
    });
    renderHook(() => useUserSkillsPage("u1"));
    expect(mockUseSkillsPageState).toHaveBeenCalledWith([], undefined);
  });

  it("passes the initial catalog through to the skills page state", () => {
    renderHook(() => useUserSkillsPage("u1", user, { categories: [], skills: [] }));
    expect(mockUseSkillsPageState).toHaveBeenCalledWith(skills, { categories: [], skills: [] });
  });

  it("reports loading when the query is loading and no user is available yet", () => {
    mockUseQuery.mockReturnValue({ data: undefined, loading: true, refetch: jest.fn() });
    const { result } = renderHook(() => useUserSkillsPage("u1"));
    expect(result.current.loading).toBe(true);
    expect(result.current.hasUser).toBe(false);
  });

  it("wires the skill mutations with the user id and refetch", () => {
    const refetch = jest.fn();
    mockUseQuery.mockReturnValue({ data: { user }, loading: false, refetch });
    renderHook(() => useUserSkillsPage("u1"));
    expect(mockUseSkillMutations).toHaveBeenCalledWith(
      expect.objectContaining({
        entityId: "u1",
        idField: "userId",
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

    const { result } = renderHook(() => useUserSkillsPage("u1"));
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

    const { result } = renderHook(() => useUserSkillsPage("u1"));
    await act(async () => {
      await result.current.handleDeleteSkills();
    });
    expect(setSelectedSkills).not.toHaveBeenCalled();
    expect(setRemoveMode).not.toHaveBeenCalled();
  });

  it("exposes permission state via usePermissions", () => {
    mockCanEditValue.mockReturnValue(false);
    const { result } = renderHook(() => useUserSkillsPage("u1"));
    expect(result.current.canMutate).toBe(false);
  });

  it("exposes the remaining skills page state and mutation helpers", async () => {
    const { result } = renderHook(() => useUserSkillsPage("u1"));
    await waitFor(() => expect(result.current.hasUser).toBe(true));
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
