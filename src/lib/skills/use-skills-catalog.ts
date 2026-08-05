"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { SkillCategoriesDocument, SkillsDocument } from "@/gql/generated/graphql";
import {
  buildIdToCategoryMap,
  buildNameToCategoryMap,
  buildSkillCategoryMap,
  filterAvailableSkills,
  groupSkillsByCategory as groupSkillsByCategoryFn,
  type CatalogSkill,
  type SkillItem,
  type SkillsByCategory,
} from "./group-skills";

export function useSkillsCatalog() {
  const { data: skillsData } = useQuery(SkillsDocument, {
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  });

  const { data: categoriesData } = useQuery(SkillCategoriesDocument, {
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  });

  const allSkillsList = useMemo(() => skillsData?.skills ?? [], [skillsData]);
  const categories = useMemo(() => categoriesData?.skillCategories ?? [], [categoriesData]);

  const nameToCategory = useMemo(() => buildNameToCategoryMap(allSkillsList), [allSkillsList]);
  const idToCategory = useMemo(
    () => buildIdToCategoryMap(allSkillsList, categories),
    [allSkillsList, categories],
  );
  const skillCategoryMap = useMemo(() => buildSkillCategoryMap(allSkillsList), [allSkillsList]);

  const groupSkillsByCategory = useCallback(
    (skills: SkillItem[]): SkillsByCategory[] =>
      groupSkillsByCategoryFn(skills, nameToCategory, idToCategory, allSkillsList),
    [nameToCategory, idToCategory, allSkillsList],
  );

  const availableSkills = useCallback(
    (assignedSkills: SkillItem[]): CatalogSkill[] =>
      filterAvailableSkills(allSkillsList, assignedSkills),
    [allSkillsList],
  );

  return { groupSkillsByCategory, availableSkills, skillCategoryMap };
}
