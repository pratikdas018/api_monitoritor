import { NextRequest, NextResponse } from "next/server";

import { requireUserId } from "@/lib/apiAuth";
import { connectToDatabase, hasMongoConfig } from "@/lib/db";
import Incident from "@/models/Incident";
import Monitor from "@/models/Monitor";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    if (!hasMongoConfig()) {
      return NextResponse.json({ incidents: [] }, { status: 200 });
    }

    const auth = requireUserId(request);
    if (auth.error) {
      return auth.error;
    }

    await connectToDatabase();

    const status = request.nextUrl.searchParams.get("status");
    const monitorId = request.nextUrl.searchParams.get("monitorId");
    const projectId = request.nextUrl.searchParams.get("projectId");

    const monitorQuery: Record<string, unknown> = { userId: auth.userId };
    if (monitorId) {
      monitorQuery._id = monitorId;
    }
    if (projectId) {
      monitorQuery.projectId = projectId;
    }

    const ownedMonitorIds = (await Monitor.find(monitorQuery).select("_id").lean()).map((monitor) => monitor._id);
    if (ownedMonitorIds.length === 0) {
      return NextResponse.json({ incidents: [] }, { status: 200 });
    }

    const query: Record<string, unknown> = {
      monitorId: { $in: ownedMonitorIds },
    };
    if (status && ["open", "resolved", "OPEN", "RESOLVED"].includes(status)) {
      query.status = status.toUpperCase();
    }

    const incidents = await Incident.find(query).sort({ startedAt: -1 }).limit(200).lean();
    return NextResponse.json({ incidents });
  } catch (error) {
    console.error("[api/incidents] GET failed", error);
    return NextResponse.json({ error: "Failed to fetch incidents" }, { status: 500 });
  }
}
