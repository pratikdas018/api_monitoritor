import { NextRequest, NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminAuth";
import { SESSION_COOKIE_NAME, USER_ID_COOKIE_NAME } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminApiRoute = pathname.startsWith("/api/admin");
  if (isAdminRoute || isAdminApiRoute) {
    const isAdminLoginRoute = pathname === "/admin/login";
    const isAdminLoginApi = pathname.startsWith("/api/admin/login");
    const adminToken = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value ?? "";
    const adminSession = adminToken ? await verifyAdminSessionToken(adminToken) : null;

    if (adminSession) {
      if (isAdminLoginRoute) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    if (isAdminLoginRoute || isAdminLoginApi) {
      return NextResponse.next();
    }

    if (isAdminApiRoute) {
      return NextResponse.json({ error: "Unauthorized: admin login required" }, { status: 401 });
    }

    const adminLoginUrl = new URL("/admin/login", request.url);
    adminLoginUrl.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(adminLoginUrl);
  }

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
    "/admin/:path*",
    "/api/admin/:path*",
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
