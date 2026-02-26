import { JobsOptions, Queue, QueueEvents } from "bullmq";

import { createRedisConnection } from "@/lib/redis";

export const MONITOR_QUEUE_NAME = "monitor-health-checks";
export const MONITOR_JOB_NAME = "execute-monitor-check";

const defaultJobOptions: JobsOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 3_000,
  },
  removeOnComplete: 1_000,
  removeOnFail: 5_000,
};

let queue: Queue | null = null;
let queueEvents: QueueEvents | null = null;

function getQueue() {
  // Queue instances are created lazily so web requests do not eagerly connect to Redis.
  if (!queue) {
    queue = new Queue(MONITOR_QUEUE_NAME, {
      connection: createRedisConnection(),
      defaultJobOptions,
    });
  }

  return queue;
}

export function getQueueEvents() {
  if (!queueEvents) {
    queueEvents = new QueueEvents(MONITOR_QUEUE_NAME, {
      connection: createRedisConnection(),
    });
  }

  return queueEvents;
}

export async function enqueueMonitorCheck(
  monitorId: string,
  reason: "create" | "manual" | "scheduler" = "scheduler",
) {
  return getQueue().add(
    MONITOR_JOB_NAME,
    { monitorId, reason },
    {
      jobId: `${monitorId}:${reason}:${Date.now()}`,
    },
  );
}
