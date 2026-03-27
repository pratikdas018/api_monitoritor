import { Document, Model, Schema, Types, model, models } from "mongoose";

export type ApiState = "UP" | "DOWN";

export interface IApiLog extends Document {
  userId: string;
  repositoryId: Types.ObjectId | null;
  monitorId: Types.ObjectId | null;
  endpoint: string;
  method: string;
  state: ApiState;
  errorMessage: string | null;
  statusCode: number | null;
  responseBody: string | null;
  latencyMs: number | null;
  region: string | null;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const apiLogSchema = new Schema<IApiLog>(
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
    monitorId: {
      type: Schema.Types.ObjectId,
      ref: "Monitor",
      default: null,
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
      trim: true,
    },
    method: {
      type: String,
      default: "GET",
      uppercase: true,
      trim: true,
    },
    state: {
      type: String,
      enum: ["UP", "DOWN"],
      required: true,
      index: true,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    statusCode: {
      type: Number,
      default: null,
      index: true,
    },
    responseBody: {
      type: String,
      default: null,
    },
    latencyMs: {
      type: Number,
      default: null,
    },
    region: {
      type: String,
      default: null,
      index: true,
    },
    timestamp: {
      type: Date,
      default: () => new Date(),
      index: true,
    },
  },
  { timestamps: true },
);

apiLogSchema.index({ userId: 1, timestamp: -1 });
apiLogSchema.index({ monitorId: 1, timestamp: -1 });

const ApiLog: Model<IApiLog> = models.ApiLog || model<IApiLog>("ApiLog", apiLogSchema);

export default ApiLog;
