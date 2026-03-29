import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminTrendCharts } from "@/components/admin/AdminTrendCharts";
import { getAdminStatsData } from "@/lib/adminQueries";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const { stats, recentIncidents, trends } = await getAdminStatsData();

  return (
    <div className="space-y-5 lg:space-y-6">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <AdminStatCard label="Total Users" value={stats.totalUsers} />
        <AdminStatCard label="Total APIs" value={stats.totalApis} />
        <AdminStatCard label="Active APIs" value={stats.activeApis} tone="good" />
        <AdminStatCard label="Down APIs" value={stats.downApis} tone="bad" />
        <AdminStatCard label="Incidents (24h)" value={stats.incidentsLast24h} tone="warn" />
      </section>

      <AdminTrendCharts data={trends} />

      <section className="rounded-2xl border border-border bg-surface-card/60 p-4 sm:p-5">
        <h2 className="text-base font-semibold text-text-primary sm:text-lg">Recent Incidents</h2>
        {recentIncidents.length === 0 ? (
          <p className="mt-3 text-sm text-text-muted">No incidents recorded yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            <div className="grid gap-3 md:hidden">
              {recentIncidents.map((incident) => (
                <article key={incident.id} className="rounded-xl border border-border bg-surface-card/60 p-3">
                  <p className="text-sm font-semibold text-text-primary">{incident.monitorName}</p>
                  <p className="mt-1 break-all text-xs text-text-muted">{incident.monitorUrl}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <p className="rounded-md border border-border px-2 py-1 text-text-secondary">
                      Status: {incident.status}
                    </p>
                    <p className="rounded-md border border-border px-2 py-1 text-text-secondary">
                      Resolved: {incident.resolvedAt ? "Yes" : "Open"}
                    </p>
                    <p className="col-span-2 rounded-md border border-border px-2 py-1 text-text-muted">
                      Started: {new Date(incident.startedAt).toLocaleString()}
                    </p>
                    <p className="col-span-2 rounded-md border border-border px-2 py-1 text-text-muted">
                      Message: {incident.message}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-[0.08em] text-text-muted">
                    <th className="px-3 py-2">Monitor</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Started</th>
                    <th className="hidden px-3 py-2 lg:table-cell">Resolved</th>
                    <th className="hidden px-3 py-2 lg:table-cell">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {recentIncidents.map((incident) => (
                    <tr key={incident.id} className="border-b border-border text-text-secondary">
                      <td className="px-3 py-2">
                        <p className="font-medium">{incident.monitorName}</p>
                        <p className="max-w-sm truncate text-xs text-text-muted">{incident.monitorUrl}</p>
                      </td>
                      <td className="px-3 py-2">{incident.status}</td>
                      <td className="px-3 py-2 text-xs">{new Date(incident.startedAt).toLocaleString()}</td>
                      <td className="hidden px-3 py-2 text-xs lg:table-cell">
                        {incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleString() : "Open"}
                      </td>
                      <td className="hidden max-w-sm truncate px-3 py-2 text-xs text-text-secondary lg:table-cell">
                        {incident.message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

