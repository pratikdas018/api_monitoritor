"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type RepoRow = {
  _id: string;
  fullName: string;
  name: string;
  owner: string;
  description: string | null;
  htmlUrl: string;
  isPrivate: boolean;
  lastScannedAt: string | null;
  scannedFileCount: number;
};

export function RepoListClient() {
  const [repos, setRepos] = useState<RepoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadRepos() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/github/repos", { cache: "no-store" });
      const payload = (await response.json()) as { repos?: RepoRow[]; error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Failed to load repositories.");
        setRepos([]);
        return;
      }
      setRepos(payload.repos ?? []);
    } catch (fetchError) {
      console.error("[repos] load failed", fetchError);
      setError("Unable to load repositories.");
      setRepos([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRepos().catch(() => null);
  }, []);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-text-primary sm:text-3xl">GitHub Repositories</h1>
        <button
          type="button"
          onClick={() => loadRepos().catch(() => null)}
          className="btn-ghost px-3 py-2 text-sm"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="glass-card rounded-xl border p-4"
            >
              <div className="skeleton h-4 w-2/3 rounded" />
              <div className="skeleton mt-2 h-3 w-full rounded" />
              <div className="skeleton mt-2 h-3 w-4/5 rounded" />
            </div>
          ))}
        </div>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {error}
        </p>
      ) : null}

      {!loading && !error && repos.length === 0 ? (
        <p className="rounded-xl border border-border-accent bg-accent/10 px-4 py-3 text-sm text-text-secondary">
          No repositories found. Make sure you signed in with GitHub and granted repository scope.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {repos.map((repo) => (
          <article key={repo._id} className="glass-card card-interactive rounded-xl border p-4 hover:animate-float">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-text-primary">{repo.fullName}</h2>
                <p className="mt-1 text-xs text-text-muted">{repo.isPrivate ? "Private" : "Public"}</p>
              </div>
              <a
                href={repo.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-accent-bright hover:text-accent-bright"
              >
                Open
              </a>
            </div>

            <p className="mt-3 min-h-[40px] text-sm text-text-secondary">
              {repo.description || "No description provided."}
            </p>

            <div className="mt-3 flex items-center justify-between text-xs text-text-muted">
              <span>Scanned files: {repo.scannedFileCount ?? 0}</span>
              <span>
                {repo.lastScannedAt
                  ? `Last scan: ${new Date(repo.lastScannedAt).toLocaleString()}`
                  : "Not scanned yet"}
              </span>
            </div>

            <div className="mt-4">
              <Link
                href={`/repo/${repo._id}`}
                className="btn-primary inline-flex px-3 py-2 text-sm font-semibold"
              >
                Analyze Repository
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
