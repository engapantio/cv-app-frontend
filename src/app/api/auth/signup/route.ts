import { NextRequest, NextResponse } from "next/server";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { createServerApolloClient } from "@/lib/apollo/server-client";
import { SIGNUP_MUTATION } from "@/lib/graphql/auth/signup.mutation";
import { setAuthCookies } from "@/lib/auth/cookies";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 },
      );
    }

    const client = createServerApolloClient();
    const { data } = await client.mutate({
      mutation: SIGNUP_MUTATION,
      variables: { auth: { email, password } },
    });

    if (!data?.signup) {
      return NextResponse.json({ message: "Signup failed" }, { status: 400 });
    }

    const { user, access_token, refresh_token } = data.signup;

    const response = NextResponse.json({ user });
    return setAuthCookies(response, {
      accessToken: access_token,
      refreshToken: refresh_token,
    });
  } catch (error: unknown) {
    if (CombinedGraphQLErrors.is(error)) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: "Unknown error" }, { status: 500 });
  }
}
