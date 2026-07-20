import { NextRequest, NextResponse } from "next/server";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { createServerApolloClient } from "@/lib/apollo/server-client";
import { setAuthCookies } from "@/lib/auth/cookies";
import { SignupDocument } from "@/gql/generated/graphql";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const client = createServerApolloClient();
    const { data } = await client.mutate({
      mutation: SignupDocument,
      variables: { auth: { email, password } },
    });

    const signup = data?.signup;

    if (!signup?.user || !signup.access_token || !signup.refresh_token) {
      return NextResponse.json({ message: "Signup failed" }, { status: 400 });
    }

    const response = NextResponse.json({ user: signup.user });

    return setAuthCookies(
      response,
      {
        accessToken: signup.access_token,
        refreshToken: signup.refresh_token,
      },
      signup.user.id,
    );
  } catch (error: unknown) {
    if (CombinedGraphQLErrors.is(error)) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: "Unknown error" }, { status: 500 });
  }
}
