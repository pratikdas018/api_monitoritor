import { resolveIncidentAction } from "@/app/actions/monitorActions";
import { formatDateTime, formatDurationMs } from "@/lib/format";
import type { IncidentView } from "@/lib/queries";

type IncidentTimelineProps = {
  incidents: IncidentView[];
};

const incidentStatusStyles: Record<IncidentView["status"], string> = {
  open: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30",
  resolved: "bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30",
};

const eventStyles: Record<string, string> = {
  down: "text-rose-300 border-rose-400/40 bg-rose-500/10",
  retry: "text-amber-300 border-amber-400/40 bg-amber-500/10",
  recovered: "text-sky-300 border-sky-400/40 bg-sky-500/10",
};

export function IncidentTimeline({ incidents }: IncidentTimelineProps) {
  if (incidents.length === 0) {
    return (
      <section className="glass-panel rounded-2xl border-dashed p-8 text-center text-sm text-slate-400">
        No incidents recorded.
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {incidents.map((incident) => {
        const resolveAction = resolveIncidentAction.bind(null, incident.id);

        return (
          <article key={incident.id} className="glass-panel card-interactive rounded-2xl p-4 md:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-100">{incident.monitorName}</h3>
                <p className="text-sm text-slate-400">{incident.monitorUrl}</p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${incidentStatusStyles[incident.status]}`}
                >
                  {incident.status}
                </span>
                <span className="rounded-full border border-slate-700 bg-slate-900/70 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                  Failures: {incident.failureCount}
                </span>
                {incident.status === "open" ? (
                  <form action={resolveAction}>
                    <button
                      type="submit"
                      className="rounded-lg border border-slate-700/80 bg-slate-900/70 px-3 py-1.5 text-xs font-semibold text-slate-200 transition duration-200 hover:border-sky-400/70 hover:text-sky-200"
                    >
                      Resolve
                    </button>
                  </form>
                ) : null}
              </div>
            </div>

            <div className="mt-3 grid gap-2 text-sm text-slate-300 md:grid-cols-3">
              <p>
                <span className="text-slate-500">Started:</span> {formatDateTime(incident.startedAt)}
              </p>
              <p>
                <span className="text-slate-500">Resolved:</span> {formatDateTime(incident.resolvedAt)}
              </p>
              <p className="text-slate-400">Incident ID: {incident.id.slice(-8).toUpperCase()}</p>
            </div>

            <div className="relative mt-5 border-l border-slate-700/80 pl-4">
              {incident.events.map((event) => (
                <div key={`${incident.id}-${event.type}-${event.timestamp}`} className="relative mb-3 last:mb-0">
                  <span className="absolute -left-[22px] top-1.5 h-2.5 w-2.5 rounded-full bg-slate-300" />
                  <div
                    className={`rounded-xl border px-3 py-2 text-sm ${eventStyles[event.type] ?? "border-slate-700 bg-slate-900/70 text-slate-300"}`}
                  >
                    <p className="font-medium">
                      <span className="mr-2 text-[11px] uppercase tracking-wide opacity-80">
                        {event.type}
                      </span>
                      {event.message}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatDateTime(event.timestamp)} • status {event.statusCode ?? "N/A"} •{" "}
                      {formatDurationMs(event.responseTimeMs)}
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
