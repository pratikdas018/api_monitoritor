import IORedis from "ioredis";

const redisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

declare global {
  // eslint-disable-next-line no-var
  var redisClient: IORedis | undefined;
}

function attachErrorHandler(client: IORedis) {
  // Prevent unhandled ioredis error event noise when Redis is temporarily unavailable.
  client.on("error", () => {
    // Intentionally no-op. Connection health is handled by caller retry logic.
  });
  return client;
}

export function getRedisClient() {
  if (!global.redisClient) {
    global.redisClient = attachErrorHandler(new IORedis(getRedisUrl(), redisOptions));
  }

  return global.redisClient;
}

export function createRedisConnection() {
  return attachErrorHandler(new IORedis(getRedisUrl(), redisOptions));
}

export async function isRedisReachable(timeoutMs = 1_500) {
  const probe = createRedisConnection();

  try {
    await Promise.race([
      probe.ping(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("redis ping timeout")), timeoutMs),
      ),
    ]);
    await probe.quit();
    return true;
  } catch {
    probe.disconnect();
    return false;
  }
}

function getRedisUrl() {
  const redisUrl = process.env.REDIS_URL?.trim();
  if (redisUrl) {
    return redisUrl;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("REDIS_URL is missing in production.");
  }

  return "redis://127.0.0.1:6379";
}
