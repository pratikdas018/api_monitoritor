import { NextRequest, NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminAuth";

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

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
