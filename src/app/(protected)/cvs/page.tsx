import { createServerApolloClient } from "@/lib/apollo/server-client";
import { getServerAccessToken } from "@/lib/auth/cookies";
import { CvsDocument, type UserQuery } from "@/gql/generated/graphql";
import CvsListClient from "./cvs-list-client";

type CvItem = NonNullable<UserQuery["user"]["cvs"]>[number];

export default async function CvsPage() {
  const token = await getServerAccessToken();
  const client = createServerApolloClient(token ?? undefined);

  let initialCvs: CvItem[] = [];
  let serverError: string | null = null;

  try {
    const { data } = await client.query({
      query: CvsDocument,
      errorPolicy: "all",
      fetchPolicy: "no-cache",
    });
    initialCvs = (data?.cvs ?? []) as CvItem[];
  } catch (e) {
    serverError = e instanceof Error ? e.message : "Failed to load CVs";
  }

  return <CvsListClient initialCvs={initialCvs} serverError={serverError} />;
}
