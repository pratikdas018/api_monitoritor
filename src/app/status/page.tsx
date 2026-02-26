import type { Metadata } from "next";

import { IncidentHistory } from "@/components/status/IncidentHistory";
import {
  MonitorStatusTable,
  type PublicMonitorRow,
} from "@/components/status/MonitorStatusTable";
import { formatDateTime } from "@/lib/format";
import { getIncidents, getStatusMonitors } from "@/lib/queries";
import { calculateUptimePercentage } from "@/lib/uptime";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Status Page | API Monitor Platform",
  description:
    "Public real-time API status page with uptime, latency, and recent incidents.",
};

function averageLatency(
  latencyLogs: { responseTimeMs: number | null }[],
): number | null {
  const values = latencyLogs
    .map((entry) => entry.responseTimeMs)
    .filter((value): value is number => value !== null && !Number.isNaN(value));

  if (values.length === 0) return null;
  return Math.round(values.reduce((acc, value) => acc + value, 0) / values.length);
}

export default async function StatusPage() {
  const [monitors, incidents] = await Promise.all([
    getStatusMonitors(),
    getIncidents(30),
  ]);

  const lastIncidentByMonitor = new Map<string, string>();
  const incidentFailuresByMonitor = new Map<string, number>();
  for (const incident of incidents) {
    const existing = lastIncidentByMonitor.get(incident.monitorId);
    const candidate = incident.lastFailureAt ?? incident.startedAt;
    const currentFailures = incidentFailuresByMonitor.get(incident.monitorId) ?? 0;

    if (!existing || new Date(candidate).getTime() > new Date(existing).getTime()) {
      lastIncidentByMonitor.set(incident.monitorId, candidate);
    }

    incidentFailuresByMonitor.set(
      incident.monitorId,
      currentFailures + (incident.failureCount ?? 0),
    );
  }

  const monitorRows: PublicMonitorRow[] = monitors.map((monitor) => ({
    id: monitor.id,
    name: monitor.name,
    status: monitor.status,
    uptimePercentage: calculateUptimePercentage({
      totalChecks: monitor.totalChecks,
      failureCount: monitor.totalFailures,
      monitoringHistory: monitor.latencyLogs,
      incidentFailureCount: incidentFailuresByMonitor.get(monitor.id),
    }),
    avgLatencyMs: averageLatency(monitor.latencyLogs),
    lastCheckedAt: monitor.lastCheckedAt,
    lastIncidentAt: lastIncidentByMonitor.get(monitor.id) ?? null,
  }));

  const generatedAt =
    monitors
      .map((monitor) => monitor.lastCheckedAt)
      .filter((value): value is string => Boolean(value))
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ??
    new Date().toISOString();

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1300px] px-4 py-6 sm:px-6 md:px-8 lg:px-10 xl:py-8">
      <header className="glass-panel mb-6 rounded-2xl p-5 md:p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Public Status</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-100 md:text-4xl">
            API Health Status
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            No authentication required. Last checked at {formatDateTime(generatedAt)}.
          </p>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100 md:text-xl">Monitors</h2>
        <MonitorStatusTable rows={monitorRows} />
      </section>

      <section className="mt-6 space-y-3 pb-4">
        <h2 className="text-lg font-semibold text-slate-100 md:text-xl">Recent Incident History</h2>
        <IncidentHistory incidents={incidents} />
      </section>
    </main>
  );
}
