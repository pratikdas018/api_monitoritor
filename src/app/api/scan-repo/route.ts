import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireUserId } from "@/lib/apiAuth";
import { getGitHubAccessToken, GitHubApiError } from "@/lib/githubApi";
import { scanGitHubRepository } from "@/lib/githubScan";
import { getRepositoryForUser, persistScannedFiles } from "@/lib/repositoryService";

export const dynamic = "force-dynamic";

const scanSchema = z.object({
  repositoryId: z.string().trim().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const auth = await requireUserId(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const parsed = scanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const repository = await getRepositoryForUser(auth.userId as string, parsed.data.repositoryId);
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

    const scanResult = await scanGitHubRepository({
      accessToken,
      owner: repository.owner,
      repo: repository.name,
      defaultBranch: repository.defaultBranch,
    });

    const savedFiles = await persistScannedFiles(
      auth.userId as string,
      String(repository._id),
      scanResult.snippets,
    );

    return NextResponse.json({
      repositoryId: String(repository._id),
      scannedCount: savedFiles.length,
      files: savedFiles.map((file) => ({
        ...file,
        _id: String(file._id),
      })),
    });
  } catch (error) {
    if (error instanceof GitHubApiError) {
      const status = error.code === "RATE_LIMIT" ? 429 : error.status;
      return NextResponse.json({ error: error.message, code: error.code }, { status });
    }
    console.error("[api/scan-repo] POST failed", error);
    return NextResponse.json({ error: "Failed to scan repository." }, { status: 500 });
  }
}
