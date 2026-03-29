import Image from "next/image";

const highlights = [
  "Uptime tracking for every monitor",
  "Latency charts with trend analysis",
  "Incident logs and recovery timeline",
  "Service status and performance metrics",
];

export function DashboardPreviewSection() {
  return (
    <section id="dashboard-preview" className="space-y-5">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Dashboard Preview</p>
        <h2 className="mt-2 text-2xl font-semibold text-text-primary sm:text-3xl">
          One Console For Monitoring, Incidents, And Reliability Trends
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass-card rounded-2xl border p-5 lg:col-span-1">
          <ul className="space-y-3">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-text-secondary">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-accent-bright shadow-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="glass-card rounded-2xl border p-4 lg:col-span-2">
          <Image
            src="/dashboard-preview.svg"
            alt="Monitoring dashboard preview"
            width={1200}
            height={720}
            className="h-auto w-full rounded-xl border border-border-accent"
          />
        </div>
      </div>
    </section>
  );
}
