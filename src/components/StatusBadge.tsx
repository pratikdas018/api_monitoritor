import type { MonitorView } from "@/lib/queries";

const statusStyles: Record<MonitorView["status"], string> = {
  up: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/40",
  down: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/40 motion-safe:animate-pulse",
  paused: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/40",
  unknown: "bg-slate-500/20 text-slate-300 ring-1 ring-slate-400/40",
};

const dotStyles: Record<MonitorView["status"], string> = {
  up: "bg-emerald-400",
  down: "bg-rose-400",
  paused: "bg-amber-400",
  unknown: "bg-slate-400",
};

export function StatusBadge({ status }: { status: MonitorView["status"] }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors duration-200 ${statusStyles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[status]}`} />
      {status}
    </span>
  );
}
