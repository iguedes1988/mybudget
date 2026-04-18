/**
 * Simple in-memory rate limiter for self-hosted environments.
 * Tracks attempts per key (IP or email) with a sliding window.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  store.forEach((entry, key) => {
    if (entry.resetAt < now) store.delete(key);
  });
}, 5 * 60 * 1000);

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number } {
  // Allow full bypass for local testing (RATE_LIMIT_DISABLED=true)
  if (process.env.RATE_LIMIT_DISABLED === "true") {
    return { success: true, remaining: 999 };
  }

  // Optionally scale all limits by a multiplier (e.g. RATE_LIMIT_MULTIPLIER=10)
  const multiplier = Math.max(1, Number(process.env.RATE_LIMIT_MULTIPLIER) || 1);
  const effectiveLimit = limit * multiplier;

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: effectiveLimit - 1 };
  }

  if (entry.count >= effectiveLimit) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  return { success: true, remaining: effectiveLimit - entry.count };
}
