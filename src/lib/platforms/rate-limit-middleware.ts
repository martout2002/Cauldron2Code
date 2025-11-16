/**
 * Rate Limiting Middleware
 * Middleware for checking deployment rate limits
 */

import { NextResponse } from 'next/server';
import { getDeploymentRateLimiter } from './rate-limiter';

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}

/**
 * Check rate limit for a user
 * @param userId - User identifier
 * @returns Rate limit result
 */
export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  const rateLimiter = getDeploymentRateLimiter();

  const allowed = await rateLimiter.checkLimit(userId);
  const info = await rateLimiter.getRateLimitInfo(userId);

  return {
    allowed,
    limit: info.limit,
    remaining: info.remaining,
    reset: info.reset,
  };
}

/**
 * Create a rate limit error response
 * @param result - Rate limit result
 * @returns NextResponse with rate limit error
 */
export function createRateLimitResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: 'Rate limit exceeded',
      message: `You have exceeded the deployment limit of ${result.limit} deployments per hour. Please try again later.`,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset.toISOString(),
      resetIn: Math.ceil((result.reset.getTime() - Date.now()) / 1000 / 60), // minutes
    },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.reset.toISOString(),
        'Retry-After': Math.ceil(
          (result.reset.getTime() - Date.now()) / 1000
        ).toString(),
      },
    }
  );
}

/**
 * Add rate limit headers to a response
 * @param response - NextResponse to add headers to
 * @param result - Rate limit result
 * @returns NextResponse with rate limit headers
 */
export function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult
): NextResponse {
  response.headers.set('X-RateLimit-Limit', result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.reset.toISOString());

  return response;
}

/**
 * Middleware wrapper for rate limiting
 * Usage in API routes:
 * 
 * ```typescript
 * export async function POST(request: Request) {
 *   const userId = await getUserId(request);
 *   const rateLimitCheck = await withRateLimit(userId);
 *   
 *   if (!rateLimitCheck.allowed) {
 *     return rateLimitCheck.response;
 *   }
 *   
 *   // Process deployment...
 *   const result = await processDeployment();
 *   
 *   return addRateLimitHeaders(
 *     NextResponse.json(result),
 *     rateLimitCheck.result
 *   );
 * }
 * ```
 */
export async function withRateLimit(userId: string): Promise<{
  allowed: boolean;
  result: RateLimitResult;
  response?: NextResponse;
}> {
  const result = await checkRateLimit(userId);

  if (!result.allowed) {
    return {
      allowed: false,
      result,
      response: createRateLimitResponse(result),
    };
  }

  return {
    allowed: true,
    result,
  };
}
