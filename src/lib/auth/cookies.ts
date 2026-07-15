import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

export const ACCESS_TOKEN_COOKIE = "cv_access_token";
export const REFRESH_TOKEN_COOKIE = "cv_refresh_token";

const isProd = process.env.NODE_ENV === "production";

export function setAuthCookies(
  response: NextResponse,
  tokens: { accessToken: string; refreshToken: string },
) {
  response.cookies.set({
    name: ACCESS_TOKEN_COOKIE,
    value: tokens.accessToken,
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  response.cookies.set({
    name: REFRESH_TOKEN_COOKIE,
    value: tokens.refreshToken,
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set({
    name: ACCESS_TOKEN_COOKIE,
    value: "",
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set({
    name: REFRESH_TOKEN_COOKIE,
    value: "",
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function getServerAccessToken() {
  const store = await cookies();
  return store.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getServerRefreshToken() {
  const store = await cookies();
  return store.get(REFRESH_TOKEN_COOKIE)?.value ?? null;
}
