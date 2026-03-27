type GeminiInput = {
  endpoint: string;
  statusCode: number | null;
  errorMessage: string;
  responseBody: string | null;
  relatedFiles: { path: string; snippet: string }[];
};

export type GeminiAnalysis = {
  reason: string;
  possibleCauses: string[];
  suggestedFixes: string[];
  possibleFile: string | null;
  rawText: string;
};

const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || "gemini-1.5-flash";
const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS ?? "25000");
const GEMINI_FALLBACK_MODELS = process.env.GEMINI_FALLBACK_MODELS?.split(",")
  .map((model) => model.trim())
  .filter(Boolean);

export type GeminiFailureInfo = {
  category: "quota" | "model" | "auth" | "timeout" | "request" | "unknown";
  message: string;
  suggestedFixes: string[];
};

function getGeminiApiKey() {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    throw new Error("GEMINI_API_KEY is missing. Configure it in your environment.");
  }
  return key;
}

function buildPrompt(input: GeminiInput) {
  return [
    "You are a senior backend reliability engineer.",
    "Analyze the API failure and return strict JSON only.",
    "JSON schema:",
    "{\"reason\":\"string\",\"possibleCauses\":[\"string\"],\"suggestedFixes\":[\"string\"],\"possibleFile\":\"string|null\"}",
    "",
    `Endpoint: ${input.endpoint}`,
    `Status Code: ${input.statusCode ?? "N/A"}`,
    `Error Message: ${input.errorMessage}`,
    `Response Body: ${input.responseBody ?? "N/A"}`,
    "",
    "Relevant code snippets:",
    ...input.relatedFiles.map((file, index) => {
      return [
        `File ${index + 1}: ${file.path}`,
        "```",
        file.snippet,
        "```",
      ].join("\n");
    }),
  ].join("\n");
}

function summarizeProviderError(errorText: string) {
  try {
    const parsed = JSON.parse(errorText) as {
      error?: { code?: number; message?: string; status?: string };
    };
    const message = parsed.error?.message?.trim();
    if (message) return message;
  } catch {
    // Ignore parse errors and fallback to a truncated raw string.
  }

  return errorText.replace(/\s+/g, " ").trim().slice(0, 220);
}

function getCandidateModels() {
  return Array.from(
    new Set([
      GEMINI_MODEL,
      ...(GEMINI_FALLBACK_MODELS ?? []),
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-1.5-flash",
    ]),
  );
}

export function explainGeminiFailure(error: unknown): GeminiFailureInfo {
  const message = error instanceof Error ? error.message : "Unknown Gemini request error";
  const normalized = message.toLowerCase();

  if (normalized.includes("429") || normalized.includes("quota") || normalized.includes("resource_exhausted")) {
    return {
      category: "quota",
      message: "Gemini API quota exceeded for current key/project.",
      suggestedFixes: [
        "Check quota usage in Google AI Studio / Google Cloud console.",
        "Retry after quota reset or upgrade plan limits.",
        "Use a model available in your project and region.",
      ],
    };
  }

  if (normalized.includes("404") || normalized.includes("not found") || normalized.includes("model")) {
    return {
      category: "model",
      message: "Configured Gemini model is unavailable for this API version/key.",
      suggestedFixes: [
        "Set GEMINI_MODEL to a currently supported model (for example gemini-2.0-flash).",
        "Optionally set GEMINI_FALLBACK_MODELS with comma-separated alternatives.",
        "Verify model availability for your project in Google AI Studio.",
      ],
    };
  }

  if (normalized.includes("401") || normalized.includes("403") || normalized.includes("permission") || normalized.includes("unauthorized")) {
    return {
      category: "auth",
      message: "Gemini API key is invalid or lacks permission.",
      suggestedFixes: [
        "Regenerate GEMINI_API_KEY and update .env.local.",
        "Check key restrictions (API/domain/IP) in Google Cloud credentials.",
      ],
    };
  }

  if (normalized.includes("abort") || normalized.includes("timeout")) {
    return {
      category: "timeout",
      message: "Gemini request timed out.",
      suggestedFixes: [
        "Increase GEMINI_TIMEOUT_MS in .env.local.",
        "Retry analysis after reducing payload size.",
      ],
    };
  }

  if (normalized.includes("400")) {
    return {
      category: "request",
      message: "Gemini rejected the request payload.",
      suggestedFixes: [
        "Check request fields and body size limits.",
        "Retry with a shorter response body/snippet context.",
      ],
    };
  }

  return {
    category: "unknown",
    message: "Gemini request failed unexpectedly.",
    suggestedFixes: [
      "Retry analysis in a few moments.",
      "Check server logs for provider error details.",
    ],
  };
}

function tryParseJson(text: string): GeminiAnalysis | null {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned) as Partial<GeminiAnalysis>;
    if (!parsed || typeof parsed.reason !== "string") return null;
    return {
      reason: parsed.reason,
      possibleCauses: Array.isArray(parsed.possibleCauses) ? parsed.possibleCauses : [],
      suggestedFixes: Array.isArray(parsed.suggestedFixes) ? parsed.suggestedFixes : [],
      possibleFile:
        typeof parsed.possibleFile === "string" && parsed.possibleFile.trim()
          ? parsed.possibleFile.trim()
          : null,
      rawText: cleaned,
    };
  } catch {
    return null;
  }
}

async function requestGeminiModel(model: string, apiKey: string, prompt: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
          },
        }),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      const providerMessage = summarizeProviderError(errorText);
      throw new Error(`model=${model} status=${response.status} ${providerMessage}`);
    }

    const payload = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };

    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    if (!text) {
      throw new Error(`model=${model} returned empty response`);
    }

    return text;
  } finally {
    clearTimeout(timeout);
  }
}

export async function analyzeWithGemini(input: GeminiInput): Promise<GeminiAnalysis> {
  const apiKey = getGeminiApiKey();
  const prompt = buildPrompt(input);

  const candidateModels = getCandidateModels();

  const errors: string[] = [];
  let text = "";
  for (const model of candidateModels) {
    try {
      text = await requestGeminiModel(model, apiKey, prompt);
      break;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown Gemini request error";
      errors.push(message);
    }
  }

  if (!text) {
    const compactErrors = errors
      .map((entry) => entry.replace(/\s+/g, " ").trim().slice(0, 220))
      .slice(0, 3)
      .join(" | ");
    throw new Error(`Gemini API request failed for all models. ${compactErrors}`);
  }

  const parsed = tryParseJson(text);
  if (parsed) return parsed;

  // Fallback if the model returns prose instead of strict JSON.
  return {
    reason: "AI returned an unstructured response",
    possibleCauses: ["Model output was not valid JSON"],
    suggestedFixes: ["Retry analysis with additional constraints"],
    possibleFile: input.relatedFiles[0]?.path ?? null,
    rawText: text,
  };
}

export function buildGeminiPromptForStorage(input: GeminiInput) {
  return buildPrompt(input);
}
