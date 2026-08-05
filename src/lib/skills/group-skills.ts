import type { Mastery, SkillCategoriesQuery, SkillsQuery } from "@/gql/generated/graphql";

export type CatalogSkill = SkillsQuery["skills"][number];
export type CatalogCategory = SkillCategoriesQuery["skillCategories"][number];

export type SkillItem = {
  name: string;
  mastery: Mastery;
  categoryId: string | null;
};

export interface SkillsByCategory {
  categoryId: string;
  categoryName: string;
  skills: SkillItem[];
}

interface CategoryInfo {
  categoryName: string;
  parentCategoryName: string | null;
}

export function buildNameToCategoryMap(skills: CatalogSkill[]): Map<string, CategoryInfo> {
  const nameMap = new Map<string, CategoryInfo>();
  for (const skill of skills) {
    nameMap.set(skill.name, {
      categoryName: skill.category?.name ?? skill.category_name ?? "Unknown",
      parentCategoryName: skill.category?.parent?.name ?? skill.category_parent_name ?? null,
    });
  }
  return nameMap;
}

export function buildIdToCategoryMap(
  skills: CatalogSkill[],
  categories: CatalogCategory[],
): Map<string, string> {
  const idMap = new Map<string, string>();
  for (const skill of skills) {
    if (skill.category?.id) {
      idMap.set(skill.category.id, skill.category.name);
    }
    if (skill.category?.parent?.id) {
      idMap.set(skill.category.parent.id, skill.category.parent.name);
    }
  }
  for (const cat of categories) {
    if (!idMap.has(cat.id)) {
      idMap.set(cat.id, cat.name);
    }
    if (cat.parent && !idMap.has(cat.parent.id)) {
      idMap.set(cat.parent.id, cat.parent.name);
    }
  }
  return idMap;
}

export function buildSkillCategoryMap(
  skills: CatalogSkill[],
): Map<string, string | null | undefined> {
  const map = new Map<string, string | null | undefined>();
  for (const skill of skills) {
    map.set(skill.name, skill.category?.id);
  }
  return map;
}

export function groupSkillsByCategory(
  skills: SkillItem[],
  nameToCategory: Map<string, CategoryInfo>,
  idToCategory: Map<string, string>,
  allSkillsList: CatalogSkill[],
): SkillsByCategory[] {
  const groups = new Map<string, SkillItem[]>();
  for (const skill of skills) {
    const byName = nameToCategory.get(skill.name);
    const byId = skill.categoryId != null ? idToCategory.get(String(skill.categoryId)) : undefined;
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
    const displayName =
      byName?.parentCategoryName ?? byName?.categoryName ?? byId ?? directFromList ?? "Skills";
    if (!groups.has(displayName)) groups.set(displayName, []);
    groups.get(displayName)!.push(skill);
  }
  const result: SkillsByCategory[] = [];
  for (const [catName, skills] of groups) {
    result.push({ categoryId: catName, categoryName: catName, skills });
  }
  return result;
}

export function filterAvailableSkills(
  allSkills: CatalogSkill[],
  assignedSkills: SkillItem[],
): CatalogSkill[] {
  const assignedNames = new Set(assignedSkills.map((s) => s.name));
  return allSkills.filter((s) => !assignedNames.has(s.name));
}
