import { fetchInitialRows } from "@/lib/apollo/initial-data";
import { CvsDocument, type CvsQuery, type UserQuery } from "@/gql/generated/graphql";
import CvsListClient from "./cvs-list-client";

type CvItem = NonNullable<UserQuery["user"]["cvs"]>[number];

export default async function CvsPage() {
  const { initial, serverError } = await fetchInitialRows<CvsQuery, CvItem>({
    query: CvsDocument,
    getData: (data) => (data?.cvs ?? []) as Array<CvItem | null>,
    errorMessage: "Failed to load CVs",
  });

  return <CvsListClient initialCvs={initial} serverError={serverError} />;
}
