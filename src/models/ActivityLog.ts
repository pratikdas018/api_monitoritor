import { Document, Model, Schema, model, models } from "mongoose";

export type ActivityRole = "user" | "admin";

export interface IActivityLog extends Document {
  userId: string;
  userEmail: string | null;
  role: ActivityRole;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    userEmail: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      index: true,
      maxlength: 120,
    },
    targetType: {
      type: String,
      default: null,
      trim: true,
      maxlength: 80,
    },
    targetId: {
      type: String,
      default: null,
      trim: true,
      maxlength: 200,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: null,
      trim: true,
    },
    userAgent: {
      type: String,
      default: null,
      trim: true,
      maxlength: 400,
    },
    timestamp: {
      type: Date,
      default: () => new Date(),
      index: true,
    },
  },
  { timestamps: true },
);

activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ role: 1, timestamp: -1 });

const ActivityLog: Model<IActivityLog> =
  models.ActivityLog || model<IActivityLog>("ActivityLog", activityLogSchema);

export default ActivityLog;

