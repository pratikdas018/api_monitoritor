import type { ReactNode } from "react";

type FeatureCard = {
  title: string;
  description: string;
  icon: ReactNode;
};

const features: FeatureCard[] = [
  {
    title: "API Monitoring",
    description: "Track endpoint health, response codes, and latency with scheduled checks.",
    icon: "01",
  },
  {
    title: "Incident Detection",
    description: "Detects repeated failures and opens incidents with timeline context.",
    icon: "02",
  },
  {
    title: "Auto Recovery Detection",
    description: "Automatically resolves incidents when services return to healthy state.",
    icon: "03",
  },
  {
    title: "Alert Notifications",
    description: "Sends operational alerts to email and external channels for quick response.",
    icon: "04",
  },
  {
    title: "Multi-region Monitoring",
    description: "Checks API health from multiple regions for better reliability visibility.",
    icon: "05",
  },
  {
    title: "Public Status Page",
    description: "Shares uptime transparency and incident updates with users and stakeholders.",
    icon: "06",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="space-y-5">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Features</p>
        <h2 className="mt-2 text-2xl font-semibold text-text-primary sm:text-3xl">
          Monitoring Features Designed For Production Operations
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="glass-card group relative overflow-hidden rounded-2xl border p-5 transition duration-300 hover:-translate-y-1"
          >
            <div className="pointer-events-none absolute inset-0 bg-accent/10 opacity-0 transition duration-300 group-hover:opacity-100" />
            <div className="relative">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border-accent bg-accent/10 text-sm font-semibold text-accent-bright shadow-accent">
                {feature.icon}
              </div>
              <h3 className="mt-3 text-base font-semibold text-text-primary">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{feature.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
