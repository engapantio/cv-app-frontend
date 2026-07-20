import { NextRequest, NextResponse } from "next/server";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { createServerApolloClient } from "@/lib/apollo/server-client";
import { ResetPasswordDocument } from "@/gql/generated/graphql";

export async function POST(request: NextRequest) {
  try {
    const { newPassword, token } = await request.json();

    if (!newPassword) {
      return NextResponse.json({ message: "New password is required" }, { status: 400 });
    }

    // token from the email link is passed as Bearer if needed
    const client = createServerApolloClient(token ?? undefined);
    await client.mutate({
      mutation: ResetPasswordDocument,
      variables: { auth: { newPassword } },
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    if (CombinedGraphQLErrors.is(error)) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
