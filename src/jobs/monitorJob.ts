import cron from "node-cron";
import "../lib/loadEnv";

import { connectToDatabase, hasMongoConfig } from "../lib/db";
import { enqueueMonitorCheck } from "../lib/queue";
import Monitor from "../models/Monitor";

const cronExpression = process.env.MONITOR_SCHEDULER_CRON ?? "*/1 * * * *";
let hasShownMissingMongoWarning = false;

async function enqueueDueMonitors() {
  if (!hasMongoConfig()) {
    if (!hasShownMissingMongoWarning) {
      hasShownMissingMongoWarning = true;
      console.warn("[scheduler] MONGODB_URI is missing. Scheduler is idle until env is configured.");
    }
    return;
  }

  await connectToDatabase();
  const now = new Date();

  const dueMonitors = await Monitor.find({
    status: { $ne: "paused" },
    $or: [
      { nextCheckAt: { $lte: now } },
      { nextCheckAt: { $exists: false } },
      { nextCheckAt: null },
    ],
  })
    .select("_id")
    .lean();

  if (dueMonitors.length === 0) {
    console.log(`[scheduler] ${now.toISOString()} no due monitors`);
    return;
  }

  await Promise.all(
    dueMonitors.map((monitor) => enqueueMonitorCheck(String(monitor._id), "scheduler")),
  );

  console.log(`[scheduler] ${now.toISOString()} queued ${dueMonitors.length} monitor checks`);
}

async function startScheduler() {
  console.log(`[scheduler] started with cron "${cronExpression}"`);

  // Run once at startup so new monitors are not delayed until the first tick.
  await enqueueDueMonitors().catch((error) => {
    console.error("[scheduler] startup enqueue failure", error);
  });

  cron.schedule(cronExpression, () => {
    enqueueDueMonitors().catch((error) => {
      console.error("[scheduler] enqueue failure", error);
    });
  });
}

startScheduler().catch((error) => {
  console.error("[scheduler] failed to start cron loop", error);
});
