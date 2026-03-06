import Link from "next/link";

import { GoogleAuthPanel } from "@/components/login/GoogleAuthPanel";
import { LoginForm } from "@/components/login/LoginForm";

type LoginPageProps = {
  searchParams?: {
    next?: string;
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const nextPath = searchParams?.next ?? "/dashboard";

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

            <p className="mt-6 text-xs text-slate-500">
              Need platform overview?{" "}
              <Link href="/" className="font-medium text-sky-300 hover:text-sky-200">
                Go to Landing Page
              </Link>
            </p>
          </aside>

          <section className="glass-panel rounded-2xl p-6 sm:p-7">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Login</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-100">API Monitor Platform</h2>
            <p className="mt-2 text-sm text-slate-400">
              Continue with email/password or your Google account.
            </p>

            <div className="mt-6">
              <LoginForm nextPath={nextPath} />
            </div>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-slate-700/70" />
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">or</span>
              <span className="h-px flex-1 bg-slate-700/70" />
            </div>

            <GoogleAuthPanel nextPath={nextPath} />
          </section>
        </div>
      </section>
    </main>
  );
}
