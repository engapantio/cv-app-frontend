"use client";

import { useCallback } from "react";
import { useMutation } from "@apollo/client/react";
import type { DocumentNode } from "graphql";
import { toast } from "sonner";
import type { Mastery } from "@/gql/generated/graphql";

interface UseSkillMutationsOptions {
  entityId: string;
  idField: "cvId" | "userId";
  addDocument: DocumentNode;
  updateDocument: DocumentNode;
  deleteDocument: DocumentNode;
  refetch: () => void;
  skillCategoryMap: Map<string, string | null | undefined>;
}

export function useSkillMutations({
  entityId,
  idField,
  addDocument,
  updateDocument,
  deleteDocument,
  refetch,
  skillCategoryMap,
}: UseSkillMutationsOptions) {
  const [addSkill, { loading: addingSkill }] = useMutation(addDocument);

  const handleAddSkill = useCallback(
    async (skillName: string, mastery: Mastery) => {
      const categoryId = skillCategoryMap.get(skillName) ?? null;
      await addSkill({
        variables: { skill: { [idField]: entityId, name: skillName, mastery, categoryId } },
      });
      refetch();
    },
    [addSkill, entityId, idField, refetch, skillCategoryMap],
  );

  const [updateSkill, { loading: updatingSkill }] = useMutation(updateDocument);

  const handleUpdateSkill = useCallback(
    async (skillName: string, mastery: Mastery) => {
      const categoryId = skillCategoryMap.get(skillName) ?? null;
      await updateSkill({
        variables: { skill: { [idField]: entityId, name: skillName, mastery, categoryId } },
      });
      refetch();
    },
    [updateSkill, entityId, idField, refetch, skillCategoryMap],
  );

  const [deleteSkills, { loading: deletingSkill }] = useMutation(deleteDocument);

  const handleDeleteSkills = useCallback(
    async (names: string[]): Promise<boolean> => {
      if (names.length === 0) return false;
      try {
        await deleteSkills({
          variables: { skill: { [idField]: entityId, name: names } },
        });
        refetch();
        return true;
      } catch {
        toast.error("Failed to delete skills");
        return false;
      }
    },
    [deleteSkills, entityId, idField, refetch],
  );

  return {
    handleAddSkill,
    handleUpdateSkill,
    handleDeleteSkills,
    addingSkill,
    updatingSkill,
    deletingSkill,
  };
}
