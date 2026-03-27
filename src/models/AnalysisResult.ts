import { Document, Model, Schema, Types, model, models } from "mongoose";

type RelatedFile = {
  path: string;
  snippet: string;
};

type AnalysisPayload = {
  reason: string;
  possibleCauses: string[];
  suggestedFixes: string[];
  possibleFile: string | null;
  rawText: string;
};

export interface IAnalysisResult extends Document {
  userId: string;
  repositoryId: Types.ObjectId | null;
  apiLogId: Types.ObjectId | null;
  endpoint: string;
  statusCode: number | null;
  errorMessage: string;
  responseBody: string | null;
  relatedFiles: RelatedFile[];
  aiModel: string;
  prompt: string;
  result: AnalysisPayload;
  createdAt: Date;
  updatedAt: Date;
}

const relatedFileSchema = new Schema<RelatedFile>(
  {
    path: { type: String, required: true, trim: true },
    snippet: { type: String, required: true },
  },
  { _id: false },
);

const analysisPayloadSchema = new Schema<AnalysisPayload>(
  {
    reason: { type: String, required: true },
    possibleCauses: { type: [String], default: [] },
    suggestedFixes: { type: [String], default: [] },
    possibleFile: { type: String, default: null },
    rawText: { type: String, required: true },
  },
  { _id: false },
);

const analysisResultSchema = new Schema<IAnalysisResult>(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    repositoryId: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      default: null,
      index: true,
    },
    apiLogId: {
      type: Schema.Types.ObjectId,
      ref: "ApiLog",
      default: null,
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
      trim: true,
    },
    statusCode: {
      type: Number,
      default: null,
    },
    errorMessage: {
      type: String,
      required: true,
    },
    responseBody: {
      type: String,
      default: null,
    },
    relatedFiles: {
      type: [relatedFileSchema],
      default: [],
    },
    aiModel: {
      type: String,
      default: "gemini-1.5-flash",
      trim: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    result: {
      type: analysisPayloadSchema,
      required: true,
    },
  },
  { timestamps: true },
);

analysisResultSchema.index({ userId: 1, createdAt: -1 });
analysisResultSchema.index({ repositoryId: 1, createdAt: -1 });

const AnalysisResult: Model<IAnalysisResult> =
  models.AnalysisResult || model<IAnalysisResult>("AnalysisResult", analysisResultSchema);

export default AnalysisResult;
