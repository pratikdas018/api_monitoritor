import {
  fetchGitHubFileContent,
  fetchGitHubRepoTree,
  type GitHubTreeEntry,
} from "@/lib/githubApi";
import {
  analyzeFileMatch,
  createSnippet,
  pickRelevantTreeEntries,
  type ScannedSnippet,
} from "@/lib/repoScanner";

export async function scanGitHubRepository(params: {
  accessToken: string;
  owner: string;
  repo: string;
  defaultBranch: string;
}) {
  const tree = await fetchGitHubRepoTree(
    params.accessToken,
    params.owner,
    params.repo,
    params.defaultBranch,
  );

  const candidateEntries = pickRelevantTreeEntries(tree);
  const snippets: ScannedSnippet[] = [];

  for (const entry of candidateEntries) {
    const content = await fetchGitHubFileContent(
      params.accessToken,
      params.owner,
      params.repo,
      entry.path,
      entry.sha,
    );
    if (!content) continue;

    const analysis = analyzeFileMatch(entry.path, content);
    if (analysis.matchedBy.length === 0) continue;

    snippets.push({
      path: entry.path,
      sha: entry.sha ?? null,
      size: entry.size ?? content.length,
      snippet: createSnippet(content),
      matchedBy: analysis.matchedBy,
      relevanceScore: analysis.relevanceScore,
      language: analysis.language,
    });
  }

  snippets.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return {
    tree,
    snippets,
  };
}

export function getBackendLikeTreePreview(tree: GitHubTreeEntry[]) {
  const candidateEntries = pickRelevantTreeEntries(tree);
  return candidateEntries.map((entry) => ({
    path: entry.path,
    type: entry.type,
    size: entry.size ?? 0,
    sha: entry.sha,
  }));
}
