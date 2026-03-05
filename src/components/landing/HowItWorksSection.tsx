const steps = [
  "Add API endpoint",
  "Background worker monitors API",
  "System detects failure",
  "Incident created and alert sent",
];

export function HowItWorksSection() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100 sm:text-3xl">How It Works</h2>
        <p className="mt-2 text-sm text-slate-400">
          Monitoring pipeline from endpoint onboarding to incident response.
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-5 md:p-6">
        <ol className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step} className="relative rounded-xl border border-slate-700/70 bg-slate-900/60 p-4">
              <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/20 text-xs font-semibold text-sky-300">
                {index + 1}
              </span>
              <p className="text-sm text-slate-200">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
