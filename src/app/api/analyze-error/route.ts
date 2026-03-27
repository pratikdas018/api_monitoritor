import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";

import { requireUserId } from "@/lib/apiAuth";
import { analyzeWithGemini, buildGeminiPromptForStorage, explainGeminiFailure } from "@/lib/gemini";
import { connectToDatabase } from "@/lib/db";
import { buildLocalFailureAnalysis } from "@/lib/localFailureAnalysis";
import AnalysisResult from "@/models/AnalysisResult";
import ApiLog from "@/models/ApiLog";
import ScannedFile from "@/models/ScannedFile";

export const dynamic = "force-dynamic";

const analyzeSchema = z.object({
  repositoryId: z.string().trim().optional(),
  endpoint: z.string().trim().min(1),
  errorMessage: z.string().trim().min(1),
  statusCode: z.preprocess((value) => (value === null ? null : Number(value)), z.number().int().nullable()),
  responseBody: z.string().trim().max(30_000).optional(),
  method: z.string().trim().max(10).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const auth = await requireUserId(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const parsed = analyzeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid analysis payload." }, { status: 400 });
    }

    await connectToDatabase();

    const repositoryObjectId =
      parsed.data.repositoryId && Types.ObjectId.isValid(parsed.data.repositoryId)
        ? new Types.ObjectId(parsed.data.repositoryId)
        : null;

    const apiLog = await ApiLog.create({
      userId: auth.userId as string,
      repositoryId: repositoryObjectId,
      monitorId: null,
      endpoint: parsed.data.endpoint,
      method: (parsed.data.method ?? "GET").toUpperCase(),
      state: "DOWN",
      errorMessage: parsed.data.errorMessage,
      statusCode: parsed.data.statusCode,
      responseBody: parsed.data.responseBody ?? null,
      latencyMs: null,
      region: null,
      timestamp: new Date(),
    });

    const relatedFiles = repositoryObjectId
      ? await ScannedFile.find({
          userId: auth.userId,
          repositoryId: repositoryObjectId,
        })
          .sort({ relevanceScore: -1, scannedAt: -1 })
          .limit(8)
          .select("path snippet")
          .lean<{ path: string; snippet: string }[]>()
      : [];

    const prompt = buildGeminiPromptForStorage({
      endpoint: parsed.data.endpoint,
      statusCode: parsed.data.statusCode,
      errorMessage: parsed.data.errorMessage,
      responseBody: parsed.data.responseBody ?? null,
      relatedFiles,
    });

    let analysis;
    try {
      analysis = await analyzeWithGemini({
        endpoint: parsed.data.endpoint,
        statusCode: parsed.data.statusCode,
        errorMessage: parsed.data.errorMessage,
        responseBody: parsed.data.responseBody ?? null,
        relatedFiles,
      });
    } catch (error) {
      console.error("[api/analyze-error] Gemini analysis failed", error);
      const failure = explainGeminiFailure(error);
      analysis = buildLocalFailureAnalysis({
        endpoint: parsed.data.endpoint,
        statusCode: parsed.data.statusCode,
        errorMessage: parsed.data.errorMessage,
        responseBody: parsed.data.responseBody ?? null,
        relatedFiles,
        geminiFailure: failure,
      });
    }

    const resultDoc = await AnalysisResult.create({
      userId: auth.userId as string,
      repositoryId: repositoryObjectId,
      apiLogId: apiLog._id,
      endpoint: parsed.data.endpoint,
      statusCode: parsed.data.statusCode,
      errorMessage: parsed.data.errorMessage,
      responseBody: parsed.data.responseBody ?? null,
      relatedFiles,
      aiModel: process.env.GEMINI_MODEL?.trim() || "gemini-1.5-flash",
      prompt,
      result: analysis,
    });

    return NextResponse.json({
      id: String(resultDoc._id),
      apiLogId: String(apiLog._id),
      analysis: resultDoc.result,
      relatedFiles,
      createdAt: resultDoc.createdAt,
    });
  } catch (error) {
    console.error("[api/analyze-error] POST failed", error);
    return NextResponse.json({ error: "Failed to analyze API error." }, { status: 500 });
  }
}
