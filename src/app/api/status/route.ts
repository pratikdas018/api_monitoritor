import { NextRequest, NextResponse } from "next/server";

import { requireUserId } from "@/lib/apiAuth";
import { getStatusMonitors } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireUserId(request);
    if (auth.error) {
      return auth.error;
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const monitors = await getStatusMonitors(projectId, auth.userId as string);
    const summary = {
      total: monitors.length,
      up: monitors.filter((monitor) => monitor.status === "up").length,
      down: monitors.filter((monitor) => monitor.status === "down").length,
      paused: monitors.filter((monitor) => monitor.status === "paused").length,
    };

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      summary,
      monitors,
    });
  } catch (error) {
    console.error("[api/status] GET failed", error);
    return NextResponse.json({ error: "Failed to load status page data" }, { status: 500 });
  }
}
