import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { LoginQuery } from "@/gql/generated/graphql";

export type SessionUser = NonNullable<LoginQuery["login"]>["user"];

export const ACCESS_TOKEN_COOKIE = "cv_access_token";
export const REFRESH_TOKEN_COOKIE = "cv_refresh_token";
export const USER_ID_COOKIE = "cv_user_id";

const isProd = process.env.NODE_ENV === "production";
const expired = new Date(0);

export function setAuthCookies(
  response: NextResponse,
  tokens: { accessToken: string; refreshToken: string },
  userId: string | number,
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

  response.cookies.set({
    name: USER_ID_COOKIE,
    value: String(userId),
    httpOnly: false,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

export function clearAuthCookies(response: NextResponse) {
  for (const name of [ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, USER_ID_COOKIE]) {
    response.cookies.set({
      name,
      value: "",
      httpOnly: name !== USER_ID_COOKIE,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: expired,
    });
  }

  return response;
}

export async function getServerAccessToken() {
  return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getServerRefreshToken() {
  return (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value ?? null;
}

export function getClientAccessToken(request: NextRequest) {
  return request.cookies.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getServerUserId() {
  return (await cookies()).get(USER_ID_COOKIE)?.value ?? null;
}

export function getClientUserId(request: NextRequest) {
  return request.cookies.get(USER_ID_COOKIE)?.value ?? null;
}
