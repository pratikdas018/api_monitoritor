const workflowSteps = [
  {
    title: "Step 1",
    heading: "Add API endpoint",
    description: "Configure your API URL and monitoring interval from the dashboard.",
  },
  {
    title: "Step 2",
    heading: "Background worker checks API health",
    description: "BullMQ workers run checks asynchronously without blocking the UI.",
  },
  {
    title: "Step 3",
    heading: "System detects failures",
    description: "Consecutive failures open incidents and capture error details.",
  },
  {
    title: "Step 4",
    heading: "Alerts are sent automatically",
    description: "Notification channels trigger down and recovery alerts for rapid response.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="space-y-5">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">How It Works</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-100 sm:text-3xl">
          Monitoring Workflow From Check To Response
        </h2>
      </div>

      <ol className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {workflowSteps.map((step, index) => (
          <li
            key={step.heading}
            className="relative overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/60 p-5"
          >
            {index < workflowSteps.length - 1 ? (
              <div className="pointer-events-none absolute right-0 top-1/2 hidden h-px w-10 translate-x-1/2 bg-slate-600 xl:block" />
            ) : null}
            <span className="inline-flex rounded-full border border-sky-400/40 bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-sky-300">
              {step.title}
            </span>
            <h3 className="mt-3 text-base font-semibold text-slate-100">{step.heading}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
