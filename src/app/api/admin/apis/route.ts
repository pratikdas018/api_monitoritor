import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminRequest } from "@/lib/adminAuth";
import { getRequestContext, recordActivity } from "@/lib/activity";
import { getAdminApisData } from "@/lib/adminQueries";
import { connectToDatabase } from "@/lib/db";
import Monitor from "@/models/Monitor";

export const dynamic = "force-dynamic";

const updateApiSchema = z.object({
  id: z.string().trim().min(1),
  status: z.enum(["up", "down", "paused", "unknown"]).optional(),
  intervalMinutes: z.union([z.literal(1), z.literal(5), z.literal(10)]).optional(),
  timeoutMs: z.number().int().min(1000).max(60000).optional(),
  name: z.string().trim().max(80).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const adminAuth = await requireAdminRequest(request);
    if (adminAuth.error) {
      return adminAuth.error;
    }

    const { searchParams } = request.nextUrl;
    const data = await getAdminApisData({
      page: Number(searchParams.get("page") ?? "1"),
      limit: Number(searchParams.get("limit") ?? "20"),
      search: searchParams.get("search") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      userId: searchParams.get("userId") ?? undefined,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/admin/apis] GET failed", error);
    return NextResponse.json({ error: "Failed to fetch APIs" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminAuth = await requireAdminRequest(request);
    if (adminAuth.error) {
      return adminAuth.error;
    }

    const body = await request.json();
    const parsed = updateApiSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid API update payload" }, { status: 400 });
    }

    const update: Record<string, unknown> = {};
    if (parsed.data.status) update.status = parsed.data.status;
    if (parsed.data.intervalMinutes) update.intervalMinutes = parsed.data.intervalMinutes;
    if (parsed.data.timeoutMs) update.timeoutMs = parsed.data.timeoutMs;
    if (parsed.data.name !== undefined) update.name = parsed.data.name;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No update fields provided" }, { status: 400 });
    }

    await connectToDatabase();
    const updated = await Monitor.findByIdAndUpdate(parsed.data.id, { $set: update }, { new: true }).lean();
    if (!updated) {
      return NextResponse.json({ error: "API monitor not found" }, { status: 404 });
    }

    const { ipAddress, userAgent } = getRequestContext(request);
    await recordActivity({
      userId: `admin:${adminAuth.admin?.email}`,
      userEmail: adminAuth.admin?.email,
      role: "admin",
      action: "admin_update_api_monitor",
      targetType: "monitor",
      targetId: String(updated._id),
      ipAddress,
      userAgent,
      metadata: update,
    }).catch(() => null);

    return NextResponse.json({ ok: true, monitor: updated });
  } catch (error) {
    console.error("[api/admin/apis] PATCH failed", error);
    return NextResponse.json({ error: "Failed to update API monitor" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminAuth = await requireAdminRequest(request);
    if (adminAuth.error) {
      return adminAuth.error;
    }

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing monitor id" }, { status: 400 });
    }

    await connectToDatabase();
    const deleted = await Monitor.findByIdAndDelete(id).lean();
    if (!deleted) {
      return NextResponse.json({ error: "API monitor not found" }, { status: 404 });
    }

    const { ipAddress, userAgent } = getRequestContext(request);
    await recordActivity({
      userId: `admin:${adminAuth.admin?.email}`,
      userEmail: adminAuth.admin?.email,
      role: "admin",
      action: "admin_delete_api_monitor",
      targetType: "monitor",
      targetId: String(id),
      ipAddress,
      userAgent,
      metadata: { url: deleted.url, name: deleted.name },
    }).catch(() => null);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/admin/apis] DELETE failed", error);
    return NextResponse.json({ error: "Failed to delete API monitor" }, { status: 500 });
  }
}
