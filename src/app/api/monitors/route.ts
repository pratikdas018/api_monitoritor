import { NextResponse } from "next/server";

import { hasMongoConfig } from "@/lib/db";
import { createMonitorRecord } from "@/lib/monitorMutations";
import { runMonitorCheck } from "@/lib/monitoring";
import { getStatusMonitors } from "@/lib/queries";
import { enqueueMonitorCheck } from "@/lib/queue";
import { createMonitorSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

const ENQUEUE_TIMEOUT_MS = Number(process.env.MONITOR_ENQUEUE_TIMEOUT_MS ?? "4500");
const CREATE_INLINE_CHECK_TIMEOUT_MS = Number(process.env.MONITOR_CREATE_INLINE_TIMEOUT_MS ?? "2500");

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((value) => resolve(value))
      .catch((error) => reject(error))
      .finally(() => clearTimeout(timeout));
  });
}

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
    let mode: "queued" | "inline" | "deferred" = "queued";

    try {
      await withTimeout(enqueueMonitorCheck(monitor.id, "create"), ENQUEUE_TIMEOUT_MS);
    } catch (queueError) {
      console.warn("[api/monitors] queue unavailable on create, trying short inline check", queueError);
      try {
        await withTimeout(
          runMonitorCheck(monitor.id, { requestTimeoutMs: CREATE_INLINE_CHECK_TIMEOUT_MS }),
          CREATE_INLINE_CHECK_TIMEOUT_MS + 1_000,
        );
        mode = "inline";
      } catch (inlineError) {
        console.warn("[api/monitors] inline create check failed; deferred", inlineError);
        mode = "deferred";
      }
    }

    return NextResponse.json(
      {
        message:
          mode === "queued"
            ? "Monitor created and scheduled"
            : mode === "inline"
              ? "Monitor created and checked immediately"
              : "Monitor created. Initial check deferred.",
        monitorId: monitor.id,
        executionMode: mode,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[api/monitors] POST failed", error);
    return NextResponse.json({ error: "Failed to create monitor" }, { status: 500 });
  }
}
