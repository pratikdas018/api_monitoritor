import { redirect } from "next/navigation";

import { SocialLoginCard } from "@/components/login/SocialLoginCard";
import { auth } from "@/lib/auth";

type LoginPageProps = {
  searchParams?: {
    next?: string;
    error?: string;
  };
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  if (session?.user) {
    redirect(searchParams?.next?.startsWith("/") ? searchParams.next : "/dashboard");
  }

  const nextPath = searchParams?.next ?? "/dashboard";
  const error = searchParams?.error;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
      <section className="relative overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950/55 p-4 sm:p-6 lg:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(56,189,248,0.18),transparent_38%),radial-gradient(circle_at_88%_82%,rgba(16,185,129,0.14),transparent_35%)]" />

        <div className="relative grid items-stretch gap-5 lg:grid-cols-2">
          <aside className="rounded-2xl border border-slate-800/70 bg-slate-950/55 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Secure Access</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
              Welcome Back
            </h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-400 sm:text-base">
              Sign in to manage monitors, incidents, uptime analytics, and real-time status telemetry.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <article className="rounded-xl border border-slate-700/70 bg-slate-900/65 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Monitoring</p>
                <p className="mt-2 text-sm font-medium text-slate-200">Distributed health checks</p>
              </article>
              <article className="rounded-xl border border-slate-700/70 bg-slate-900/65 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Incidents</p>
                <p className="mt-2 text-sm font-medium text-slate-200">Auto open and auto resolve</p>
              </article>
              <article className="rounded-xl border border-slate-700/70 bg-slate-900/65 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Alerts</p>
                <p className="mt-2 text-sm font-medium text-slate-200">Email and channel notifications</p>
              </article>
              <article className="rounded-xl border border-slate-700/70 bg-slate-900/65 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Analytics</p>
                <p className="mt-2 text-sm font-medium text-slate-200">Latency and uptime insights</p>
              </article>
            </div>
          </aside>

          <SocialLoginCard nextPath={nextPath} error={error} />
        </div>
      </section>
    </main>
  );
}
