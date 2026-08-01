import { createServerApolloClientForRequest } from "@/lib/apollo/server-client";
import { CvsDocument, type UserQuery } from "@/gql/generated/graphql";
import CvsListClient from "./cvs-list-client";

type CvItem = NonNullable<UserQuery["user"]["cvs"]>[number];

const INITIAL_PAGE_SIZE = 10;

export default async function CvsPage() {
  const { client } = await createServerApolloClientForRequest();

  let initialCvs: CvItem[] = [];
  let serverError: string | null = null;

  try {
    const { data } = await client.query({
      query: CvsDocument,
      errorPolicy: "all",
      fetchPolicy: "no-cache",
    });
    initialCvs = ((data?.cvs ?? []) as CvItem[]).slice(0, INITIAL_PAGE_SIZE);
  } catch (e) {
    serverError = e instanceof Error ? e.message : "Failed to load CVs";
  }

  return <CvsListClient initialCvs={initialCvs} serverError={serverError} />;
}
