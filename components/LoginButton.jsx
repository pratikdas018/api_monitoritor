"use client";

import { useState } from "react";

import { useAuth } from "../hooks/useAuth";

export default function LoginButton() {
  const { loginWithGoogle, loading } = useAuth();
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    try {
      await loginWithGoogle();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to sign in with Google.";
      setError(message);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleLogin}
        disabled={loading}
        className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign in with Google"}
      </button>
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
    </div>
  );
}
