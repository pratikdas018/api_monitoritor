import { Document, Model, Schema, Types, model, models } from "mongoose";

export type IncidentStatus = "OPEN" | "RESOLVED";
export type IncidentEventType = "down" | "retry" | "recovered";

export type IncidentEvent = {
  type: IncidentEventType;
  message: string;
  statusCode: number | null;
  responseTimeMs: number | null;
  timestamp: Date;
};

export interface IIncident extends Document {
  monitorId: Types.ObjectId;
  message: string;
  monitorName: string;
  monitorUrl: string;
  status: IncidentStatus;
  startedAt: Date;
  resolvedAt: Date | null;
  lastFailureAt: Date;
  failureCount: number;
  lastError: string | null;
  events: IncidentEvent[];
  createdAt: Date;
  updatedAt: Date;
}

const incidentEventSchema = new Schema<IncidentEvent>(
  {
    type: {
      type: String,
      enum: ["down", "retry", "recovered"],
      required: true,
    },
    message: {
      type: String,
      required: true,
      default: "Monitor incident detected.",
    },
    statusCode: { type: Number, default: null },
    responseTimeMs: { type: Number, default: null },
    timestamp: { type: Date, required: true },
  },
  { _id: false },
);

const incidentSchema = new Schema<IIncident>(
  {
    monitorId: {
      type: Schema.Types.ObjectId,
      ref: "Monitor",
      required: true,
      index: true,
    },
    message: { type: String, required: true },
    monitorName: { type: String, required: true },
    monitorUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ["OPEN", "RESOLVED"],
      default: "OPEN",
      index: true,
    },
    startedAt: { type: Date, required: true, default: () => new Date() },
    resolvedAt: { type: Date, default: null },
    lastFailureAt: { type: Date, required: true, default: () => new Date() },
    failureCount: { type: Number, default: 1 },
    lastError: { type: String, default: null },
    events: { type: [incidentEventSchema], default: [] },
  },
  { timestamps: true },
);

incidentSchema.index({ status: 1, startedAt: -1 });
incidentSchema.index(
  { monitorId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "OPEN" },
  },
);

const Incident: Model<IIncident> =
  models.Incident || model<IIncident>("Incident", incidentSchema);

export default Incident;
