import { Document, Model, Schema, Types, model, models } from "mongoose";
import { MonitorRegion, MonitorStatus } from "@/models/Monitor";

export interface ICheckHistory extends Document {
  monitorId: Types.ObjectId;
  projectId: Types.ObjectId | null;
  status: MonitorStatus;
  latency: number | null;
  statusCode: number | null;
  region: MonitorRegion;
  errorMessage: string | null;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const checkHistorySchema = new Schema<ICheckHistory>(
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
    status: {
      type: String,
      enum: ["up", "down", "paused", "unknown"],
      required: true,
      index: true,
    },
    latency: { type: Number, default: null },
    statusCode: { type: Number, default: null },
    region: {
      type: String,
      enum: ["India", "US", "Europe"],
      required: true,
      index: true,
    },
    errorMessage: { type: String, default: null },
    timestamp: {
      type: Date,
      required: true,
      default: () => new Date(),
      index: true,
    },
  },
  { timestamps: true },
);

checkHistorySchema.index({ monitorId: 1, timestamp: -1 });
checkHistorySchema.index({ projectId: 1, timestamp: -1 });
checkHistorySchema.index({ monitorId: 1, region: 1, timestamp: -1 });

const CheckHistory: Model<ICheckHistory> =
  models.CheckHistory || model<ICheckHistory>("CheckHistory", checkHistorySchema);

export default CheckHistory;
