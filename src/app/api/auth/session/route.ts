import { NextResponse } from "next/server";
import { createServerApolloClient } from "@/lib/apollo/server-client";
import { getServerAccessToken, getServerUserId } from "@/lib/auth/cookies";
import { UserDocument} from "@/gql/generated/graphql";

export async function GET() {
  const accessToken = await getServerAccessToken();
  const userId = Number(await getServerUserId());

  if (!accessToken || !userId) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  try {
    const client = createServerApolloClient(accessToken);

    const result = await client.query({
      query: UserDocument,
      variables: { userId },
      fetchPolicy: "no-cache",
    });

    const user = result.data?.user ?? null;

    return NextResponse.json({
      authenticated: !!user,
      user,
    });
  } catch {
    return NextResponse.json({ authenticated: false, user: null });
  }
}
