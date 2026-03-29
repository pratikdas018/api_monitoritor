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
    <div className="glass-card rounded-2xl border p-4">
      <div className="flex items-center gap-3">
        {user.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.photo}
            alt={user.name || "User profile"}
            className="h-12 w-12 rounded-full border border-accent/70 object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/70 bg-accent/15 text-accent-bright">
            U
          </div>
        )}

        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-text-primary">{user.name || "Unknown User"}</p>
          <p className="truncate text-sm text-text-secondary">{user.email || "No email"}</p>
          <p className="truncate text-xs text-text-muted">UID: {user.uid}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className="mt-4 rounded-btn border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:border-rose-400 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Please wait..." : "Logout"}
      </button>

      {error ? <p className="mt-2 text-sm text-rose-400">{error}</p> : null}
    </div>
  );
}
