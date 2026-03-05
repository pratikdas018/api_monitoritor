const features = [
  "Real-time API monitoring",
  "Automated incident detection",
  "Multi-region health checks",
  "Alert notifications (Email / Slack)",
  "Public status page",
  "Uptime analytics",
];

export function FeaturesSection() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100 sm:text-3xl">Features</h2>
        <p className="mt-2 text-sm text-slate-400">
          Built for engineering teams that need reliable API visibility.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <article
            key={feature}
            className="card-interactive glass-panel rounded-2xl p-4 md:p-5"
          >
            <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-sky-400/40 bg-sky-500/10 text-sm font-bold text-sky-300">
              {index + 1}
            </div>
            <p className="text-sm font-medium text-slate-200">{feature}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
