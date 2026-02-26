type StatCardProps = {
  label: string;
  value: string | number;
  tone?: "default" | "good" | "bad" | "warn" | "info";
};

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "border-white/10 bg-slate-900/55 text-slate-200",
  good: "border-emerald-400/35 bg-emerald-500/10 text-emerald-200",
  bad: "border-rose-400/35 bg-rose-500/10 text-rose-200",
  warn: "border-amber-400/35 bg-amber-500/10 text-amber-200",
  info: "border-sky-400/35 bg-sky-500/10 text-sky-200",
};

export function StatCard({ label, value, tone = "default" }: StatCardProps) {
  return (
    <article
      className={`card-interactive glass-panel rounded-2xl border p-4 md:p-5 ${toneClasses[tone]}`}
    >
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-50">{value}</p>
    </article>
  );
}
