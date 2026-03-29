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
    <section className="glass-card rounded-3xl border p-6 sm:p-8">
      <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Authentication</p>
      <h1 className="mt-2 text-3xl font-semibold text-text-primary sm:text-4xl">
        Sign In
      </h1>
      <p className="mt-2 text-sm text-text-secondary">
        Continue with Google or GitHub to access your monitoring dashboard.
      </p>

      <div className="mt-6 grid gap-3">
        <button
          type="button"
          onClick={() => handleProviderLogin("google")}
          disabled={Boolean(providerLoading)}
          className="btn-ghost group flex w-full items-center justify-center gap-3 px-4 py-3 text-sm font-semibold text-text-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-accent/60 bg-accent/15 text-[11px] font-bold text-accent-bright transition">
            G
          </span>
          {providerLoading === "google" ? "Connecting to Google..." : "Continue with Google"}
        </button>

        <button
          type="button"
          onClick={() => handleProviderLogin("github")}
          disabled={Boolean(providerLoading)}
          className="btn-ghost group flex w-full items-center justify-center gap-3 px-4 py-3 text-sm font-semibold text-text-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-accent/60 bg-accent/15 text-[11px] font-bold text-accent-bright transition">
            GH
          </span>
          {providerLoading === "github" ? "Connecting to GitHub..." : "Continue with GitHub"}
        </button>
      </div>

      {status === "loading" ? (
        <p className="mt-4 text-xs text-text-muted">Checking existing session...</p>
      ) : null}

      {mappedError ? (
        <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {mappedError}
        </p>
      ) : null}

      {localError ? (
        <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          {localError}
        </p>
      ) : null}
    </section>
  );
}
