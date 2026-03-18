import { NextRequest } from "next/server";

import { connectToDatabase } from "@/lib/db";
import ActivityLog from "@/models/ActivityLog";
import User, { type UserRole, type UserStatus } from "@/models/User";

type UpsertUserInput = {
  authId?: string | null;
  name?: string | null;
  email: string;
  role?: UserRole;
  status?: UserStatus;
  touchLoginAt?: boolean;
};

type ActivityInput = {
  userId: string;
  userEmail?: string | null;
  role?: "user" | "admin";
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
};

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function looksLikeEmail(value: string) {
  const trimmed = value.trim();
  if (trimmed.length < 6 || trimmed.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

function sanitizeMetadata(metadata: unknown) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }
  return metadata as Record<string, unknown>;
}

export async function upsertUserProfile(input: UpsertUserInput) {
  const normalizedEmail = normalizeEmail(input.email);
  if (!looksLikeEmail(normalizedEmail)) {
    return null;
  }

  await connectToDatabase();

  const update: Record<string, unknown> = {
    email: normalizedEmail,
  };

  if (input.authId && input.authId.trim()) {
    update.authId = input.authId.trim();
  }
  if (input.name && input.name.trim()) {
    update.name = input.name.trim();
  }
  if (input.role) {
    update.role = input.role;
  }
  if (input.status) {
    update.status = input.status;
  }
  if (input.touchLoginAt) {
    update.lastLoginAt = new Date();
  }

  return User.findOneAndUpdate(
    { email: normalizedEmail },
    {
      $set: update,
      $setOnInsert: {
        role: input.role ?? "user",
        status: input.status ?? "active",
      },
    },
    { upsert: true, new: true },
  );
}

export async function recordActivity(input: ActivityInput) {
  if (!input.userId?.trim() || !input.action?.trim()) {
    return null;
  }

  await connectToDatabase();

  return ActivityLog.create({
    userId: input.userId.trim(),
    userEmail: input.userEmail ? normalizeEmail(input.userEmail) : null,
    role: input.role ?? "user",
    action: input.action.trim(),
    targetType: input.targetType?.trim() || null,
    targetId: input.targetId?.trim() || null,
    metadata: sanitizeMetadata(input.metadata),
    ipAddress: input.ipAddress?.trim() || null,
    userAgent: input.userAgent?.trim() || null,
    timestamp: new Date(),
  });
}

export function getRequestContext(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
  const ipAddress = forwardedFor.split(",")[0]?.trim() || request.headers.get("x-real-ip") || null;
  const userAgent = request.headers.get("user-agent");
  return { ipAddress, userAgent };
}

