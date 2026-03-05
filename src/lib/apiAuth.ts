import { NextRequest, NextResponse } from "next/server";

import { USER_ID_COOKIE_NAME } from "@/lib/auth";

export function getCurrentUserIdFromRequest(request: NextRequest) {
  const headerUserId = request.headers.get("x-user-id")?.trim();
  if (!headerUserId) return null;

  const cookieUserIdRaw = request.cookies.get(USER_ID_COOKIE_NAME)?.value ?? "";
  const cookieUserId = (() => {
    try {
      return decodeURIComponent(cookieUserIdRaw).trim();
    } catch {
      return cookieUserIdRaw.trim();
    }
  })();

  if (cookieUserId && cookieUserId !== headerUserId) {
    return null;
  }

  return headerUserId;
}

export function requireUserId(request: NextRequest) {
  const userId = getCurrentUserIdFromRequest(request);
  if (!userId) {
    return {
      userId: null,
      error: NextResponse.json(
        { error: "Unauthorized: missing x-user-id header" },
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
