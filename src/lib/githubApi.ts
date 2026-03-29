import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { resolveAuthSecret } from "@/lib/authSecret";
import { getCachedFileContent, getCachedRepoTree, setCachedFileContent, setCachedRepoTree } from "@/lib/githubCache";

const GITHUB_API_BASE = "https://api.github.com";
const MAX_FILE_BYTES = 120_000;

export type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  private: boolean;
  default_branch: string;
  owner: {
    login: string;
  };
};

export type GitHubTreeEntry = {
  path: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
  url: string;
};

type GitHubApiErrorCode = "RATE_LIMIT" | "NOT_FOUND" | "UNAUTHORIZED" | "UNKNOWN";

export class GitHubApiError extends Error {
  code: GitHubApiErrorCode;
  status: number;

  constructor(message: string, code: GitHubApiErrorCode, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export async function getGitHubAccessToken(request: NextRequest) {
  const secret = resolveAuthSecret() || undefined;
  const secureCookie = process.env.NODE_ENV === "production";
  const authjsCookieName = secureCookie ? "__Secure-authjs.session-token" : "authjs.session-token";
  const nextAuthCookieName = secureCookie
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

  let jwt = await getToken({
    req: request,
    secret,
    secureCookie,
  });

  // Production proxies can interfere with automatic cookie-name detection.
  if (!jwt) {
    jwt = await getToken({
      req: request,
      secret,
      secureCookie,
      cookieName: authjsCookieName,
    });
  }
  if (!jwt) {
    jwt = await getToken({
      req: request,
      secret,
      secureCookie,
      cookieName: nextAuthCookieName,
    });
  }

  const accessToken =
    typeof jwt?.githubAccessToken === "string" && jwt.githubAccessToken.trim()
      ? jwt.githubAccessToken
      : null;

  return accessToken;
}

async function githubRequest<T>(path: string, accessToken: string): Promise<T> {
  const response = await fetch(`${GITHUB_API_BASE}${path}`, {
    headers: {
      authorization: `Bearer ${accessToken}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const remaining = response.headers.get("x-ratelimit-remaining");
    const resetAt = response.headers.get("x-ratelimit-reset");
    const message = await response.text();

    if (response.status === 401 || response.status === 403) {
      if (remaining === "0") {
        throw new GitHubApiError(
          `GitHub API rate limit exceeded. Reset at ${resetAt ?? "unknown time"}.`,
          "RATE_LIMIT",
          response.status,
        );
      }
      throw new GitHubApiError(
        `GitHub token is invalid or lacks permissions. ${message}`,
        "UNAUTHORIZED",
        response.status,
      );
    }

    if (response.status === 404) {
      throw new GitHubApiError("GitHub repository or resource not found.", "NOT_FOUND", 404);
    }

    throw new GitHubApiError(
      `GitHub API request failed with status ${response.status}. ${message}`,
      "UNKNOWN",
      response.status,
    );
  }

  return (await response.json()) as T;
}

export async function fetchGitHubRepos(accessToken: string) {
  return githubRequest<GitHubRepo[]>("/user/repos?per_page=100&sort=updated", accessToken);
}

export async function fetchGitHubRepoTree(
  accessToken: string,
  owner: string,
  repo: string,
  defaultBranch: string,
) {
  const cacheKey = `${owner}/${repo}@${defaultBranch}`;
  const cached = getCachedRepoTree<GitHubTreeEntry[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const payload = await githubRequest<{ tree: GitHubTreeEntry[] }>(
    `/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
    accessToken,
  );
  const tree = payload.tree ?? [];
  setCachedRepoTree(cacheKey, tree);
  return tree;
}

export async function fetchGitHubFileContent(
  accessToken: string,
  owner: string,
  repo: string,
  path: string,
  sha?: string,
) {
  const cacheKey = `${owner}/${repo}:${sha ?? path}`;
  const cached = getCachedFileContent(cacheKey);
  if (cached !== null) {
    return cached;
  }

  const payload = await githubRequest<{
    content?: string;
    encoding?: string;
    size?: number;
  }>(`/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`, accessToken);

  const size = payload.size ?? 0;
  if (size > MAX_FILE_BYTES) {
    return "";
  }

  if (!payload.content) return "";

  const normalized = payload.content.replace(/\n/g, "");
  const decoded =
    payload.encoding === "base64"
      ? Buffer.from(normalized, "base64").toString("utf8")
      : payload.content;

  const limited = decoded.slice(0, MAX_FILE_BYTES);
  setCachedFileContent(cacheKey, limited);
  return limited;
}
