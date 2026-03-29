import type { AdminLogRow } from "@/lib/adminQueries";

type AdminLogsTableProps = {
  logs: AdminLogRow[];
};

export function AdminLogsTable({ logs }: AdminLogsTableProps) {
  if (!logs.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border-accent bg-surface-card/50 p-6 text-sm text-text-muted">
        No monitor logs found for this filter.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:hidden">
        {logs.map((log) => (
          <article key={log.id} className="rounded-2xl border border-border bg-surface-card/60 p-4">
            <p className="text-xs text-text-muted">{new Date(log.timestamp).toLocaleString()}</p>
            <p className="mt-1 text-sm font-semibold text-text-primary">{log.eventType}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <p className="col-span-2 break-all rounded-lg border border-border bg-surface-card/60 px-2 py-1.5 text-text-muted">
                monitorId: {log.monitorId}
              </p>
              <p className="col-span-2 break-all rounded-lg border border-border bg-surface-card/60 px-2 py-1.5 text-text-muted">
                userId: {log.userId}
              </p>
              <p className="rounded-lg border border-border bg-surface-card/60 px-2 py-1.5 text-text-secondary">
                Status: {log.status || "N/A"}
              </p>
              <p className="rounded-lg border border-border bg-surface-card/60 px-2 py-1.5 text-text-secondary">
                Region: {log.region || "N/A"}
              </p>
              <p className="rounded-lg border border-border bg-surface-card/60 px-2 py-1.5 text-text-secondary">
                Code: {log.statusCode ?? "N/A"}
              </p>
              <p className="rounded-lg border border-border bg-surface-card/60 px-2 py-1.5 text-text-secondary">
                Latency: {log.responseTimeMs ?? "N/A"} ms
              </p>
              <p className="col-span-2 rounded-lg border border-border bg-surface-card/60 px-2 py-1.5 text-text-secondary">
                Message: {log.message || "N/A"}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-border bg-surface-card/60 md:block">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-[0.08em] text-text-muted">
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Event</th>
              <th className="hidden px-4 py-3 lg:table-cell">Monitor</th>
              <th className="hidden px-4 py-3 lg:table-cell">User</th>
              <th className="hidden px-4 py-3 xl:table-cell">Region</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Latency</th>
              <th className="hidden px-4 py-3 xl:table-cell">Code</th>
              <th className="hidden px-4 py-3 xl:table-cell">Message</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-border text-text-secondary">
                <td className="px-4 py-3 text-xs text-text-secondary">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="px-4 py-3">{log.eventType}</td>
                <td className="hidden max-w-[220px] truncate px-4 py-3 text-xs text-text-secondary lg:table-cell">
                  {log.monitorId}
                </td>
                <td className="hidden max-w-[220px] truncate px-4 py-3 text-xs text-text-secondary lg:table-cell">
                  {log.userId}
                </td>
                <td className="hidden px-4 py-3 xl:table-cell">{log.region || "N/A"}</td>
                <td className="px-4 py-3">{log.status || "N/A"}</td>
                <td className="px-4 py-3">{log.responseTimeMs ?? "N/A"} ms</td>
                <td className="hidden px-4 py-3 xl:table-cell">{log.statusCode ?? "N/A"}</td>
                <td className="hidden max-w-sm truncate px-4 py-3 text-xs text-text-secondary xl:table-cell">
                  {log.message || "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

