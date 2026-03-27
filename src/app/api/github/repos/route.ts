import { NextRequest, NextResponse } from "next/server";

import { requireUserId } from "@/lib/apiAuth";
import { fetchGitHubRepos, getGitHubAccessToken, GitHubApiError } from "@/lib/githubApi";
import { getRepositoriesForUser, syncRepositoriesForUser } from "@/lib/repositoryService";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireUserId(request);
    if (auth.error) {
      return auth.error;
    }

    const accessToken = await getGitHubAccessToken(request);
    if (!accessToken) {
      return NextResponse.json(
        { error: "GitHub session token not found. Please sign in with GitHub again." },
        { status: 401 },
      );
    }

    const repos = await fetchGitHubRepos(accessToken);
    await syncRepositoriesForUser(auth.userId as string, repos);

    const syncedRepos = await getRepositoriesForUser(auth.userId as string);
    return NextResponse.json({
      repos: syncedRepos.map((repo) => ({
        ...repo,
        _id: String(repo._id),
      })),
    });
  } catch (error) {
    if (error instanceof GitHubApiError) {
      const status = error.code === "RATE_LIMIT" ? 429 : error.status;
      return NextResponse.json({ error: error.message, code: error.code }, { status });
    }
    console.error("[api/github/repos] GET failed", error);
    return NextResponse.json({ error: "Failed to fetch GitHub repositories." }, { status: 500 });
  }
}
