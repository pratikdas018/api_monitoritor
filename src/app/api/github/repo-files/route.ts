import { NextRequest, NextResponse } from "next/server";

import { requireUserId } from "@/lib/apiAuth";
import {
  fetchGitHubFileContent,
  fetchGitHubRepoTree,
  getGitHubAccessToken,
  GitHubApiError,
} from "@/lib/githubApi";
import { getBackendLikeTreePreview } from "@/lib/githubScan";
import { getRepositoryForUser } from "@/lib/repositoryService";
import { hasApiContentHint, hasApiPathHint, isCodeFilePath } from "@/lib/repoScanner";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireUserId(request);
    if (auth.error) return auth.error;

    const repositoryId = request.nextUrl.searchParams.get("repositoryId") ?? "";
    if (!repositoryId) {
      return NextResponse.json({ error: "repositoryId is required." }, { status: 400 });
    }

    const repository = await getRepositoryForUser(auth.userId as string, repositoryId);
    if (!repository) {
      return NextResponse.json({ error: "Repository not found." }, { status: 404 });
    }

    const accessToken = await getGitHubAccessToken(request);
    if (!accessToken) {
      return NextResponse.json(
        { error: "GitHub session token not found. Please sign in with GitHub again." },
        { status: 401 },
      );
    }

    const tree = await fetchGitHubRepoTree(
      accessToken,
      repository.owner,
      repository.name,
      repository.defaultBranch,
    );
    const pathRelevant = getBackendLikeTreePreview(tree).map((file) => ({
      ...file,
      matchedBy: ["path"],
    }));
    const merged = new Map<string, { path: string; type: string; size: number; sha: string; matchedBy: string[] }>();
    for (const file of pathRelevant) {
      merged.set(file.path, file);
    }

    const keywordCandidates = tree
      .filter((entry) => entry.type === "blob" && isCodeFilePath(entry.path) && !hasApiPathHint(entry.path))
      .slice(0, 25);

    for (const file of keywordCandidates) {
      const content = await fetchGitHubFileContent(
        accessToken,
        repository.owner,
        repository.name,
        file.path,
        file.sha,
      );
      if (!content || !hasApiContentHint(content)) continue;

      merged.set(file.path, {
        path: file.path,
        type: file.type,
        size: file.size ?? content.length,
        sha: file.sha,
        matchedBy: ["content"],
      });
    }

    const relevantFiles = Array.from(merged.values()).sort((a, b) => a.path.localeCompare(b.path));

    return NextResponse.json({
      repository: {
        id: String(repository._id),
        owner: repository.owner,
        name: repository.name,
        fullName: repository.fullName,
      },
      totals: {
        allTreeEntries: tree.length,
        relevantEntries: relevantFiles.length,
      },
      relevantFiles,
    });
  } catch (error) {
    if (error instanceof GitHubApiError) {
      const status = error.code === "RATE_LIMIT" ? 429 : error.status;
      return NextResponse.json({ error: error.message, code: error.code }, { status });
    }
    console.error("[api/github/repo-files] GET failed", error);
    return NextResponse.json({ error: "Failed to fetch repository files." }, { status: 500 });
  }
}
