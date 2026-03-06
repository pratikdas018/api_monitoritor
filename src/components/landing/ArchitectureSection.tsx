const architecture = [
  { layer: "Frontend", stack: "Next.js 14", detail: "App Router UI with responsive SaaS components." },
  { layer: "Backend", stack: "Node.js", detail: "Server actions and APIs for monitoring operations." },
  { layer: "Queue", stack: "Redis + BullMQ", detail: "Asynchronous job orchestration for background checks." },
  { layer: "Database", stack: "MongoDB", detail: "Stores monitors, incidents, and historical telemetry." },
  { layer: "Monitoring Engine", stack: "Axios health checks", detail: "Performs endpoint checks and latency capture." },
];

export function ArchitectureSection() {
  return (
    <section id="architecture" className="space-y-5">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Architecture</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-100 sm:text-3xl">
          Technology Stack Powering The Platform
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {architecture.map((item) => (
          <article
            key={item.layer}
            className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-4 transition duration-300 hover:border-slate-500/80"
          >
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{item.layer}</p>
            <p className="mt-2 text-sm font-semibold text-slate-100">{item.stack}</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
