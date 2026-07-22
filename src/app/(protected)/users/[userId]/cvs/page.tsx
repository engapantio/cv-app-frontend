import { createServerApolloClient } from "@/lib/apollo/server-client";
import { UserDocument, type UserQuery } from "@/gql/generated/graphql";
import { getServerAccessToken } from "@/lib/auth/cookies";
import UserCvsClient from "./cvs-client";

type CvItem = NonNullable<UserQuery["user"]["cvs"]>[number];

export default async function UserCvsPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const token = await getServerAccessToken();
  const client = createServerApolloClient(token ?? undefined);

  let initialCvs: CvItem[] = [];
  let initialUserEmail: string | null = null;
  let serverError: string | null = null;

  try {
    const { data } = await client.query({
      query: UserDocument,
      variables: { userId },
      errorPolicy: "all",
      fetchPolicy: "no-cache",
    });
    initialCvs = data?.user?.cvs ?? [];
    initialUserEmail = data?.user?.email ?? null;
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
