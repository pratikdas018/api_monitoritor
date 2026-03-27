import Link from "next/link";
import { redirect } from "next/navigation";

import { getSessionUserId } from "@/lib/serverSession";

export default async function ProfilePage() {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect("/login?next=/profile");
  }

  const initials = userId
    .split(/[\s._-]+/g)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-10">
      <section className="relative overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950/55 p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(56,189,248,0.18),transparent_38%),radial-gradient(circle_at_88%_82%,rgba(16,185,129,0.14),transparent_35%)]" />

        <div className="relative grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
          <aside className="flex h-full flex-col justify-between rounded-2xl border border-slate-800/70 bg-slate-950/55 p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Profile</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-100">Account</h1>
              <p className="mt-2 text-sm text-slate-400">
                Review your access details and return to monitoring operations.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-4 rounded-2xl border border-slate-700/80 bg-slate-900/60 p-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-400/40 bg-sky-500/10 text-lg font-semibold text-sky-200">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Session User</p>
                <p className="mt-1 truncate text-sm font-semibold text-slate-100">{userId}</p>
              </div>
            </div>
          </aside>

          <div className="space-y-4">
            <div className="glass-panel rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Identity</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-100">User ID</h2>
                </div>
                <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  Active Session
                </span>
              </div>
              <div className="mt-4 rounded-xl border border-slate-700/80 bg-slate-900/60 p-4">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Identifier</p>
                <p className="mt-2 break-all text-sm text-slate-200">{userId}</p>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-5">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Quick Actions</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link href="/dashboard" className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
                  Back to Dashboard
                </Link>
                <Link href="/status" className="btn-soft">
                  View Status Page
                </Link>
                <Link href="/incidents" className="btn-soft">
                  Incident Timeline
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
