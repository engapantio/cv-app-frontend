"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import {
  AddCvSkillDocument,
  CvDocument,
  DeleteCvSkillDocument,
  UpdateCvSkillDocument,
  type CvQuery,
} from "@/gql/generated/graphql";
import { usePermissions } from "@/lib/auth/permissions";
import { useSkillsPageState } from "@/lib/skills/use-skills-page-state";
import { useSkillMutations } from "@/lib/skills/use-skill-mutations";
import type { SkillsCatalogInitial } from "@/lib/skills/group-skills";

export function useCvSkillsPage(
  cvId: string,
  initialCv: CvQuery["cv"] | null = null,
  initialCatalog?: SkillsCatalogInitial,
) {
  const {
    data: cvData,
    loading: cvLoading,
    refetch: refetchCv,
  } = useQuery(CvDocument, {
    variables: { cvId },
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });

  const cv = cvData?.cv ?? initialCv;
  const cvUserId = cv?.user?.id;
  const { canEdit: canMutate } = usePermissions(cvUserId);

  const cvSkills = useMemo(() => cv?.skills ?? [], [cv]);

  const {
    skillCategoryMap,
    skillsByCategory,
    availableSkills,
    removeMode,
    selectedSkills,
    addDialogOpen,
    setAddDialogOpen,
    updateSkillTarget,
    setUpdateSkillTarget,
    toggleSkillSelection,
    enterRemoveMode,
    cancelRemove,
    setSelectedSkills,
    setRemoveMode,
  } = useSkillsPageState(cvSkills, initialCatalog);

  const {
    handleAddSkill,
    handleUpdateSkill,
    handleDeleteSkills: deleteSkills,
    addingSkill,
    updatingSkill,
    deletingSkill,
  } = useSkillMutations({
    entityId: cvId,
    idField: "cvId",
    addDocument: AddCvSkillDocument,
    updateDocument: UpdateCvSkillDocument,
    deleteDocument: DeleteCvSkillDocument,
    refetch: refetchCv,
    skillCategoryMap,
  });

  const handleDeleteSkills = useCallback(async () => {
    const ok = await deleteSkills(Array.from(selectedSkills));
    if (ok) {
      setSelectedSkills(new Set());
      setRemoveMode(false);
    }
  }, [deleteSkills, selectedSkills, setSelectedSkills, setRemoveMode]);

  return {
    loading: cvLoading && cv == null,
    hasCv: cv != null,
    skillsByCategory,
    availableSkills,
    canMutate,
    removeMode,
    selectedSkills,
    toggleSkillSelection,
    enterRemoveMode,
    cancelRemove,
    addDialogOpen,
    setAddDialogOpen,
    updateSkillTarget,
    setUpdateSkillTarget,
    handleAddSkill,
    handleUpdateSkill,
    handleDeleteSkills,
    addingSkill,
    updatingSkill,
    deletingSkill,
  };
}
