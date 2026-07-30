"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  CvDocument,
  SkillsDocument,
  SkillCategoriesDocument,
  AddCvSkillDocument,
  UpdateCvSkillDocument,
  DeleteCvSkillDocument,
  type Mastery,
  type CvQuery,
} from "@/gql/generated/graphql";
import { toast } from "sonner";
import { useSession } from "@/lib/auth/session";

type CvSkill = NonNullable<CvQuery["cv"]["skills"]>[number];

export interface SkillsByCategory {
  categoryId: string;
  categoryName: string;
  skills: CvSkill[];
}

export function useCvSkillsPage(cvId: string) {
  const { user: currentUser } = useSession();

  const {
    data: cvData,
    loading: cvLoading,
    refetch: refetchCv,
  } = useQuery(CvDocument, {
    variables: { cvId },
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });

  const { data: skillsData } = useQuery(SkillsDocument, {
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  });

  const { data: categoriesData } = useQuery(SkillCategoriesDocument, {
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  });

  const cv = cvData?.cv;
  const cvUserId = cv?.user?.id;
  const isAdmin = currentUser?.role === "Admin";
  const isOwner = currentUser?.id === cvUserId;
  const canMutate = isOwner || isAdmin;

  const cvSkills = useMemo(() => cv?.skills ?? [], [cv]);

  const { nameToCategory, idToCategory } = useMemo(() => {
    const nameMap = new Map<string, { categoryName: string; parentCategoryName: string | null }>();
    const idMap = new Map<string, string>();
    for (const skill of skillsData?.skills ?? []) {
      nameMap.set(skill.name, {
        categoryName: skill.category?.name ?? skill.category_name ?? "Unknown",
        parentCategoryName: skill.category?.parent?.name ?? skill.category_parent_name ?? null,
      });
      if (skill.category?.id) {
        idMap.set(skill.category.id, skill.category.name);
      }
      if (skill.category?.parent?.id) {
        idMap.set(skill.category.parent.id, skill.category.parent.name);
      }
    }
    for (const cat of categoriesData?.skillCategories ?? []) {
      if (!idMap.has(cat.id)) {
        idMap.set(cat.id, cat.name);
      }
      if (cat.parent && !idMap.has(cat.parent.id)) {
        idMap.set(cat.parent.id, cat.parent.name);
      }
    }
    return { nameToCategory: nameMap, idToCategory: idMap };
  }, [skillsData, categoriesData]);

  const allSkillsList = useMemo(() => skillsData?.skills ?? [], [skillsData]);

  const skillsByCategory = useMemo(() => {
    const groups = new Map<string, CvSkill[]>();
    for (const skill of cvSkills) {
      const byName = (() => {
        const info = nameToCategory.get(skill.name);
        return info?.parentCategoryName ?? info?.categoryName;
      })();
      const byId =
        skill.categoryId != null ? idToCategory.get(String(skill.categoryId)) : undefined;
      const directFromList = (() => {
        const match = allSkillsList.find((s) => s.name === skill.name);
        if (!match) return undefined;
        return (
          match.category_parent_name ??
          match.category_name ??
          match.category?.parent?.name ??
          match.category?.name
        );
      })();
      const displayName = byName ?? byId ?? directFromList ?? "Skills";
      if (!groups.has(displayName)) groups.set(displayName, []);
      groups.get(displayName)!.push(skill);
    }
    const result: SkillsByCategory[] = [];
    for (const [catName, skills] of groups) {
      result.push({ categoryId: catName, categoryName: catName, skills });
    }
    return result;
  }, [cvSkills, nameToCategory, idToCategory, allSkillsList]);

  const availableSkills = useMemo(() => {
    if (!skillsData?.skills) return [];
    const cvSkillNames = new Set(cvSkills.map((s) => s.name));
    return skillsData.skills.filter((s) => !cvSkillNames.has(s.name));
  }, [skillsData, cvSkills]);

  const skillCategoryMap = useMemo(() => {
    const map = new Map<string, string | null | undefined>();
    if (!skillsData?.skills) return map;
    for (const skill of skillsData.skills) {
      map.set(skill.name, skill.category?.id);
    }
    return map;
  }, [skillsData]);

  const [removeMode, setRemoveMode] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());

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

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [updateSkillTarget, setUpdateSkillTarget] = useState<CvSkill | null>(null);

  const [addCvSkill, { loading: addingSkill }] = useMutation(AddCvSkillDocument);

  const handleAddSkill = useCallback(
    async (skillName: string, mastery: Mastery) => {
      const categoryId = skillCategoryMap.get(skillName) ?? null;
      await addCvSkill({
        variables: {
          skill: { cvId, name: skillName, mastery, categoryId },
        },
      });
      refetchCv();
    },
    [addCvSkill, cvId, refetchCv, skillCategoryMap],
  );

  const [updateCvSkill, { loading: updatingSkill }] = useMutation(UpdateCvSkillDocument);

  const handleUpdateSkill = useCallback(
    async (skillName: string, mastery: Mastery) => {
      const categoryId = skillCategoryMap.get(skillName) ?? null;
      await updateCvSkill({
        variables: {
          skill: { cvId, name: skillName, mastery, categoryId },
        },
      });
      refetchCv();
    },
    [updateCvSkill, cvId, refetchCv, skillCategoryMap],
  );

  const [deleteCvSkill, { loading: deletingSkill }] = useMutation(DeleteCvSkillDocument);

  const handleDeleteSkills = useCallback(async () => {
    try {
      const names = Array.from(selectedSkills);
      if (names.length === 0) return;
      await deleteCvSkill({
        variables: { skill: { cvId, name: names } },
      });
      setSelectedSkills(new Set());
      setRemoveMode(false);
      refetchCv();
    } catch {
      toast.error("Failed to delete skills");
    }
  }, [deleteCvSkill, cvId, selectedSkills, refetchCv]);

  return {
    loading: cvLoading,
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
