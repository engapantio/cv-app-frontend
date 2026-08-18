import { renderHook, act } from "@testing-library/react";
import { useMutation } from "@apollo/client/react";
import { useSkillMutations } from "./use-skill-mutations";

jest.mock("@apollo/client/react", () => ({ useMutation: jest.fn() }));
jest.mock("sonner", () => ({ toast: { error: jest.fn() } }));
jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());

const mockUseMutation = useMutation as unknown as jest.Mock;
const mockToastError = jest.fn();

jest.mock("sonner", () => ({
  get toast() {
    return { error: mockToastError };
  },
}));

function operationName(doc: unknown): string {
  return (
    (doc as { definitions?: Array<{ name?: { value?: string } }> }).definitions?.[0]?.name?.value ??
    ""
  );
}

const skillCategoryMap = new Map<string, string | null | undefined>([
  ["TypeScript", "c1"],
  ["UnknownSkill", undefined],
]);

let addSkill: jest.Mock;
let updateSkill: jest.Mock;
let deleteSkills: jest.Mock;
let refetch: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  addSkill = jest.fn();
  updateSkill = jest.fn();
  deleteSkills = jest.fn();
  refetch = jest.fn();
  mockUseMutation.mockImplementation((doc: unknown) => {
    const name = operationName(doc);
    if (name === "AddProfileSkill") return [addSkill, { loading: false }];
    if (name === "UpdateProfileSkill") return [updateSkill, { loading: false }];
    return [deleteSkills, { loading: false }];
  });
});

describe("useSkillMutations", () => {
  it("adds a skill with its mapped category id and refetches", async () => {
    const { result } = renderHook(() =>
      useSkillMutations({
        entityId: "u1",
        idField: "userId",
        addDocument: { definitions: [{ name: { value: "AddProfileSkill" } }] } as never,
        updateDocument: { definitions: [{ name: { value: "UpdateProfileSkill" } }] } as never,
        deleteDocument: { definitions: [{ name: { value: "DeleteProfileSkill" } }] } as never,
        refetch,
        skillCategoryMap,
      }),
    );
    addSkill.mockResolvedValue({});
    await act(async () => {
      await result.current.handleAddSkill("TypeScript", "Advanced");
    });
    expect(addSkill).toHaveBeenCalledWith({
      variables: {
        skill: { userId: "u1", name: "TypeScript", mastery: "Advanced", categoryId: "c1" },
      },
    });
    expect(refetch).toHaveBeenCalled();
  });

  it("passes null category id for unmapped skills on add", async () => {
    const { result } = renderHook(() =>
      useSkillMutations({
        entityId: "u1",
        idField: "userId",
        addDocument: { definitions: [{ name: { value: "AddProfileSkill" } }] } as never,
        updateDocument: { definitions: [{ name: { value: "UpdateProfileSkill" } }] } as never,
        deleteDocument: { definitions: [{ name: { value: "DeleteProfileSkill" } }] } as never,
        refetch,
        skillCategoryMap,
      }),
    );
    addSkill.mockResolvedValue({});
    await act(async () => {
      await result.current.handleAddSkill("UnknownSkill", "Novice");
    });
    expect(addSkill).toHaveBeenCalledWith({
      variables: {
        skill: { userId: "u1", name: "UnknownSkill", mastery: "Novice", categoryId: null },
      },
    });
  });

  it("updates a skill and refetches", async () => {
    const { result } = renderHook(() =>
      useSkillMutations({
        entityId: "u1",
        idField: "userId",
        addDocument: { definitions: [{ name: { value: "AddProfileSkill" } }] } as never,
        updateDocument: { definitions: [{ name: { value: "UpdateProfileSkill" } }] } as never,
        deleteDocument: { definitions: [{ name: { value: "DeleteProfileSkill" } }] } as never,
        refetch,
        skillCategoryMap,
      }),
    );
    updateSkill.mockResolvedValue({});
    await act(async () => {
      await result.current.handleUpdateSkill("TypeScript", "Expert");
    });
    expect(updateSkill).toHaveBeenCalledWith({
      variables: {
        skill: { userId: "u1", name: "TypeScript", mastery: "Expert", categoryId: "c1" },
      },
    });
    expect(refetch).toHaveBeenCalled();
  });

  it("deletes skills and returns true", async () => {
    const { result } = renderHook(() =>
      useSkillMutations({
        entityId: "u1",
        idField: "userId",
        addDocument: { definitions: [{ name: { value: "AddProfileSkill" } }] } as never,
        updateDocument: { definitions: [{ name: { value: "UpdateProfileSkill" } }] } as never,
        deleteDocument: { definitions: [{ name: { value: "DeleteProfileSkill" } }] } as never,
        refetch,
        skillCategoryMap,
      }),
    );
    deleteSkills.mockResolvedValue({});
    let ok = false;
    await act(async () => {
      ok = await result.current.handleDeleteSkills(["TypeScript", "Figma"]);
    });
    expect(deleteSkills).toHaveBeenCalledWith({
      variables: { skill: { userId: "u1", name: ["TypeScript", "Figma"] } },
    });
    expect(ok).toBe(true);
    expect(refetch).toHaveBeenCalled();
  });

  it("returns false without calling the mutation when no names are given", async () => {
    const { result } = renderHook(() =>
      useSkillMutations({
        entityId: "u1",
        idField: "userId",
        addDocument: { definitions: [{ name: { value: "AddProfileSkill" } }] } as never,
        updateDocument: { definitions: [{ name: { value: "UpdateProfileSkill" } }] } as never,
        deleteDocument: { definitions: [{ name: { value: "DeleteProfileSkill" } }] } as never,
        refetch,
        skillCategoryMap,
      }),
    );
    let ok = true;
    await act(async () => {
      ok = await result.current.handleDeleteSkills([]);
    });
    expect(ok).toBe(false);
    expect(deleteSkills).not.toHaveBeenCalled();
  });

  it("shows an error toast and returns false when deletion fails", async () => {
    const { result } = renderHook(() =>
      useSkillMutations({
        entityId: "u1",
        idField: "userId",
        addDocument: { definitions: [{ name: { value: "AddProfileSkill" } }] } as never,
        updateDocument: { definitions: [{ name: { value: "UpdateProfileSkill" } }] } as never,
        deleteDocument: { definitions: [{ name: { value: "DeleteProfileSkill" } }] } as never,
        refetch,
        skillCategoryMap,
      }),
    );
    deleteSkills.mockRejectedValue(new Error("boom"));
    let ok = true;
    await act(async () => {
      ok = await result.current.handleDeleteSkills(["TypeScript"]);
    });
    expect(ok).toBe(false);
    expect(mockToastError).toHaveBeenCalledWith("removeSkillsFailed");
  });
});
