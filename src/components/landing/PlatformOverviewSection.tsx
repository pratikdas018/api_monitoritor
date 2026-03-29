const overviewCards = [
  {
    title: "Real-time uptime monitoring",
    description: "Continuously checks endpoint health and availability across your services.",
  },
  {
    title: "Automatic incident detection",
    description: "Opens incidents on repeated failures and keeps the timeline updated.",
  },
  {
    title: "Alert notifications",
    description: "Delivers actionable alerts to email and collaboration channels.",
  },
  {
    title: "Performance analytics",
    description: "Tracks latency and response trends for operational insights.",
  },
  {
    title: "Public service status page",
    description: "Publishes transparent service health for customers and stakeholders.",
  },
];

export function PlatformOverviewSection() {
  return (
    <section id="overview" className="space-y-5">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Platform Overview</p>
        <h2 className="mt-2 text-2xl font-semibold text-text-primary sm:text-3xl">
          Built To Keep APIs Reliable Around The Clock
        </h2>
        <p className="mt-3 text-sm leading-6 text-text-secondary sm:text-base">
          This platform continuously monitors APIs and services to ensure reliability with fast
          incident response and clear operational visibility.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {overviewCards.map((card) => (
          <article
            key={card.title}
            className="glass-card group relative overflow-hidden rounded-2xl border p-4 transition duration-300 hover:-translate-y-0.5 hover:border-accent/60"
          >
            <div className="pointer-events-none absolute inset-0 bg-accent/10 opacity-0 transition duration-300 group-hover:opacity-100" />
            <div className="relative">
              <h3 className="text-sm font-semibold text-text-primary">{card.title}</h3>
              <p className="mt-2 text-sm text-text-secondary">{card.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
