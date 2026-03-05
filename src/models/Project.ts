import { Document, Model, Schema, model, models } from "mongoose";

export interface IProject extends Document {
  userId: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    userId: {
      type: String,
      required: true,
      default: "legacy",
      index: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 100,
      index: true,
    },
    description: {
      type: String,
      default: null,
      maxlength: 240,
    },
  },
  { timestamps: true },
);

projectSchema.index({ userId: 1, slug: 1 }, { unique: true });

const Project: Model<IProject> = models.Project || model<IProject>("Project", projectSchema);

export default Project;
