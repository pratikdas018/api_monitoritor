import { formatDateTime } from "@/lib/format";
import type { IncidentView } from "@/lib/queries";

type IncidentHistoryProps = {
  incidents: IncidentView[];
};

const incidentBadgeStyles: Record<IncidentView["status"], string> = {
  open: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30",
  resolved: "bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30",
};

const markerStyles: Record<IncidentView["status"], string> = {
  open: "bg-rose-400",
  resolved: "bg-sky-400",
};

export function IncidentHistory({ incidents }: IncidentHistoryProps) {
  if (incidents.length === 0) {
    return (
      <section className="glass-panel rounded-2xl border-dashed p-8 text-center text-sm text-slate-400">
        No recent incidents.
      </section>
    );
  }

  return (
    <section className="glass-panel rounded-2xl p-4 md:p-5">
      <div className="relative border-l border-slate-700/80 pl-4">
        {incidents.map((incident) => (
          <article key={incident.id} className="relative mb-4 last:mb-0">
            <span
              className={`absolute -left-[22px] top-2 h-2.5 w-2.5 rounded-full ${markerStyles[incident.status]}`}
            />
            <div className="rounded-xl border border-slate-700/70 bg-slate-900/65 p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">{incident.monitorName}</h3>
                  <p className="text-xs text-slate-400">{incident.monitorUrl}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${incidentBadgeStyles[incident.status]}`}
                >
                  {incident.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-300">
                {incident.lastError ?? "Incident automatically tracked by monitor worker."}
              </p>
              <dl className="mt-2 grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
                <div>
                  <dt className="text-slate-500">Started</dt>
                  <dd>{formatDateTime(incident.startedAt)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Resolved</dt>
                  <dd>{formatDateTime(incident.resolvedAt)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Failures</dt>
                  <dd>{incident.failureCount}</dd>
                </div>
              </dl>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
