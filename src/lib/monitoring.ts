import axios from "axios";
import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/db";
import { sendMonitorDownEmail, sendMonitorRecoveredEmail } from "@/lib/mail";
import Incident from "@/models/Incident";
import Monitor, { type IntervalMinutes, type MonitorStatus } from "@/models/Monitor";

const MAX_LATENCY_SAMPLES = 300;

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

async function checkEndpoint(url: string, timeoutMs: number): Promise<CheckResult> {
  const startedAt = Date.now();

  try {
    const response = await axios.get(url, {
      timeout: timeoutMs,
      validateStatus: () => true,
    });

    const responseTimeMs = Date.now() - startedAt;
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
      responseTimeMs: Date.now() - startedAt,
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

async function createIncident(params: {
  monitorId: Types.ObjectId;
  monitorName: string;
  monitorUrl: string;
  checkedAt: Date;
  statusCode: number | null;
  responseTimeMs: number | null;
  errorMessage: string | null;
}) {
  try {
    const incident = await Incident.create({
      monitorId: params.monitorId,
      message: params.errorMessage ?? "Endpoint returned an invalid response.",
      monitorName: params.monitorName,
      monitorUrl: params.monitorUrl,
      status: "OPEN",
      startedAt: params.checkedAt,
      lastFailureAt: params.checkedAt,
      failureCount: 1,
      lastError: params.errorMessage,
      events: [
        {
          type: "down",
          message: params.errorMessage ?? "Endpoint returned an invalid response.",
          statusCode: params.statusCode,
          responseTimeMs: params.responseTimeMs,
          timestamp: params.checkedAt,
        },
      ],
    });

    await sendMonitorDownEmail({
      monitorName: params.monitorName,
      monitorUrl: params.monitorUrl,
      incidentId: incident.id,
      checkedAt: params.checkedAt,
      responseTimeMs: params.responseTimeMs,
      statusCode: params.statusCode,
      errorMessage: params.errorMessage,
    });
  } catch (error: unknown) {
    // Another concurrent worker already created the OPEN incident.
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
  checkedAt: Date;
  statusCode: number | null;
  responseTimeMs: number | null;
  errorMessage: string | null;
}) {
  await Incident.findByIdAndUpdate(params.incidentId, {
    $inc: { failureCount: 1 },
    $set: {
      lastFailureAt: params.checkedAt,
      lastError: params.errorMessage,
      message: params.errorMessage ?? "Endpoint still failing.",
    },
    $push: {
      events: {
        type: "retry",
        message: params.errorMessage ?? "Endpoint still failing.",
        statusCode: params.statusCode,
        responseTimeMs: params.responseTimeMs,
        timestamp: params.checkedAt,
      },
    },
  });
}

async function resolveIncident(params: {
  monitorId: Types.ObjectId;
  monitorName: string;
  monitorUrl: string;
  checkedAt: Date;
  statusCode: number | null;
  responseTimeMs: number | null;
}) {
  const incident = await Incident.findOneAndUpdate(
    {
      monitorId: params.monitorId,
      status: { $in: ["OPEN", "open"] },
    },
    {
      $set: {
        status: "RESOLVED",
        resolvedAt: params.checkedAt,
        message: "Endpoint recovered successfully.",
      },
      $push: {
        events: {
          type: "recovered",
          message: "Endpoint responded successfully.",
          statusCode: params.statusCode,
          responseTimeMs: params.responseTimeMs,
          timestamp: params.checkedAt,
        },
      },
    },
    { returnDocument: "after", sort: { startedAt: -1 } },
  );

  if (!incident) return;

  await sendMonitorRecoveredEmail({
    monitorName: params.monitorName,
    monitorUrl: params.monitorUrl,
    incidentId: incident.id,
    checkedAt: params.checkedAt,
    responseTimeMs: params.responseTimeMs,
    statusCode: params.statusCode,
  });
}

export async function runMonitorCheck(monitorId: string) {
  await connectToDatabase();
  const monitor = await Monitor.findById(monitorId);

  if (!monitor || monitor.status === "paused") {
    return;
  }

  const checkedAt = new Date();
  const result = await checkEndpoint(monitor.url, monitor.timeoutMs);
  const nextStatus: MonitorStatus = result.success ? "up" : "down";
  const totalChecks = monitor.totalChecks + 1;
  const totalFailures = monitor.totalFailures + (result.success ? 0 : 1);

  monitor.status = nextStatus;
  monitor.totalChecks = totalChecks;
  monitor.totalFailures = totalFailures;
  monitor.consecutiveFailures = result.success ? 0 : monitor.consecutiveFailures + 1;
  monitor.uptimePercentage = calculateUptimePercentage(totalChecks, totalFailures);
  monitor.lastCheckedAt = checkedAt;
  monitor.lastResponseTimeMs = result.responseTimeMs;
  monitor.lastStatusCode = result.statusCode;
  monitor.nextCheckAt = calculateNextCheckAt(monitor.intervalMinutes);
  monitor.name = monitor.name || getDefaultMonitorName(monitor.url);
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

  await monitor.save();

  const openIncidentDoc = await Incident.findOne({
    monitorId: monitor._id,
    status: { $in: ["OPEN", "open"] },
  });

  // Only create one open incident per monitor; repeated failures append retry events.
  if (!result.success) {
    if (openIncidentDoc) {
      await appendIncidentFailure({
        incidentId: openIncidentDoc._id,
        checkedAt,
        statusCode: result.statusCode,
        responseTimeMs: result.responseTimeMs,
        errorMessage: result.errorMessage,
      });
      return;
    }

    await createIncident({
      monitorId: monitor._id,
      monitorName: monitor.name,
      monitorUrl: monitor.url,
      checkedAt,
      statusCode: result.statusCode,
      responseTimeMs: result.responseTimeMs,
      errorMessage: result.errorMessage,
    });

    return;
  }

  if (openIncidentDoc) {
    await resolveIncident({
      monitorId: monitor._id,
      monitorName: monitor.name,
      monitorUrl: monitor.url,
      checkedAt,
      statusCode: result.statusCode,
      responseTimeMs: result.responseTimeMs,
    });
  }
}
