import Image from "next/image";

export function DashboardPreviewSection() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100 sm:text-3xl">Dashboard Preview</h2>
        <p className="mt-2 text-sm text-slate-400">
          Observe latency charts, incident timeline, and uptime metrics in one workspace.
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-4">
        <Image
          src="/dashboard-preview.svg"
          alt="Monitoring dashboard"
          width={1200}
          height={720}
          className="h-auto w-full rounded-xl border border-slate-700/60"
        />
      </div>
    </section>
  );
}
