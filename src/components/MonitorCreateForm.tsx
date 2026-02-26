"use client";

import { useFormState } from "react-dom";

import { createMonitorAction } from "@/app/actions/monitorActions";
import { SubmitButton } from "@/components/SubmitButton";

export function MonitorCreateForm() {
  const initialMonitorActionState = { status: "idle", message: "" } as const;
  const [state, formAction] = useFormState(createMonitorAction, initialMonitorActionState);

  return (
    <section className="glass-panel rounded-2xl p-5 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-50 md:text-xl">Create Monitor</h2>
          <p className="mt-1 text-sm text-slate-400">
            Add endpoint health checks with async queue execution.
          </p>
        </div>
      </div>

      <p className="mt-2 text-sm text-slate-400">
        Add an endpoint and start asynchronous checks immediately.
      </p>

      <form action={formAction} className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          name="name"
          placeholder="Name (optional)"
          className="rounded-xl border border-slate-700/80 bg-slate-950/80 px-3.5 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-400/80 focus:ring-2 focus:ring-sky-500/30"
        />
        <input
          required
          type="url"
          name="url"
          placeholder="https://api.example.com/health"
          className="rounded-xl border border-slate-700/80 bg-slate-950/80 px-3.5 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-400/80 focus:ring-2 focus:ring-sky-500/30 sm:col-span-2 lg:col-span-2"
        />
        <select
          name="intervalMinutes"
          defaultValue="1"
          className="rounded-xl border border-slate-700/80 bg-slate-950/80 px-3.5 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-400/80 focus:ring-2 focus:ring-sky-500/30"
        >
          <option value="1">1 min</option>
          <option value="5">5 min</option>
          <option value="10">10 min</option>
        </select>

        <input type="hidden" name="timeoutMs" value="10000" />

        <div className="sm:col-span-2 lg:col-span-4 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <p
            className={`text-sm ${
              state.status === "error"
                ? "text-rose-400"
                : state.status === "success"
                  ? "text-emerald-400"
                  : "text-slate-500"
            }`}
          >
            {state.message || "Checks run in the background worker queue."}
          </p>
          <SubmitButton label="Add Monitor" pendingLabel="Creating..." />
        </div>
      </form>
    </section>
  );
}
