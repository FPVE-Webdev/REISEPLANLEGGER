/**
 * Rate Limiting Utility for API Protection
 * Uses Upstash Redis for distributed rate limiting, with fallback to in-memory storage
 * Supports different limits per endpoint and client
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Rate limit configuration
export const RATE_LIMIT_CONFIG = {
  POST_TRIPS: {
    limit: 10,
    window: 3600, // 1 hour in seconds
    name: 'POST /api/trips',
  },
  GET_TRIPS_ID: {
    limit: 100,
    window: 3600, // 1 hour in seconds
    name: 'GET /api/trips/[id]',
  },
  GET_TRIPS_SHARE: {
    limit: 200,
    window: 3600, // 1 hour in seconds
    name: 'GET /api/trips/share/[shareableId]',
  },
  POST_WEBHOOKS_CHECKFRONT: {
    limit: 1000,
    window: 3600, // 1 hour in seconds
    name: 'POST /api/webhooks/checkfront',
  },
} as const;

// Type for rate limit result
export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: Date;
  limit: number;
}

// In-memory fallback storage for when Redis is unavailable
interface InMemoryStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const inMemoryStore: InMemoryStore = {};

/**
 * Initialize Redis client if REDIS_URL is available
 * Returns null if Redis is not configured
 */
function initializeRedis(): Redis | null {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.warn(
      'REDIS_URL not configured. Using in-memory rate limiting (not suitable for production/distributed systems)'
    );
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const redis = new Redis({
      url: redisUrl,
    } as any);
    return redis;
  } catch (error) {
    console.error('Failed to initialize Redis client:', error);
    return null;
  }
}

// Singleton Redis instance
let redisClient: Redis | null = null;
let redisInitialized = false;

function getRedisClient(): Redis | null {
  if (!redisInitialized) {
    redisClient = initializeRedis();
    redisInitialized = true;
  }
  return redisClient;
}

/**
 * In-memory rate limiter fallback
 * Stores request counts and reset times in memory
 */
async function checkInMemoryRateLimit(
  identifier: string,
  limit: number,
  window: number
): Promise<RateLimitResult> {
  const now = Date.now();
  const record = inMemoryStore[identifier];

  // Initialize or reset if window has expired
  if (!record || now > record.resetTime) {
    inMemoryStore[identifier] = {
      count: 1,
      resetTime: now + window * 1000,
    };
    return {
      success: true,
      remaining: limit - 1,
      resetAt: new Date(now + window * 1000),
      limit,
    };
  }

  // Increment count
  record.count += 1;

  if (record.count > limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: new Date(record.resetTime),
      limit,
    };
  }

  return {
    success: true,
    remaining: limit - record.count,
    resetAt: new Date(record.resetTime),
    limit,
  };
}

/**
 * Redis-based rate limiter using Upstash
 */
async function checkRedisRateLimit(
  identifier: string,
  limit: number,
  window: number,
  redis: Redis
): Promise<RateLimitResult> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(limit, `${window}s`),
      analytics: true,
      prefix: `ratelimit:${identifier}`,
    } as any);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await ratelimit.limit(identifier);

    return {
      success: result.success,
      remaining: result.remaining,
      resetAt: new Date(result.reset), // reset is unix timestamp in milliseconds
      limit,
    };
  } catch (error) {
    console.error('Redis rate limit check failed, falling back to in-memory:', error);
    // Fallback to in-memory if Redis fails
    return checkInMemoryRateLimit(identifier, limit, window);
  }
}

/**
 * Main rate limiting function
 * Checks if a request should be allowed based on rate limit config
 *
 * @param identifier - Unique identifier for the client (usually IP address)
 * @param limit - Maximum number of requests allowed
 * @param window - Time window in seconds
 * @returns RateLimitResult with success status and metadata
 */
export async function rateLimitRequest(
  identifier: string,
  limit: number,
  window: number
): Promise<RateLimitResult> {
  if (!identifier) {
    throw new Error('Rate limit identifier is required');
  }

  const redis = getRedisClient();

  if (redis) {
    return checkRedisRateLimit(identifier, limit, window, redis);
  }

  return checkInMemoryRateLimit(identifier, limit, window);
}

/**
 * Extracts client IP from request
 * Handles X-Forwarded-For header (for proxies, load balancers)
 * Falls back to connection remote address
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }

  // Fallback for direct connections
  const remoteAddress = (request as any).ip || 'unknown';
  return remoteAddress;
}

/**
 * Check and log rate limit violation
 * Useful for monitoring and debugging
 */
export function logRateLimitViolation(
  identifier: string,
  endpoint: string,
  limit: number
): void {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      `Rate limit exceeded: ${endpoint} from ${identifier} (limit: ${limit} requests/hour)`
    );
  }

  // In production, you might want to send this to a monitoring service
  // Example: Sentry.captureMessage(...), LogRocket, etc.
}
