import axios from "axios";
import { Types } from "mongoose";

import { dispatchAlert } from "@/lib/alerts";
import { connectToDatabase } from "@/lib/db";
import { getRegionLatencyJitterMs, getMonitoringRegions } from "@/lib/regions";
import { enqueueMonitorCheck } from "@/lib/queue";
import CheckHistory from "@/models/CheckHistory";
import Incident from "@/models/Incident";
import Monitor, {
  type IntervalMinutes,
  type MonitorRegion,
  type MonitorStatus,
  type RegionCheckState,
} from "@/models/Monitor";
import MonitorLog from "@/models/MonitorLog";

const MAX_LATENCY_SAMPLES = 300;
const FAILURE_RETRY_DELAYS_MS = [10_000, 30_000] as const;
const HIGH_LATENCY_THRESHOLD_MS = Number(process.env.MONITOR_HIGH_LATENCY_MS ?? "2000");

function getDefaultMonitorName(url: string) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
  } catch {
    return url;
  }
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED") {
      return "Request timed out";
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}

type CheckResult = {
  success: boolean;
  responseTimeMs: number | null;
  statusCode: number | null;
  errorMessage: string | null;
};

async function checkEndpoint(
  url: string,
  timeoutMs: number,
  region: MonitorRegion,
): Promise<CheckResult> {
  const startedAt = Date.now();
  const jitterMs = getRegionLatencyJitterMs(region);

  try {
    const response = await axios.get(url, {
      timeout: timeoutMs,
      validateStatus: () => true,
      headers: {
        // Some sites (e.g. Cloudflare-protected pages) block generic HTTP clients.
        // A browser-like UA reduces false "DOWN" reports for publicly reachable pages.
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9",
      },
    });

    const responseTimeMs = Date.now() - startedAt + jitterMs;
    const success = response.status >= 200 && response.status < 400;

    return {
      success,
      responseTimeMs,
      statusCode: response.status,
      errorMessage: success ? null : `Received status code ${response.status}`,
    };
  } catch (error) {
    return {
      success: false,
      responseTimeMs: Date.now() - startedAt + jitterMs,
      statusCode: null,
      errorMessage: getErrorMessage(error),
    };
  }
}

function calculateNextCheckAt(intervalMinutes: IntervalMinutes) {
  return new Date(Date.now() + intervalMinutes * 60_000);
}

function calculateUptimePercentage(totalChecks: number, totalFailures: number) {
  if (totalChecks <= 0) {
    return 100;
  }

  return Number((((totalChecks - totalFailures) / totalChecks) * 100).toFixed(2));
}

function mergeRegionState(
  states: RegionCheckState[],
  input: {
    region: MonitorRegion;
    status: MonitorStatus;
    latencyMs: number | null;
    statusCode: number | null;
    errorMessage: string | null;
    checkedAt: Date;
  },
) {
  const next = states.filter((entry) => entry.region !== input.region);
  next.push({
    region: input.region,
    status: input.status,
    latencyMs: input.latencyMs,
    statusCode: input.statusCode,
    errorMessage: input.errorMessage,
    checkedAt: input.checkedAt,
  });

  return next.sort((a, b) => a.region.localeCompare(b.region));
}

function aggregateMonitorStatus(states: RegionCheckState[]): MonitorStatus {
  if (states.length === 0) return "unknown";
  if (states.some((state) => state.status === "down")) return "down";
  if (states.every((state) => state.status === "up")) return "up";
  if (states.every((state) => state.status === "paused")) return "paused";
  if (states.some((state) => state.status === "up")) return "up";
  return "unknown";
}

