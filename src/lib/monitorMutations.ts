import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/db";
import { ensureDefaultProject } from "@/lib/projects";
import Incident from "@/models/Incident";
import Monitor, { type IntervalMinutes } from "@/models/Monitor";
import Project from "@/models/Project";

type CreateMonitorInput = {
  userId?: string;
  name?: string;
  url: string;
  intervalMinutes: IntervalMinutes;
  timeoutMs?: number;
  projectId?: string;
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
  const userId = input.userId?.trim() || "legacy";
  const defaultProject = await ensureDefaultProject(userId);
  let projectId = defaultProject._id;
  if (input.projectId && Types.ObjectId.isValid(input.projectId)) {
    const ownedProject = await Project.findOne({ _id: input.projectId, userId }).select("_id").lean();
    if (ownedProject?._id) {
      projectId = new Types.ObjectId(String(ownedProject._id));
    }
  }

  const monitor = await Monitor.create({
    userId,
    projectId,
    name: getMonitorName(input.name, input.url),
    url: input.url,
    intervalMinutes: input.intervalMinutes,
    timeoutMs: input.timeoutMs ?? Number(process.env.DEFAULT_MONITOR_TIMEOUT_MS ?? 10_000),
    status: "unknown",
    nextCheckAt: new Date(),
  });

  return monitor;
}

export async function toggleMonitorPause(monitorId: string, userId: string) {
  if (!Types.ObjectId.isValid(monitorId)) {
    return null;
  }

  await connectToDatabase();
  const monitor = await Monitor.findOne({ _id: monitorId, userId });
  if (!monitor) return null;

  const isPaused = monitor.status === "paused";
  monitor.status = isPaused ? "unknown" : "paused";
  monitor.nextCheckAt = new Date();
  await monitor.save();
  return monitor;
}

export async function resolveIncidentByOperator(incidentId: string, userId: string) {
  if (!Types.ObjectId.isValid(incidentId)) {
    return null;
  }

  await connectToDatabase();
  const incident = await Incident.findById(incidentId);
  if (!incident || incident.status === "RESOLVED") {
    return null;
  }
  const monitor = await Monitor.findOne({ _id: incident.monitorId, userId }).select("_id").lean();
  if (!monitor) {
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
