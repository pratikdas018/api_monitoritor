import { Document, Model, Schema, Types, model, models } from "mongoose";

export type AlertChannelType = "email" | "slack" | "discord" | "telegram";

export interface IAlertEventToggles {
  onDown: boolean;
  onRecovery: boolean;
  onHighLatency: boolean;
}

export interface IAlertChannel extends Document {
  userId: string;
  projectId: Types.ObjectId | null;
  type: AlertChannelType;
  name: string;
  enabled: boolean;
  config: Record<string, string>;
  events: IAlertEventToggles;
  createdAt: Date;
  updatedAt: Date;
}

const alertChannelSchema = new Schema<IAlertChannel>(
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
    type: {
      type: String,
      enum: ["email", "slack", "discord", "telegram"],
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    enabled: { type: Boolean, default: true, index: true },
    config: { type: Schema.Types.Mixed, default: {} },
    events: {
      onDown: { type: Boolean, default: true },
      onRecovery: { type: Boolean, default: true },
      onHighLatency: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

alertChannelSchema.index({ projectId: 1, type: 1, enabled: 1 });
alertChannelSchema.index({ userId: 1, projectId: 1, type: 1, enabled: 1 });

const AlertChannel: Model<IAlertChannel> =
  models.AlertChannel || model<IAlertChannel>("AlertChannel", alertChannelSchema);

export default AlertChannel;
