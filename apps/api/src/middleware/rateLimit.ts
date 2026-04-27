import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const store: RateLimitStore = {};

/**
 * Simple in-memory rate limiter
 * For production, use Redis or a proper rate limiting service
 */
export function rateLimit(windowMs: number, maxRequests: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    // Initialize or get existing entry
    if (!store[key]) {
      store[key] = { count: 0, resetTime: now + windowMs };
    }

    const entry = store[key];

    // Reset if window has expired
    if (now > entry.resetTime) {
      entry.count = 0;
      entry.resetTime = now + windowMs;
    }

    entry.count++;

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - entry.count));
    res.setHeader('X-RateLimit-Reset', entry.resetTime);

    // Check if limit exceeded
    if (entry.count > maxRequests) {
      res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later',
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      });
      return;
    }

    next();
  };
}

/**
 * Specific rate limiter for authentication endpoints (stricter)
 */
export function authRateLimit() {
  // 5 attempts per 5 minutes
  return rateLimit(5 * 60 * 1000, 5);
}

/**
 * Specific rate limiter for general API endpoints (moderate)
 */
export function apiRateLimit() {
  // 100 requests per minute per user
  return rateLimit(60 * 1000, 100);
}

/**
 * Cleanup old entries periodically (optional for memory management)
 */
export function cleanupRateLimit(intervalMs: number = 60 * 1000) {
  setInterval(() => {
    const now = Date.now();
    for (const key in store) {
      if (store[key].resetTime < now) {
        delete store[key];
      }
    }
  }, intervalMs);
}
