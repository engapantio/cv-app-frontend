import { createServerApolloClient } from "@/lib/apollo/server-client";
import { getServerAccessToken } from "@/lib/auth/cookies";
import { CvDocument, type CvQuery } from "@/gql/generated/graphql";
import CvProjectsClient from "./projects-client";

export default async function CvProjectsPage({ params }: { params: Promise<{ cvId: string }> }) {
  const { cvId } = await params;

  let initialCv: CvQuery["cv"] | null = null;
  let serverError: string | null = null;

  try {
    const token = await getServerAccessToken();
    if (!token) throw new Error("Unauthorized");

    const client = createServerApolloClient(token);
    const { data } = await client.query({
      query: CvDocument,
      variables: { cvId },
      fetchPolicy: "no-cache",
    });
    initialCv = data?.cv ?? null;
    if (!initialCv) serverError = "CV not found";
  } catch (e) {
    serverError = e instanceof Error ? e.message : "Failed to load CV";
  }

  return <CvProjectsClient cvId={cvId} initialCv={initialCv} serverError={serverError} />;
}
