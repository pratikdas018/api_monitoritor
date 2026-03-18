import { NextRequest, NextResponse } from "next/server";

import { requireAdminRequest } from "@/lib/adminAuth";
import { getAdminActivityData } from "@/lib/adminQueries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const adminAuth = await requireAdminRequest(request);
    if (adminAuth.error) {
      return adminAuth.error;
    }

    const { searchParams } = request.nextUrl;
    const format = (searchParams.get("format") ?? "json").toLowerCase() === "csv" ? "csv" : "json";
    const data = await getAdminActivityData({
      page: Number(searchParams.get("page") ?? "1"),
      limit: Number(searchParams.get("limit") ?? "20"),
      search: searchParams.get("search") ?? undefined,
      action: searchParams.get("action") ?? undefined,
      role: searchParams.get("role") ?? undefined,
      dateFrom: searchParams.get("dateFrom") ?? undefined,
      dateTo: searchParams.get("dateTo") ?? undefined,
      format,
    });

    if (format === "csv") {
      return new NextResponse(data.csv, {
        status: 200,
        headers: {
          "content-type": "text/csv; charset=utf-8",
          "content-disposition": 'attachment; filename="admin-activity-logs.csv"',
        },
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/admin/activity] GET failed", error);
    return NextResponse.json({ error: "Failed to fetch activity logs" }, { status: 500 });
  }
}

