import { StatusBadge } from "@/components/StatusBadge";
import { formatDurationMs } from "@/lib/format";
import type { MonitorView } from "@/lib/queries";

type RegionStatusTableProps = {
  monitors: MonitorView[];
};

export function RegionStatusTable({ monitors }: RegionStatusTableProps) {
  const rows = monitors.flatMap((monitor) =>
    (monitor.regionStates ?? []).map((region) => ({
      id: `${monitor.id}-${region.region}`,
      monitorName: monitor.name,
      region: region.region,
      status: region.status,
      latencyMs: region.latencyMs,
      errorMessage: region.errorMessage,
    })),
  );

  if (rows.length === 0) {
    return (
      <section className="glass-card rounded-2xl border border-dashed p-6 text-sm text-text-muted">
        No regional checks yet.
      </section>
    );
  }

  return (
    <section className="glass-card overflow-hidden rounded-2xl border">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[color:var(--border)] text-sm">
          <thead className="bg-black/95 text-left text-xs uppercase tracking-[0.12em] text-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Monitor</th>
              <th className="px-4 py-3 font-medium">Region</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Latency</th>
              <th className="px-4 py-3 font-medium">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--border)] text-text-secondary">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-[rgba(255,255,255,0.02)]">
                <td className="px-4 py-3 text-text-primary">{row.monitorName}</td>
                <td className="px-4 py-3">{row.region}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-4 py-3">{formatDurationMs(row.latencyMs)}</td>
                <td className="px-4 py-3 text-xs text-text-muted">
                  {row.errorMessage ?? "Healthy"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
