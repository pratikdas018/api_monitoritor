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
    <section className="glass-panel rounded-2xl p-4 md:p-5">
      <h3 className="text-base font-semibold text-slate-100">Alert Channels</h3>
      <p className="mt-1 text-sm text-slate-400">
        Configure Email, Slack, Discord, and Telegram notifications.
      </p>

      <form action={formAction} className="mt-4 grid gap-2 md:grid-cols-2 lg:grid-cols-4">
        <select
          name="projectId"
          defaultValue={activeProjectId ?? projects[0]?.id ?? ""}
          className="rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400/80 focus:ring-2 focus:ring-sky-500/30"
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
          className="rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400/80 focus:ring-2 focus:ring-sky-500/30"
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
          className="rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400/80 focus:ring-2 focus:ring-sky-500/30"
        />
        <input
          name="target"
          required
          placeholder="Webhook / emails / bot token"
          className="rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400/80 focus:ring-2 focus:ring-sky-500/30"
        />
        <input
          name="secondaryTarget"
          placeholder="Telegram chat ID (optional)"
          className="rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400/80 focus:ring-2 focus:ring-sky-500/30 lg:col-span-2"
        />
        <label className="inline-flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-2 text-xs text-slate-300">
          <input type="checkbox" name="onDown" defaultChecked className="accent-sky-400" />
          Down
        </label>
        <label className="inline-flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-2 text-xs text-slate-300">
          <input type="checkbox" name="onRecovery" defaultChecked className="accent-sky-400" />
          Recovery
        </label>
        <label className="inline-flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-2 text-xs text-slate-300">
          <input type="checkbox" name="onHighLatency" defaultChecked className="accent-sky-400" />
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
              : "text-slate-500"
        }`}
      >
        {state.message || "Channel target depends on type (webhook, recipients, bot token)."}
      </p>

      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {channels.map((channel) => (
          <article
            key={channel.id}
            className="rounded-xl border border-slate-700/70 bg-slate-900/65 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-100">{channel.name}</p>
              <span className="rounded-full border border-slate-600 px-2 py-0.5 text-[11px] uppercase text-slate-300">
                {channel.type}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Events:
              {channel.events.onDown ? " down" : ""}
              {channel.events.onRecovery ? " recovery" : ""}
              {channel.events.onHighLatency ? " latency" : ""}
            </p>
          </article>
        ))}
        {channels.length === 0 ? (
          <p className="text-sm text-slate-500">No channels configured yet.</p>
        ) : null}
      </div>
    </section>
  );
}
