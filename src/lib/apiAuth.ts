import { NextRequest, NextResponse } from "next/server";
import type { Session } from "next-auth";

import { auth } from "@/lib/auth";

function normalizeEmail(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

function resolveSessionUserId(session: Session | null) {
  if (!session?.user) return null;

  // We use email as the application tenant key for monitor/project ownership.
  const email = normalizeEmail(session.user.email);
  if (email) return email;

  const fallbackId = session.user.id?.trim();
  return fallbackId && fallbackId.length > 0 ? fallbackId : null;
}

export async function getCurrentUserIdFromRequest(request: NextRequest) {
  void request;
  const session = await auth();
  return resolveSessionUserId(session);
}

export async function requireUserId(request: NextRequest) {
  const userId = await getCurrentUserIdFromRequest(request);
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

export async function getCurrentUserEmailFromRequest(request: NextRequest) {
  void request;
  const session = await auth();
  return normalizeEmail(session?.user?.email);
}
