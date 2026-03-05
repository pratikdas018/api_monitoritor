import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";

import { requireUserId } from "@/lib/apiAuth";
import { connectToDatabase, hasMongoConfig } from "@/lib/db";
import Monitor from "@/models/Monitor";

const updateMonitorSchema = z
  .object({
    name: z.string().trim().max(80).optional(),
    url: z
      .string()
      .trim()
      .url()
      .refine((value) => value.startsWith("http://") || value.startsWith("https://"), {
        message: "URL must start with http:// or https://",
      })
      .optional(),
    intervalMinutes: z.preprocess((value) => Number(value), z.union([z.literal(1), z.literal(5), z.literal(10)])).optional(),
    timeoutMs: z.preprocess((value) => Number(value), z.number().int().min(1000).max(60000)).optional(),
    status: z.enum(["up", "down", "paused", "unknown"]).optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "No update fields provided",
  });

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = requireUserId(request);
  if (auth.error) {
    return auth.error;
  }

  if (!hasMongoConfig()) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }

  if (!Types.ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: "Invalid monitor id" }, { status: 400 });
  }

  await connectToDatabase();
  const monitor = await Monitor.findById(params.id);
  if (!monitor) {
    return NextResponse.json({ error: "Monitor not found" }, { status: 404 });
  }

  if (monitor.userId !== auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = updateMonitorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 },
    );
  }

  Object.assign(monitor, parsed.data);
  await monitor.save();

  return NextResponse.json({ monitor });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = requireUserId(request);
  if (auth.error) {
    return auth.error;
  }

  if (!hasMongoConfig()) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }

  if (!Types.ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: "Invalid monitor id" }, { status: 400 });
  }

  await connectToDatabase();
  const monitor = await Monitor.findById(params.id).select("_id userId").lean();
  if (!monitor) {
    return NextResponse.json({ error: "Monitor not found" }, { status: 404 });
  }

  if (monitor.userId !== auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await Monitor.findByIdAndDelete(params.id);
  return NextResponse.json({ ok: true });
}
