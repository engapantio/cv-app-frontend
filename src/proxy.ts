// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/auth/login", "/auth/signup"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (isPublic && (accessToken || refreshToken)) {
    return NextResponse.redirect(new URL("/users", request.url));
  }

  if (
    !isPublic &&
    !pathname.startsWith("/api") &&
    !accessToken &&
    !refreshToken
  ) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

