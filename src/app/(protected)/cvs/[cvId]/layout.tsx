import { fetchInitialRecord } from "@/lib/apollo/initial-data";
import { CvDocument, type CvQuery } from "@/gql/generated/graphql";
import { CvLayoutClient } from "./cv-layout-client";

export default async function CvLayout({
  params,
  children,
}: {
  params: Promise<{ cvId: string }>;
  children: React.ReactNode;
}) {
  const { cvId } = await params;

  const { initial } = await fetchInitialRecord<CvQuery, CvQuery["cv"]>({
    query: CvDocument,
    variables: { cvId },
    getRecord: (data) => data?.cv ?? null,
    errorMessage: "Failed to load CV",
  });

  const cvName = initial?.name ?? null;
  const cvUserId = initial?.user?.id ?? null;

  return (
    <CvLayoutClient cvId={cvId} initialCvName={cvName} cvUserId={cvUserId}>
      {children}
    </CvLayoutClient>
  );
}
