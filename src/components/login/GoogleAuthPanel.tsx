"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useGoogleAuth } from "@/hooks/useGoogleAuth";

type GoogleAuthPanelProps = {
  nextPath: string;
};

export function GoogleAuthPanel({ nextPath }: GoogleAuthPanelProps) {
  const router = useRouter();
  const { user, loading, loginWithGoogle, logout } = useGoogleAuth();
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setError("");
    try {
      await loginWithGoogle();
      router.push(nextPath);
      router.refresh();
    } catch (loginError) {
      console.error("[auth] google login failed", loginError);
      setError("Google sign-in failed. Please try again.");
    }
  };

  const handleLogout = async () => {
    setError("");
    try {
      await logout();
    } catch (logoutError) {
      console.error("[auth] logout failed", logoutError);
      setError("Logout failed. Please try again.");
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-700/70 bg-slate-900/65 p-4">
      {user ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.photo || "https://placehold.co/48x48"}
              alt={user.name || "User"}
              className="h-12 w-12 rounded-full border border-slate-600 object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-100">{user.name || "Unknown User"}</p>
              <p className="truncate text-xs text-slate-400">{user.email || "No email"}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            className="w-full rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-rose-400 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Please wait..." : "Logout"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="group flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300/70 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white text-[11px] text-slate-700 transition group-hover:border-slate-400">
            G
          </span>
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>
      )}

      {error ? (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
