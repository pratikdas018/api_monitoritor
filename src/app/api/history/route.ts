import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

import { requireUserId } from "@/lib/apiAuth";
import { connectToDatabase, hasMongoConfig } from "@/lib/db";
import CheckHistory from "@/models/CheckHistory";
import Monitor from "@/models/Monitor";

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

    const auth = requireUserId(request);
    if (auth.error) {
      return auth.error;
    }

    const monitorId = request.nextUrl.searchParams.get("monitorId");
    const projectId = request.nextUrl.searchParams.get("projectId");
    const range = request.nextUrl.searchParams.get("range");
    const since = getRangeStart(range);

    await connectToDatabase();
    const monitorQuery: Record<string, unknown> = { userId: auth.userId };
    if (monitorId && Types.ObjectId.isValid(monitorId)) {
      monitorQuery._id = monitorId;
    }
    if (projectId && Types.ObjectId.isValid(projectId)) {
      monitorQuery.projectId = projectId;
    }

    const ownedMonitorIds = (await Monitor.find(monitorQuery).select("_id").lean()).map(
      (monitor) => monitor._id,
    );
    if (ownedMonitorIds.length === 0) {
      return NextResponse.json({ history: [] });
    }

    const query: Record<string, unknown> = {
      monitorId: { $in: ownedMonitorIds },
      timestamp: { $gte: since },
    };

    const history = await CheckHistory.find(query).sort({ timestamp: 1 }).limit(5000).lean();

    return NextResponse.json({ history });
  } catch (error) {
    console.error("[api/history] GET failed", error);
    return NextResponse.json({ error: "Failed to fetch check history" }, { status: 500 });
  }
}
