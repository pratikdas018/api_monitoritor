import { Document, Model, Schema, Types, model, models } from "mongoose";

export interface IScannedFile extends Document {
  userId: string;
  repositoryId: Types.ObjectId;
  path: string;
  sha: string | null;
  size: number;
  language: string | null;
  snippet: string;
  matchedBy: string[];
  relevanceScore: number;
  scannedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const scannedFileSchema = new Schema<IScannedFile>(
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
      required: true,
      index: true,
    },
    path: {
      type: String,
      required: true,
      trim: true,
    },
    sha: {
      type: String,
      default: null,
      trim: true,
    },
    size: {
      type: Number,
      default: 0,
    },
    language: {
      type: String,
      default: null,
    },
    snippet: {
      type: String,
      required: true,
    },
    matchedBy: {
      type: [String],
      default: [],
    },
    relevanceScore: {
      type: Number,
      default: 0,
    },
    scannedAt: {
      type: Date,
      default: () => new Date(),
      index: true,
    },
  },
  { timestamps: true },
);

scannedFileSchema.index({ repositoryId: 1, path: 1 }, { unique: true });
scannedFileSchema.index({ userId: 1, repositoryId: 1, relevanceScore: -1 });

const ScannedFile: Model<IScannedFile> =
  models.ScannedFile || model<IScannedFile>("ScannedFile", scannedFileSchema);

export default ScannedFile;
