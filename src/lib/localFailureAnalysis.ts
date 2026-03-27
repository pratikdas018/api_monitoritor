import type { GeminiAnalysis, GeminiFailureInfo } from "@/lib/gemini";

type LocalFailureAnalysisInput = {
  endpoint: string;
  statusCode: number | null;
  errorMessage: string;
  responseBody: string | null;
  relatedFiles: { path: string; snippet: string }[];
  geminiFailure: GeminiFailureInfo;
};

function addUnique(target: string[], value: string) {
  if (!target.includes(value)) {
    target.push(value);
  }
}

function findPossibleFile(
  endpoint: string,
  relatedFiles: { path: string; snippet: string }[],
) {
  if (!relatedFiles.length) return null;

  const endpointParts = endpoint
    .toLowerCase()
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

  let best: { path: string; score: number } | null = null;
  for (const file of relatedFiles) {
    const lowerPath = file.path.toLowerCase();
    let score = 0;

    if (/(controller|route|api)/.test(lowerPath)) score += 2;
    for (const part of endpointParts) {
      if (part.length > 2 && lowerPath.includes(part)) {
        score += 1;
      }
    }

    if (!best || score > best.score) {
      best = { path: file.path, score };
    }
  }

  return best?.path ?? relatedFiles[0].path;
}

export function buildLocalFailureAnalysis(input: LocalFailureAnalysisInput): GeminiAnalysis {
  const causes: string[] = [];
  const fixes: string[] = [];
  const combinedText = `${input.errorMessage}\n${input.responseBody ?? ""}`.toLowerCase();

  if (input.statusCode === 500) {
    addUnique(causes, "Unhandled exception in backend handler.");
    addUnique(fixes, "Wrap handler logic in try/catch and return consistent error responses.");
  }
  if (input.statusCode === 401 || input.statusCode === 403) {
    addUnique(causes, "Authentication/authorization check failed.");
    addUnique(fixes, "Verify auth middleware, token validation, and role checks.");
  }
  if (input.statusCode === 404) {
    addUnique(causes, "Route or method mismatch for requested endpoint.");
    addUnique(fixes, "Confirm endpoint path, HTTP method, and route registration.");
  }
  if (input.statusCode === 408 || input.statusCode === 504 || combinedText.includes("timeout")) {
    addUnique(causes, "Upstream dependency timeout or slow query.");
    addUnique(fixes, "Add timeout guards, retries, and optimize slow DB/API calls.");
  }
  if (combinedText.includes("mongo") || combinedText.includes("database") || combinedText.includes("connection")) {
    addUnique(causes, "Database connection or query failure.");
    addUnique(fixes, "Validate DB URI/credentials and handle reconnect logic.");
  }
  if (combinedText.includes("undefined") || combinedText.includes("null")) {
    addUnique(causes, "Missing/null value used without validation.");
    addUnique(fixes, "Add null/undefined guards before property access.");
  }
  if (combinedText.includes("validation") || combinedText.includes("invalid")) {
    addUnique(causes, "Request payload validation failed.");
    addUnique(fixes, "Validate input schema and return field-level validation errors.");
  }

  if (!causes.length) {
    addUnique(causes, "Runtime error in route/controller logic.");
  }
  if (!fixes.length) {
    addUnique(fixes, "Inspect server logs around this endpoint and add defensive error handling.");
  }

  for (const fix of input.geminiFailure.suggestedFixes) {
    addUnique(fixes, fix);
  }

  return {
    reason: `${input.geminiFailure.message} Local fallback analysis used.`,
    possibleCauses: causes.slice(0, 5),
    suggestedFixes: fixes.slice(0, 6),
    possibleFile: findPossibleFile(input.endpoint, input.relatedFiles),
    rawText: input.geminiFailure.message,
  };
}

