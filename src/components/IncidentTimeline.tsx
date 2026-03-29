import { resolveIncidentAction } from "@/app/actions/monitorActions";
import { formatDateTime, formatDurationMs } from "@/lib/format";
import type { IncidentView } from "@/lib/queries";

type IncidentTimelineProps = {
  incidents: IncidentView[];
};

const incidentStatusStyles: Record<IncidentView["status"], string> = {
  open: "border border-rose-500/30 bg-rose-500/20 text-rose-400",
  resolved: "border border-emerald-500/30 bg-emerald-500/20 text-emerald-400",
};

const incidentCardStyles: Record<IncidentView["status"], string> = {
  open: "border-l-4 border-l-rose-500 bg-rose-500/5",
  resolved: "border-l-4 border-l-emerald-500 bg-emerald-500/5",
};

const eventStyles: Record<string, string> = {
  down: "border-rose-500/40 bg-rose-500/10 text-rose-300",
  retry: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  recovered: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
};

const dotStyles: Record<string, string> = {
  down: "bg-rose-400 shadow-glow-danger",
  retry: "bg-amber-400",
  recovered: "bg-emerald-400 shadow-glow-success",
};

export function IncidentTimeline({ incidents }: IncidentTimelineProps) {
  if (incidents.length === 0) {
    return (
      <section className="glass-card rounded-2xl border border-dashed p-8 text-center text-sm text-text-muted">
        No incidents recorded.
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {incidents.map((incident) => {
        const resolveAction = resolveIncidentAction.bind(null, incident.id);

        return (
          <article
            key={incident.id}
            className={`glass-card card-interactive rounded-2xl border p-4 md:p-5 ${incidentCardStyles[incident.status]}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-text-primary">{incident.monitorName}</h3>
                <p className="text-sm text-text-secondary">{incident.monitorUrl}</p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${incidentStatusStyles[incident.status]}`}
                >
                  {incident.status}
                </span>
                <span className="rounded-full border border-border-accent bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-text-secondary">
                  Failures: {incident.failureCount}
                </span>
                {incident.status === "open" ? (
                  <form action={resolveAction}>
                    <button
                      type="submit"
                      className="rounded-btn border border-border-accent bg-accent/10 px-3 py-1.5 text-xs font-semibold text-text-secondary transition duration-200 hover:text-text-primary"
                    >
                      Resolve
                    </button>
                  </form>
                ) : null}
              </div>
            </div>

            <div className="mt-3 grid gap-2 text-sm text-text-secondary md:grid-cols-3">
              <p>
                <span className="text-text-muted">Started:</span> {formatDateTime(incident.startedAt)}
              </p>
              <p>
                <span className="text-text-muted">Resolved:</span> {formatDateTime(incident.resolvedAt)}
              </p>
              <p className="text-text-muted">Incident ID: {incident.id.slice(-8).toUpperCase()}</p>
            </div>

            <div className="relative mt-5 border-l border-border-accent pl-4">
              {incident.events.map((event) => (
                <div key={`${incident.id}-${event.type}-${event.timestamp}`} className="relative mb-3 last:mb-0">
                  <span
                    className={`absolute -left-[22px] top-1.5 h-2.5 w-2.5 rounded-full animate-glow-pulse ${dotStyles[event.type] ?? "bg-text-muted"}`}
                  />
                  <div
                    className={`rounded-xl border px-3 py-2 text-sm ${eventStyles[event.type] ?? "border-border-accent bg-accent/10 text-text-secondary"}`}
                  >
                    <p className="font-medium">
                      <span className="mr-2 text-[11px] uppercase tracking-wide opacity-80">
                        {event.type}
                      </span>
                      {event.message}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      {formatDateTime(event.timestamp)} - status {event.statusCode ?? "N/A"} - {formatDurationMs(event.responseTimeMs)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        );
      })}
    </section>
  );
}

