import 'server-only';

// ============================================================
// Minimal in-memory rate limiter — server-only
// ============================================================
// Fixed-window counter keyed by an arbitrary string (IP, email, etc).
// This is process-local: on a horizontally-scaled serverless deployment
// each instance has its own counters, so it throttles a single hot
// instance rather than enforcing a hard global cap. Good enough to blunt
// casual brute-force/enumeration against auth endpoints; swap for a
// shared store (Redis/Upstash) if this needs to be a real global limit.
// ============================================================

declare global {
  // eslint-disable-next-line no-var
  var __rateLimitBuckets: Map<string, { count: number; resetAt: number }> | undefined;
  // eslint-disable-next-line no-var
  var __rateLimitHits: Map<string, number[]> | undefined;
}

function getBuckets() {
  if (!global.__rateLimitBuckets) global.__rateLimitBuckets = new Map();
  return global.__rateLimitBuckets;
}

/** Returns true if `key` is still within `limit` requests per `windowMs`. */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const buckets = getBuckets();
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;

  bucket.count += 1;
  return true;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || 'unknown';
}

// Best-effort, in-memory rate limiting — resets on cold start/redeploy.
// Good enough to blunt naive spam bots on a low-traffic association site
// without needing external infra (Redis, etc.). If abuse becomes a real
// problem, swap this for Vercel's Edge Config / KV-backed rate limiter.
const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 5;

function getHits() {
  if (!global.__rateLimitHits) global.__rateLimitHits = new Map();
  return global.__rateLimitHits;
}

export function isRateLimited(key: string): boolean {
  const hits = getHits();
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  hits.set(key, timestamps);
  return timestamps.length > MAX_REQUESTS;
}
