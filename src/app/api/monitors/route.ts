import { NextRequest, NextResponse } from "next/server";

import { requireUserId, ensurePayloadUserMatch } from "@/lib/apiAuth";
import { connectToDatabase, hasMongoConfig } from "@/lib/db";
import { createMonitorRecord } from "@/lib/monitorMutations";
import { runMonitorCheck } from "@/lib/monitoring";
import { enqueueMonitorCheck } from "@/lib/queue";
import { createMonitorSchema } from "@/lib/validators";
import Monitor from "@/models/Monitor";
import Project from "@/models/Project";

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

export async function GET(request: NextRequest) {
  try {
    if (!hasMongoConfig()) {
      return NextResponse.json({ monitors: [] }, { status: 200 });
    }

    const auth = requireUserId(request);
    if (auth.error) {
      return auth.error;
    }

    await connectToDatabase();

    const { searchParams } = request.nextUrl;
    const projectId = searchParams.get("projectId");
    const query: Record<string, unknown> = { userId: auth.userId };
    if (projectId) {
      query.projectId = projectId;
    }

    const monitors = await Monitor.find(query).sort({ name: 1 }).lean();
    return NextResponse.json({ monitors });
  } catch (error) {
    console.error("[api/monitors] GET failed", error);
    return NextResponse.json({ error: "Failed to fetch monitors" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireUserId(request);
    if (auth.error) {
      return auth.error;
    }

    if (!hasMongoConfig()) {
      return NextResponse.json(
        { error: "Database is not configured. Set MONGODB_URI." },
        { status: 503 },
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const payloadMismatch = ensurePayloadUserMatch(body?.userId, auth.userId as string);
    if (payloadMismatch) {
      return payloadMismatch;
    }

    const parsed = createMonitorSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid payload",
        },
        { status: 400 },
      );
    }

    if (parsed.data.projectId) {
      const project = await Project.findOne({
        _id: parsed.data.projectId,
        userId: auth.userId,
      })
        .select("_id")
        .lean();

      if (!project) {
        return NextResponse.json({ error: "Unauthorized project access" }, { status: 403 });
      }
    }

    const monitor = await createMonitorRecord({
      ...parsed.data,
      userId: auth.userId as string,
    });
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
