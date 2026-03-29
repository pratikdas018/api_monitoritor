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
      <section className="relative overflow-hidden rounded-3xl border border-border-accent bg-surface-card/55 p-6 backdrop-blur-xl sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-transparent" />

        <div className="relative grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
          <aside className="glass-card flex h-full flex-col justify-between rounded-2xl border p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Profile</p>
              <h1 className="mt-2 text-3xl font-semibold text-text-primary">Account</h1>
              <p className="mt-2 text-sm text-text-secondary">
                Review your access details and return to monitoring operations.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-4 rounded-2xl border border-border-accent bg-accent/10 p-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/70 bg-accent/15 text-lg font-semibold text-accent-bright shadow-accent">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.14em] text-text-muted">Session User</p>
                <p className="mt-1 truncate text-sm font-semibold text-text-primary">{userId}</p>
              </div>
            </div>
          </aside>

          <div className="space-y-4">
            <div className="glass-card rounded-2xl border p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Identity</p>
                  <h2 className="mt-2 text-xl font-semibold text-text-primary">User ID</h2>
                </div>
                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                  Active Session
                </span>
              </div>
              <div className="mt-4 rounded-xl border border-border-accent bg-accent/10 p-4">
                <p className="text-xs uppercase tracking-[0.1em] text-text-muted">Identifier</p>
                <p className="mt-2 break-all text-sm text-text-secondary">{userId}</p>
              </div>
            </div>

            <div className="glass-card rounded-2xl border p-5">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Quick Actions</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link href="/dashboard" className="btn-primary px-5 py-2.5 text-sm font-semibold">
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
