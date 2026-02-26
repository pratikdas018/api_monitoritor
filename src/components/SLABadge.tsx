import { SLA_TARGETS, getSLAStatus } from "@/lib/uptime";

type SLABadgeProps = {
  uptimePercentage: number;
};

export function SLABadge({ uptimePercentage }: SLABadgeProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {SLA_TARGETS.map((target) => {
        const status = getSLAStatus(uptimePercentage, target);
        const tone =
          status === "MET"
            ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30"
            : "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30";

        return (
          <span
            key={target}
            className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold tracking-wide ${tone}`}
            title={`SLA ${target}%: ${status}`}
            aria-label={`SLA ${target} percent ${status}`}
          >
            {target}% {status}
          </span>
        );
      })}
    </div>
  );
}
