import { Document, Model, Schema, model, models } from "mongoose";

export type UserRole = "user" | "admin";
export type UserStatus = "active" | "suspended" | "deleted";

export interface IUser extends Document {
  authId: string | null;
  name: string;
  email: string;
  image: string | null;
  provider: string | null;
  providers: string[];
  role: UserRole;
  status: UserStatus;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    authId: {
      type: String,
      default: null,
      trim: true,
      index: true,
      sparse: true,
    },
    name: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      index: true,
    },
    image: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },
    provider: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
      maxlength: 40,
      index: true,
    },
    providers: {
      type: [String],
      default: [],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "suspended", "deleted"],
      default: "active",
      index: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, status: 1, createdAt: -1 });

const User: Model<IUser> = models.User || model<IUser>("User", userSchema);

export default User;
