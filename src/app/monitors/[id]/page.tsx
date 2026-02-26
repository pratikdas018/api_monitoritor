import Link from "next/link";
import { notFound } from "next/navigation";

import { IncidentTimeline } from "@/components/IncidentTimeline";
import { LatencyChart } from "@/components/LatencyChart";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDateTime, formatDurationMs, formatUptime } from "@/lib/format";
import { getIncidentsByMonitorId, getMonitorById } from "@/lib/queries";

export const dynamic = "force-dynamic";

type MonitorDetailPageProps = {
  params: Promise<{ id: string }> | { id: string };
};

export default async function MonitorDetailPage({ params }: MonitorDetailPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const monitorId = resolvedParams.id;

  const [monitor, incidents] = await Promise.all([
    getMonitorById(monitorId),
    getIncidentsByMonitorId(monitorId, 20),
  ]);

  if (!monitor) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 md:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Monitor Detail</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-100">{monitor.name}</h1>
          <p className="mt-1 text-sm text-slate-400">{monitor.url}</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={monitor.status} />
          <Link
            href="/"
            className="rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-sky-500 hover:text-sky-300"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-sm text-slate-500">Last Latency</p>
          <p className="mt-2 text-xl font-semibold text-slate-100">
            {formatDurationMs(monitor.lastResponseTimeMs)}
          </p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-sm text-slate-500">Uptime</p>
          <p className="mt-2 text-xl font-semibold text-slate-100">
            {formatUptime(monitor.uptimePercentage)}
          </p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-sm text-slate-500">Last Check</p>
          <p className="mt-2 text-xl font-semibold text-slate-100">
            {formatDateTime(monitor.lastCheckedAt)}
          </p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-sm text-slate-500">Interval</p>
          <p className="mt-2 text-xl font-semibold text-slate-100">
            {monitor.intervalMinutes} min
          </p>
        </article>
      </section>

      <section className="mb-6 space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">Latency History</h2>
        <LatencyChart data={monitor.latencyLogs} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">Monitor Incidents</h2>
        <IncidentTimeline incidents={incidents} />
      </section>
    </main>
  );
}
