import { JobsOptions, Queue, QueueEvents } from "bullmq";

import { getMonitoringRegions } from "@/lib/regions";
import { createRedisConnection } from "@/lib/redis";
import type { MonitorRegion } from "@/models/Monitor";

export const MONITOR_QUEUE_NAME = "monitor-health-checks";
export const MONITOR_JOB_NAME = "execute-monitor-check";

const defaultJobOptions: JobsOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 10_000,
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
  options?: {
    region?: MonitorRegion;
    retryAttempt?: number;
    delayMs?: number;
  },
) {
  const queue = getQueue();
  const retryAttempt = options?.retryAttempt ?? 0;
  const delayMs = options?.delayMs ?? 0;
  const createJobId = (region: MonitorRegion) =>
    [monitorId, region, reason, retryAttempt, Date.now()].join("__");

  if (options?.region) {
    await queue.add(
      MONITOR_JOB_NAME,
      { monitorId, reason, region: options.region, retryAttempt },
      {
        delay: delayMs,
        jobId: createJobId(options.region),
      },
    );
    return;
  }

  const regions = getMonitoringRegions();
  await Promise.all(
    regions.map((region) =>
      queue.add(
        MONITOR_JOB_NAME,
        { monitorId, reason, region, retryAttempt },
        {
          delay: delayMs,
          jobId: createJobId(region),
        },
      ),
    ),
  );
}
