import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-700/70 bg-slate-900/50 p-6 md:p-10">
      <div className="absolute -top-24 right-0 h-56 w-56 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="absolute -bottom-24 left-0 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />

      <div className="relative grid items-center gap-8 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            SaaS API Reliability
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl">
            Distributed API Monitoring Platform
          </h1>
          <p className="mt-4 max-w-xl text-base text-slate-300 sm:text-lg">
            Monitor APIs, detect incidents, and receive alerts in real-time.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/login" className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
              Get Started
            </Link>
            <Link href="/status" className="btn-soft">
              View Status Page
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700/70 bg-slate-950/70 p-3 shadow-[0_20px_45px_-25px_rgba(56,189,248,0.5)]">
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
