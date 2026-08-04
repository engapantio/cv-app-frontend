import { NextRequest, NextResponse } from "next/server";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { createServerApolloClient } from "@/lib/apollo/server-client";
import { ForgotPasswordDocument } from "@/gql/generated/graphql";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email?.trim()) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const origin = request.headers.get("origin") ?? request.nextUrl.origin;
    const client = createServerApolloClient(undefined, { Origin: origin });

    await client.mutate({
      mutation: ForgotPasswordDocument,
      variables: {
        auth: {
          email: email.trim(),
        },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    if (CombinedGraphQLErrors.is(error)) {
      const message = error.errors?.[0]?.message ?? error.message;

      if (/failed to send email/i.test(message)) {
        return NextResponse.json(
          { message: "Unable to send reset email right now. Please try again later." },
          { status: 503 },
        );
      }

      return NextResponse.json({ message }, { status: 400 });
    }

    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
