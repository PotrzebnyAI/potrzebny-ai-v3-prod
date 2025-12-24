import { NextRequest } from 'next/server';

interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
}

// In-memory store for rate limiting
// In production, use Redis (Upstash) for distributed rate limiting
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Default configurations for different endpoint types
export const RATE_LIMIT_CONFIGS = {
  default: { limit: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 minutes
  auth: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  api: { limit: 60, windowMs: 60 * 1000 }, // 60 requests per minute
  upload: { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 uploads per hour
  webhook: { limit: 1000, windowMs: 60 * 1000 }, // 1000 webhooks per minute
  search: { limit: 30, windowMs: 60 * 1000 }, // 30 searches per minute
  export: { limit: 5, windowMs: 60 * 60 * 1000 }, // 5 exports per hour
} as const;

/**
 * Get client identifier from request
 */
function getClientId(req: NextRequest): string {
  // Try to get IP from various headers
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const cfConnectingIp = req.headers.get('cf-connecting-ip');

  const ip = cfConnectingIp || realIp || forwardedFor?.split(',')[0] || 'unknown';

  // Combine with user agent for more accurate identification
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const fingerprint = `${ip}:${userAgent.substring(0, 50)}`;

  return fingerprint;
}

/**
 * Rate limit check using in-memory store
 * For production, replace with Redis-based implementation
 */
export async function rateLimit(
  req: NextRequest,
  config: RateLimitConfig = RATE_LIMIT_CONFIGS.default
): Promise<RateLimitResult> {
  const clientId = getClientId(req);
  const key = `ratelimit:${clientId}:${req.nextUrl.pathname}`;
  const now = Date.now();

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    cleanupExpiredEntries();
  }

  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt <= now) {
    // Create new entry
    const resetAt = now + config.windowMs;
    rateLimitStore.set(key, { count: 1, resetAt });

    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetAt: new Date(resetAt),
    };
  }

  // Increment counter
  entry.count += 1;
  rateLimitStore.set(key, entry);

  const remaining = Math.max(0, config.limit - entry.count);

  return {
    success: entry.count <= config.limit,
    limit: config.limit,
    remaining,
    resetAt: new Date(entry.resetAt),
  };
}

/**
 * Rate limit with user ID (for authenticated endpoints)
 */
export async function rateLimitByUser(
  userId: string,
  endpoint: string,
  config: RateLimitConfig = RATE_LIMIT_CONFIGS.default
): Promise<RateLimitResult> {
  const key = `ratelimit:user:${userId}:${endpoint}`;
  const now = Date.now();

  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt <= now) {
    const resetAt = now + config.windowMs;
    rateLimitStore.set(key, { count: 1, resetAt });

    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetAt: new Date(resetAt),
    };
  }

  entry.count += 1;
  rateLimitStore.set(key, entry);

  const remaining = Math.max(0, config.limit - entry.count);

  return {
    success: entry.count <= config.limit,
    limit: config.limit,
    remaining,
    resetAt: new Date(entry.resetAt),
  };
}

/**
 * Clean up expired entries from in-memory store
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();

  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetAt.toISOString(),
  };
}

/**
 * Sliding window rate limiter
 * More accurate than fixed window but uses more memory
 */
export async function slidingWindowRateLimit(
  req: NextRequest,
  config: RateLimitConfig = RATE_LIMIT_CONFIGS.default
): Promise<RateLimitResult> {
  const clientId = getClientId(req);
  const key = `sliding:${clientId}:${req.nextUrl.pathname}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Get or create timestamps array
  const timestampsKey = `${key}:timestamps`;
  const existingData = rateLimitStore.get(timestampsKey);

  let timestamps: number[] = [];

  if (existingData) {
    // Parse timestamps from stored string
    try {
      timestamps = JSON.parse(String(existingData.count)) as number[];
    } catch {
      timestamps = [];
    }
  }

  // Filter out old timestamps
  timestamps = timestamps.filter((ts) => ts > windowStart);

  // Add current timestamp
  timestamps.push(now);

  // Store updated timestamps
  rateLimitStore.set(timestampsKey, {
    count: JSON.stringify(timestamps) as unknown as number,
    resetAt: now + config.windowMs,
  });

  const remaining = Math.max(0, config.limit - timestamps.length);

  return {
    success: timestamps.length <= config.limit,
    limit: config.limit,
    remaining,
    resetAt: new Date(now + config.windowMs),
  };
}

/**
 * Token bucket rate limiter
 * Best for smoothing out bursts
 */
export async function tokenBucketRateLimit(
  req: NextRequest,
  config: { capacity: number; refillRate: number } = { capacity: 100, refillRate: 10 }
): Promise<RateLimitResult> {
  const clientId = getClientId(req);
  const key = `bucket:${clientId}:${req.nextUrl.pathname}`;
  const now = Date.now();

  const entry = rateLimitStore.get(key) as
    | { tokens: number; lastRefill: number }
    | undefined;

  let tokens: number;
  let lastRefill: number;

  if (!entry) {
    tokens = config.capacity;
    lastRefill = now;
  } else {
    // Calculate tokens to add based on time passed
    const timePassed = (now - entry.lastRefill) / 1000;
    const tokensToAdd = Math.floor(timePassed * config.refillRate);
    tokens = Math.min(config.capacity, entry.tokens + tokensToAdd);
    lastRefill = tokensToAdd > 0 ? now : entry.lastRefill;
  }

  const success = tokens >= 1;

  if (success) {
    tokens -= 1;
  }

  rateLimitStore.set(key, {
    count: tokens,
    resetAt: lastRefill,
  });

  return {
    success,
    limit: config.capacity,
    remaining: Math.floor(tokens),
    resetAt: new Date(now + (config.capacity - tokens) * (1000 / config.refillRate)),
  };
}

// Export for testing
export { getClientId, cleanupExpiredEntries };
