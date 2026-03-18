import { NextRequest, NextResponse } from "next/server";

import { requireAdminRequest } from "@/lib/adminAuth";
import { getAdminStatsData } from "@/lib/adminQueries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const adminAuth = await requireAdminRequest(request);
    if (adminAuth.error) {
      return adminAuth.error;
    }

    const data = await getAdminStatsData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/admin/stats] GET failed", error);
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 });
  }
}

