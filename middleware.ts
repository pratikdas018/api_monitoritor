import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE_NAME, USER_ID_COOKIE_NAME } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const sessionValue = request.cookies.get(SESSION_COOKIE_NAME)?.value ?? "";
  const isAuthenticated = Boolean(sessionValue);
  const cookieUserIdRaw = request.cookies.get(USER_ID_COOKIE_NAME)?.value ?? "";
  const cookieUserId = (() => {
    try {
      return decodeURIComponent(cookieUserIdRaw).trim();
    } catch {
      return cookieUserIdRaw.trim();
    }
  })();

  // API authorization middleware for user-isolated resources.
  if (
    pathname.startsWith("/api/monitors") ||
    pathname.startsWith("/api/projects") ||
    pathname.startsWith("/api/incidents") ||
    pathname.startsWith("/api/status") ||
    pathname.startsWith("/api/history")
  ) {
    if (!isAuthenticated || !cookieUserId) {
      return NextResponse.json(
        { error: "Unauthorized: login required" },
        { status: 401 },
      );
    }

    const headerUserId = request.headers.get("x-user-id")?.trim();
    if (headerUserId && cookieUserId !== headerUserId) {
      return NextResponse.json(
        { error: "Unauthorized: user mismatch" },
        { status: 403 },
      );
    }
    return NextResponse.next();
  }

  if (isAuthenticated && cookieUserId) {
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
    "/status/:path*",
    "/api/monitors/:path*",
    "/api/projects/:path*",
    "/api/incidents/:path*",
    "/api/status/:path*",
    "/api/history/:path*",
  ],
};
