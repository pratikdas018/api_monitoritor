import { NextResponse } from "next/server";

import { hasMongoConfig } from "@/lib/db";
import { createMonitorRecord } from "@/lib/monitorMutations";
import { getStatusMonitors } from "@/lib/queries";
import { enqueueMonitorCheck } from "@/lib/queue";
import { createMonitorSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const monitors = await getStatusMonitors();
    return NextResponse.json({ monitors });
  } catch (error) {
    console.error("[api/monitors] GET failed", error);
    return NextResponse.json({ error: "Failed to fetch monitors" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!hasMongoConfig()) {
      return NextResponse.json(
        { error: "Database is not configured. Set MONGODB_URI." },
        { status: 503 },
      );
    }

    const body = await request.json();
    const parsed = createMonitorSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid payload",
        },
        { status: 400 },
      );
    }

    const monitor = await createMonitorRecord(parsed.data);
    await enqueueMonitorCheck(monitor.id, "create");

    return NextResponse.json(
      {
        message: "Monitor created",
        monitorId: monitor.id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[api/monitors] POST failed", error);
    return NextResponse.json({ error: "Failed to create monitor" }, { status: 500 });
  }
}