async function createIncident(params: {
  userId: string;
  userEmail: string | null;
  monitorId: Types.ObjectId;
  projectId: Types.ObjectId | null;
  monitorName: string;
  monitorUrl: string;
  region: MonitorRegion;
  checkedAt: Date;
  statusCode: number | null;
  responseTimeMs: number | null;
  errorMessage: string | null;
}) {
  const message = `[${params.region}] ${params.errorMessage ?? "Endpoint returned an invalid response."}`;

  try {
    const incident = await Incident.create({
      monitorId: params.monitorId,
      projectId: params.projectId,
      message,
      monitorName: params.monitorName,
      monitorUrl: params.monitorUrl,
      status: "OPEN",
      startedAt: params.checkedAt,
      lastFailureAt: params.checkedAt,
      failureCount: 1,
      lastError: message,
      events: [
        {
          type: "down",
          message,
          statusCode: params.statusCode,
          responseTimeMs: params.responseTimeMs,
          timestamp: params.checkedAt,
        },
      ],
    });

    await dispatchAlert({
      userId: params.userId,
      userEmail: params.userEmail,
      eventType: "down",
      projectId: params.projectId ? String(params.projectId) : null,
      monitorName: params.monitorName,
      monitorUrl: params.monitorUrl,
      incidentId: incident.id,
      region: params.region,
      checkedAt: params.checkedAt,
      responseTimeMs: params.responseTimeMs,
      statusCode: params.statusCode,
      errorMessage: message,
    });

    await createMonitorEventLog({
      monitorId: params.monitorId,
      projectId: params.projectId,
      userId: params.userId,
      eventType: "incident_open",
      status: "down",
      region: params.region,
      responseTimeMs: params.responseTimeMs,
      statusCode: params.statusCode,
      message,
      checkedAt: params.checkedAt,
    }).catch((error) => {
      console.warn("[monitoring] incident_open log failed", error);
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      return;
    }

    throw error;
  }
}

async function appendIncidentFailure(params: {
  incidentId: Types.ObjectId;
  region: MonitorRegion;
  checkedAt: Date;
  statusCode: number | null;
  responseTimeMs: number | null;
  errorMessage: string | null;
}) {
  const message = `[${params.region}] ${params.errorMessage ?? "Endpoint still failing."}`;

  await Incident.findByIdAndUpdate(params.incidentId, {
    $inc: { failureCount: 1 },
    $set: {
      lastFailureAt: params.checkedAt,
      lastError: message,
      message,
    },
    $push: {
      events: {
        type: "retry",
        message,
        statusCode: params.statusCode,
        responseTimeMs: params.responseTimeMs,
        timestamp: params.checkedAt,
      },
    },
  });
}

async function resolveIncident(params: {
  userId: string;
  userEmail: string | null;
  monitorId: Types.ObjectId;
  projectId: Types.ObjectId | null;
  monitorName: string;
  monitorUrl: string;
  region: MonitorRegion;
  checkedAt: Date;
  statusCode: number | null;
  responseTimeMs: number | null;
}) {
  const openIncidents = await Incident.find({
    monitorId: params.monitorId,
    status: { $in: ["OPEN", "open"] },
  })
    .select("_id")
    .lean();

  if (openIncidents.length === 0) return;

  const incidentIds = openIncidents.map((incident) => incident._id);

  await Incident.updateMany(
    { _id: { $in: incidentIds } },
    {
      $set: {
        status: "RESOLVED",
        resolvedAt: params.checkedAt,
        message: `[${params.region}] Endpoint recovered successfully.`,
      },
      $push: {
        events: {
          type: "recovered",
          message: `[${params.region}] Endpoint responded successfully.`,
          statusCode: params.statusCode,
          responseTimeMs: params.responseTimeMs,
          timestamp: params.checkedAt,
        },
      },
    },
  );

  await dispatchAlert({
    userId: params.userId,
    userEmail: params.userEmail,
    eventType: "recovery",
    projectId: params.projectId ? String(params.projectId) : null,
    monitorName: params.monitorName,
    monitorUrl: params.monitorUrl,
    incidentId: String(incidentIds[0]),
    region: params.region,
    checkedAt: params.checkedAt,
    responseTimeMs: params.responseTimeMs,
    statusCode: params.statusCode,
  });

  await createMonitorEventLog({
    monitorId: params.monitorId,
    projectId: params.projectId,
    userId: params.userId,
    eventType: "incident_resolved",
    status: "up",
    region: params.region,
    responseTimeMs: params.responseTimeMs,
    statusCode: params.statusCode,
    message: `[${params.region}] Endpoint recovered successfully.`,
    checkedAt: params.checkedAt,
  }).catch((error) => {
    console.warn("[monitoring] incident_resolved log failed", error);
  });
}

async function saveHistory(params: {
  monitorId: Types.ObjectId;
  projectId: Types.ObjectId | null;
  region: MonitorRegion;
  status: MonitorStatus;
  latency: number | null;
  statusCode: number | null;
  errorMessage: string | null;
  timestamp: Date;
}) {
  await CheckHistory.create({
    monitorId: params.monitorId,
    projectId: params.projectId,
    region: params.region,
    status: params.status,
    latency: params.latency,
    statusCode: params.statusCode,
    errorMessage: params.errorMessage,
    timestamp: params.timestamp,
  });
}

async function createMonitorEventLog(params: {
  monitorId: Types.ObjectId;
  projectId: Types.ObjectId | null;
  userId: string;
  eventType:
    | "status_up"
    | "status_down"
    | "incident_open"
    | "incident_resolved"
    | "latency_high";
  status: MonitorStatus | null;
  region: MonitorRegion | null;
  responseTimeMs: number | null;
  statusCode: number | null;
  message: string | null;
  checkedAt: Date;
}) {
  await MonitorLog.create({
    monitorId: params.monitorId,
    projectId: params.projectId,
    userId: params.userId,
    eventType: params.eventType,
    status: params.status,
    region: params.region,
    responseTimeMs: params.responseTimeMs,
    statusCode: params.statusCode,
    message: params.message,
    timestamp: params.checkedAt,
  });
}

export type RunMonitorCheckOptions = {
  requestTimeoutMs?: number;
  region?: MonitorRegion;
  reason?: "create" | "manual" | "scheduler";
  retryAttempt?: number;
};

export async function runMonitorCheck(monitorId: string, options?: RunMonitorCheckOptions) {
  if (!options?.region) {
    const regions = getMonitoringRegions();
    for (const region of regions) {
      await runMonitorCheck(monitorId, { ...options, region });
    }
    return;
  }

  await connectToDatabase();
  const monitor = await Monitor.findById(monitorId);

  if (!monitor || monitor.status === "paused") {
    return;
  }

  const region = options.region;
  const checkedAt = new Date();
  const requestTimeoutMs = options?.requestTimeoutMs ?? monitor.timeoutMs;
  const result = await checkEndpoint(monitor.url, requestTimeoutMs, region);
  const regionStatus: MonitorStatus = result.success ? "up" : "down";

  const nextRegionStates = mergeRegionState(monitor.regionStates ?? [], {
    region,
    status: regionStatus,
    latencyMs: result.responseTimeMs,
    statusCode: result.statusCode,
    errorMessage: result.errorMessage,
    checkedAt,
  });
  const aggregatedStatus = aggregateMonitorStatus(nextRegionStates);

  const totalChecks = monitor.totalChecks + 1;
  const totalFailures = monitor.totalFailures + (aggregatedStatus === "down" ? 1 : 0);

  monitor.name = monitor.name || getDefaultMonitorName(monitor.url);
  monitor.regionStates = nextRegionStates;
  monitor.status = aggregatedStatus;
  monitor.lastCheckedAt = checkedAt;
  monitor.lastResponseTimeMs = result.responseTimeMs;
  monitor.lastStatusCode = result.statusCode;
  monitor.totalChecks = totalChecks;
  monitor.totalFailures = totalFailures;
  monitor.uptimePercentage = calculateUptimePercentage(totalChecks, totalFailures);
  monitor.latencyLogs.push({
    checkedAt,
    success: result.success,
    responseTimeMs: result.responseTimeMs,
    statusCode: result.statusCode,
    errorMessage: result.errorMessage,
  });

  if (monitor.latencyLogs.length > MAX_LATENCY_SAMPLES) {
    monitor.latencyLogs = monitor.latencyLogs.slice(-MAX_LATENCY_SAMPLES);
  }

  await saveHistory({
    monitorId: monitor._id,
    projectId: monitor.projectId ?? null,
    region,
    status: regionStatus,
    latency: result.responseTimeMs,
    statusCode: result.statusCode,
    errorMessage: result.errorMessage,
    timestamp: checkedAt,
  });

  await createMonitorEventLog({
    monitorId: monitor._id,
    projectId: monitor.projectId ?? null,
    userId: monitor.userId,
    eventType: result.success ? "status_up" : "status_down",
    status: regionStatus,
    region,
    responseTimeMs: result.responseTimeMs,
    statusCode: result.statusCode,
    message: result.errorMessage,
    checkedAt,
  }).catch((error) => {
    console.warn("[monitoring] status log failed", error);
  });

  const openIncidentDoc = await Incident.findOne({
    monitorId: monitor._id,
    status: { $in: ["OPEN", "open"] },
  });

  if (aggregatedStatus === "down") {
    monitor.consecutiveFailures = monitor.consecutiveFailures + 1;
    monitor.retryStrikeCount = (monitor.retryStrikeCount ?? 0) + 1;

    if (monitor.retryStrikeCount < 3) {
      const delayMs = FAILURE_RETRY_DELAYS_MS[monitor.retryStrikeCount - 1] ?? 30_000;
      monitor.nextCheckAt = new Date(Date.now() + delayMs);
      await monitor.save();
      await enqueueMonitorCheck(monitor.id, "scheduler", {
        region,
        retryAttempt: monitor.retryStrikeCount,
        delayMs,
      });
      return;
    }

    monitor.nextCheckAt = calculateNextCheckAt(monitor.intervalMinutes);
    await monitor.save();

    if (openIncidentDoc) {
      await appendIncidentFailure({
        incidentId: openIncidentDoc._id,
        region,
        checkedAt,
        statusCode: result.statusCode,
        responseTimeMs: result.responseTimeMs,
        errorMessage: result.errorMessage,
      });
      return;
    }

    await createIncident({
      userId: monitor.userId,
      userEmail: monitor.ownerEmail ?? null,
      monitorId: monitor._id,
      projectId: monitor.projectId ?? null,
      monitorName: monitor.name,
      monitorUrl: monitor.url,
      region,
      checkedAt,
      statusCode: result.statusCode,
      responseTimeMs: result.responseTimeMs,
      errorMessage: result.errorMessage,
    });
    return;
  }

  monitor.consecutiveFailures = 0;
  monitor.retryStrikeCount = 0;
  monitor.nextCheckAt = calculateNextCheckAt(monitor.intervalMinutes);
  await monitor.save();

  if (openIncidentDoc) {
    await resolveIncident({
      userId: monitor.userId,
      userEmail: monitor.ownerEmail ?? null,
      monitorId: monitor._id,
      projectId: monitor.projectId ?? null,
      monitorName: monitor.name,
      monitorUrl: monitor.url,
      region,
      checkedAt,
      statusCode: result.statusCode,
      responseTimeMs: result.responseTimeMs,
    });
  }

  if (
    result.responseTimeMs !== null &&
    result.responseTimeMs > HIGH_LATENCY_THRESHOLD_MS
  ) {
    await dispatchAlert({
      userId: monitor.userId,
      userEmail: monitor.ownerEmail ?? null,
      eventType: "high_latency",
      projectId: monitor.projectId ? String(monitor.projectId) : null,
      monitorName: monitor.name,
      monitorUrl: monitor.url,
      region,
      checkedAt,
      responseTimeMs: result.responseTimeMs,
      statusCode: result.statusCode,
      errorMessage: result.errorMessage,
    });

    await createMonitorEventLog({
      monitorId: monitor._id,
      projectId: monitor.projectId ?? null,
      userId: monitor.userId,
      eventType: "latency_high",
      status: "up",
      region,
      responseTimeMs: result.responseTimeMs,
      statusCode: result.statusCode,
      message: `Latency threshold exceeded (${HIGH_LATENCY_THRESHOLD_MS} ms).`,
      checkedAt,
    }).catch((error) => {
      console.warn("[monitoring] latency_high log failed", error);
    });
  }
}
