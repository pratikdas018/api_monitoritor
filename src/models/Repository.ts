import { Document, Model, Schema, model, models } from "mongoose";

export interface IRepository extends Document {
  userId: string;
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  defaultBranch: string;
  isPrivate: boolean;
  githubRepoId: number;
  lastSyncedAt: Date | null;
  lastScannedAt: Date | null;
  scannedFileCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const repositorySchema = new Schema<IRepository>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    owner: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: null,
    },
    htmlUrl: {
      type: String,
      required: true,
      trim: true,
    },
    defaultBranch: {
      type: String,
      required: true,
      trim: true,
      default: "main",
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    githubRepoId: {
      type: Number,
      required: true,
      index: true,
    },
    lastSyncedAt: {
      type: Date,
      default: null,
    },
    lastScannedAt: {
      type: Date,
      default: null,
    },
    scannedFileCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

repositorySchema.index({ userId: 1, githubRepoId: 1 }, { unique: true });
repositorySchema.index({ userId: 1, fullName: 1 }, { unique: true });

const Repository: Model<IRepository> =
  models.Repository || model<IRepository>("Repository", repositorySchema);

export default Repository;
