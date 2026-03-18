import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { ADMIN_SESSION_COOKIE_NAME, createAdminSessionToken, isValidAdminCredentials } from "@/lib/adminAuth";
import { getRequestContext, recordActivity, upsertUserProfile } from "@/lib/activity";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid admin login payload" }, { status: 400 });
    }

    const { email, password } = parsed.data;
    if (!isValidAdminCredentials(email, password)) {
      return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
    }

    const token = await createAdminSessionToken(email);
    const normalizedEmail = email.trim().toLowerCase();
    const { ipAddress, userAgent } = getRequestContext(request);

    await upsertUserProfile({
      authId: `admin:${normalizedEmail}`,
      email: normalizedEmail,
      role: "admin",
      status: "active",
      touchLoginAt: true,
    }).catch(() => null);

    await recordActivity({
      userId: `admin:${normalizedEmail}`,
      userEmail: normalizedEmail,
      role: "admin",
      action: "admin_login",
      targetType: "session",
      targetId: null,
      ipAddress,
      userAgent,
      metadata: {
        source: "api_admin_login",
      },
    }).catch(() => null);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Number(process.env.ADMIN_SESSION_TTL_SECONDS ?? "28800"),
    });

    return response;
  } catch (error) {
    console.error("[api/admin/login] POST failed", error);
    return NextResponse.json({ error: "Failed to login admin" }, { status: 500 });
  }
}

