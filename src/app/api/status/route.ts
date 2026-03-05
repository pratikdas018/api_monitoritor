import { NextResponse } from "next/server";

import { getStatusMonitors } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const monitors = await getStatusMonitors(projectId);
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
