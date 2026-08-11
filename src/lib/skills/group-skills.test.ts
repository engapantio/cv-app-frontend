import {
  buildNameToCategoryMap,
  buildIdToCategoryMap,
  buildSkillCategoryMap,
  groupSkillsByCategory,
  filterAvailableSkills,
} from "./group-skills";
import type { CatalogSkill, SkillItem } from "./group-skills";

const skills: CatalogSkill[] = [
  {
    id: "s1",
    created_at: "",
    name: "TypeScript",
    category_name: "Programming Language",
    category_parent_name: "Development",
    category: {
      id: "c1",
      name: "Programming Language",
      order: 1,
      parent: { id: "p1", name: "Development", order: 1 },
    },
  },
  {
    id: "s2",
    created_at: "",
    name: "Figma",
    category_name: "Design",
    category_parent_name: null,
    category: null,
  },
  {
    id: "s3",
    created_at: "",
    name: "Uncategorized Skill",
    category_name: null,
    category_parent_name: null,
    category: null,
  },
];

const categories = [
  { id: "c1", name: "Programming Language", order: 1, parent: null, children: [] },
  { id: "p1", name: "Development", order: 1, parent: null, children: [] },
  { id: "c2", name: "Design", order: 2, parent: null, children: [] },
  { id: "extra", name: "Extra Category", order: 3, parent: null, children: [] },
];

describe("group-skills", () => {
  describe("buildNameToCategoryMap", () => {
    it("maps skill names to their category info", () => {
      const map = buildNameToCategoryMap(skills);
      expect(map.get("TypeScript")).toEqual({
        categoryName: "Programming Language",
        parentCategoryName: "Development",
      });
      expect(map.get("Figma")).toEqual({
        categoryName: "Design",
        parentCategoryName: null,
      });
    });

    it("falls back to 'Unknown' for a skill without category names", () => {
      const map = buildNameToCategoryMap(skills);
      expect(map.get("Uncategorized Skill")?.categoryName).toBe("Unknown");
    });
  });

  describe("buildIdToCategoryMap", () => {
    it("maps category and parent ids to their names from skills", () => {
      const map = buildIdToCategoryMap(skills, []);
      expect(map.get("c1")).toBe("Programming Language");
      expect(map.get("p1")).toBe("Development");
    });

    it("fills in remaining categories from the category list", () => {
      const map = buildIdToCategoryMap(skills, categories);
      expect(map.get("c2")).toBe("Design");
      expect(map.get("extra")).toBe("Extra Category");
    });
  });

  describe("buildSkillCategoryMap", () => {
    it("maps skill names to their category id", () => {
      const map = buildSkillCategoryMap(skills);
      expect(map.get("TypeScript")).toBe("c1");
      expect(map.get("Figma")).toBeUndefined();
    });
  });

  describe("groupSkillsByCategory", () => {
    const nameMap = buildNameToCategoryMap(skills);
    const idMap = buildIdToCategoryMap(skills, categories);

    it("groups skills under their parent category name", () => {
      const assigned: SkillItem[] = [
        { name: "TypeScript", mastery: "Proficient", categoryId: "c1" },
        { name: "Figma", mastery: "Competent", categoryId: "c2" },
      ];
      const grouped = groupSkillsByCategory(assigned, nameMap, idMap, skills);
      expect(grouped).toEqual([
        {
          categoryId: "Development",
          categoryName: "Development",
          skills: [{ name: "TypeScript", mastery: "Proficient", categoryId: "c1" }],
        },
        {
          categoryId: "Design",
          categoryName: "Design",
          skills: [{ name: "Figma", mastery: "Competent", categoryId: "c2" }],
        },
      ]);
    });

    it("falls back to 'Skills' for unknown skills", () => {
      const assigned: SkillItem[] = [{ name: "Mystery", mastery: "Novice", categoryId: null }];
      const grouped = groupSkillsByCategory(assigned, nameMap, idMap, skills);
      expect(grouped[0].categoryName).toBe("Skills");
    });

    it("groups multiple skills with the same category together", () => {
      const catalog = [
        ...skills,
        {
          id: "s4",
          created_at: "",
          name: "TypeScript2",
          category_name: "Programming Language",
          category_parent_name: "Development",
          category: {
            id: "c1",
            name: "Programming Language",
            order: 1,
            parent: { id: "p1", name: "Development", order: 1 },
          },
        },
      ];
      const nMap = buildNameToCategoryMap(catalog);
      const iMap = buildIdToCategoryMap(catalog, categories);
      const assigned: SkillItem[] = [
        { name: "TypeScript", mastery: "Expert", categoryId: "c1" },
        { name: "Figma", mastery: "Novice", categoryId: "c2" },
        { name: "TypeScript2", mastery: "Advanced", categoryId: "c1" },
      ];
      const grouped = groupSkillsByCategory(assigned, nMap, iMap, catalog);
      expect(grouped).toHaveLength(2);
      expect(grouped[0].skills).toHaveLength(2);
    });
  });

  describe("filterAvailableSkills", () => {
    it("excludes skills that are already assigned", () => {
      const assigned: SkillItem[] = [{ name: "TypeScript", mastery: "Novice", categoryId: null }];
      const available = filterAvailableSkills(skills, assigned);
      expect(available.map((s) => s.name)).toEqual(["Figma", "Uncategorized Skill"]);
    });

    it("returns all skills when nothing is assigned", () => {
      const available = filterAvailableSkills(skills, []);
      expect(available).toHaveLength(3);
    });
  });
});
