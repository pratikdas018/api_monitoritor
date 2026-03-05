import { NextRequest, NextResponse } from "next/server";

import { connectToDatabase, hasMongoConfig } from "@/lib/db";
import CheckHistory from "@/models/CheckHistory";

export const dynamic = "force-dynamic";

function getRangeStart(range: string | null) {
  if (range === "30d") {
    return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }

  if (range === "7d") {
    return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  }

  return new Date(Date.now() - 24 * 60 * 60 * 1000);
}

export async function GET(request: NextRequest) {
  try {
    if (!hasMongoConfig()) {
      return NextResponse.json({ history: [] });
    }

    const monitorId = request.nextUrl.searchParams.get("monitorId");
    const projectId = request.nextUrl.searchParams.get("projectId");
    const range = request.nextUrl.searchParams.get("range");
    const since = getRangeStart(range);

    const query: Record<string, unknown> = {
      timestamp: { $gte: since },
    };

    if (monitorId) {
      query.monitorId = monitorId;
    }
    if (projectId) {
      query.projectId = projectId;
    }

    await connectToDatabase();
    const history = await CheckHistory.find(query).sort({ timestamp: 1 }).limit(5000).lean();

    return NextResponse.json({ history });
  } catch (error) {
    console.error("[api/history] GET failed", error);
    return NextResponse.json({ error: "Failed to fetch check history" }, { status: 500 });
  }
}
