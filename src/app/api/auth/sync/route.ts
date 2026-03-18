import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { connectToDatabase, hasMongoConfig } from "@/lib/db";
import { SESSION_COOKIE_NAME, USER_EMAIL_COOKIE_NAME, USER_ID_COOKIE_NAME } from "@/lib/auth";
import Monitor from "@/models/Monitor";

function looksLikeEmail(value: string) {
  const trimmed = value.trim();
  if (trimmed.length < 6 || trimmed.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

function decodeCookie(value: string) {
  let decoded = value.trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    // ignore
  }
  return decoded.trim();
}

// Sync the logged-in user's email into monitor documents so alerts can route reliably.
export async function POST() {
  const cookieStore = cookies();
  const hasSession = Boolean(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!hasSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = decodeCookie(cookieStore.get(USER_ID_COOKIE_NAME)?.value ?? "");
  const email = decodeCookie(cookieStore.get(USER_EMAIL_COOKIE_NAME)?.value ?? "");
  if (!userId || !looksLikeEmail(email)) {
    return NextResponse.json({ ok: true, updated: 0 });
  }

  if (!hasMongoConfig()) {
    return NextResponse.json({ ok: true, updated: 0 });
  }

  await connectToDatabase();
  const normalizedEmail = email.toLowerCase();

  const result = await Monitor.updateMany(
    {
      userId,
      $or: [
        { ownerEmail: { $exists: false } },
        { ownerEmail: null },
        { ownerEmail: "" },
        { ownerEmail: { $ne: normalizedEmail } },
      ],
    },
    { $set: { ownerEmail: normalizedEmail } },
  );

  return NextResponse.json({
    ok: true,
    updated: "modifiedCount" in result ? result.modifiedCount : 0,
  });
}
