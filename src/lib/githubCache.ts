type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const repoTreeCache = new Map<string, CacheEntry<unknown>>();
const fileContentCache = new Map<string, CacheEntry<string>>();

const DEFAULT_TTL_MS = 5 * 60 * 1000;

function getFromCache<T>(store: Map<string, CacheEntry<unknown>>, key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value as T;
}

function setInCache(
  store: Map<string, CacheEntry<unknown>>,
  key: string,
  value: unknown,
  ttlMs = DEFAULT_TTL_MS,
) {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

export function getCachedRepoTree<T>(key: string) {
  return getFromCache<T>(repoTreeCache, key);
}

export function setCachedRepoTree<T>(key: string, value: T, ttlMs?: number) {
  setInCache(repoTreeCache, key, value, ttlMs);
}

export function getCachedFileContent(key: string) {
  return getFromCache<string>(fileContentCache, key);
}

export function setCachedFileContent(key: string, value: string, ttlMs?: number) {
  setInCache(fileContentCache, key, value, ttlMs);
}
