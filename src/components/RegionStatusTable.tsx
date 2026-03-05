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
      <section className="glass-panel rounded-2xl border-dashed p-6 text-sm text-slate-400">
        No regional checks yet.
      </section>
    );
  }

  return (
    <section className="glass-panel overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800/80 text-sm">
          <thead className="bg-slate-950/85 text-left text-xs uppercase tracking-[0.12em] text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Monitor</th>
              <th className="px-4 py-3 font-medium">Region</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Latency</th>
              <th className="px-4 py-3 font-medium">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-200">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-800/45">
                <td className="px-4 py-3">{row.monitorName}</td>
                <td className="px-4 py-3">{row.region}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-4 py-3">{formatDurationMs(row.latencyMs)}</td>
                <td className="px-4 py-3 text-xs text-slate-400">
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
