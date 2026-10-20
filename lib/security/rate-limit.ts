type Bucket = { timestamps: number[] };

const buckets = new Map<string, Bucket>();

export function resetRateLimits(): void {
  buckets.clear();
}

export function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): boolean {
  const bucket = buckets.get(key) ?? { timestamps: [] };
  const fresh = bucket.timestamps.filter((timestamp) => now - timestamp < windowMs);
  if (fresh.length >= limit) {
    buckets.set(key, { timestamps: fresh });
    return false;
  }
  fresh.push(now);
  buckets.set(key, { timestamps: fresh });
  return true;
}
