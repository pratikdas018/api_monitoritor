import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminRequest } from "@/lib/adminAuth";
import { getRequestContext, recordActivity } from "@/lib/activity";
import { getAdminUsersData } from "@/lib/adminQueries";
import { connectToDatabase } from "@/lib/db";
import Monitor from "@/models/Monitor";
import User from "@/models/User";

export const dynamic = "force-dynamic";

const updateUserSchema = z.object({
  id: z.string().trim().min(1),
  role: z.enum(["user", "admin"]).optional(),
  status: z.enum(["active", "suspended", "deleted"]).optional(),
  name: z.string().trim().max(120).optional(),
});

async function pauseUserMonitors(authId: string | null, email: string) {
  const identifiers = [email.trim().toLowerCase()];
  if (authId && authId.trim()) {
    identifiers.push(authId.trim());
  }
  await Monitor.updateMany({ userId: { $in: identifiers } }, { $set: { status: "paused" } });
}

export async function GET(request: NextRequest) {
  try {
    const adminAuth = await requireAdminRequest(request);
    if (adminAuth.error) {
      return adminAuth.error;
    }

    const { searchParams } = request.nextUrl;
    const data = await getAdminUsersData({
      page: Number(searchParams.get("page") ?? "1"),
      limit: Number(searchParams.get("limit") ?? "20"),
      search: searchParams.get("search") ?? undefined,
      role: searchParams.get("role") ?? undefined,
      status: searchParams.get("status") ?? undefined,
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/admin/users] GET failed", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminAuth = await requireAdminRequest(request);
    if (adminAuth.error) {
      return adminAuth.error;
    }

    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid user update payload" }, { status: 400 });
    }

    await connectToDatabase();
    const update: Record<string, unknown> = {};
    if (parsed.data.role) update.role = parsed.data.role;
    if (parsed.data.status) update.status = parsed.data.status;
    if (parsed.data.name !== undefined) update.name = parsed.data.name;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No update fields provided" }, { status: 400 });
    }

    const updated = await User.findByIdAndUpdate(parsed.data.id, { $set: update }, { new: true }).lean();
    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (parsed.data.status && parsed.data.status !== "active") {
      await pauseUserMonitors(updated.authId ?? null, updated.email);
    }

    const { ipAddress, userAgent } = getRequestContext(request);
    await recordActivity({
      userId: `admin:${adminAuth.admin?.email}`,
      userEmail: adminAuth.admin?.email,
      role: "admin",
      action: "admin_update_user",
      targetType: "user",
      targetId: String(updated._id),
      ipAddress,
      userAgent,
      metadata: update,
    }).catch(() => null);

    return NextResponse.json({ ok: true, user: updated });
  } catch (error) {
    console.error("[api/admin/users] PATCH failed", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminAuth = await requireAdminRequest(request);
    if (adminAuth.error) {
      return adminAuth.error;
    }

    const userId = request.nextUrl.searchParams.get("id");
    if (!userId) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.status = "deleted";
    await user.save();
    await pauseUserMonitors(user.authId ?? null, user.email);

    const { ipAddress, userAgent } = getRequestContext(request);
    await recordActivity({
      userId: `admin:${adminAuth.admin?.email}`,
      userEmail: adminAuth.admin?.email,
      role: "admin",
      action: "admin_delete_user",
      targetType: "user",
      targetId: String(user._id),
      ipAddress,
      userAgent,
    }).catch(() => null);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/admin/users] DELETE failed", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
