import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/db";
import { ensureDefaultProject } from "@/lib/projects";
import AlertChannel from "@/models/AlertChannel";

type CreateAlertChannelInput = {
  userId?: string;
  projectId?: string;
  type: "email" | "slack" | "discord" | "telegram";
  name: string;
  target: string;
  secondaryTarget?: string;
  onDown: boolean;
  onRecovery: boolean;
  onHighLatency: boolean;
};

function getChannelConfig(input: CreateAlertChannelInput) {
  if (input.type === "email") {
    return { recipients: input.target };
  }

  if (input.type === "telegram") {
    return {
      botToken: input.target,
      chatId: input.secondaryTarget ?? "",
    };
  }

  return { webhookUrl: input.target };
}

export async function createAlertChannel(input: CreateAlertChannelInput) {
  await connectToDatabase();
  const userId = input.userId?.trim() || "legacy";
  const defaultProject = await ensureDefaultProject(userId);

  const projectId =
    input.projectId && Types.ObjectId.isValid(input.projectId)
      ? new Types.ObjectId(input.projectId)
      : defaultProject._id;

  return AlertChannel.create({
    userId,
    projectId,
    type: input.type,
    name: input.name.trim(),
    enabled: true,
    config: getChannelConfig(input),
    events: {
      onDown: input.onDown,
      onRecovery: input.onRecovery,
      onHighLatency: input.onHighLatency,
    },
  });
}

export async function getAlertChannels(userId: string, projectId?: string | null) {
  await connectToDatabase();
  const userQuery = { userId };
  if (projectId && Types.ObjectId.isValid(projectId)) {
    return AlertChannel.find({ ...userQuery, projectId }).sort({ createdAt: -1 }).lean();
  }

  return AlertChannel.find(userQuery).sort({ createdAt: -1 }).lean();
}
