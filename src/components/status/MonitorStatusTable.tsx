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
      <section className="glass-card rounded-2xl border border-dashed p-8 text-center text-sm text-text-muted">
        No monitors available on this status page.
      </section>
    );
  }

  return (
    <section className="glass-card overflow-hidden rounded-2xl border">
      <div className="space-y-3 p-3 md:hidden">
        {rows.map((row) => (
          <article key={row.id} className="glass-card rounded-xl border p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-text-primary">{row.name}</h3>
              <StatusBadge status={row.status} />
            </div>
            <dl className="mt-3 space-y-1 text-sm text-text-secondary">
              <div className="flex justify-between gap-3">
                <dt className="text-text-muted">Uptime</dt>
                <dd>{formatUptime(row.uptimePercentage)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-text-muted">Avg Latency</dt>
                <dd>{formatDurationMs(row.avgLatencyMs)}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-text-muted">SLA</dt>
                <dd>
                  <SLABadge uptimePercentage={row.uptimePercentage} />
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-text-muted">Last Check</dt>
                <dd>{formatDateTime(row.lastCheckedAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-text-muted">Last Incident</dt>
                <dd>{formatDateTime(row.lastIncidentAt)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-[color:var(--border)] text-sm">
          <caption className="sr-only">Public monitor status table</caption>
          <thead className="sticky top-0 z-10 bg-black/95 text-left text-xs uppercase tracking-[0.12em] text-text-muted backdrop-blur-xl">
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
          <tbody className="divide-y divide-[color:var(--border)] text-text-secondary">
            {rows.map((row) => (
              <tr key={row.id} className="transition-colors duration-200 hover:bg-[rgba(255,255,255,0.02)]">
                <td className="px-4 py-3 font-medium text-text-primary">{row.name}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-4 py-3 text-text-secondary">{formatUptime(row.uptimePercentage)}</td>
                <td className="px-4 py-3 text-text-secondary">
                  <SLABadge uptimePercentage={row.uptimePercentage} />
                </td>
                <td className="px-4 py-3 text-text-secondary">{formatDurationMs(row.avgLatencyMs)}</td>
                <td className="px-4 py-3 text-text-secondary">{formatDateTime(row.lastCheckedAt)}</td>
                <td className="px-4 py-3 text-text-secondary">{formatDateTime(row.lastIncidentAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
