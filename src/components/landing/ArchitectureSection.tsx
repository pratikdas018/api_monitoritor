const architecture = [
  { title: "Frontend", stack: "Next.js 14 + Tailwind CSS" },
  { title: "Backend", stack: "Node.js" },
  { title: "Queue System", stack: "Redis + BullMQ" },
  { title: "Database", stack: "MongoDB" },
  { title: "Monitoring Engine", stack: "Axios worker" },
];

export function ArchitectureSection() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100 sm:text-3xl">
          Platform Architecture
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Production-ready stack for scalable asynchronous monitoring.
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-5 md:p-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          {architecture.map((item) => (
            <article key={item.title} className="rounded-xl border border-slate-700/70 bg-slate-900/65 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{item.title}</p>
              <p className="mt-2 text-sm font-medium text-slate-100">{item.stack}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
