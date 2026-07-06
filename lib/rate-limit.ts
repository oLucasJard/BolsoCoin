import { LRUCache } from 'lru-cache';

type RateLimitOptions = {
  interval: number;
  uniqueTokenPerInterval: number;
};

const caches = new Map<string, LRUCache<string, number>>();

function getCache(name: string, options: RateLimitOptions) {
  if (!caches.has(name)) {
    caches.set(
      name,
      new LRUCache<string, number>({
        max: options.uniqueTokenPerInterval,
        ttl: options.interval,
      })
    );
  }
  return caches.get(name)!;
}

export function rateLimit(
  name: string,
  token: string,
  limit: number,
  intervalMs = 60_000
): { success: boolean; remaining: number } {
  const cache = getCache(name, { interval: intervalMs, uniqueTokenPerInterval: 500 });
  const count = cache.get(token) ?? 0;
  if (count >= limit) {
    return { success: false, remaining: 0 };
  }
  cache.set(token, count + 1);
  return { success: true, remaining: limit - count - 1 };
}
