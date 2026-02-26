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

function revalidateMonitoringPages() {
  revalidatePath("/");
  revalidatePath("/status");
  revalidatePath("/incidents");
}

async function enqueueCheckWithInlineFallback(
  monitorId: string,
  reason: "create" | "manual" | "scheduler",
) {
  try {
    await enqueueMonitorCheck(monitorId, reason);
    return "queued" as const;
  } catch (error) {
    if (reason === "manual" || reason === "create") {
      console.warn("[action] queue unavailable, running inline check", error);
      await runMonitorCheck(monitorId);
      return "inline" as const;
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
          : "Monitor created and checked immediately (queue unavailable).",
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
