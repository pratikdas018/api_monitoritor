"use client";

import { useFormState } from "react-dom";

import { createAlertChannelAction } from "@/app/actions/monitorActions";
import { SubmitButton } from "@/components/SubmitButton";
import type { AlertChannelView, ProjectView } from "@/lib/queries";

type AlertChannelSettingsProps = {
  projects: ProjectView[];
  activeProjectId: string | null;
  channels: AlertChannelView[];
};

export function AlertChannelSettings({
  projects,
  activeProjectId,
  channels,
}: AlertChannelSettingsProps) {
  const initialState = { status: "idle", message: "" } as const;
  const [state, formAction] = useFormState(createAlertChannelAction, initialState);

  return (
    <section className="glass-card rounded-2xl border p-4 md:p-5">
      <h3 className="text-base font-semibold text-text-primary">Alert Channels</h3>
      <p className="mt-1 text-sm text-text-secondary">
        Configure Email, Slack, Discord, and Telegram notifications.
      </p>

      <form action={formAction} className="mt-4 grid gap-2 md:grid-cols-2 lg:grid-cols-4">
        <select
          name="projectId"
          defaultValue={activeProjectId ?? projects[0]?.id ?? ""}
          className="px-3 py-2 text-sm"
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <select
          name="type"
          defaultValue="email"
          className="px-3 py-2 text-sm"
        >
          <option value="email">Email</option>
          <option value="slack">Slack</option>
          <option value="discord">Discord</option>
          <option value="telegram">Telegram</option>
        </select>
        <input
          name="name"
          required
          placeholder="Channel name"
          className="px-3 py-2 text-sm"
        />
        <input
          name="target"
          required
          placeholder="Webhook / emails / bot token"
          className="px-3 py-2 text-sm"
        />
        <input
          name="secondaryTarget"
          placeholder="Telegram chat ID (optional)"
          className="px-3 py-2 text-sm lg:col-span-2"
        />
        <label className="inline-flex items-center gap-2 rounded-btn border border-border-accent bg-accent/10 px-3 py-2 text-xs text-text-secondary">
          <input type="checkbox" name="onDown" defaultChecked className="accent-accent" />
          Down
        </label>
        <label className="inline-flex items-center gap-2 rounded-btn border border-border-accent bg-accent/10 px-3 py-2 text-xs text-text-secondary">
          <input type="checkbox" name="onRecovery" defaultChecked className="accent-accent" />
          Recovery
        </label>
        <label className="inline-flex items-center gap-2 rounded-btn border border-border-accent bg-accent/10 px-3 py-2 text-xs text-text-secondary">
          <input type="checkbox" name="onHighLatency" defaultChecked className="accent-accent" />
          High latency
        </label>
        <div className="lg:col-span-4">
          <SubmitButton label="Save Channel" pendingLabel="Saving..." />
        </div>
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
        {state.message || "Channel target depends on type (webhook, recipients, bot token)."}
      </p>

      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {channels.map((channel) => (
          <article
            key={channel.id}
            className="glass-card rounded-xl border p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-text-primary">{channel.name}</p>
              <span className="rounded-full border border-border-accent bg-accent/10 px-2 py-0.5 text-[11px] uppercase text-text-secondary">
                {channel.type}
              </span>
            </div>
            <p className="mt-2 text-xs text-text-secondary">
              Events:
              {channel.events.onDown ? " down" : ""}
              {channel.events.onRecovery ? " recovery" : ""}
              {channel.events.onHighLatency ? " latency" : ""}
            </p>
          </article>
        ))}
        {channels.length === 0 ? (
          <p className="text-sm text-text-muted">No channels configured yet.</p>
        ) : null}
      </div>
    </section>
  );
}
