import { NextRequest, NextResponse } from "next/server";

import { requireAdminRequest } from "@/lib/adminAuth";
import { getAdminLogsData } from "@/lib/adminQueries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const adminAuth = await requireAdminRequest(request);
    if (adminAuth.error) {
      return adminAuth.error;
    }

    const { searchParams } = request.nextUrl;
    const format = (searchParams.get("format") ?? "json").toLowerCase() === "csv" ? "csv" : "json";
    const data = await getAdminLogsData({
      page: Number(searchParams.get("page") ?? "1"),
      limit: Number(searchParams.get("limit") ?? "20"),
      userId: searchParams.get("userId") ?? undefined,
      eventType: searchParams.get("eventType") ?? undefined,
      dateFrom: searchParams.get("dateFrom") ?? undefined,
      dateTo: searchParams.get("dateTo") ?? undefined,
      format,
    });

    if (format === "csv") {
      return new NextResponse(data.csv, {
        status: 200,
        headers: {
          "content-type": "text/csv; charset=utf-8",
          "content-disposition": 'attachment; filename="admin-monitor-logs.csv"',
        },
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/admin/logs] GET failed", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

