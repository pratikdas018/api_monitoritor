import { Document, Model, Schema, Types, model, models } from "mongoose";
import type { MonitorRegion, MonitorStatus } from "@/models/Monitor";

export type MonitorLogEventType =
  | "status_up"
  | "status_down"
  | "incident_open"
  | "incident_resolved"
  | "latency_high"
  | "monitor_created"
  | "monitor_deleted";

export interface IMonitorLog extends Document {
  monitorId: Types.ObjectId;
  projectId: Types.ObjectId | null;
  userId: string;
  eventType: MonitorLogEventType;
  status: MonitorStatus | null;
  region: MonitorRegion | null;
  responseTimeMs: number | null;
  statusCode: number | null;
  message: string | null;
  downtimeStartedAt: Date | null;
  downtimeEndedAt: Date | null;
  metadata: Record<string, unknown>;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const monitorLogSchema = new Schema<IMonitorLog>(
  {
    monitorId: {
      type: Schema.Types.ObjectId,
      ref: "Monitor",
      required: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      default: null,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: [
        "status_up",
        "status_down",
        "incident_open",
        "incident_resolved",
        "latency_high",
        "monitor_created",
        "monitor_deleted",
      ],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["up", "down", "paused", "unknown", null],
      default: null,
      index: true,
    },
    region: {
      type: String,
      enum: ["India", "US", "Europe", null],
      default: null,
      index: true,
    },
    responseTimeMs: {
      type: Number,
      default: null,
    },
    statusCode: {
      type: Number,
      default: null,
    },
    message: {
      type: String,
      default: null,
    },
    downtimeStartedAt: {
      type: Date,
      default: null,
    },
    downtimeEndedAt: {
      type: Date,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: () => new Date(),
      index: true,
    },
  },
  { timestamps: true },
);

monitorLogSchema.index({ userId: 1, timestamp: -1 });
monitorLogSchema.index({ monitorId: 1, timestamp: -1 });
monitorLogSchema.index({ eventType: 1, timestamp: -1 });

const MonitorLog: Model<IMonitorLog> =
  models.MonitorLog || model<IMonitorLog>("MonitorLog", monitorLogSchema);

export default MonitorLog;

