import { SLABadge } from "@/components/SLABadge";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDateTime, formatDurationMs, formatUptime } from "@/lib/format";

export type PublicMonitorRow = {
  id: string;
  name: string;
  status: "up" | "down" | "paused" | "unknown";
  uptimePercentage: number;
  avgLatencyMs: number | null;
  lastCheckedAt: string | null;
  lastIncidentAt: string | null;
};

type MonitorStatusTableProps = {
  rows: PublicMonitorRow[];
};

export function MonitorStatusTable({ rows }: MonitorStatusTableProps) {
  if (rows.length === 0) {
    return (
      <section className="glass-panel rounded-2xl border-dashed p-8 text-center text-sm text-slate-400">
        No monitors available on this status page.
      </section>
    );
  }

  return (
    <section className="glass-panel overflow-hidden rounded-2xl">
      <div className="md:hidden space-y-3 p-3">
        {rows.map((row) => (
          <article key={row.id} className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-100">{row.name}</h3>
              <StatusBadge status={row.status} />
            </div>
            <dl className="mt-3 space-y-1 text-sm text-slate-300">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Uptime</dt>
                <dd>{formatUptime(row.uptimePercentage)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Avg Latency</dt>
                <dd>{formatDurationMs(row.avgLatencyMs)}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-slate-500">SLA</dt>
                <dd>
                  <SLABadge uptimePercentage={row.uptimePercentage} />
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Last Check</dt>
                <dd>{formatDateTime(row.lastCheckedAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Last Incident</dt>
                <dd>{formatDateTime(row.lastIncidentAt)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800/80 text-sm">
          <caption className="sr-only">Public monitor status table</caption>
          <thead className="sticky top-0 z-10 bg-slate-950/85 text-left text-xs uppercase tracking-[0.12em] text-slate-400 backdrop-blur-xl">
            <tr>
              <th className="px-4 py-3 font-medium">Monitor</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Uptime</th>
              <th className="px-4 py-3 font-medium">SLA</th>
              <th className="px-4 py-3 font-medium">Avg Latency</th>
              <th className="px-4 py-3 font-medium">Last Checked</th>
              <th className="px-4 py-3 font-medium">Last Incident</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-200">
            {rows.map((row) => (
              <tr key={row.id} className="transition-colors duration-200 hover:bg-slate-800/45">
                <td className="px-4 py-3 font-medium text-slate-100">{row.name}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-4 py-3 text-slate-300">{formatUptime(row.uptimePercentage)}</td>
                <td className="px-4 py-3 text-slate-300">
                  <SLABadge uptimePercentage={row.uptimePercentage} />
                </td>
                <td className="px-4 py-3 text-slate-300">{formatDurationMs(row.avgLatencyMs)}</td>
                <td className="px-4 py-3 text-slate-300">{formatDateTime(row.lastCheckedAt)}</td>
                <td className="px-4 py-3 text-slate-300">{formatDateTime(row.lastIncidentAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
