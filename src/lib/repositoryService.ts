import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/db";
import Repository from "@/models/Repository";
import ScannedFile from "@/models/ScannedFile";
import type { GitHubRepo } from "@/lib/githubApi";
import type { ScannedSnippet } from "@/lib/repoScanner";

export async function syncRepositoriesForUser(userId: string, repos: GitHubRepo[]) {
  await connectToDatabase();

  await Promise.all(
    repos.map((repo) =>
      Repository.findOneAndUpdate(
        { userId, githubRepoId: repo.id },
        {
          $set: {
            userId,
            owner: repo.owner.login,
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description ?? null,
            htmlUrl: repo.html_url,
            defaultBranch: repo.default_branch || "main",
            isPrivate: Boolean(repo.private),
            lastSyncedAt: new Date(),
          },
          $setOnInsert: {
            scannedFileCount: 0,
          },
        },
        { upsert: true, new: true },
      ),
    ),
  );
}

export async function getRepositoryForUser(userId: string, repositoryId: string) {
  if (!Types.ObjectId.isValid(repositoryId)) return null;
  await connectToDatabase();
  return Repository.findOne({ _id: repositoryId, userId }).lean();
}

export async function getRepositoriesForUser(userId: string) {
  await connectToDatabase();
  return Repository.find({ userId }).sort({ updatedAt: -1 }).lean();
}

export async function persistScannedFiles(
  userId: string,
  repositoryId: string,
  scannedSnippets: ScannedSnippet[],
) {
  if (!Types.ObjectId.isValid(repositoryId)) {
    throw new Error("Invalid repository id.");
  }

  await connectToDatabase();
  const repositoryObjectId = new Types.ObjectId(repositoryId);

  await Promise.all(
    scannedSnippets.map((snippet) =>
      ScannedFile.findOneAndUpdate(
        { repositoryId: repositoryObjectId, path: snippet.path },
        {
          $set: {
            userId,
            repositoryId: repositoryObjectId,
            path: snippet.path,
            sha: snippet.sha,
            size: snippet.size,
            language: snippet.language,
            snippet: snippet.snippet,
            matchedBy: snippet.matchedBy,
            relevanceScore: snippet.relevanceScore,
            scannedAt: new Date(),
          },
        },
        { upsert: true, new: true },
      ),
    ),
  );

  await Repository.findOneAndUpdate(
    { _id: repositoryObjectId, userId },
    {
      $set: {
        lastScannedAt: new Date(),
        scannedFileCount: scannedSnippets.length,
      },
    },
  );

  return ScannedFile.find({ repositoryId: repositoryObjectId, userId })
    .sort({ relevanceScore: -1, path: 1 })
    .lean();
}

export async function getScannedFilesForRepository(userId: string, repositoryId: string, limit = 100) {
  if (!Types.ObjectId.isValid(repositoryId)) return [];
  await connectToDatabase();

  return ScannedFile.find({
    userId,
    repositoryId: new Types.ObjectId(repositoryId),
  })
    .sort({ relevanceScore: -1, path: 1 })
    .limit(limit)
    .lean();
}
