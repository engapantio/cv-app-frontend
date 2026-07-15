import { NextResponse } from "next/server";
import {
  getServerAccessToken,
  getServerRefreshToken,
} from "@/lib/auth/cookies";

export async function GET() {
  const accessToken = await getServerAccessToken();
  const refreshToken = await getServerRefreshToken();

  return NextResponse.json(
    {
      authenticated: Boolean(accessToken || refreshToken),
      user: null,
    },
    { status: 200 },
  );
}
