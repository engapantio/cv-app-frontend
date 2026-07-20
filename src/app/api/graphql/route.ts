import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  const body = await request.text();

  const res = await fetch(process.env.GRAPHQL_API_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body,
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
