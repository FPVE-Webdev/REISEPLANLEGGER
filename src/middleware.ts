/**
 * Next.js Middleware for Rate Limiting
 * Applies rate limits to API endpoints based on client IP
 * Allows different limits for different endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getClientIp,
  rateLimitRequest,
  RATE_LIMIT_CONFIG,
  logRateLimitViolation,
} from '@/lib/rate-limit';

/**
 * Middleware configuration
 * Specifies which routes should have rate limiting applied
 */
export const config = {
  matcher: [
    // API trips routes
    '/api/trips',
    '/api/trips/:path*',
    // Webhook routes
    '/api/webhooks/:path*',
  ],
};

/**
 * Main middleware handler
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  // Extract client IP
  const clientIp = getClientIp(request);

  // Determine rate limit config based on route and method
  let limitConfig:
    | {
        limit: number;
        window: number;
        name: string;
      }
    | null = null;
  let rateLimitKey = '';

  if (pathname === '/api/trips' && method === 'POST') {
    limitConfig = RATE_LIMIT_CONFIG.POST_TRIPS;
    rateLimitKey = `ratelimit:post:trips:${clientIp}`;
  } else if (pathname.match(/^\/api\/trips\/[^/]+$/) && method === 'GET') {
    // Matches /api/trips/[id]
    limitConfig = RATE_LIMIT_CONFIG.GET_TRIPS_ID;
    rateLimitKey = `ratelimit:get:trips:id:${clientIp}`;
  } else if (pathname.match(/^\/api\/trips\/share\/[^/]+$/) && method === 'GET') {
    // Matches /api/trips/share/[shareableId]
    limitConfig = RATE_LIMIT_CONFIG.GET_TRIPS_SHARE;
    rateLimitKey = `ratelimit:get:trips:share:${clientIp}`;
  } else if (pathname === '/api/webhooks/checkfront' && method === 'POST') {
    limitConfig = RATE_LIMIT_CONFIG.POST_WEBHOOKS_CHECKFRONT;
    rateLimitKey = `ratelimit:post:webhooks:checkfront:${clientIp}`;
  } else if (pathname === '/api/webhooks/checkfront' && method === 'GET') {
    // Health check endpoint - allow generous limits
    limitConfig = { limit: 1000, window: 3600, name: 'GET /api/webhooks/checkfront' };
    rateLimitKey = `ratelimit:get:webhooks:checkfront:${clientIp}`;
  }

  // If no rate limit config found, allow the request
  if (!limitConfig) {
    return NextResponse.next();
  }

  // Check rate limit
  const result = await rateLimitRequest(clientIp, limitConfig.limit, limitConfig.window);

  if (!result.success) {
    logRateLimitViolation(clientIp, limitConfig.name, limitConfig.limit);

    // Return 429 Too Many Requests
    return NextResponse.json(
      {
        success: false,
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Max ${limitConfig.limit} requests per hour.`,
        resetAt: result.resetAt.toISOString(),
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limitConfig.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': Math.floor(result.resetAt.getTime() / 1000).toString(),
          'Retry-After': Math.ceil((result.resetAt.getTime() - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  // Request is within rate limit - add headers for client reference
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', limitConfig.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set(
    'X-RateLimit-Reset',
    Math.floor(result.resetAt.getTime() / 1000).toString()
  );

  return response;
}
