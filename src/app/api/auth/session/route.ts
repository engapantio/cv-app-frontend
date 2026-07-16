import { NextResponse } from "next/server";
import {
  clearAuthCookies,
  getServerAccessToken,
  getServerRefreshToken,
  getServerSessionUser,
} from "@/lib/auth/cookies";

export async function GET() {
  const accessToken = await getServerAccessToken();
  const refreshToken = await getServerRefreshToken();
  const user = await getServerSessionUser();

  if (!accessToken && !refreshToken) {
    return clearAuthCookies(
      NextResponse.json(
        {
          authenticated: false,
          user: null,
        },
        { status: 200 },
      ),
    );
  }

  return NextResponse.json(
    {
      authenticated: Boolean(accessToken || refreshToken),
      user,
    },
    { status: 200 },
  );
}
