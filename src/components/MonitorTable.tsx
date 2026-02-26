import Link from "next/link";

import {
  runMonitorNowAction,
  toggleMonitorStatusAction,
} from "@/app/actions/monitorActions";
import { SLABadge } from "@/components/SLABadge";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDateTime, formatDurationMs, formatUptime } from "@/lib/format";
import type { MonitorView } from "@/lib/queries";
import { calculateUptimePercentage } from "@/lib/uptime";

type MonitorTableProps = {
  monitors: MonitorView[];
};

export function MonitorTable({ monitors }: MonitorTableProps) {
  if (monitors.length === 0) {
    return (
      <section className="glass-panel rounded-2xl border-dashed p-8 text-center text-sm text-slate-400">
        No monitors created yet.
      </section>
    );
  }

  return (
    <section className="glass-panel overflow-hidden rounded-2xl">
      <div className="max-h-[26rem] overflow-auto">
        <table className="min-w-full divide-y divide-slate-800/80 text-sm">
          <thead className="sticky top-0 z-10 bg-slate-950/85 text-left text-xs uppercase tracking-[0.12em] text-slate-400 backdrop-blur-xl">
            <tr>
              <th className="px-4 py-3 font-medium">Monitor</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Interval</th>
              <th className="px-4 py-3 font-medium">Uptime</th>
              <th className="px-4 py-3 font-medium">SLA</th>
              <th className="px-4 py-3 font-medium">Latency</th>
              <th className="px-4 py-3 font-medium">Last Check</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-200">
            {monitors.map((monitor) => {
              const pauseAction = toggleMonitorStatusAction.bind(null, monitor.id);
              const runNowAction = runMonitorNowAction.bind(null, monitor.id);
              const uptimePercentage = calculateUptimePercentage({
                totalChecks: monitor.totalChecks,
                failureCount: monitor.totalFailures,
                monitoringHistory: monitor.latencyLogs,
              });

              return (
                <tr
                  key={monitor.id}
                  className="transition-colors duration-200 hover:bg-slate-800/45"
                >
                  <td className="px-4 py-3 align-top">
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-100">{monitor.name}</p>
                      <p className="max-w-xs truncate text-xs text-slate-400">{monitor.url}</p>
                      <Link
                        href={`/monitors/${monitor.id}`}
                        className="text-xs font-medium text-sky-300 transition hover:text-sky-200"
                      >
                        View Details
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <StatusBadge status={monitor.status} />
                  </td>
                  <td className="px-4 py-3 align-top text-slate-300">
                    {monitor.intervalMinutes} min
                  </td>
                  <td className="px-4 py-3 align-top text-slate-300">
                    {formatUptime(uptimePercentage)}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <SLABadge uptimePercentage={uptimePercentage} />
                  </td>
                  <td className="px-4 py-3 align-top text-slate-300">
                    {formatDurationMs(monitor.lastResponseTimeMs)}
                  </td>
                  <td className="px-4 py-3 align-top text-slate-300">
                    {formatDateTime(monitor.lastCheckedAt)}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-wrap gap-2">
                      <form action={runNowAction}>
                        <button
                          type="submit"
                          className="rounded-lg border border-slate-700/80 bg-slate-900/70 px-3 py-1.5 text-xs font-semibold text-slate-200 transition duration-200 hover:border-sky-400/70 hover:text-sky-200"
                        >
                          Run Now
                        </button>
                      </form>
                      <form action={pauseAction}>
                        <button
                          type="submit"
                          className="rounded-lg border border-slate-700/80 bg-slate-900/70 px-3 py-1.5 text-xs font-semibold text-slate-200 transition duration-200 hover:border-amber-400/70 hover:text-amber-200"
                        >
                          {monitor.status === "paused" ? "Resume" : "Pause"}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-800/80 px-4 py-2 text-xs text-slate-500">
        {monitors.length} monitor{monitors.length === 1 ? "" : "s"} tracked
      </div>
    </section>
  );
}
