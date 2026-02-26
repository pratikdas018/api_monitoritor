import { Types } from "mongoose";

import { connectToDatabase, hasMongoConfig } from "@/lib/db";
import Incident from "@/models/Incident";
import Monitor, { type MonitorStatus } from "@/models/Monitor";

export type LatencyLogView = {
  checkedAt: string;
  success: boolean;
  responseTimeMs: number | null;
  statusCode: number | null;
  errorMessage: string | null;
};

export type MonitorView = {
  id: string;
  name: string;
  url: string;
  intervalMinutes: 1 | 5 | 10;
  timeoutMs: number;
  status: MonitorStatus;
  lastCheckedAt: string | null;
  nextCheckAt: string;
  lastResponseTimeMs: number | null;
  lastStatusCode: number | null;
  totalChecks: number;
  totalFailures: number;
  consecutiveFailures: number;
  uptimePercentage: number;
  latencyLogs: LatencyLogView[];
  createdAt: string;
  updatedAt: string;
};

export type IncidentEventView = {
  type: "down" | "retry" | "recovered";
  message: string;
  statusCode: number | null;
  responseTimeMs: number | null;
  timestamp: string;
};

export type IncidentView = {
  id: string;
  monitorId: string;
  monitorName: string;
  monitorUrl: string;
  status: "open" | "resolved";
  startedAt: string;
  resolvedAt: string | null;
  lastFailureAt: string;
  failureCount: number;
  lastError: string | null;
  events: IncidentEventView[];
  createdAt: string;
  updatedAt: string;
};

type DashboardStats = {
  totalMonitors: number;
  upMonitors: number;
  downMonitors: number;
  pausedMonitors: number;
  openIncidents: number;
  avgLatencyMs: number;
};

type RawLatencyEntry = {
  checkedAt?: Date | string | null;
  success?: boolean;
  responseTimeMs?: number | null;
  statusCode?: number | null;
  errorMessage?: string | null;
};

type RawMonitorDoc = {
  _id: Types.ObjectId | string;
  name: string;
  url: string;
  intervalMinutes: 1 | 5 | 10;
  timeoutMs: number;
  status: MonitorStatus;
  lastCheckedAt?: Date | string | null;
  nextCheckAt?: Date | string | null;
  lastResponseTimeMs?: number | null;
  lastStatusCode?: number | null;
  totalChecks?: number;
  totalFailures?: number;
  consecutiveFailures?: number;
  uptimePercentage?: number;
  latencyLogs?: RawLatencyEntry[];
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
};

type RawIncidentEvent = {
  type: "down" | "retry" | "recovered";
  message: string;
  statusCode?: number | null;
  responseTimeMs?: number | null;
  timestamp?: Date | string | null;
};

type RawIncidentDoc = {
  _id: Types.ObjectId | string;
  monitorId: Types.ObjectId | string;
  monitorName: string;
  monitorUrl: string;
  status: "OPEN" | "RESOLVED" | "open" | "resolved";
  startedAt?: Date | string | null;
  resolvedAt?: Date | string | null;
  lastFailureAt?: Date | string | null;
  failureCount?: number;
  lastError?: string | null;
  events?: RawIncidentEvent[];
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
};

function toIso(value: unknown) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function serializeMonitor(doc: RawMonitorDoc): MonitorView {
  return {
    id: String(doc._id),
    name: doc.name,
    url: doc.url,
    intervalMinutes: doc.intervalMinutes,
    timeoutMs: doc.timeoutMs,
    status: doc.status,
    lastCheckedAt: toIso(doc.lastCheckedAt),
    nextCheckAt: toIso(doc.nextCheckAt) ?? new Date().toISOString(),
    lastResponseTimeMs: doc.lastResponseTimeMs ?? null,
    lastStatusCode: doc.lastStatusCode ?? null,
    totalChecks: doc.totalChecks ?? 0,
    totalFailures: doc.totalFailures ?? 0,
    consecutiveFailures: doc.consecutiveFailures ?? 0,
    uptimePercentage: doc.uptimePercentage ?? 0,
    latencyLogs: (doc.latencyLogs ?? []).map((entry) => ({
      checkedAt: toIso(entry.checkedAt) ?? new Date().toISOString(),
      success: Boolean(entry.success),
      responseTimeMs: entry.responseTimeMs ?? null,
      statusCode: entry.statusCode ?? null,
      errorMessage: entry.errorMessage ?? null,
    })),
    createdAt: toIso(doc.createdAt) ?? new Date().toISOString(),
    updatedAt: toIso(doc.updatedAt) ?? new Date().toISOString(),
  };
}

