import { NextResponse } from "next/server";
import { createServerApolloClient } from "@/lib/apollo/server-client";
import {
  getServerAccessToken,
  getServerRefreshToken,
  getServerUserId,
  setAuthCookies,
} from "@/lib/auth/cookies";
import { UserDocument, UpdateTokenDocument } from "@/gql/generated/graphql";

async function fetchUser(token: string, userId: string) {
  const client = createServerApolloClient(token);
  const result = await client.query({
    query: UserDocument,
    variables: { userId },
    fetchPolicy: "no-cache",
  });
  return result.data?.user ?? null;
}

async function refreshTokens() {
  const refreshToken = await getServerRefreshToken();
  const userId = await getServerUserId();
  if (!refreshToken || !userId) return null;
  try {
    const client = createServerApolloClient(refreshToken);
    const { data } = await client.mutate({
      mutation: UpdateTokenDocument,
    });
    return data?.updateToken
      ? {
          accessToken: data.updateToken.access_token,
          refreshToken: data.updateToken.refresh_token,
          userId,
        }
      : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const accessToken = await getServerAccessToken();
  const userId = await getServerUserId();

  if (!userId) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  if (accessToken) {
    try {
      const user = await fetchUser(accessToken, userId);
      return NextResponse.json({
        authenticated: !!user,
        user,
        accessToken,
        refreshToken: await getServerRefreshToken(),
      });
    } catch {
      // access token invalid/expired; fall through to refresh
    }
  }

  const refreshed = await refreshTokens();
  if (!refreshed) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  try {
    const user = await fetchUser(refreshed.accessToken, userId);
    const res = NextResponse.json({
      authenticated: !!user,
      user,
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken,
    });
    return setAuthCookies(res, refreshed, refreshed.userId);
  } catch {
    return setAuthCookies(
      NextResponse.json({ authenticated: false, user: null }),
      refreshed,
      refreshed.userId,
    );
  }
}
