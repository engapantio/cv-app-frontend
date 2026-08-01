import { createServerApolloClientForRequest } from "@/lib/apollo/server-client";
import { CvDocument } from "@/gql/generated/graphql";
import { CvLayoutClient } from "./cv-layout-client";

export default async function CvLayout({
  params,
  children,
}: {
  params: Promise<{ cvId: string }>;
  children: React.ReactNode;
}) {
  const { cvId } = await params;

  let cvName: string | null = null;
  try {
    const { client } = await createServerApolloClientForRequest();
    const { data } = await client.query({
      query: CvDocument,
      variables: { cvId },
      fetchPolicy: "no-cache",
    });
    cvName = data?.cv?.name ?? null;
  } catch {
    // breadcrumb falls back to "CV"
  }

  return (
    <CvLayoutClient cvId={cvId} initialCvName={cvName}>
      {children}
    </CvLayoutClient>
  );
}
