import { Types } from "mongoose";

import { connectToDatabase, hasMongoConfig } from "@/lib/db";
import { ensureDefaultProject } from "@/lib/projects";
import AlertChannel from "@/models/AlertChannel";
import CheckHistory from "@/models/CheckHistory";
import Incident from "@/models/Incident";
import Monitor, { type MonitorRegion, type MonitorStatus } from "@/models/Monitor";
import Project from "@/models/Project";

export type LatencyLogView = {
  checkedAt: string;
  success: boolean;
  responseTimeMs: number | null;
  statusCode: number | null;
  errorMessage: string | null;
};

export type RegionStateView = {
  region: MonitorRegion;
  status: MonitorStatus;
  latencyMs: number | null;
  statusCode: number | null;
  errorMessage: string | null;
  checkedAt: string | null;
};

export type MonitorView = {
  id: string;
  projectId: string | null;
  name: string;
  url: string;
  intervalMinutes: 1 | 5 | 10;
  timeoutMs: number;
  status: MonitorStatus;
  regionStates: RegionStateView[];
  lastCheckedAt: string | null;
  nextCheckAt: string;
  lastResponseTimeMs: number | null;
  lastStatusCode: number | null;
  totalChecks: number;
  totalFailures: number;
  consecutiveFailures: number;
  retryStrikeCount: number;
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
  projectId: string | null;
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

export type ProjectView = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CheckHistoryView = {
  id: string;
  monitorId: string;
  projectId: string | null;
  status: MonitorStatus;
  latency: number | null;
  statusCode: number | null;
  region: MonitorRegion;
  errorMessage: string | null;
  timestamp: string;
};

export type PerformanceMetrics = {
  averageLatencyMs: number;
  p95LatencyMs: number;
  errorRate: number;
  statusCodeDistribution: Record<string, number>;
  responseTrend: { timestamp: string; latency: number | null }[];
  uptimeTrend: { timestamp: string; uptimePercentage: number }[];
};

export type AlertChannelView = {
  id: string;
  projectId: string | null;
  type: "email" | "slack" | "discord" | "telegram";
  name: string;
  enabled: boolean;
  events: {
    onDown: boolean;
    onRecovery: boolean;
    onHighLatency: boolean;
  };
  createdAt: string;
};

type DashboardStats = {
  totalMonitors: number;
  upMonitors: number;
  downMonitors: number;
  pausedMonitors: number;
  openIncidents: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  errorRate: number;
};

type RawLatencyEntry = {
  checkedAt?: Date | string | null;
  success?: boolean;
  responseTimeMs?: number | null;
  statusCode?: number | null;
  errorMessage?: string | null;
};

type RawRegionEntry = {
  region: MonitorRegion;
  status: MonitorStatus;
  latencyMs?: number | null;
  statusCode?: number | null;
  errorMessage?: string | null;
  checkedAt?: Date | string | null;
};

type RawMonitorDoc = {
  _id: Types.ObjectId | string;
  projectId?: Types.ObjectId | string | null;
  name: string;
  url: string;
  intervalMinutes: 1 | 5 | 10;
  timeoutMs: number;
  status: MonitorStatus;
  regionStates?: RawRegionEntry[];
  lastCheckedAt?: Date | string | null;
  nextCheckAt?: Date | string | null;
  lastResponseTimeMs?: number | null;
  lastStatusCode?: number | null;
  totalChecks?: number;
  totalFailures?: number;
  consecutiveFailures?: number;
  retryStrikeCount?: number;
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
  projectId?: Types.ObjectId | string | null;
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

type RawProjectDoc = {
  _id: Types.ObjectId | string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
};

type RawHistoryDoc = {
  _id: Types.ObjectId | string;
  monitorId: Types.ObjectId | string;
  projectId?: Types.ObjectId | string | null;
  status: MonitorStatus;
  latency?: number | null;
  statusCode?: number | null;
  region: MonitorRegion;
  errorMessage?: string | null;
  timestamp?: Date | string | null;
};

type RawAlertChannelDoc = {
  _id: Types.ObjectId | string;
  userId?: string;
  projectId?: Types.ObjectId | string | null;
  type: "email" | "slack" | "discord" | "telegram";
  name: string;
  enabled: boolean;
  events?: {
    onDown?: boolean;
    onRecovery?: boolean;
    onHighLatency?: boolean;
  };
  createdAt?: Date | string | null;
};

function toIso(value: unknown) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function percentile(values: number[], p: number) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
}

function serializeMonitor(doc: RawMonitorDoc): MonitorView {
  return {
    id: String(doc._id),
    projectId: doc.projectId ? String(doc.projectId) : null,
    name: doc.name,
    url: doc.url,
    intervalMinutes: doc.intervalMinutes,
    timeoutMs: doc.timeoutMs,
    status: doc.status,
    regionStates: (doc.regionStates ?? []).map((entry) => ({
      region: entry.region,
      status: entry.status,
      latencyMs: entry.latencyMs ?? null,
      statusCode: entry.statusCode ?? null,
      errorMessage: entry.errorMessage ?? null,
      checkedAt: toIso(entry.checkedAt),
    })),
    lastCheckedAt: toIso(doc.lastCheckedAt),
    nextCheckAt: toIso(doc.nextCheckAt) ?? new Date().toISOString(),
    lastResponseTimeMs: doc.lastResponseTimeMs ?? null,
    lastStatusCode: doc.lastStatusCode ?? null,
    totalChecks: doc.totalChecks ?? 0,
    totalFailures: doc.totalFailures ?? 0,
    consecutiveFailures: doc.consecutiveFailures ?? 0,
    retryStrikeCount: doc.retryStrikeCount ?? 0,
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
  return {
    id: String(doc._id),
    monitorId: String(doc.monitorId),
    projectId: doc.projectId ? String(doc.projectId) : null,
    monitorName: doc.monitorName,
    monitorUrl: doc.monitorUrl,
    status: doc.status.toUpperCase() === "OPEN" ? "open" : "resolved",
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

function serializeProject(doc: RawProjectDoc): ProjectView {
  return {
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    description: doc.description ?? null,
    createdAt: toIso(doc.createdAt) ?? new Date().toISOString(),
    updatedAt: toIso(doc.updatedAt) ?? new Date().toISOString(),
  };
}

function serializeHistory(doc: RawHistoryDoc): CheckHistoryView {
  return {
    id: String(doc._id),
    monitorId: String(doc.monitorId),
    projectId: doc.projectId ? String(doc.projectId) : null,
    status: doc.status,
    latency: doc.latency ?? null,
    statusCode: doc.statusCode ?? null,
    region: doc.region,
    errorMessage: doc.errorMessage ?? null,
    timestamp: toIso(doc.timestamp) ?? new Date().toISOString(),
  };
}

function dedupeProjectsBySlug(projects: RawProjectDoc[]) {
  const bySlug = new Map<string, RawProjectDoc>();
  for (const project of projects) {
    const key = project.slug || String(project._id);
    if (!bySlug.has(key)) {
      bySlug.set(key, project);
    }
  }
  return Array.from(bySlug.values());
}

function serializeAlertChannel(doc: RawAlertChannelDoc): AlertChannelView {
  return {
    id: String(doc._id),
    projectId: doc.projectId ? String(doc.projectId) : null,
    type: doc.type,
    name: doc.name,
    enabled: doc.enabled,
    events: {
      onDown: Boolean(doc.events?.onDown),
      onRecovery: Boolean(doc.events?.onRecovery),
      onHighLatency: Boolean(doc.events?.onHighLatency),
    },
    createdAt: toIso(doc.createdAt) ?? new Date().toISOString(),
  };
}

function buildPerformanceMetrics(history: CheckHistoryView[]): PerformanceMetrics {
  const latencyValues = history
    .map((entry) => entry.latency)
    .filter((value): value is number => value !== null && !Number.isNaN(value));
  const errorCount = history.filter((entry) => entry.status === "down").length;
  const statusCodeDistribution = history.reduce<Record<string, number>>((acc, entry) => {
    const key = entry.statusCode === null ? "N/A" : String(entry.statusCode);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const uptimeBuckets = new Map<string, { total: number; failed: number }>();
  for (const entry of history) {
    const key = entry.timestamp.slice(0, 10);
    const bucket = uptimeBuckets.get(key) ?? { total: 0, failed: 0 };
    bucket.total += 1;
    if (entry.status === "down") {
      bucket.failed += 1;
    }
    uptimeBuckets.set(key, bucket);
  }

  const uptimeTrend = Array.from(uptimeBuckets.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([timestamp, values]) => ({
      timestamp,
      uptimePercentage:
        values.total === 0 ? 100 : Number((((values.total - values.failed) / values.total) * 100).toFixed(2)),
    }));

  return {
    averageLatencyMs:
      latencyValues.length === 0
        ? 0
        : Math.round(latencyValues.reduce((acc, value) => acc + value, 0) / latencyValues.length),
    p95LatencyMs: Math.round(percentile(latencyValues, 95)),
    errorRate:
      history.length === 0
        ? 0
        : Number(((errorCount / history.length) * 100).toFixed(2)),
    statusCodeDistribution,
    responseTrend: history.slice(-300).map((entry) => ({
      timestamp: entry.timestamp,
      latency: entry.latency,
    })),
    uptimeTrend,
  };
}

function buildDashboardStats(
  monitors: MonitorView[],
  incidents: IncidentView[],
  metrics: PerformanceMetrics,
): DashboardStats {
  return {
    totalMonitors: monitors.length,
    upMonitors: monitors.filter((monitor) => monitor.status === "up").length,
    downMonitors: monitors.filter((monitor) => monitor.status === "down").length,
    pausedMonitors: monitors.filter((monitor) => monitor.status === "paused").length,
    openIncidents: incidents.filter((incident) => incident.status === "open").length,
    avgLatencyMs: metrics.averageLatencyMs,
    p95LatencyMs: metrics.p95LatencyMs,
    errorRate: metrics.errorRate,
  };
}

function fallbackDashboardData() {
  const metrics = buildPerformanceMetrics([]);
  return {
    projects: [] as ProjectView[],
    activeProjectId: null as string | null,
    monitors: [] as MonitorView[],
    incidents: [] as IncidentView[],
    history: [] as CheckHistoryView[],
    metrics,
    stats: buildDashboardStats([], [], metrics),
  };
}

function buildProjectFilter(
  userId: string,
  projectId?: string | null,
  allowedProjectIds?: string[],
) {
  const query: Record<string, unknown> = { userId };
  if (!projectId || !Types.ObjectId.isValid(projectId)) {
    return query;
  }
  if (allowedProjectIds && !allowedProjectIds.includes(projectId)) {
    return query;
  }

  query.projectId = projectId;
  return query;
}

export async function getDashboardData(userId?: string | null, projectId?: string | null) {
  if (!hasMongoConfig()) {
    return fallbackDashboardData();
  }

  try {
    await connectToDatabase();
    if (userId) {
      await ensureDefaultProject(userId);
    }

    const projectDocs = await Project.find(userId ? { userId } : {})
      .sort({ createdAt: 1 })
      .lean<RawProjectDoc[]>();
    const uniqueProjectDocs = dedupeProjectsBySlug(projectDocs);
    const projectIds = uniqueProjectDocs.map((project) => String(project._id));
    const monitorFilter = userId
      ? buildProjectFilter(userId, projectId, projectIds)
      : (() => {
          const query: Record<string, unknown> = {};
          if (projectId && Types.ObjectId.isValid(projectId)) {
            query.projectId = projectId;
          }
          return query;
        })();

    const monitorDocs = await Monitor.find(monitorFilter)
      .sort({ createdAt: -1 })
      .lean<RawMonitorDoc[]>();
    const monitorIds = monitorDocs.map((monitor) => monitor._id);
    const scopedIncidentFilter =
      monitorIds.length > 0
        ? ({ monitorId: { $in: monitorIds } } as Record<string, unknown>)
        : ({ _id: { $in: [] } } as Record<string, unknown>);

    const [incidentDocs, historyDocs] = await Promise.all([
      Incident.find(scopedIncidentFilter).sort({ startedAt: -1 }).limit(30).lean<RawIncidentDoc[]>(),
      CheckHistory.find(scopedIncidentFilter).sort({ timestamp: -1 }).limit(2500).lean<RawHistoryDoc[]>(),
    ]);

    const projects = uniqueProjectDocs.map(serializeProject);
    const monitors = monitorDocs.map(serializeMonitor);
    const incidents = incidentDocs.map(serializeIncident);
    const history = historyDocs.map(serializeHistory).reverse();
    const metrics = buildPerformanceMetrics(history);

    const activeProjectId =
      typeof (monitorFilter as { projectId?: unknown }).projectId === "string"
        ? String((monitorFilter as { projectId: string }).projectId)
        : projects[0]?.id ?? null;

    return {
      projects,
      activeProjectId,
      monitors,
      incidents,
      history,
      metrics,
      stats: buildDashboardStats(monitors, incidents, metrics),
    };
  } catch (error) {
    console.error("[queries] getDashboardData failed", error);
    return fallbackDashboardData();
  }
}

export async function getIncidents(
  limit = 100,
  userId?: string | null,
  projectId?: string | null,
) {
  if (!hasMongoConfig()) {
    return [] as IncidentView[];
  }

  try {
    await connectToDatabase();
    let query: Record<string, unknown> = {};
    if (userId) {
      const monitorFilter = buildProjectFilter(userId, projectId);
      const monitorDocs = await Monitor.find(monitorFilter).select("_id").lean<{ _id: Types.ObjectId }[]>();
      const monitorIds = monitorDocs.map((monitor) => monitor._id);
      if (monitorIds.length === 0) {
        return [] as IncidentView[];
      }
      query = { monitorId: { $in: monitorIds } };
    } else if (projectId && Types.ObjectId.isValid(projectId)) {
      query = { projectId };
    }

    const incidentDocs = await Incident.find(query).sort({ startedAt: -1 }).limit(limit).lean<RawIncidentDoc[]>();
    return incidentDocs.map(serializeIncident);
  } catch (error) {
    console.error("[queries] getIncidents failed", error);
    return [] as IncidentView[];
  }
}

export async function getStatusMonitors(projectId?: string | null) {
  if (!hasMongoConfig()) {
    return [] as MonitorView[];
  }

  try {
    await connectToDatabase();
    const query: Record<string, unknown> = {};
    if (projectId && Types.ObjectId.isValid(projectId)) {
      query.projectId = projectId;
    }
    const monitorDocs = await Monitor.find(query).sort({ name: 1 }).lean<RawMonitorDoc[]>();
    return monitorDocs.map(serializeMonitor);
  } catch (error) {
    console.error("[queries] getStatusMonitors failed", error);
    return [] as MonitorView[];
  }
}

export async function getProjects(userId?: string | null) {
  if (!hasMongoConfig()) {
    return [] as ProjectView[];
  }

  try {
    await connectToDatabase();
    if (userId) {
      await ensureDefaultProject(userId);
    }
    const projectDocs = await Project.find(userId ? { userId } : {})
      .sort({ createdAt: 1 })
      .lean<RawProjectDoc[]>();
    return dedupeProjectsBySlug(projectDocs).map(serializeProject);
  } catch (error) {
    console.error("[queries] getProjects failed", error);
    return [] as ProjectView[];
  }
}

export async function getMonitorById(monitorId: string, userId?: string | null) {
  if (!Types.ObjectId.isValid(monitorId) || !hasMongoConfig()) {
    return null;
  }

  try {
    await connectToDatabase();
    const query: Record<string, unknown> = { _id: monitorId };
    if (userId) {
      query.userId = userId;
    }
    const monitorDoc = await Monitor.findOne(query).lean<RawMonitorDoc | null>();
    return monitorDoc ? serializeMonitor(monitorDoc) : null;
  } catch (error) {
    console.error("[queries] getMonitorById failed", error);
    return null;
  }
}

export async function getIncidentsByMonitorId(
  monitorId: string,
  limit = 20,
  userId?: string | null,
) {
  if (!Types.ObjectId.isValid(monitorId) || !hasMongoConfig()) {
    return [] as IncidentView[];
  }

  try {
    await connectToDatabase();
    if (userId) {
      const monitor = await Monitor.findOne({ _id: monitorId, userId }).select("_id").lean();
      if (!monitor) {
        return [] as IncidentView[];
      }
    }
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

export async function getCheckHistoryByMonitorId(
  monitorId: string,
  range: "24h" | "7d" | "30d" = "24h",
  userId?: string | null,
) {
  if (!Types.ObjectId.isValid(monitorId) || !hasMongoConfig()) {
    return [] as CheckHistoryView[];
  }

  const lookbackHours = range === "24h" ? 24 : range === "7d" ? 24 * 7 : 24 * 30;
  const since = new Date(Date.now() - lookbackHours * 60 * 60 * 1000);

  try {
    await connectToDatabase();
    if (userId) {
      const monitor = await Monitor.findOne({ _id: monitorId, userId }).select("_id").lean();
      if (!monitor) {
        return [] as CheckHistoryView[];
      }
    }
    const historyDocs = await CheckHistory.find({
      monitorId,
      timestamp: { $gte: since },
    })
      .sort({ timestamp: 1 })
      .lean<RawHistoryDoc[]>();

    return historyDocs.map(serializeHistory);
  } catch (error) {
    console.error("[queries] getCheckHistoryByMonitorId failed", error);
    return [] as CheckHistoryView[];
  }
}

export async function getAlertChannels(userId: string, projectId?: string | null) {
  if (!hasMongoConfig()) {
    return [] as AlertChannelView[];
  }

  try {
    await connectToDatabase();
    const query = buildProjectFilter(userId, projectId);
    const docs = await AlertChannel.find(query)
      .sort({ createdAt: -1 })
      .lean<RawAlertChannelDoc[]>();
    return docs.map(serializeAlertChannel);
  } catch (error) {
    console.error("[queries] getAlertChannels failed", error);
    return [] as AlertChannelView[];
  }
}
