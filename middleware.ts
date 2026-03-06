import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE_NAME, USER_ID_COOKIE_NAME } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // API authorization middleware for user-isolated resources.
  if (
    pathname.startsWith("/api/monitors") ||
    pathname.startsWith("/api/projects") ||
    pathname.startsWith("/api/incidents")
  ) {
    const headerUserId = request.headers.get("x-user-id")?.trim();
    if (!headerUserId) {
      return NextResponse.json(
        { error: "Unauthorized: missing x-user-id header" },
        { status: 401 },
      );
    }
    const cookieUserIdRaw = request.cookies.get(USER_ID_COOKIE_NAME)?.value ?? "";
    const cookieUserId = (() => {
      try {
        return decodeURIComponent(cookieUserIdRaw).trim();
      } catch {
        return cookieUserIdRaw.trim();
      }
    })();
    if (cookieUserId && cookieUserId !== headerUserId) {
      return NextResponse.json(
        { error: "Unauthorized: user mismatch" },
        { status: 403 },
      );
    }
    return NextResponse.next();
  }

  const isAuthenticated = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  const hasUserId = Boolean(request.cookies.get(USER_ID_COOKIE_NAME)?.value?.trim());
  if (isAuthenticated && hasUserId) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/api/monitors/:path*",
    "/api/projects/:path*",
    "/api/incidents/:path*",
  ],
};
