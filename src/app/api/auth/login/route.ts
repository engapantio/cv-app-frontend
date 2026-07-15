import { NextRequest, NextResponse } from "next/server";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { createServerApolloClient } from "@/lib/apollo/server-client";
import { setAuthCookies } from "@/lib/auth/cookies";
import { LOGIN_QUERY } from "@/lib/graphql/auth/login.query";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const client = createServerApolloClient(req.headers.get("cookie") ?? undefined);

  try {
    const { data } = await client.query({
      query: LOGIN_QUERY,
      variables: {
        auth: {
          email: body.email,
          password: body.password,
        },
      },
      fetchPolicy: "no-cache",
    });

    if (!data?.login) {
      return NextResponse.json({ message: "Login failed" }, { status: 401 });
    }

    const authResult = data.login;

    const response = NextResponse.json({
      user: authResult.user,
    });

    return setAuthCookies(
      response,
      {
        accessToken: authResult.access_token,
        refreshToken: authResult.refresh_token,
      },
      authResult.user,
    );
  } catch (error: unknown) {
    if (CombinedGraphQLErrors.is(error)) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
