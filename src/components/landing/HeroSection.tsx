import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border-accent bg-black p-6 backdrop-blur-xl md:p-10">
      <div className="absolute inset-0 bg-transparent" />

      <div className="relative grid items-center gap-8 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-text-muted">
            SaaS API Reliability
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
            Distributed API Monitoring Platform
          </h1>
          <p className="mt-4 max-w-xl text-base text-text-secondary sm:text-lg">
            Monitor APIs, detect incidents, track uptime, and receive alerts automatically.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="btn-primary px-5 py-2.5 text-sm font-semibold"
            >
              Get Started
            </Link>
            <Link href="/status" className="btn-soft">
              View Status Page
            </Link>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 text-xs text-text-secondary">
            <span className="rounded-full border border-border-bright bg-black-900 px-2.5 py-1">
              Real-time Monitoring
            </span>
            <span className="rounded-full border border-border-bright bg-black-900 px-2.5 py-1">
              Incident Response
            </span>
            <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1">
              Public Status
            </span>
          </div>
        </div>

        <div className="glass-card rounded-2xl border p-3 shadow-accent">
          <Image
            src="/dashboard-preview.svg"
            alt="Dashboard preview"
            width={960}
            height={620}
            className="h-auto w-full rounded-xl"
            priority
          />
        </div>
      </div>
    </section>
  );
}
