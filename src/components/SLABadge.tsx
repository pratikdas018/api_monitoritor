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
            ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
            : "border border-rose-500/30 bg-rose-500/20 text-rose-400";

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
