"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { AdminApiRow } from "@/lib/adminQueries";

type AdminApisTableProps = {
  apis: AdminApiRow[];
};

export function AdminApisTable({ apis }: AdminApisTableProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const pauseApi = async (id: string) => {
    try {
      setPendingId(id);
      await fetch("/api/admin/apis", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, status: "paused" }),
      });
      router.refresh();
    } finally {
      setPendingId(null);
    }
  };

  const resumeApi = async (id: string) => {
    try {
      setPendingId(id);
      await fetch("/api/admin/apis", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, status: "unknown" }),
      });
      router.refresh();
    } finally {
      setPendingId(null);
    }
  };

  const deleteApi = async (id: string) => {
    try {
      setPendingId(id);
      await fetch(`/api/admin/apis?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setPendingId(null);
    }
  };

  if (!apis.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-700/80 bg-slate-900/50 p-6 text-sm text-slate-400">
        No API monitors found for this filter.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:hidden">
        {apis.map((api) => (
          <article key={api.id} className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
            <div className="space-y-1">
              <p className="text-base font-semibold text-slate-100">{api.name}</p>
              <p className="break-all text-xs text-slate-400">{api.url}</p>
              <p className="text-[11px] text-slate-500">Interval: {api.intervalMinutes}m</p>
              <Link
                href={`/admin/logs?monitorId=${encodeURIComponent(api.id)}`}
                className="text-xs font-medium text-sky-300 hover:text-sky-200"
              >
                View Logs
              </Link>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <p className="rounded-lg border border-slate-800/70 bg-slate-950/60 px-2 py-1.5 text-slate-300">
                Status: <span className="uppercase">{api.status}</span>
              </p>
              <p className="rounded-lg border border-slate-800/70 bg-slate-950/60 px-2 py-1.5 text-slate-300">
                Uptime: {api.uptimePercentage.toFixed(2)}%
              </p>
              <p className="rounded-lg border border-slate-800/70 bg-slate-950/60 px-2 py-1.5 text-slate-300">
                Latency: {api.responseTimeMs ?? "N/A"} ms
              </p>
              <p className="rounded-lg border border-slate-800/70 bg-slate-950/60 px-2 py-1.5 text-slate-300">
                Owner: {api.ownerEmail || "N/A"}
              </p>
              <p className="col-span-2 break-all rounded-lg border border-slate-800/70 bg-slate-950/60 px-2 py-1.5 text-slate-400">
                userId: {api.userId}
              </p>
              <p className="col-span-2 rounded-lg border border-slate-800/70 bg-slate-950/60 px-2 py-1.5 text-slate-400">
                Updated: {new Date(api.updatedAt).toLocaleString()}
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {api.status === "paused" ? (
                <button
                  type="button"
                  onClick={() => resumeApi(api.id)}
                  disabled={pendingId === api.id}
                  className="min-h-10 rounded-md border border-emerald-500/40 px-3 py-2 text-xs text-emerald-200 hover:border-emerald-400 disabled:opacity-60"
                >
                  Resume
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => pauseApi(api.id)}
                  disabled={pendingId === api.id}
                  className="min-h-10 rounded-md border border-amber-500/40 px-3 py-2 text-xs text-amber-200 hover:border-amber-400 disabled:opacity-60"
                >
                  Pause
                </button>
              )}
              <button
                type="button"
                onClick={() => deleteApi(api.id)}
                disabled={pendingId === api.id}
                className="min-h-10 rounded-md border border-rose-500/40 px-3 py-2 text-xs text-rose-200 hover:border-rose-400 disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-900/60 md:block">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800/80 text-left text-xs uppercase tracking-[0.08em] text-slate-400">
              <th className="px-4 py-3">API</th>
              <th className="hidden px-4 py-3 lg:table-cell">Owner</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Uptime</th>
              <th className="hidden px-4 py-3 xl:table-cell">Latency</th>
              <th className="hidden px-4 py-3 xl:table-cell">Updated</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {apis.map((api) => (
              <tr key={api.id} className="border-b border-slate-800/60 text-slate-200">
                <td className="px-4 py-3">
                  <p className="font-medium">{api.name}</p>
                  <p className="max-w-md truncate text-xs text-slate-400">{api.url}</p>
                  <p className="text-[11px] text-slate-500">Interval: {api.intervalMinutes}m</p>
                  <Link
                    href={`/admin/logs?monitorId=${encodeURIComponent(api.id)}`}
                    className="text-[11px] text-sky-300 hover:text-sky-200"
                  >
                    View Logs
                  </Link>
                </td>
                <td className="hidden px-4 py-3 text-xs lg:table-cell">
                  <p className="text-slate-300">{api.ownerEmail || "N/A"}</p>
                  <p className="max-w-[200px] truncate text-slate-500">{api.userId}</p>
                </td>
                <td className="px-4 py-3 uppercase">{api.status}</td>
                <td className="px-4 py-3">{api.uptimePercentage.toFixed(2)}%</td>
                <td className="hidden px-4 py-3 xl:table-cell">{api.responseTimeMs ?? "N/A"} ms</td>
                <td className="hidden px-4 py-3 text-xs text-slate-300 xl:table-cell">
                  {new Date(api.updatedAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {api.status === "paused" ? (
                      <button
                        type="button"
                        onClick={() => resumeApi(api.id)}
                        disabled={pendingId === api.id}
                        className="min-h-9 rounded-md border border-emerald-500/40 px-2.5 py-1.5 text-xs text-emerald-200 hover:border-emerald-400 disabled:opacity-60"
                      >
                        Resume
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => pauseApi(api.id)}
                        disabled={pendingId === api.id}
                        className="min-h-9 rounded-md border border-amber-500/40 px-2.5 py-1.5 text-xs text-amber-200 hover:border-amber-400 disabled:opacity-60"
                      >
                        Pause
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteApi(api.id)}
                      disabled={pendingId === api.id}
                      className="min-h-9 rounded-md border border-rose-500/40 px-2.5 py-1.5 text-xs text-rose-200 hover:border-rose-400 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
