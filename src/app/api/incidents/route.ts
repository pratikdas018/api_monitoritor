import { NextRequest, NextResponse } from "next/server";

import { connectToDatabase, hasMongoConfig } from "@/lib/db";
import Incident from "@/models/Incident";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    if (!hasMongoConfig()) {
      return NextResponse.json({ incidents: [] }, { status: 200 });
    }

    await connectToDatabase();

    const status = request.nextUrl.searchParams.get("status");
    const monitorId = request.nextUrl.searchParams.get("monitorId");

    const query: Record<string, unknown> = {};
    if (status && ["open", "resolved", "OPEN", "RESOLVED"].includes(status)) {
      query.status = status.toUpperCase();
    }
    if (monitorId) {
      query.monitorId = monitorId;
    }

    const incidents = await Incident.find(query).sort({ startedAt: -1 }).limit(200).lean();
    return NextResponse.json({ incidents });
  } catch (error) {
    console.error("[api/incidents] GET failed", error);
    return NextResponse.json({ error: "Failed to fetch incidents" }, { status: 500 });
  }
}
