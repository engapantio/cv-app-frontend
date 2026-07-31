import { createServerApolloClient } from "@/lib/apollo/server-client";
import { getServerAccessToken } from "@/lib/auth/cookies";
import { SkillsDocument, type SkillsQuery } from "@/gql/generated/graphql";
import SkillsClient from "./skills-client";

type SkillItem = SkillsQuery["skills"][number];

export default async function SkillsPage() {
  const token = await getServerAccessToken();
  const client = createServerApolloClient(token ?? undefined);

  let initialSkills: SkillItem[] = [];
  let serverError: string | null = null;

  try {
    const { data } = await client.query({
      query: SkillsDocument,
      errorPolicy: "all",
      fetchPolicy: "no-cache",
    });
    initialSkills = (data?.skills ?? []) as SkillItem[];
  } catch (e) {
    serverError = e instanceof Error ? e.message : "Failed to load skills";
  }

  return <SkillsClient initialSkills={initialSkills} serverError={serverError} />;
}
