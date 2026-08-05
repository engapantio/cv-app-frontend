"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import {
  AddCvSkillDocument,
  CvDocument,
  DeleteCvSkillDocument,
  UpdateCvSkillDocument,
  type CvQuery,
} from "@/gql/generated/graphql";
import { usePermissions } from "@/lib/auth/permissions";
import { useSkillsCatalog } from "@/lib/skills/use-skills-catalog";
import { useSkillMutations } from "@/lib/skills/use-skill-mutations";

type CvSkill = NonNullable<CvQuery["cv"]["skills"]>[number];

export function useCvSkillsPage(
  cvId: string,
  initialCv: CvQuery["cv"] | null = null,
  isOwner = false,
) {
  const {
    groupSkillsByCategory,
    availableSkills: getAvailableSkills,
    skillCategoryMap,
    loading: catalogLoading,
  } = useSkillsCatalog();

  const {
    data: cvData,
    loading: cvLoading,
    refetch: refetchCv,
  } = useQuery(CvDocument, {
    variables: { cvId },
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });

  const cv = cvData?.cv ?? initialCv;
  const cvUserId = cv?.user?.id;
  const { isAdmin } = usePermissions(cvUserId);
  const canMutate = isOwner || isAdmin;

  const cvSkills = useMemo(() => cv?.skills ?? [], [cv]);

  const skillsByCategory = useMemo(
    () => groupSkillsByCategory(cvSkills),
    [groupSkillsByCategory, cvSkills],
  );
  const availableSkills = useMemo(
    () => getAvailableSkills(cvSkills),
    [getAvailableSkills, cvSkills],
  );

  const [removeMode, setRemoveMode] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [updateSkillTarget, setUpdateSkillTarget] = useState<CvSkill | null>(null);

  const toggleSkillSelection = useCallback((skillName: string) => {
    setSelectedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skillName)) next.delete(skillName);
      else next.add(skillName);
      return next;
    });
  }, []);

  const enterRemoveMode = useCallback(() => {
    setRemoveMode(true);
    setSelectedSkills(new Set());
  }, []);

  const cancelRemove = useCallback(() => {
    setRemoveMode(false);
    setSelectedSkills(new Set());
  }, []);

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
  }, [deleteSkills, selectedSkills]);

  return {
    loading: (cvLoading && cv == null) || catalogLoading,
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