function serializeIncident(doc: RawIncidentDoc): IncidentView {
  const normalizedStatus = doc.status.toUpperCase() === "OPEN" ? "open" : "resolved";

  return {
    id: String(doc._id),
    monitorId: String(doc.monitorId),
    monitorName: doc.monitorName,
    monitorUrl: doc.monitorUrl,
    status: normalizedStatus,
    startedAt: toIso(doc.startedAt) ?? new Date().toISOString(),
    resolvedAt: toIso(doc.resolvedAt),
    lastFailureAt: toIso(doc.lastFailureAt) ?? new Date().toISOString(),
    failureCount: doc.failureCount ?? 0,
    lastError: doc.lastError ?? null,
    events: (doc.events ?? []).map((event) => ({
      type: event.type,
      message: event.message,
      statusCode: event.statusCode ?? null,
      responseTimeMs: event.responseTimeMs ?? null,
      timestamp: toIso(event.timestamp) ?? new Date().toISOString(),
    })),
    createdAt: toIso(doc.createdAt) ?? new Date().toISOString(),
    updatedAt: toIso(doc.updatedAt) ?? new Date().toISOString(),
  };
}

function buildDashboardStats(monitors: MonitorView[], incidents: IncidentView[]): DashboardStats {
  const latencyValues = monitors
    .map((monitor) => monitor.lastResponseTimeMs)
    .filter((value): value is number => value !== null && !Number.isNaN(value));

  const avgLatencyMs =
    latencyValues.length === 0
      ? 0
      : Math.round(latencyValues.reduce((acc, value) => acc + value, 0) / latencyValues.length);

  return {
    totalMonitors: monitors.length,
    upMonitors: monitors.filter((monitor) => monitor.status === "up").length,
    downMonitors: monitors.filter((monitor) => monitor.status === "down").length,
    pausedMonitors: monitors.filter((monitor) => monitor.status === "paused").length,
    openIncidents: incidents.filter((incident) => incident.status === "open").length,
    avgLatencyMs,
  };
}

function fallbackDashboardData() {
  return {
    monitors: [] as MonitorView[],
    incidents: [] as IncidentView[],
    stats: buildDashboardStats([], []),
  };
}

export async function getDashboardData() {
  if (!hasMongoConfig()) {
    return fallbackDashboardData();
  }

  try {
    await connectToDatabase();

    const [monitorDocs, incidentDocs] = await Promise.all([
      Monitor.find().sort({ createdAt: -1 }).lean<RawMonitorDoc[]>(),
      Incident.find().sort({ startedAt: -1 }).limit(20).lean<RawIncidentDoc[]>(),
    ]);

    const monitors = monitorDocs.map(serializeMonitor);
    const incidents = incidentDocs.map(serializeIncident);

    return {
      monitors,
      incidents,
      stats: buildDashboardStats(monitors, incidents),
    };
  } catch (error) {
    console.error("[queries] getDashboardData failed", error);
    return fallbackDashboardData();
  }
}

export async function getIncidents(limit = 100) {
  if (!hasMongoConfig()) {
    return [] as IncidentView[];
  }

  try {
    await connectToDatabase();
    const incidentDocs = await Incident.find()
      .sort({ startedAt: -1 })
      .limit(limit)
      .lean<RawIncidentDoc[]>();
    return incidentDocs.map(serializeIncident);
  } catch (error) {
    console.error("[queries] getIncidents failed", error);
    return [] as IncidentView[];
  }
}

export async function getStatusMonitors() {
  if (!hasMongoConfig()) {
    return [] as MonitorView[];
  }

  try {
    await connectToDatabase();
    const monitorDocs = await Monitor.find().sort({ name: 1 }).lean<RawMonitorDoc[]>();
    return monitorDocs.map(serializeMonitor);
  } catch (error) {
    console.error("[queries] getStatusMonitors failed", error);
    return [] as MonitorView[];
  }
}

export async function getMonitorById(monitorId: string) {
  if (!Types.ObjectId.isValid(monitorId)) {
    return null;
  }

  if (!hasMongoConfig()) {
    return null;
  }

  try {
    await connectToDatabase();
    const monitorDoc = await Monitor.findById(monitorId).lean<RawMonitorDoc | null>();
    if (!monitorDoc) {
      return null;
    }

    return serializeMonitor(monitorDoc);
  } catch (error) {
    console.error("[queries] getMonitorById failed", error);
    return null;
  }
}

export async function getIncidentsByMonitorId(monitorId: string, limit = 20) {
  if (!Types.ObjectId.isValid(monitorId)) {
    return [];
  }

  if (!hasMongoConfig()) {
    return [] as IncidentView[];
  }

  try {
    await connectToDatabase();
    const incidentDocs = await Incident.find({ monitorId })
      .sort({ startedAt: -1 })
      .limit(limit)
      .lean<RawIncidentDoc[]>();
    return incidentDocs.map(serializeIncident);
  } catch (error) {
    console.error("[queries] getIncidentsByMonitorId failed", error);
    return [] as IncidentView[];
  }
}
