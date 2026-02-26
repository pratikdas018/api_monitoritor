import { Job, Worker } from "bullmq";
import "../lib/loadEnv";

import { runMonitorCheck } from "../lib/monitoring";
import { MONITOR_JOB_NAME, MONITOR_QUEUE_NAME } from "../lib/queue";
import { createRedisConnection } from "../lib/redis";

const concurrency = Number(process.env.MONITOR_WORKER_CONCURRENCY ?? "5");
const redisRetryDelayMs = 5_000;

type MonitorJobData = {
  monitorId: string;
  reason: "create" | "manual" | "scheduler";
};

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitForRedis() {
  while (true) {
    const probe = createRedisConnection();

    try {
      await probe.ping();
      await probe.quit();
      return;
    } catch {
      probe.disconnect();
      console.warn(
        `[worker] Redis unavailable. Retrying connection in ${redisRetryDelayMs / 1000}s...`,
      );
      await sleep(redisRetryDelayMs);
    }
  }
}

async function processMonitorJob(job: Job<MonitorJobData>) {
  if (job.name !== MONITOR_JOB_NAME) {
    return;
  }

  await runMonitorCheck(job.data.monitorId);
}

async function startWorker() {
  await waitForRedis();

  const worker = new Worker<MonitorJobData>(MONITOR_QUEUE_NAME, processMonitorJob, {
    connection: createRedisConnection(),
    concurrency,
  });

  worker.on("ready", () => {
    console.log(
      `[worker] listening on queue "${MONITOR_QUEUE_NAME}" with concurrency ${concurrency}`,
    );
  });

  worker.on("completed", (job) => {
    console.log(`[worker] completed job ${job.id} for monitor ${job.data.monitorId}`);
  });

  worker.on("failed", (job, error) => {
    console.error(`[worker] failed job ${job?.id}`, error);
  });

  worker.on("error", (error) => {
    console.error("[worker] runtime error", error);
  });

  async function shutdown(signal: string) {
    console.log(`[worker] received ${signal}. Closing worker...`);
    // Graceful close avoids dropping in-flight jobs on termination.
    await worker.close();
    process.exit(0);
  }

  process.on("SIGINT", () => {
    shutdown("SIGINT").catch((error) => {
      console.error("[worker] shutdown error", error);
      process.exit(1);
    });
  });

  process.on("SIGTERM", () => {
    shutdown("SIGTERM").catch((error) => {
      console.error("[worker] shutdown error", error);
      process.exit(1);
    });
  });
}

startWorker().catch((error) => {
  console.error("[worker] failed to start", error);
});
