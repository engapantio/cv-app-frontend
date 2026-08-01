import { createServerApolloClientForRequest } from "@/lib/apollo/server-client";
import { UserDocument, type UserQuery } from "@/gql/generated/graphql";
import UserCvsClient from "./cvs-client";

type CvItem = NonNullable<UserQuery["user"]["cvs"]>[number];

const INITIAL_PAGE_SIZE = 10;

export default async function UserCvsPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const { client } = await createServerApolloClientForRequest();

  let initialCvs: CvItem[] = [];
  let initialUserEmail: string | null | undefined;
  let serverError: string | null = null;

  try {
    const { data } = await client.query({
      query: UserDocument,
      variables: { userId },
      errorPolicy: "all",
      fetchPolicy: "no-cache",
    });
    initialCvs = (data?.user?.cvs ?? []).slice(0, INITIAL_PAGE_SIZE);
    initialUserEmail = data?.user?.email;
  } catch (e) {
    serverError = e instanceof Error ? e.message : "Failed to load CVs";
  }

  return (
    <UserCvsClient
      userId={userId}
      initialCvs={initialCvs}
      initialUserEmail={initialUserEmail}
      serverError={serverError}
    />
  );
}
