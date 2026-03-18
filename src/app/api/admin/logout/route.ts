import { NextRequest, NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE_NAME, getAdminSessionFromRequest } from "@/lib/adminAuth";
import { getRequestContext, recordActivity } from "@/lib/activity";

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminSessionFromRequest(request);
    if (admin) {
      const { ipAddress, userAgent } = getRequestContext(request);
      await recordActivity({
        userId: `admin:${admin.email}`,
        userEmail: admin.email,
        role: "admin",
        action: "admin_logout",
        targetType: "session",
        targetId: null,
        ipAddress,
        userAgent,
      }).catch(() => null);
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_SESSION_COOKIE_NAME, "", {
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch (error) {
    console.error("[api/admin/logout] POST failed", error);
    return NextResponse.json({ error: "Failed to logout admin" }, { status: 500 });
  }
}

