import { notFound } from "next/navigation";
import { createServerApolloClientForRequest } from "@/lib/apollo/server-client";
import { UserDocument } from "@/gql/generated/graphql";
import { fetchSkillsCatalog } from "@/lib/apollo/initial-data";
import { UserSkillsClient } from "./user-skills-client";

interface SkillsPageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserSkillsPage({ params }: SkillsPageProps) {
  const { userId } = await params;
  const { client, accessToken: token } = await createServerApolloClientForRequest();

  if (!token) return notFound();

  const { data } = await client.query({
    query: UserDocument,
    variables: { userId },
    fetchPolicy: "no-cache",
  });

  const user = data?.user;
  if (!user) return notFound();

  const skillsCatalog = await fetchSkillsCatalog();

  return <UserSkillsClient userId={userId} initialUser={user} skillsCatalog={skillsCatalog} />;
}
