"use client";

import { useMemo, useState } from "react";
import { signIn, useSession } from "next-auth/react";

type SocialLoginCardProps = {
  nextPath: string;
  error?: string;
};

function normalizeNextPath(value: string) {
  if (!value || !value.startsWith("/")) return "/dashboard";
  return value;
}

function mapAuthError(error?: string) {
  if (!error) return null;

  switch (error) {
    case "AccessDenied":
      return "Access denied. Please use an allowed account and try again.";
    case "OAuthAccountNotLinked":
      return "That email is linked with a different provider. Try another sign-in method.";
    case "Configuration":
      return "Authentication is not configured correctly. Check your env variables.";
    default:
      return "Authentication failed. Please try again.";
  }
}

export function SocialLoginCard({ nextPath, error }: SocialLoginCardProps) {
  const safeNextPath = normalizeNextPath(nextPath);
  const [providerLoading, setProviderLoading] = useState<"google" | "github" | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const { status } = useSession();
  const mappedError = useMemo(() => mapAuthError(error), [error]);

  async function handleProviderLogin(provider: "google" | "github") {
    try {
      setLocalError(null);
      setProviderLoading(provider);
      await signIn(provider, { callbackUrl: safeNextPath });
    } catch (loginError) {
      console.error(`[auth] ${provider} sign-in failed`, loginError);
      setLocalError("Could not start sign-in. Please retry.");
      setProviderLoading(null);
    }
  }

  return (
    <section className="glass-panel rounded-3xl p-6 sm:p-8">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Authentication</p>
      <h1 className="mt-2 text-3xl font-semibold text-slate-100 sm:text-4xl">
        Sign In
      </h1>
      <p className="mt-2 text-sm text-slate-400">
        Continue with Google or GitHub to access your monitoring dashboard.
      </p>

      <div className="mt-6 grid gap-3">
        <button
          type="button"
          onClick={() => handleProviderLogin("google")}
          disabled={Boolean(providerLoading)}
          className="group flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300/70 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 bg-white text-[11px] font-bold text-slate-700 transition group-hover:border-slate-400">
            G
          </span>
          {providerLoading === "google" ? "Connecting to Google..." : "Continue with Google"}
        </button>

        <button
          type="button"
          onClick={() => handleProviderLogin("github")}
          disabled={Boolean(providerLoading)}
          className="group flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700/80 bg-slate-900/80 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-600 bg-slate-950 text-[11px] font-bold text-slate-200 transition group-hover:border-slate-400">
            GH
          </span>
          {providerLoading === "github" ? "Connecting to GitHub..." : "Continue with GitHub"}
        </button>
      </div>

      {status === "loading" ? (
        <p className="mt-4 text-xs text-slate-400">Checking existing session...</p>
      ) : null}

      {mappedError ? (
        <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {mappedError}
        </p>
      ) : null}

      {localError ? (
        <p className="mt-3 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          {localError}
        </p>
      ) : null}
    </section>
  );
}
