import IORedis from "ioredis";

const redisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

declare global {
  // eslint-disable-next-line no-var
  var redisClient: IORedis | undefined;
}

export function getRedisClient() {
  if (!global.redisClient) {
    global.redisClient = new IORedis(getRedisUrl(), redisOptions);
  }

  return global.redisClient;
}

export function createRedisConnection() {
  return new IORedis(getRedisUrl(), redisOptions);
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
