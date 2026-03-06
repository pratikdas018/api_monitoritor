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

const cardAccents = [
  "from-emerald-400/25 to-emerald-500/5",
  "from-rose-400/25 to-rose-500/5",
  "from-sky-400/25 to-sky-500/5",
  "from-violet-400/25 to-violet-500/5",
  "from-amber-400/25 to-amber-500/5",
];

export function PlatformOverviewSection() {
  return (
    <section id="overview" className="space-y-5">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Platform Overview</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-100 sm:text-3xl">
          Built To Keep APIs Reliable Around The Clock
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">
          This platform continuously monitors APIs and services to ensure reliability with fast
          incident response and clear operational visibility.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {overviewCards.map((card, index) => (
          <article
            key={card.title}
            className="group relative overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/60 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-slate-500/80"
          >
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition duration-300 group-hover:opacity-100 ${cardAccents[index % cardAccents.length]}`}
            />
            <div className="relative">
              <h3 className="text-sm font-semibold text-slate-100">{card.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{card.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
