"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { AdminUserRow } from "@/lib/adminQueries";

type AdminUsersTableProps = {
  users: AdminUserRow[];
};

export function AdminUsersTable({ users }: AdminUsersTableProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const updateStatus = async (id: string, status: "active" | "suspended") => {
    try {
      setPendingId(id);
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      router.refresh();
    } finally {
      setPendingId(null);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      setPendingId(id);
      await fetch(`/api/admin/users?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      router.refresh();
    } finally {
      setPendingId(null);
    }
  };

  if (!users.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border-accent bg-surface-card/50 p-6 text-sm text-text-muted">
        No users found for this filter.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:hidden">
        {users.map((user) => (
          <article key={user.id} className="rounded-2xl border border-border bg-surface-card/60 p-4">
            <div className="space-y-1">
              <p className="text-base font-semibold text-text-primary">{user.name || "Unknown"}</p>
              <p className="break-all text-xs text-text-muted">{user.email}</p>
              {user.authId ? <p className="break-all text-[11px] text-text-muted">authId: {user.authId}</p> : null}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <p className="rounded-lg border border-border bg-surface-card/60 px-2 py-1.5 text-text-secondary">
                Role: <span className="uppercase">{user.role}</span>
              </p>
              <p className="rounded-lg border border-border bg-surface-card/60 px-2 py-1.5 text-text-secondary">
                Status: <span className="uppercase">{user.status}</span>
              </p>
              <p className="col-span-2 rounded-lg border border-border bg-surface-card/60 px-2 py-1.5 text-text-muted">
                Created: {new Date(user.createdAt).toLocaleString()}
              </p>
              <p className="col-span-2 rounded-lg border border-border bg-surface-card/60 px-2 py-1.5 text-text-muted">
                Last Login: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {user.status === "suspended" ? (
                <button
                  type="button"
                  onClick={() => updateStatus(user.id, "active")}
                  disabled={pendingId === user.id}
                  className="min-h-10 rounded-md border border-emerald-500/40 px-3 py-2 text-xs text-emerald-200 hover:border-emerald-400 disabled:opacity-60"
                >
                  Activate
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => updateStatus(user.id, "suspended")}
                  disabled={pendingId === user.id}
                  className="min-h-10 rounded-md border border-amber-500/40 px-3 py-2 text-xs text-amber-200 hover:border-amber-400 disabled:opacity-60"
                >
                  Suspend
                </button>
              )}
              <button
                type="button"
                onClick={() => deleteUser(user.id)}
                disabled={pendingId === user.id}
                className="min-h-10 rounded-md border border-rose-500/40 px-3 py-2 text-xs text-rose-200 hover:border-rose-400 disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-border bg-surface-card/60 md:block">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-[0.08em] text-text-muted">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="hidden px-4 py-3 lg:table-cell">Created</th>
              <th className="hidden px-4 py-3 xl:table-cell">Last Login</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border text-text-secondary">
                <td className="px-4 py-3">
                  <p className="font-medium">{user.name || "Unknown"}</p>
                  <p className="text-xs text-text-muted">{user.email}</p>
                  {user.authId ? <p className="text-[11px] text-text-muted">authId: {user.authId}</p> : null}
                </td>
                <td className="px-4 py-3 capitalize">{user.role}</td>
                <td className="px-4 py-3 capitalize">{user.status}</td>
                <td className="hidden px-4 py-3 text-xs text-text-secondary lg:table-cell">
                  {new Date(user.createdAt).toLocaleString()}
                </td>
                <td className="hidden px-4 py-3 text-xs text-text-secondary xl:table-cell">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {user.status === "suspended" ? (
                      <button
                        type="button"
                        onClick={() => updateStatus(user.id, "active")}
                        disabled={pendingId === user.id}
                        className="min-h-9 rounded-md border border-emerald-500/40 px-2.5 py-1.5 text-xs text-emerald-200 hover:border-emerald-400 disabled:opacity-60"
                      >
                        Activate
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => updateStatus(user.id, "suspended")}
                        disabled={pendingId === user.id}
                        className="min-h-9 rounded-md border border-amber-500/40 px-2.5 py-1.5 text-xs text-amber-200 hover:border-amber-400 disabled:opacity-60"
                      >
                        Suspend
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteUser(user.id)}
                      disabled={pendingId === user.id}
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


