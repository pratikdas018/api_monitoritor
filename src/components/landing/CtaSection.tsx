import Link from "next/link";

export function CtaSection() {
  return (
    <section className="glass-panel rounded-2xl p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-100 sm:text-3xl">
            Start Monitoring with Confidence
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Launch API checks, detect incidents early, and keep services reliable.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/login" className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
            Login
          </Link>
          <Link href="/login" className="btn-soft">
            Start Monitoring APIs
          </Link>
        </div>
      </div>
    </section>
  );
}
