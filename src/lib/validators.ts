import { z } from "zod";

const allowedIntervals = [1, 5, 10] as const;

export const createMonitorSchema = z.object({
  projectId: z.string().trim().optional(),
  name: z.string().trim().max(80).optional(),
  url: z
    .string()
    .trim()
    .url()
    .refine((value) => value.startsWith("http://") || value.startsWith("https://"), {
      message: "URL must start with http:// or https://",
    }),
  intervalMinutes: z.preprocess(
    (value) => Number(value),
    z.union([
      z.literal(allowedIntervals[0]),
      z.literal(allowedIntervals[1]),
      z.literal(allowedIntervals[2]),
    ]),
  ),
  timeoutMs: z
    .preprocess((value) => (value === undefined || value === "" ? undefined : Number(value)), z.number().int().min(1000).max(60000))
    .optional(),
});

export const monitorStatusFilterSchema = z.enum(["up", "down", "paused", "unknown"]).optional();

export const createProjectSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(240).optional(),
});

export const createAlertChannelSchema = z.object({
  projectId: z.string().trim().optional(),
  type: z.enum(["email", "slack", "discord", "telegram"]),
  name: z.string().trim().min(2).max(80),
  target: z.string().trim().min(1).max(400),
  secondaryTarget: z.string().trim().max(400).optional(),
  onDown: z.preprocess((value) => value === "on" || value === true, z.boolean()),
  onRecovery: z.preprocess((value) => value === "on" || value === true, z.boolean()),
  onHighLatency: z.preprocess((value) => value === "on" || value === true, z.boolean()),
});
