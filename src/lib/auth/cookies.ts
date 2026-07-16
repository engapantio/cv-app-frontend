import { NextRequest, NextResponse } from "next/server";
import type { User } from "cv-graphql";

export const ACCESS_TOKEN_COOKIE = "cv_access_token";
export const REFRESH_TOKEN_COOKIE = "cv_refresh_token";
export const SESSION_USER_COOKIE = "cv_session_user";

const isProd = process.env.NODE_ENV === "production";
const sessionUserMaxAge = 60 * 60 * 24 * 7;

export type SessionUser = Pick<User, "id" | "email" | "role" | "is_verified">;

export function setAuthCookies(
  response: NextResponse,
  tokens: { accessToken: string; refreshToken: string },
  rawUser?: SessionUser,
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

  if (rawUser) {
    response.cookies.set({
      name: SESSION_USER_COOKIE,
      value: encodeURIComponent(JSON.stringify(rawUser)),
      httpOnly: false,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: sessionUserMaxAge,
    });
  }

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

  response.cookies.set({
    name: SESSION_USER_COOKIE,
    value: "",
    httpOnly: false,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

export async function getServerAccessToken() {
  const { cookies } = await import("next/headers");
  return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getServerRefreshToken() {
  const { cookies } = await import("next/headers");
  return (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value ?? null;
}

export function getClientSessionUser(request: NextRequest): SessionUser | null {
  const value = request.cookies.get(SESSION_USER_COOKIE)?.value;

  if (!value) return null;

  try {
    return JSON.parse(decodeURIComponent(value)) as SessionUser;
  } catch {
    return null;
  }
}

export async function getServerSessionUser(): Promise<SessionUser | null> {
  const { cookies } = await import("next/headers");
  const value = (await cookies()).get(SESSION_USER_COOKIE)?.value;

  if (!value) return null;

  try {
    return JSON.parse(decodeURIComponent(value)) as SessionUser;
  } catch {
    return null;
  }
}
