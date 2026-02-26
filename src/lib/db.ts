import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const globalCache = global as typeof global & { mongooseCache?: MongooseCache };

// Reuse a single Mongoose connection across hot reloads in dev.
const cache = globalCache.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!globalCache.mongooseCache) {
  globalCache.mongooseCache = cache;
}

export function hasMongoConfig() {
  return Boolean(process.env.MONGODB_URI);
}

export async function connectToDatabase() {
  if (cache.conn) {
    return cache.conn;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing. Add it to your environment variables.");
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(mongoUri, {
      dbName: process.env.MONGODB_DB_NAME,
      bufferCommands: false,
    });
  }

  try {
    cache.conn = await cache.promise;
    return cache.conn;
  } catch (error) {
    // Reset cached promise so the next request can retry a fresh connection.
    cache.promise = null;
    throw error;
  }
}
