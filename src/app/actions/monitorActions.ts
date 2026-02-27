"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";

import { createMonitorRecord, resolveIncidentByOperator, toggleMonitorPause } from "@/lib/monitorMutations";
import { runMonitorCheck } from "@/lib/monitoring";
import { enqueueMonitorCheck } from "@/lib/queue";
import { createMonitorSchema } from "@/lib/validators";

type MonitorActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const ENQUEUE_TIMEOUT_MS = Number(process.env.MONITOR_ENQUEUE_TIMEOUT_MS ?? "4500");
const CREATE_INLINE_CHECK_TIMEOUT_MS = Number(process.env.MONITOR_CREATE_INLINE_TIMEOUT_MS ?? "2500");

function revalidateMonitoringPages() {
  revalidatePath("/");
  revalidatePath("/status");
  revalidatePath("/incidents");
}

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

async function enqueueCheckWithInlineFallback(
  monitorId: string,
  reason: "create" | "manual" | "scheduler",
) {
  try {
    await withTimeout(enqueueMonitorCheck(monitorId, reason), ENQUEUE_TIMEOUT_MS);
    return "queued" as const;
  } catch (error) {
    if (reason === "manual") {
      console.warn("[action] queue unavailable, running inline check", error);
      await runMonitorCheck(monitorId);
      return "inline" as const;
    }

    if (reason === "create") {
      // Keep create fast, but avoid persistent UNKNOWN status when queue is flaky.
      console.warn("[action] queue unavailable for create flow, running short inline check", error);
      try {
        await withTimeout(
          runMonitorCheck(monitorId, { requestTimeoutMs: CREATE_INLINE_CHECK_TIMEOUT_MS }),
          CREATE_INLINE_CHECK_TIMEOUT_MS + 1_000,
        );
        return "inline" as const;
      } catch (inlineError) {
        console.warn("[action] inline create check failed, deferring to scheduler", inlineError);
        return "deferred" as const;
      }
    }

    throw error;
  }
}

export async function createMonitorAction(
  _prevState: MonitorActionState,
  formData: FormData,
): Promise<MonitorActionState> {
  const parsed = createMonitorSchema.safeParse({
    name: formData.get("name"),
    url: formData.get("url"),
    intervalMinutes: formData.get("intervalMinutes"),
    timeoutMs: formData.get("timeoutMs"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid monitor input",
    };
  }

  let monitorId: string;

  try {
    const monitor = await createMonitorRecord(parsed.data);
    monitorId = monitor.id;
  } catch (error) {
    console.error("[action] createMonitorAction failed", error);
    return {
      status: "error",
      message: "Failed to create monitor",
    };
  }

  try {
    const executionMode = await enqueueCheckWithInlineFallback(monitorId, "create");
    revalidateMonitoringPages();

    return {
      status: "success",
      message:
        executionMode === "queued"
          ? "Monitor created and scheduled."
          : executionMode === "inline"
            ? "Monitor created and checked immediately."
          : executionMode === "deferred"
            ? "Monitor created. Initial check deferred (queue unavailable)."
            : "Monitor created.",
    };
  } catch (error) {
    console.error("[action] monitor created but initial check failed", error);
    revalidateMonitoringPages();
    return {
      status: "success",
      message: "Monitor created. Initial check failed; scheduler will retry.",
    };
  }
}

export async function toggleMonitorStatusAction(monitorId: string) {
  try {
    const monitor = await toggleMonitorPause(monitorId);
    if (!monitor) return;

    if (monitor.status !== "paused") {
      await enqueueCheckWithInlineFallback(monitor.id, "manual");
    }

    revalidateMonitoringPages();
  } catch (error) {
    console.error("[action] toggleMonitorStatusAction failed", error);
  }
}

export async function runMonitorNowAction(monitorId: string) {
  if (!Types.ObjectId.isValid(monitorId)) {
    return;
  }

  try {
    await enqueueCheckWithInlineFallback(monitorId, "manual");
    revalidateMonitoringPages();
  } catch (error) {
    console.error("[action] runMonitorNowAction failed", error);
  }
}

export async function resolveIncidentAction(incidentId: string) {
  try {
    await resolveIncidentByOperator(incidentId);
    revalidateMonitoringPages();
  } catch (error) {
    console.error("[action] resolveIncidentAction failed", error);
  }
}
