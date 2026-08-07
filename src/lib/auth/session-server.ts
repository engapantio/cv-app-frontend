import type { SessionUser } from "@/lib/auth/cookies";
import { getServerUserId } from "@/lib/auth/cookies";
import { createServerApolloClientForRequest } from "@/lib/apollo/server-client";
import { UserDocument } from "@/gql/generated/graphql";

export async function getServerSessionUser(): Promise<SessionUser | null> {
  const userId = await getServerUserId();
  if (!userId) return null;

  try {
    const { client } = await createServerApolloClientForRequest();
    const { data } = await client.query({
      query: UserDocument,
      variables: { userId },
      fetchPolicy: "no-cache",
    });
    return data?.user ?? null;
  } catch {
    return null;
  }
}
