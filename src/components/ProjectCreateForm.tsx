"use client";

import { useFormState } from "react-dom";

import { createProjectAction } from "@/app/actions/monitorActions";
import { SubmitButton } from "@/components/SubmitButton";

export function ProjectCreateForm() {
  const initialState = { status: "idle", message: "" } as const;
  const [state, formAction] = useFormState(createProjectAction, initialState);

  return (
    <section className="glass-panel rounded-2xl p-4">
      <h3 className="text-sm font-semibold text-slate-100">Create Project</h3>
      <form action={formAction} className="mt-3 grid gap-2 md:grid-cols-3">
        <input
          name="name"
          required
          placeholder="Project name"
          className="rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400/80 focus:ring-2 focus:ring-sky-500/30"
        />
        <input
          name="description"
          placeholder="Description (optional)"
          className="rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400/80 focus:ring-2 focus:ring-sky-500/30"
        />
        <SubmitButton label="Add Project" pendingLabel="Adding..." />
      </form>
      <p
        className={`mt-2 text-xs ${
          state.status === "error"
            ? "text-rose-400"
            : state.status === "success"
              ? "text-emerald-400"
              : "text-slate-500"
        }`}
      >
        {state.message || "Use projects to separate production/staging monitor sets."}
      </p>
    </section>
  );
}
