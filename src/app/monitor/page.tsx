import { redirect } from "next/navigation";

import { connectToDatabase, hasMongoConfig } from "@/lib/db";
import { getSessionUserId } from "@/lib/serverSession";
import ApiLog from "@/models/ApiLog";

export const dynamic = "force-dynamic";

function latencyPercent(value: number | null) {
  if (value === null || Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(4, Math.round((value / 2000) * 100)));
}

export default async function MonitorPage() {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect("/login?next=/monitor");
  }

  if (!hasMongoConfig()) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-[1200px] px-4 py-6 sm:px-6 md:px-8 lg:px-10">
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          MongoDB is not configured. API monitor logs are unavailable.
        </p>
      </main>
    );
  }

  await connectToDatabase();
  const logs = await ApiLog.find({ userId }).sort({ timestamp: -1 }).limit(100).lean();

  const total = logs.length;
  const down = logs.filter((log) => log.state === "DOWN").length;
  const up = logs.filter((log) => log.state === "UP").length;

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1200px] space-y-5 px-4 py-6 sm:px-6 md:px-8 lg:px-10">
      <header className="glass-card rounded-2xl border p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-text-muted">API Health Monitor</p>
        <h1 className="mt-2 text-2xl font-semibold text-text-primary sm:text-3xl">API Status Board</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Real-time failure records captured from monitor checks and manual analysis requests.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <article className="glass-card rounded-xl border p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Total Logs</p>
          <p className="mt-2 text-2xl font-semibold accent-text">{total}</p>
        </article>
        <article className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-emerald-400">UP</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-300">{up}</p>
        </article>
        <article className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-rose-400">DOWN</p>
          <p className="mt-2 text-2xl font-semibold text-rose-300">{down}</p>
        </article>
      </section>

      <section className="glass-card rounded-xl border p-4">
        <h2 className="text-lg font-semibold text-text-primary">Recent API Failures</h2>
        <div className="mt-3 space-y-2">
          {logs.length === 0 ? (
            <p className="text-sm text-text-muted">No API logs captured yet.</p>
          ) : (
            logs.map((log) => {
              const isDown = log.state === "DOWN";
              const statusBadge = isDown
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
              const dotClass = isDown
                ? "bg-rose-400 shadow-glow-danger"
                : "bg-emerald-400 shadow-glow-success";

              return (
                <article
                  key={String(log._id)}
                  className="glass-card rounded-lg border p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full animate-glow-pulse ${dotClass}`} />
                      <p className="text-sm font-semibold text-text-primary">{log.endpoint}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadge}`}>
                      {log.state}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-text-secondary">
                    Status: {log.statusCode ?? "N/A"} • Region: {log.region ?? "N/A"} • {new Date(log.timestamp).toLocaleString()}
                  </p>

                  <div className="mt-2">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted/70">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${latencyPercent(log.latencyMs)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-text-muted">
                      Response time: {log.latencyMs ?? "N/A"} ms
                    </p>
                  </div>

                  <p className="mt-2 text-sm text-text-secondary">{log.errorMessage ?? "No error message"}</p>
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
