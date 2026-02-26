import { z } from "zod";

const allowedIntervals = [1, 5, 10] as const;

export const createMonitorSchema = z.object({
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
