import { fetchInitialRecord } from "@/lib/apollo/initial-data";
import { CvDocument, type CvQuery } from "@/gql/generated/graphql";
import { CvSkillsClient } from "./cv-skills-client";

export default async function CvSkillsPage({ params }: { params: Promise<{ cvId: string }> }) {
  const { cvId } = await params;

  const { initial, serverError } = await fetchInitialRecord<CvQuery, CvQuery["cv"]>({
    query: CvDocument,
    variables: { cvId },
    getRecord: (data) => data?.cv ?? null,
    errorMessage: "Failed to load CV",
  });

  return <CvSkillsClient cvId={cvId} initialCv={initial} serverError={serverError} />;
}
