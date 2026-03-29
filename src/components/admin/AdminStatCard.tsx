type AdminStatCardProps = {
  label: string;
  value: string | number;
  tone?: "default" | "good" | "bad" | "warn";
};

const toneClassMap: Record<NonNullable<AdminStatCardProps["tone"]>, string> = {
  default: "border-border-accent bg-surface-card/70 text-text-primary",
  good: "border-emerald-500/40 bg-emerald-500/10 text-emerald-100",
  bad: "border-rose-500/40 bg-rose-500/10 text-rose-100",
  warn: "border-amber-500/40 bg-amber-500/10 text-amber-100",
};

export function AdminStatCard({ label, value, tone = "default" }: AdminStatCardProps) {
  return (
    <article className={`rounded-2xl border p-4 sm:p-5 ${toneClassMap[tone]}`}>
      <p className="text-[11px] uppercase tracking-[0.14em] opacity-80 sm:text-xs">{label}</p>
      <p className="mt-2 text-2xl font-bold sm:text-3xl">{value}</p>
    </article>
  );
}

