import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { ADMIN_SESSION_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminAuth";

function isUserApiRoute(pathname: string) {
  return (
    pathname.startsWith("/api/monitors") ||
    pathname.startsWith("/api/projects") ||
    pathname.startsWith("/api/incidents") ||
    pathname.startsWith("/api/status") ||
    pathname.startsWith("/api/history")
  );
}

function isProtectedUserPage(pathname: string) {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/incidents") ||
    pathname.startsWith("/monitors") ||
    pathname.startsWith("/status")
  );
}

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

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isProtectedUserPage(pathname) && !isUserApiRoute(pathname)) {
    return NextResponse.next();
  }

  if (!token) {
    if (isUserApiRoute(pathname)) {
      return NextResponse.json({ error: "Unauthorized: login required" }, { status: 401 });
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/admin/:path*",
    "/api/admin/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/incidents/:path*",
    "/monitors/:path*",
    "/status/:path*",
    "/api/monitors/:path*",
    "/api/projects/:path*",
    "/api/incidents/:path*",
    "/api/status/:path*",
    "/api/history/:path*",
  ],
};
