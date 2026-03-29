import type { AdminActivityRow } from "@/lib/adminQueries";

type AdminActivityTableProps = {
  rows: AdminActivityRow[];
};

export function AdminActivityTable({ rows }: AdminActivityTableProps) {
  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border-accent bg-surface-card/50 p-6 text-sm text-text-muted">
        No activity logs found for this filter.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:hidden">
        {rows.map((row) => (
          <article key={row.id} className="rounded-2xl border border-border bg-surface-card/60 p-4">
            <p className="text-xs text-text-muted">{new Date(row.timestamp).toLocaleString()}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-md border border-border-accent bg-surface-card/70 px-2 py-0.5 text-[11px] uppercase text-text-secondary">
                {row.role}
              </span>
              <p className="text-sm font-semibold text-text-primary">{row.action}</p>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 text-xs">
              <p className="break-all rounded-lg border border-border bg-surface-card/60 px-2 py-1.5 text-text-secondary">
                User: {row.userEmail || "N/A"}
              </p>
              <p className="break-all rounded-lg border border-border bg-surface-card/60 px-2 py-1.5 text-text-muted">
                userId: {row.userId}
              </p>
              <p className="break-all rounded-lg border border-border bg-surface-card/60 px-2 py-1.5 text-text-secondary">
                Target: {row.targetType || "N/A"} {row.targetId ? `(${row.targetId})` : ""}
              </p>
              <p className="rounded-lg border border-border bg-surface-card/60 px-2 py-1.5 text-text-secondary">
                IP: {row.ipAddress || "N/A"}
              </p>
              <p className="rounded-lg border border-border bg-surface-card/60 px-2 py-1.5 text-text-muted">
                User Agent: {row.userAgent || "N/A"}
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
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">User</th>
              <th className="hidden px-4 py-3 lg:table-cell">Target</th>
              <th className="hidden px-4 py-3 xl:table-cell">IP</th>
              <th className="hidden px-4 py-3 xl:table-cell">User Agent</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border text-text-secondary">
                <td className="px-4 py-3 text-xs text-text-secondary">{new Date(row.timestamp).toLocaleString()}</td>
                <td className="px-4 py-3 uppercase">{row.role}</td>
                <td className="px-4 py-3">{row.action}</td>
                <td className="px-4 py-3 text-xs">
                  <p className="max-w-[260px] truncate text-text-secondary">{row.userEmail || "N/A"}</p>
                  <p className="max-w-[260px] truncate text-text-muted">{row.userId}</p>
                </td>
                <td className="hidden max-w-[260px] truncate px-4 py-3 text-xs text-text-secondary lg:table-cell">
                  {row.targetType || "N/A"} {row.targetId ? `(${row.targetId})` : ""}
                </td>
                <td className="hidden px-4 py-3 text-xs text-text-secondary xl:table-cell">{row.ipAddress || "N/A"}</td>
                <td className="hidden max-w-sm truncate px-4 py-3 text-xs text-text-muted xl:table-cell">
                  {row.userAgent || "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

