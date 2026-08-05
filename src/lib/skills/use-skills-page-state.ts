"use client";

import { useState, useCallback, useMemo } from "react";
import { useSkillsCatalog } from "./use-skills-catalog";
import type { SkillItem, SkillsCatalogInitial } from "./group-skills";

export function useSkillsPageState(skills: SkillItem[], initialCatalog?: SkillsCatalogInitial) {
  const {
    groupSkillsByCategory,
    availableSkills: getAvailableSkills,
    skillCategoryMap,
  } = useSkillsCatalog(initialCatalog);

  const skillsByCategory = useMemo(
    () => groupSkillsByCategory(skills),
    [groupSkillsByCategory, skills],
  );
  const availableSkills = useMemo(() => getAvailableSkills(skills), [getAvailableSkills, skills]);

  const [removeMode, setRemoveMode] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [updateSkillTarget, setUpdateSkillTarget] = useState<SkillItem | null>(null);

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

  return {
    skillCategoryMap,
    skillsByCategory,
    availableSkills,
    removeMode,
    setRemoveMode,
    selectedSkills,
    setSelectedSkills,
    addDialogOpen,
    setAddDialogOpen,
    updateSkillTarget,
    setUpdateSkillTarget,
    toggleSkillSelection,
    enterRemoveMode,
    cancelRemove,
  };
}
