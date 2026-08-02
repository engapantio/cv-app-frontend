import { fetchInitialRecord } from "@/lib/apollo/initial-data";
import { CvDocument, type CvQuery } from "@/gql/generated/graphql";
import CvProjectsClient from "./projects-client";

export default async function CvProjectsPage({ params }: { params: Promise<{ cvId: string }> }) {
  const { cvId } = await params;

  const { initial, serverError } = await fetchInitialRecord<CvQuery, CvQuery["cv"]>({
    query: CvDocument,
    variables: { cvId },
    getRecord: (data) => data?.cv ?? null,
    errorMessage: "Failed to load CV",
    errorPolicy: "none",
    requireAuth: true,
    notFoundMessage: "CV not found",
  });

  return <CvProjectsClient cvId={cvId} initialCv={initial} serverError={serverError} />;
}
