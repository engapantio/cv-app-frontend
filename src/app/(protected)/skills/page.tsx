import { createServerApolloClientForRequest } from "@/lib/apollo/server-client";
import {
  SkillsDocument,
  SkillCategoriesDocument,
  type SkillsQuery,
  type SkillCategoriesQuery,
} from "@/gql/generated/graphql";
import SkillsClient from "./skills-client";

type SkillItem = SkillsQuery["skills"][number];

const INITIAL_PAGE_SIZE = 10;

export default async function SkillsPage() {
  const { client } = await createServerApolloClientForRequest();

  let initialSkills: SkillItem[] = [];
  let initialCategories: SkillCategoriesQuery["skillCategories"] = [];
  let serverError: string | null = null;

  try {
    const [{ data: skillsData }, { data: categoriesData }] = await Promise.all([
      client.query({
        query: SkillsDocument,
        errorPolicy: "all",
        fetchPolicy: "no-cache",
      }),
      client.query({
        query: SkillCategoriesDocument,
        errorPolicy: "all",
        fetchPolicy: "no-cache",
      }),
    ]);
    initialSkills = ((skillsData?.skills ?? []) as SkillItem[])
      .sort((a, b) => Number(b.id) - Number(a.id))
      .slice(0, INITIAL_PAGE_SIZE);
    initialCategories = (categoriesData?.skillCategories ??
      []) as SkillCategoriesQuery["skillCategories"];
  } catch (e) {
    serverError = e instanceof Error ? e.message : "Failed to load skills";
  }

  return (
    <SkillsClient
      initialSkills={initialSkills}
      initialCategories={initialCategories}
      serverError={serverError}
    />
  );
}
