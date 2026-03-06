"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";

import { createAlertChannel } from "@/lib/alertChannels";
import { connectToDatabase, hasMongoConfig } from "@/lib/db";
import { createMonitorRecord, resolveIncidentByOperator, toggleMonitorPause } from "@/lib/monitorMutations";
import { createProject } from "@/lib/projects";
import { runMonitorCheck } from "@/lib/monitoring";
import { enqueueMonitorCheck } from "@/lib/queue";
import { getSessionUserId } from "@/lib/serverSession";
import {
  createAlertChannelSchema,
  createMonitorSchema,
  createProjectSchema,
} from "@/lib/validators";
import Monitor from "@/models/Monitor";

type MonitorActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const ENQUEUE_TIMEOUT_MS = Number(process.env.MONITOR_ENQUEUE_TIMEOUT_MS ?? "4500");
const CREATE_INLINE_CHECK_TIMEOUT_MS = Number(process.env.MONITOR_CREATE_INLINE_TIMEOUT_MS ?? "2500");

function isDuplicateKeyError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

function isMongoNetworkError(error: unknown) {
  const text =
    error instanceof Error
      ? `${error.name} ${error.message}`
      : typeof error === "string"
        ? error
        : "";

  const normalized = text.toLowerCase();
  return (
    normalized.includes("mongodbur") ||
    normalized.includes("mongoose server selection error") ||
    normalized.includes("serverselectionerror") ||
    normalized.includes("replicasetnoprimary") ||
    normalized.includes("whitelist") ||
    normalized.includes("network access")
  );
}

function revalidateMonitoringPages() {
  revalidatePath("/dashboard");
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
  const userId = getSessionUserId();
  if (!userId) {
    return {
      status: "error",
      message: "Please login again to continue.",
    };
  }

  const parsed = createMonitorSchema.safeParse({
    projectId: formData.get("projectId"),
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
    const monitor = await createMonitorRecord({ ...parsed.data, userId });
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

export async function createProjectAction(
  _prevState: MonitorActionState,
  formData: FormData,
): Promise<MonitorActionState> {
  if (!hasMongoConfig()) {
    return {
      status: "error" as const,
      message: "Database is not configured. Set MONGODB_URI in .env.local.",
    };
  }

  const userId = getSessionUserId();
  if (!userId) {
    return {
      status: "error" as const,
      message: "Please login again to continue.",
    };
  }

  const parsed = createProjectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return {
      status: "error" as const,
      message: parsed.error.issues[0]?.message ?? "Invalid project input",
    };
  }

  try {
    await createProject(parsed.data, userId);
    revalidateMonitoringPages();
    return {
      status: "success" as const,
      message: "Project created.",
    };
  } catch (error) {
    console.error("[action] createProjectAction failed", error);
    if (isMongoNetworkError(error)) {
      return {
        status: "error" as const,
        message:
          "Database connection failed. In MongoDB Atlas, allow your current IP in Network Access.",
      };
    }

    if (isDuplicateKeyError(error)) {
      return {
        status: "error" as const,
        message: "Project name already exists. Try a different name.",
      };
    }

    return {
      status: "error" as const,
      message: "Failed to create project. Please try again.",
    };
  }
}

export async function createAlertChannelAction(
  _prevState: MonitorActionState,
  formData: FormData,
): Promise<MonitorActionState> {
  const userId = getSessionUserId();
  if (!userId) {
    return {
      status: "error" as const,
      message: "Please login again to continue.",
    };
  }

  const parsed = createAlertChannelSchema.safeParse({
    projectId: formData.get("projectId"),
    type: formData.get("type"),
    name: formData.get("name"),
    target: formData.get("target"),
    secondaryTarget: formData.get("secondaryTarget"),
    onDown: formData.get("onDown"),
    onRecovery: formData.get("onRecovery"),
    onHighLatency: formData.get("onHighLatency"),
  });

  if (!parsed.success) {
    return {
      status: "error" as const,
      message: parsed.error.issues[0]?.message ?? "Invalid alert channel",
    };
  }

  try {
    await createAlertChannel({ ...parsed.data, userId });
    revalidateMonitoringPages();
    return {
      status: "success" as const,
      message: "Alert channel added.",
    };
  } catch (error) {
    console.error("[action] createAlertChannelAction failed", error);
    return {
      status: "error" as const,
      message: "Failed to create alert channel",
    };
  }
}

export async function toggleMonitorStatusAction(monitorId: string) {
  const userId = getSessionUserId();
  if (!userId) return;

  try {
    const monitor = await toggleMonitorPause(monitorId, userId);
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
  const userId = getSessionUserId();
  if (!userId) return;

  try {
    await connectToDatabase();
    const monitor = await Monitor.findOne({ _id: monitorId, userId })
      .select("_id status")
      .lean();
    if (!monitor) return;
    if (monitor.status === "paused") return;

    await enqueueCheckWithInlineFallback(monitorId, "manual");
    revalidateMonitoringPages();
  } catch (error) {
    console.error("[action] runMonitorNowAction failed", error);
  }
}

export async function resolveIncidentAction(incidentId: string) {
  const userId = getSessionUserId();
  if (!userId) return;

  try {
    await resolveIncidentByOperator(incidentId, userId);
    revalidateMonitoringPages();
  } catch (error) {
    console.error("[action] resolveIncidentAction failed", error);
  }
}
