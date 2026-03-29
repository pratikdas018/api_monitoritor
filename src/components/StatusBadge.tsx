import type { MonitorView } from "@/lib/queries";

const statusStyles: Record<MonitorView["status"], string> = {
  up: "border border-status-up/35 bg-status-up/15 text-status-up",
  down: "border border-status-down/35 bg-status-down/15 text-status-down",
  paused: "border border-status-degraded/35 bg-status-degraded/15 text-status-degraded",
  unknown: "border border-border bg-black-800 text-text-muted",
};

const dotStyles: Record<MonitorView["status"], string> = {
  up: "bg-emerald-400 shadow-glow-success",
  down: "bg-rose-400 shadow-glow-danger",
  paused: "bg-amber-400",
  unknown: "bg-text-muted",
};

export function StatusBadge({ status }: { status: MonitorView["status"] }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors duration-200 ${statusStyles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full animate-glow-pulse ${dotStyles[status]}`} />
      {status}
    </span>
  );
}
