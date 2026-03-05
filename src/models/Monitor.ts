import { Document, Model, Schema, Types, model, models } from "mongoose";

export type MonitorStatus = "up" | "down" | "paused" | "unknown";
export type IntervalMinutes = 1 | 5 | 10;
export type MonitorRegion = "India" | "US" | "Europe";

export type RegionCheckState = {
  region: MonitorRegion;
  status: MonitorStatus;
  latencyMs: number | null;
  statusCode: number | null;
  errorMessage?: string | null;
  checkedAt: Date | null;
};

export type LatencyLog = {
  checkedAt: Date;
  success: boolean;
  responseTimeMs: number | null;
  statusCode: number | null;
  errorMessage?: string | null;
};

export interface IMonitor extends Document {
  userId: string;
  projectId: Types.ObjectId | null;
  name: string;
  url: string;
  intervalMinutes: IntervalMinutes;
  timeoutMs: number;
  status: MonitorStatus;
  regionStates: RegionCheckState[];
  lastCheckedAt: Date | null;
  nextCheckAt: Date;
  lastResponseTimeMs: number | null;
  lastStatusCode: number | null;
  totalChecks: number;
  totalFailures: number;
  consecutiveFailures: number;
  retryStrikeCount: number;
  uptimePercentage: number;
  latencyLogs: LatencyLog[];
  createdAt: Date;
  updatedAt: Date;
}

const latencyLogSchema = new Schema<LatencyLog>(
  {
    checkedAt: { type: Date, required: true },
    success: { type: Boolean, required: true },
    responseTimeMs: { type: Number, default: null },
    statusCode: { type: Number, default: null },
    errorMessage: { type: String, default: null },
  },
  { _id: false },
);

const regionCheckStateSchema = new Schema<RegionCheckState>(
  {
    region: {
      type: String,
      enum: ["India", "US", "Europe"],
      required: true,
    },
    status: {
      type: String,
      enum: ["up", "down", "paused", "unknown"],
      required: true,
      default: "unknown",
    },
    latencyMs: { type: Number, default: null },
    statusCode: { type: Number, default: null },
    errorMessage: { type: String, default: null },
    checkedAt: { type: Date, default: null },
  },
  { _id: false },
);

const monitorSchema = new Schema<IMonitor>(
  {
    userId: {
      type: String,
      required: true,
      default: "legacy",
      index: true,
      trim: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      default: null,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    intervalMinutes: {
      type: Number,
      enum: [1, 5, 10],
      required: true,
    },
    timeoutMs: {
      type: Number,
      default: Number(process.env.DEFAULT_MONITOR_TIMEOUT_MS ?? 10_000),
    },
    status: {
      type: String,
      enum: ["up", "down", "paused", "unknown"],
      default: "unknown",
      index: true,
    },
    regionStates: { type: [regionCheckStateSchema], default: [] },
    lastCheckedAt: { type: Date, default: null },
    nextCheckAt: {
      type: Date,
      default: () => new Date(),
      index: true,
    },
    lastResponseTimeMs: { type: Number, default: null },
    lastStatusCode: { type: Number, default: null },
    totalChecks: { type: Number, default: 0 },
    totalFailures: { type: Number, default: 0 },
    consecutiveFailures: { type: Number, default: 0 },
    retryStrikeCount: { type: Number, default: 0 },
    uptimePercentage: { type: Number, default: 100 },
    latencyLogs: { type: [latencyLogSchema], default: [] },
  },
  { timestamps: true },
);

monitorSchema.index({ nextCheckAt: 1, status: 1 });
monitorSchema.index({ userId: 1, createdAt: -1 });
monitorSchema.index({ projectId: 1, name: 1 });

const Monitor: Model<IMonitor> =
  models.Monitor || model<IMonitor>("Monitor", monitorSchema);

export default Monitor;
