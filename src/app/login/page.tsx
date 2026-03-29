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
    <main className="mx-auto w-full max-w-6xl bg-black px-4 py-8 sm:px-6 lg:px-10">
      <section className="relative overflow-hidden rounded-3xl border border-border-accent bg-surface-card/55 p-4 backdrop-blur-xl sm:p-6 lg:p-8">
        <div className="pointer-events-none absolute inset-0 bg-transparent" />

        <div className="relative grid items-stretch gap-5 lg:grid-cols-2">
          <aside className="glass-card rounded-2xl border p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Secure Access</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
              Welcome Back
            </h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-text-secondary sm:text-base">
              Sign in to manage monitors, incidents, uptime analytics, and real-time status telemetry.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <article className="glass-card rounded-xl border p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-text-muted">Monitoring</p>
                <p className="mt-2 text-sm font-medium text-text-secondary">Distributed health checks</p>
              </article>
              <article className="glass-card rounded-xl border p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-text-muted">Incidents</p>
                <p className="mt-2 text-sm font-medium text-text-secondary">Auto open and auto resolve</p>
              </article>
              <article className="glass-card rounded-xl border p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-text-muted">Alerts</p>
                <p className="mt-2 text-sm font-medium text-text-secondary">Email and channel notifications</p>
              </article>
              <article className="glass-card rounded-xl border p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-text-muted">Analytics</p>
                <p className="mt-2 text-sm font-medium text-text-secondary">Latency and uptime insights</p>
              </article>
            </div>
          </aside>

          <SocialLoginCard nextPath={nextPath} error={error} />
        </div>
      </section>
    </main>
  );
}
