import { fetchInitialRows } from "@/lib/apollo/initial-data";
import {
  SkillsDocument,
  SkillCategoriesDocument,
  type SkillsQuery,
  type SkillCategoriesQuery,
} from "@/gql/generated/graphql";
import SkillsClient from "./skills-client";

type SkillItem = SkillsQuery["skills"][number];
type SkillCategoryItem = SkillCategoriesQuery["skillCategories"][number];

export default async function SkillsPage() {
  const [skills, categories] = await Promise.all([
    fetchInitialRows<SkillsQuery, SkillItem>({
      query: SkillsDocument,
      getData: (data) => (data?.skills ?? []) as SkillItem[],
      sort: (a, b) => Number(b.id) - Number(a.id),
      errorMessage: "Failed to load skills",
    }),
    fetchInitialRows<SkillCategoriesQuery, SkillCategoryItem>({
      query: SkillCategoriesDocument,
      getData: (data) => (data?.skillCategories ?? []) as SkillCategoryItem[],
      errorMessage: "Failed to load skills",
    }),
  ]);

  const serverError = skills.serverError ?? categories.serverError;

  return (
    <SkillsClient
      initialSkills={skills.initial}
      initialCategories={categories.initial}
      serverError={serverError}
    />
  );
}
