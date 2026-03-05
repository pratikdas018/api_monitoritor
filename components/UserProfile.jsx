"use client";

import { useState } from "react";

import { useAuth } from "../hooks/useAuth";

export default function UserProfile() {
  const { user, logout, loading } = useAuth();
  const [error, setError] = useState("");

  if (!user) return null;

  const handleLogout = async () => {
    setError("");

    try {
      await logout();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Logout failed.";
      setError(message);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4">
      <div className="flex items-center gap-3">
        {user.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.photo}
            alt={user.name || "User profile"}
            className="h-12 w-12 rounded-full border border-slate-600 object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-slate-300">
            U
          </div>
        )}

        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-slate-100">{user.name || "Unknown User"}</p>
          <p className="truncate text-sm text-slate-400">{user.email || "No email"}</p>
          <p className="truncate text-xs text-slate-500">UID: {user.uid}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className="mt-4 rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-rose-400 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Please wait..." : "Logout"}
      </button>

      {error ? <p className="mt-2 text-sm text-rose-400">{error}</p> : null}
    </div>
  );
}
