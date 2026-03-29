type StatCardProps = {
  label: string;
  value: string | number;
  tone?: "default" | "good" | "bad" | "warn" | "info";
};

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "border-border bg-black-900 text-text-primary",
  good: "border-emerald-500/35 bg-emerald-500/10 text-emerald-300",
  bad: "border-rose-500/35 bg-rose-500/10 text-rose-300",
  warn: "border-amber-500/35 bg-amber-500/10 text-amber-300",
  info: "border-accent/35 bg-accent/10 text-accent-bright",
};

const topLineClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "bg-accent",
  good: "bg-status-up",
  bad: "bg-status-down",
  warn: "bg-status-degraded",
  info: "bg-accent",
};

export function StatCard({ label, value, tone = "default" }: StatCardProps) {
  const metricClass = tone === "info" ? "accent-text" : "";

  return (
    <article className={`glass-card card-interactive relative overflow-hidden border p-4 md:p-5 ${toneClasses[tone]}`}>
      <span className={`absolute inset-x-0 top-0 h-px ${topLineClasses[tone]}`} />
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-text-muted">
        {label}
      </p>
      <p className={`mt-3 text-3xl font-semibold tracking-tight ${metricClass}`}>{value}</p>
    </article>
  );
}
