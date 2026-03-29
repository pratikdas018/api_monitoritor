"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type ScannedFileRow = {
  _id?: string;
  path: string;
  snippet: string;
  matchedBy: string[];
  relevanceScore: number;
  language?: string | null;
};

type RepoFilePreviewRow = {
  path: string;
  type: string;
  size: number;
  sha: string;
  matchedBy?: string[];
};

type RepoScanPanelProps = {
  repositoryId: string;
  fullName: string;
  initialScannedFiles: ScannedFileRow[];
};

type InlineAnalysis = {
  reason: string;
  possibleCauses: string[];
  suggestedFixes: string[];
  possibleFile: string | null;
};

function truncateLine(text: string, max = 220) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}...`;
}

export function RepoScanPanel({ repositoryId, fullName, initialScannedFiles }: RepoScanPanelProps) {
  const [scannedFiles, setScannedFiles] = useState<ScannedFileRow[]>(initialScannedFiles);
  const [filePreview, setFilePreview] = useState<RepoFilePreviewRow[]>([]);
  const [scanLoading, setScanLoading] = useState(false);
  const [treeLoading, setTreeLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<InlineAnalysis | null>(null);
  const [form, setForm] = useState({
    endpoint: "/api/example",
    statusCode: "500",
    errorMessage: "Internal Server Error",
    responseBody: "{\"error\":\"Database connection failed\"}",
  });

  const topFiles = useMemo(() => scannedFiles.slice(0, 12), [scannedFiles]);

  const loadRepoFiles = useCallback(async () => {
    try {
      setTreeLoading(true);
      setError(null);
      const response = await fetch(`/api/github/repo-files?repositoryId=${repositoryId}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as {
        relevantFiles?: RepoFilePreviewRow[];
        error?: string;
      };
      if (!response.ok) {
        setError(payload.error ?? "Failed to load repository file tree.");
        return;
      }
      setFilePreview(payload.relevantFiles ?? []);
    } catch (fetchError) {
      console.error("[repo] failed to fetch file tree", fetchError);
      setError("Unable to load repository file tree.");
    } finally {
      setTreeLoading(false);
    }
  }, [repositoryId]);

  useEffect(() => {
    loadRepoFiles().catch(() => null);
  }, [loadRepoFiles]);

  async function handleScanRepository() {
    try {
      setScanLoading(true);
      setError(null);
      const response = await fetch("/api/scan-repo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ repositoryId }),
      });
      const payload = (await response.json()) as {
        files?: ScannedFileRow[];
        error?: string;
      };
      if (!response.ok) {
        setError(payload.error ?? "Repository scan failed.");
        return;
      }
      setScannedFiles(payload.files ?? []);
    } catch (scanError) {
      console.error("[repo] scan failed", scanError);
      setError("Unable to scan repository.");
    } finally {
      setScanLoading(false);
    }
  }

  async function handleAnalyzeFailure() {
    try {
      setAnalysisLoading(true);
      setError(null);
      setAnalysis(null);

      const response = await fetch("/api/analyze-error", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          repositoryId,
          endpoint: form.endpoint,
          statusCode: Number(form.statusCode),
          errorMessage: form.errorMessage,
          responseBody: form.responseBody,
        }),
      });
      const payload = (await response.json()) as {
        analysis?: InlineAnalysis;
        error?: string;
      };
      if (!response.ok) {
        setError(payload.error ?? "AI analysis failed.");
        return;
      }
      setAnalysis(payload.analysis ?? null);
    } catch (analysisError) {
      console.error("[repo] analysis failed", analysisError);
      setError("Unable to analyze API error.");
    } finally {
      setAnalysisLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="glass-card rounded-2xl border p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Repository Workspace</p>
            <h1 className="mt-1 text-2xl font-semibold text-text-primary">{fullName}</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Scan backend/API files and run AI-assisted failure debugging.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadRepoFiles().catch(() => null)}
              className="btn-ghost px-3 py-2 text-sm"
            >
              Refresh Tree
            </button>
            <button
              type="button"
              onClick={() => handleScanRepository().catch(() => null)}
              disabled={scanLoading}
              className="btn-primary px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {scanLoading ? "Scanning..." : "Scan Repository"}
            </button>
          </div>
        </div>
      </section>

      {error ? (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {error}
        </p>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="glass-card rounded-xl border p-4">
          <h2 className="text-lg font-semibold text-text-primary">Relevant File Tree</h2>
          <p className="mt-1 text-sm text-text-secondary">
            API-like files detected from folder patterns and backend naming hints.
          </p>

          {treeLoading ? (
            <div className="mt-4 space-y-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="skeleton h-4 rounded" />
              ))}
            </div>
          ) : (
            <div className="mt-4 max-h-80 space-y-1 overflow-auto rounded-lg border border-border-accent bg-surface-card/65 p-3">
              {filePreview.length === 0 ? (
                <p className="text-sm text-text-muted">No relevant files found in tree preview.</p>
              ) : (
                filePreview.map((file) => (
                  <p key={file.path} className="text-xs text-text-secondary">
                    {file.path}
                    {file.matchedBy?.length ? (
                      <span className="ml-2 text-[10px] uppercase tracking-[0.08em] text-text-muted">
                        ({file.matchedBy.join(",")})
                      </span>
                    ) : null}
                  </p>
                ))
              )}
            </div>
          )}
        </article>

        <article className="glass-card rounded-xl border p-4">
          <h2 className="text-lg font-semibold text-text-primary">Scanned Snippets</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Stored code snippets used for AI root-cause analysis.
          </p>
          <div className="mt-4 max-h-80 space-y-3 overflow-auto pr-1">
            {topFiles.length === 0 ? (
              <p className="text-sm text-text-muted">No scanned snippets yet. Run a repository scan.</p>
            ) : (
              topFiles.map((file) => (
                <div key={file.path} className="rounded-lg border border-border-accent bg-surface-card/65 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-semibold text-text-primary">{file.path}</p>
                    <span className="text-[11px] text-text-muted">score {file.relevanceScore}</span>
                  </div>
                  <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-[11px] text-text-secondary">
                    {file.snippet}
                  </p>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="glass-card rounded-xl border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">AI API Failure Debugger</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Send API failure data plus scanned code context to Gemini.
            </p>
          </div>
          <Link href="/analysis" className="text-sm text-accent-bright hover:text-accent-bright">
            View all analysis ?
          </Link>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="text-text-secondary">Endpoint</span>
            <input
              value={form.endpoint}
              onChange={(event) => setForm((prev) => ({ ...prev, endpoint: event.target.value }))}
              className="w-full px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-text-secondary">Status Code</span>
            <input
              value={form.statusCode}
              onChange={(event) => setForm((prev) => ({ ...prev, statusCode: event.target.value }))}
              className="w-full px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1 text-sm md:col-span-2">
            <span className="text-text-secondary">Error Message</span>
            <input
              value={form.errorMessage}
              onChange={(event) => setForm((prev) => ({ ...prev, errorMessage: event.target.value }))}
              className="w-full px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1 text-sm md:col-span-2">
            <span className="text-text-secondary">Response Body</span>
            <textarea
              value={form.responseBody}
              onChange={(event) => setForm((prev) => ({ ...prev, responseBody: event.target.value }))}
              className="min-h-[90px] w-full px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => handleAnalyzeFailure().catch(() => null)}
            disabled={analysisLoading}
            className="btn-primary px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {analysisLoading ? "Analyzing..." : "Analyze Failure"}
          </button>
        </div>

        {analysis ? (
          <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
            <p className="text-sm font-semibold text-rose-300">API Down</p>
            <p className="mt-2 text-sm text-text-secondary">
              <span className="font-semibold text-text-primary">Reason: </span>
              {analysis.reason}
            </p>
            <div className="mt-2">
              <p className="text-sm font-semibold text-text-primary">Possible Causes:</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-text-secondary">
                {analysis.possibleCauses.map((cause, index) => (
                  <li key={`${cause}-${index}`} className="break-words">
                    {truncateLine(cause)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-2">
              <p className="text-sm font-semibold text-text-primary">Suggested Fixes:</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-text-secondary">
                {analysis.suggestedFixes.map((fix, index) => (
                  <li key={`${fix}-${index}`} className="break-words">
                    {truncateLine(fix)}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-2 text-sm text-text-secondary">
              <span className="font-semibold text-text-primary">Possible File: </span>
              {analysis.possibleFile ?? "Unknown"}
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
