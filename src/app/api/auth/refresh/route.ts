import { NextResponse } from "next/server";
import { createServerApolloClient } from "@/lib/apollo/server-client";
import { UPDATE_TOKEN_MUTATION } from "@/lib/graphql/auth/update-token.mutation";
import {
  getServerRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from "@/lib/auth/cookies";

export async function POST() {
  const refreshToken = await getServerRefreshToken();

  if (!refreshToken) {
    return clearAuthCookies(
      NextResponse.json({ message: "No refresh token" }, { status: 401 }),
    );
  }

  try {
    const client = createServerApolloClient(refreshToken);
    const { data } = await client.mutate({
      mutation: UPDATE_TOKEN_MUTATION,
    });

    if (!data?.updateToken) {
      return clearAuthCookies(
        NextResponse.json({ message: "Session expired" }, { status: 401 }),
      );
    }

    const response = NextResponse.json({ ok: true });
    return setAuthCookies(response, {
      accessToken: data.updateToken.access_token,
      refreshToken: data.updateToken.refresh_token,
    });
  } catch {
    return clearAuthCookies(
      NextResponse.json({ message: "Session expired" }, { status: 401 }),
    );
  }
}
