import { redirect } from "next/navigation";

import { connectToDatabase, hasMongoConfig } from "@/lib/db";
import { getSessionUserId } from "@/lib/serverSession";
import ApiLog from "@/models/ApiLog";

export const dynamic = "force-dynamic";

export default async function MonitorPage() {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect("/login?next=/monitor");
  }

  if (!hasMongoConfig()) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-[1200px] px-4 py-6 sm:px-6 md:px-8 lg:px-10">
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
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
      <header className="glass-panel rounded-2xl p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">API Health Monitor</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-100 sm:text-3xl">API Status Board</h1>
        <p className="mt-1 text-sm text-slate-400">
          Real-time failure records captured from monitor checks and manual analysis requests.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Total Logs</p>
          <p className="mt-2 text-2xl font-semibold text-slate-100">{total}</p>
        </article>
        <article className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-emerald-200">UP</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-100">{up}</p>
        </article>
        <article className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-rose-200">DOWN</p>
          <p className="mt-2 text-2xl font-semibold text-rose-100">{down}</p>
        </article>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="text-lg font-semibold text-slate-100">Recent API Failures</h2>
        <div className="mt-3 space-y-2">
          {logs.length === 0 ? (
            <p className="text-sm text-slate-500">No API logs captured yet.</p>
          ) : (
            logs.map((log) => (
              <article key={String(log._id)} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-100">{log.endpoint}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      log.state === "DOWN"
                        ? "bg-rose-500/20 text-rose-300"
                        : "bg-emerald-500/20 text-emerald-300"
                    }`}
                  >
                    {log.state}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Status: {log.statusCode ?? "N/A"} • Region: {log.region ?? "N/A"} •{" "}
                  {new Date(log.timestamp).toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-slate-300">{log.errorMessage ?? "No error message"}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
