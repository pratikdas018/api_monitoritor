"use client";

import { useFormState } from "react-dom";

import { createProjectAction } from "@/app/actions/monitorActions";
import { SubmitButton } from "@/components/SubmitButton";

export function ProjectCreateForm() {
  const initialState = { status: "idle", message: "" } as const;
  const [state, formAction] = useFormState(createProjectAction, initialState);

  return (
    <section className="glass-card rounded-2xl border p-4">
      <h3 className="text-sm font-semibold text-text-primary">Create Project</h3>
      <form action={formAction} className="mt-3 grid gap-2 md:grid-cols-3">
        <input
          name="name"
          required
          placeholder="Project name"
          className="px-3 py-2 text-sm"
        />
        <input
          name="description"
          placeholder="Description (optional)"
          className="px-3 py-2 text-sm"
        />
        <SubmitButton label="Add Project" pendingLabel="Adding..." />
      </form>
      <p
        className={`mt-2 text-xs ${
          state.status === "error"
            ? "text-rose-400"
            : state.status === "success"
              ? "text-emerald-400"
              : "text-text-muted"
        }`}
      >
        {state.message || "Use projects to separate production/staging monitor sets."}
      </p>
    </section>
  );
}
