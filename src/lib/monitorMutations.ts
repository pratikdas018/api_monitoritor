import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/db";
import Incident from "@/models/Incident";
import Monitor, { type IntervalMinutes } from "@/models/Monitor";

type CreateMonitorInput = {
  name?: string;
  url: string;
  intervalMinutes: IntervalMinutes;
  timeoutMs?: number;
};

function getMonitorName(name: string | undefined, url: string) {
  if (name && name.trim().length > 0) {
    return name.trim();
  }

  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export async function createMonitorRecord(input: CreateMonitorInput) {
  await connectToDatabase();

  const monitor = await Monitor.create({
    name: getMonitorName(input.name, input.url),
    url: input.url,
    intervalMinutes: input.intervalMinutes,
    timeoutMs: input.timeoutMs ?? Number(process.env.DEFAULT_MONITOR_TIMEOUT_MS ?? 10_000),
    status: "unknown",
    nextCheckAt: new Date(),
  });

  return monitor;
}

export async function toggleMonitorPause(monitorId: string) {
  if (!Types.ObjectId.isValid(monitorId)) {
    return null;
  }

  await connectToDatabase();
  const monitor = await Monitor.findById(monitorId);
  if (!monitor) return null;

  const isPaused = monitor.status === "paused";
  monitor.status = isPaused ? "unknown" : "paused";
  monitor.nextCheckAt = new Date();
  await monitor.save();
  return monitor;
}

export async function resolveIncidentByOperator(incidentId: string) {
  if (!Types.ObjectId.isValid(incidentId)) {
    return null;
  }

  await connectToDatabase();
  const incident = await Incident.findById(incidentId);
  if (!incident || incident.status === "RESOLVED") {
    return null;
  }

  incident.status = "RESOLVED";
  incident.resolvedAt = new Date();
  incident.message = "Incident manually resolved by an operator.";
  incident.events.push({
    type: "recovered",
    message: "Incident manually resolved by an operator.",
    statusCode: null,
    responseTimeMs: null,
    timestamp: new Date(),
  });

  await incident.save();
  return incident;
}
