import type { AdminActivityRow } from "@/lib/adminQueries";

type AdminActivityTableProps = {
  rows: AdminActivityRow[];
};

export function AdminActivityTable({ rows }: AdminActivityTableProps) {
  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-700/80 bg-slate-900/50 p-6 text-sm text-slate-400">
        No activity logs found for this filter.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:hidden">
        {rows.map((row) => (
          <article key={row.id} className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
            <p className="text-xs text-slate-400">{new Date(row.timestamp).toLocaleString()}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-md border border-slate-700/80 bg-slate-950/70 px-2 py-0.5 text-[11px] uppercase text-slate-300">
                {row.role}
              </span>
              <p className="text-sm font-semibold text-slate-100">{row.action}</p>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 text-xs">
              <p className="break-all rounded-lg border border-slate-800/70 bg-slate-950/60 px-2 py-1.5 text-slate-300">
                User: {row.userEmail || "N/A"}
              </p>
              <p className="break-all rounded-lg border border-slate-800/70 bg-slate-950/60 px-2 py-1.5 text-slate-500">
                userId: {row.userId}
              </p>
              <p className="break-all rounded-lg border border-slate-800/70 bg-slate-950/60 px-2 py-1.5 text-slate-300">
                Target: {row.targetType || "N/A"} {row.targetId ? `(${row.targetId})` : ""}
              </p>
              <p className="rounded-lg border border-slate-800/70 bg-slate-950/60 px-2 py-1.5 text-slate-300">
                IP: {row.ipAddress || "N/A"}
              </p>
              <p className="rounded-lg border border-slate-800/70 bg-slate-950/60 px-2 py-1.5 text-slate-500">
                User Agent: {row.userAgent || "N/A"}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-900/60 md:block">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800/80 text-left text-xs uppercase tracking-[0.08em] text-slate-400">
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
              <tr key={row.id} className="border-b border-slate-800/60 text-slate-200">
                <td className="px-4 py-3 text-xs text-slate-300">{new Date(row.timestamp).toLocaleString()}</td>
                <td className="px-4 py-3 uppercase">{row.role}</td>
                <td className="px-4 py-3">{row.action}</td>
                <td className="px-4 py-3 text-xs">
                  <p className="max-w-[260px] truncate text-slate-300">{row.userEmail || "N/A"}</p>
                  <p className="max-w-[260px] truncate text-slate-500">{row.userId}</p>
                </td>
                <td className="hidden max-w-[260px] truncate px-4 py-3 text-xs text-slate-300 lg:table-cell">
                  {row.targetType || "N/A"} {row.targetId ? `(${row.targetId})` : ""}
                </td>
                <td className="hidden px-4 py-3 text-xs text-slate-300 xl:table-cell">{row.ipAddress || "N/A"}</td>
                <td className="hidden max-w-sm truncate px-4 py-3 text-xs text-slate-500 xl:table-cell">
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
