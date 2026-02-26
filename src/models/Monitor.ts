import { Document, Model, Schema, model, models } from "mongoose";

export type MonitorStatus = "up" | "down" | "paused" | "unknown";
export type IntervalMinutes = 1 | 5 | 10;

export type LatencyLog = {
  checkedAt: Date;
  success: boolean;
  responseTimeMs: number | null;
  statusCode: number | null;
  errorMessage?: string | null;
};

export interface IMonitor extends Document {
  name: string;
  url: string;
  intervalMinutes: IntervalMinutes;
  timeoutMs: number;
  status: MonitorStatus;
  lastCheckedAt: Date | null;
  nextCheckAt: Date;
  lastResponseTimeMs: number | null;
  lastStatusCode: number | null;
  totalChecks: number;
  totalFailures: number;
  consecutiveFailures: number;
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

const monitorSchema = new Schema<IMonitor>(
  {
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
    uptimePercentage: { type: Number, default: 100 },
    latencyLogs: { type: [latencyLogSchema], default: [] },
  },
  { timestamps: true },
);

monitorSchema.index({ nextCheckAt: 1, status: 1 });

const Monitor: Model<IMonitor> =
  models.Monitor || model<IMonitor>("Monitor", monitorSchema);

export default Monitor;
