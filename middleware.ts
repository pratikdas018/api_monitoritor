import { NextRequest, NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminAuth";
import {
  SESSION_COOKIE_NAME,
  USER_EMAIL_COOKIE_NAME,
  USER_ID_COOKIE_NAME,
  USER_SESSION_INACTIVITY_SECONDS,
} from "@/lib/auth";

function looksLikeEmail(value: string) {
  const trimmed = value.trim();
  if (trimmed.length < 6 || trimmed.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

function getUserCookieOptions(request: NextRequest) {
  return {
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production" || request.nextUrl.protocol === "https:",
    maxAge: USER_SESSION_INACTIVITY_SECONDS,
  };
}

function clearUserCookies(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  response.cookies.set(USER_ID_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  response.cookies.set(USER_EMAIL_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return response;
}

function withRefreshedUserSession(
  request: NextRequest,
  response: NextResponse,
  userId: string,
) {
  const options = getUserCookieOptions(request);
  response.cookies.set(SESSION_COOKIE_NAME, "authenticated", {
    ...options,
    httpOnly: true,
  });
  response.cookies.set(USER_ID_COOKIE_NAME, encodeURIComponent(userId), {
    ...options,
    httpOnly: false,
  });

  const currentEmailCookie = request.cookies.get(USER_EMAIL_COOKIE_NAME)?.value ?? "";
  if (currentEmailCookie) {
    response.cookies.set(USER_EMAIL_COOKIE_NAME, currentEmailCookie, {
      ...options,
      httpOnly: false,
    });
  } else if (looksLikeEmail(userId)) {
    response.cookies.set(USER_EMAIL_COOKIE_NAME, encodeURIComponent(userId.toLowerCase()), {
      ...options,
      httpOnly: false,
    });
  }

  return response;
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
      return clearUserCookies(NextResponse.json(
        { error: "Unauthorized: login required" },
        { status: 401 },
      ));
    }

    const headerUserId = request.headers.get("x-user-id")?.trim();
    if (headerUserId && cookieUserId !== headerUserId) {
      return NextResponse.json(
        { error: "Unauthorized: user mismatch" },
        { status: 403 },
      );
    }
    return withRefreshedUserSession(request, NextResponse.next(), cookieUserId);
  }

  if (isAuthenticated && cookieUserId) {
    return withRefreshedUserSession(request, NextResponse.next(), cookieUserId);
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return clearUserCookies(NextResponse.redirect(loginUrl));
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
