import { formatDateTime } from "@/lib/format";
import type { IncidentView } from "@/lib/queries";

type IncidentHistoryProps = {
  incidents: IncidentView[];
};

const incidentBadgeStyles: Record<IncidentView["status"], string> = {
  open: "border border-rose-500/30 bg-rose-500/20 text-rose-400",
  resolved: "border border-emerald-500/30 bg-emerald-500/20 text-emerald-400",
};

const markerStyles: Record<IncidentView["status"], string> = {
  open: "bg-rose-400 shadow-glow-danger",
  resolved: "bg-emerald-400 shadow-glow-success",
};

export function IncidentHistory({ incidents }: IncidentHistoryProps) {
  if (incidents.length === 0) {
    return (
      <section className="glass-card rounded-2xl border border-dashed p-8 text-center text-sm text-text-muted">
        No recent incidents.
      </section>
    );
  }

  return (
    <section className="glass-card rounded-2xl border p-4 md:p-5">
      <div className="relative border-l border-border-accent pl-4">
        {incidents.map((incident) => (
          <article key={incident.id} className="relative mb-4 last:mb-0">
            <span
              className={`absolute -left-[22px] top-2 h-2.5 w-2.5 rounded-full animate-glow-pulse ${markerStyles[incident.status]}`}
            />
            <div className="glass-card rounded-xl border p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">{incident.monitorName}</h3>
                  <p className="text-xs text-text-secondary">{incident.monitorUrl}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${incidentBadgeStyles[incident.status]}`}
                >
                  {incident.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-text-secondary">
                {incident.lastError ?? "Incident automatically tracked by monitor worker."}
              </p>
              <dl className="mt-2 grid gap-2 text-xs text-text-secondary sm:grid-cols-3">
                <div>
                  <dt className="text-text-muted">Started</dt>
                  <dd>{formatDateTime(incident.startedAt)}</dd>
                </div>
                <div>
                  <dt className="text-text-muted">Resolved</dt>
                  <dd>{formatDateTime(incident.resolvedAt)}</dd>
                </div>
                <div>
                  <dt className="text-text-muted">Failures</dt>
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
