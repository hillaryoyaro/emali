// lib/cache/cache.ts

type CacheEntry<T = unknown> = {
  value: T;
  expires: number;
};

// The map stores CacheEntry of any type (default is unknown)
const store = new Map<string, CacheEntry>();

export function getCache<T = unknown>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expires) {
    store.delete(key);
    return null;
  }

  return entry.value as T;
}

export function setCache<T = unknown>(key: string, value: T, ttlMs: number): void {
  store.set(key, { value, expires: Date.now() + ttlMs });
}

export function clearCache(key?: string): void {
  if (key) {
    store.delete(key);
  } else {
    store.clear();
  }
}
