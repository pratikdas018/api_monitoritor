import Link from "next/link";
import { redirect } from "next/navigation";

import { AlertChannelSettings } from "@/components/AlertChannelSettings";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { IncidentTimeline } from "@/components/IncidentTimeline";
import { LatencyChart } from "@/components/LatencyChart";
import { MonitorCreateForm } from "@/components/MonitorCreateForm";
import { MonitorTable } from "@/components/MonitorTable";
import { PerformancePanel } from "@/components/PerformancePanel";
import { ProjectCreateForm } from "@/components/ProjectCreateForm";
import { ProjectSwitcher } from "@/components/ProjectSwitcher";
import { RegionStatusTable } from "@/components/RegionStatusTable";
import { StatCard } from "@/components/StatCard";
import { getAlertChannels, getDashboardData } from "@/lib/queries";
import { getSessionUserId } from "@/lib/serverSession";

type DashboardPageProps = {
  searchParams?: {
    projectId?: string;
  };
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const userId = getSessionUserId();
  if (!userId) {
    redirect("/login?next=/dashboard");
  }

  const activeProjectId = searchParams?.projectId ?? null;
  const { projects, monitors, incidents, stats, metrics } = await getDashboardData(userId, activeProjectId);
  const channels = await getAlertChannels(userId, activeProjectId);
  const chartMonitor = monitors.find((monitor) => monitor.latencyLogs.length > 0) ?? monitors[0];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col gap-6 px-4 py-6 sm:px-6 md:gap-7 md:px-8 lg:px-10 xl:py-8">
      <header className="glass-panel rounded-2xl p-5 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              API Monitoring Platform
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Real-time uptime, incidents, and latency telemetry.
            </p>
            <div className="mt-3">
              <ProjectSwitcher projects={projects} activeProjectId={activeProjectId} />
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/status" className="btn-soft">
              Status Page
            </Link>
            <Link href="/incidents" className="btn-soft">
              Incidents
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Monitors" value={stats.totalMonitors} />
        <StatCard label="Healthy" value={stats.upMonitors} tone="good" />
        <StatCard label="Down" value={stats.downMonitors} tone="bad" />
        <StatCard label="Paused" value={stats.pausedMonitors} tone="warn" />
        <StatCard
          label="Open Incidents"
          value={stats.openIncidents}
          tone={stats.openIncidents > 0 ? "bad" : "info"}
        />
        <StatCard label="Avg Latency" value={`${stats.avgLatencyMs} ms`} tone="info" />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <MonitorCreateForm projects={projects} activeProjectId={activeProjectId} />
        <ProjectCreateForm />
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-100 md:text-xl">Monitors</h2>
            <p className="text-sm text-slate-400">Manage checks, status, and runtime actions.</p>
          </div>
        </div>
        <MonitorTable monitors={monitors} />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 md:text-xl">Regional Status</h2>
          <p className="text-sm text-slate-400">Multi-region check view (India, US, Europe).</p>
        </div>
        <RegionStatusTable monitors={monitors} />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 md:text-xl">Performance Metrics</h2>
          <p className="text-sm text-slate-400">
            Average latency, P95, error rate, status code and uptime trends.
          </p>
        </div>
        <PerformancePanel metrics={metrics} />
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-7">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-100 md:text-xl">Latency Trend</h2>
              <p className="text-sm text-slate-400">Performance history per monitor.</p>
            </div>
            {chartMonitor ? (
              <p className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs text-slate-300">
                Source: {chartMonitor.name}
              </p>
            ) : null}
          </div>
          {chartMonitor ? (
            <LatencyChart data={chartMonitor.latencyLogs} />
          ) : (
            <div className="glass-panel rounded-2xl border-dashed p-6 text-sm text-slate-400">
              Add a monitor to start collecting latency data.
            </div>
          )}
        </div>

        <div className="space-y-3 lg:col-span-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-100 md:text-xl">
              Recent Incident Timeline
            </h2>
            <p className="text-sm text-slate-400">Auto-detected failures and recoveries.</p>
          </div>
          <IncidentTimeline incidents={incidents} />
        </div>
      </section>

      <AlertChannelSettings
        projects={projects}
        activeProjectId={activeProjectId}
        channels={channels}
      />
    </main>
  );
}
