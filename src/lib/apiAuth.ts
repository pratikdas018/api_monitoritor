import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE_NAME, USER_EMAIL_COOKIE_NAME, USER_ID_COOKIE_NAME } from "@/lib/auth";

export function getCurrentUserIdFromRequest(request: NextRequest) {
  const sessionValue = request.cookies.get(SESSION_COOKIE_NAME)?.value ?? "";
  if (!sessionValue) return null;

  const cookieUserIdRaw = request.cookies.get(USER_ID_COOKIE_NAME)?.value ?? "";
  const cookieUserId = (() => {
    try {
      return decodeURIComponent(cookieUserIdRaw).trim();
    } catch {
      return cookieUserIdRaw.trim();
    }
  })();

  if (!cookieUserId) return null;

  const headerUserId = request.headers.get("x-user-id")?.trim();
  if (headerUserId && cookieUserId !== headerUserId) {
    return null;
  }

  return cookieUserId;
}

export function requireUserId(request: NextRequest) {
  const userId = getCurrentUserIdFromRequest(request);
  if (!userId) {
    return {
      userId: null,
      error: NextResponse.json(
        { error: "Unauthorized: login required" },
        { status: 401 },
      ),
    };
  }

  return { userId, error: null as NextResponse | null };
}

export function ensurePayloadUserMatch(payloadUserId: unknown, currentUserId: string) {
  if (typeof payloadUserId === "string" && payloadUserId.trim() && payloadUserId !== currentUserId) {
    return NextResponse.json({ error: "Unauthorized: userId mismatch" }, { status: 403 });
  }

  return null;
}

function looksLikeEmail(value: string) {
  const trimmed = value.trim();
  if (trimmed.length < 6 || trimmed.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function getCurrentUserEmailFromRequest(request: NextRequest) {
  const sessionValue = request.cookies.get(SESSION_COOKIE_NAME)?.value ?? "";
  if (!sessionValue) return null;

  const rawEmail = request.cookies.get(USER_EMAIL_COOKIE_NAME)?.value ?? "";
  let email = rawEmail.trim();
  try {
    email = decodeURIComponent(email).trim();
  } catch {
    // Keep raw if decode fails.
  }

  if (!looksLikeEmail(email)) {
    return null;
  }

  return email.toLowerCase();
}
