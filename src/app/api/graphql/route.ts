import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies";

export async function POST(request: NextRequest) {
  const body = await request.text();

  const existingAuth = request.headers.get("Authorization");
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  const bearerToken = existingAuth ?? (cookieToken ? `Bearer ${cookieToken}` : null);

  const res = await fetch(process.env.GRAPHQL_API_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(bearerToken ? { Authorization: bearerToken } : {}),
    },
    body,
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
