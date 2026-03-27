import type { GitHubTreeEntry } from "@/lib/githubApi";

const CODE_EXTENSIONS = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".py",
  ".go",
  ".java",
];

const PATH_HINTS = [
  "/api/",
  "/routes/",
  "/controllers/",
  "/pages/api/",
];

const CONTENT_REGEX = /(fetch\s*\(|axios\.|express\s*\(|router\.)/i;
const MAX_SNIPPET_LENGTH = 2_500;
const MAX_SCAN_FILES = 50;

export type ScannedSnippet = {
  path: string;
  sha: string | null;
  size: number;
  snippet: string;
  matchedBy: string[];
  relevanceScore: number;
  language: string | null;
};

export function isCodeFilePath(path: string) {
  const lower = path.toLowerCase();
  return CODE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function hasApiPathHint(path: string) {
  const lowerPath = `/${path.toLowerCase()}`;
  return PATH_HINTS.some((hint) => lowerPath.includes(hint));
}

export function hasApiContentHint(content: string) {
  return CONTENT_REGEX.test(content);
}

function inferLanguage(path: string) {
  if (path.endsWith(".ts")) return "typescript";
  if (path.endsWith(".tsx")) return "tsx";
  if (path.endsWith(".js")) return "javascript";
  if (path.endsWith(".jsx")) return "jsx";
  if (path.endsWith(".py")) return "python";
  if (path.endsWith(".go")) return "go";
  if (path.endsWith(".java")) return "java";
  return null;
}

export function pickRelevantTreeEntries(tree: GitHubTreeEntry[]) {
  const files = tree.filter((entry) => entry.type === "blob" && isCodeFilePath(entry.path));

  // First pass: path-driven likely backend files.
  const pathRelevant = files.filter((entry) => hasApiPathHint(entry.path));

  // Second pass: broaden coverage for API-like filenames.
  const nameRelevant = files.filter((entry) => {
    const lower = entry.path.toLowerCase();
    return /(api|route|controller|service|handler)/.test(lower);
  });

  const merged = new Map<string, GitHubTreeEntry>();
  for (const file of [...pathRelevant, ...nameRelevant]) {
    merged.set(file.path, file);
  }

  return Array.from(merged.values()).slice(0, MAX_SCAN_FILES);
}

export function createSnippet(content: string) {
  return content.slice(0, MAX_SNIPPET_LENGTH);
}

export function analyzeFileMatch(path: string, content: string) {
  const matchedBy: string[] = [];
  if (hasApiPathHint(path)) {
    matchedBy.push("path");
  }
  if (hasApiContentHint(content)) {
    matchedBy.push("content");
  }

  let relevanceScore = 0;
  if (matchedBy.includes("path")) relevanceScore += 2;
  if (matchedBy.includes("content")) relevanceScore += 2;
  if (path.toLowerCase().includes("controller")) relevanceScore += 1;
  if (path.toLowerCase().includes("route")) relevanceScore += 1;

  return {
    matchedBy,
    relevanceScore,
    language: inferLanguage(path),
  };
}
