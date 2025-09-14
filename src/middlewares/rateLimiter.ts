import { Request, Response, NextFunction } from 'express';
import { sendErrorResponse } from '@/utils/responseFormatter';
import { HTTP_STATUS, MESSAGES } from '@/constants';

// Simple in-memory rate limiter (in production, use Redis)
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export const createRateLimiter = (options: RateLimitOptions) => {
  const {
    windowMs,
    max,
    message = MESSAGES.ERROR.RATE_LIMIT_EXCEEDED,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || 'unknown';
    const now = Date.now();

    // Clean up expired entries
    Object.keys(store).forEach((k) => {
      if (store[k] && store[k].resetTime < now) {
        delete store[k];
      }
    });

    // Get or create entry for this IP
    if (!store[key]) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    const entry = store[key];

    // Reset if window has passed
    if (entry.resetTime < now) {
      entry.count = 0;
      entry.resetTime = now + windowMs;
    }

    // Check if limit exceeded
    if (entry.count >= max) {
      return sendErrorResponse(
        res,
        message,
        HTTP_STATUS.TOO_MANY_REQUESTS,
        `Rate limit exceeded. Try again in ${Math.ceil((entry.resetTime - now) / 1000)} seconds.`
      );
    }

    // Increment counter
    entry.count++;

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': max.toString(),
      'X-RateLimit-Remaining': Math.max(0, max - entry.count).toString(),
      'X-RateLimit-Reset': new Date(entry.resetTime).toISOString(),
    });

    // Override res.end to track successful/failed requests
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any): Response {
      const isSuccess = res.statusCode >= 200 && res.statusCode < 400;
      const isFailure = res.statusCode >= 400;

      // Adjust count based on request outcome
      if (skipSuccessfulRequests && isSuccess) {
        entry.count = Math.max(0, entry.count - 1);
      }
      if (skipFailedRequests && isFailure) {
        entry.count = Math.max(0, entry.count - 1);
      }

      return originalEnd.call(this, chunk, encoding);
    };

    next();
  };
};

// Predefined rate limiters
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts. Please try again later.',
});

export const generalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests. Please try again later.',
});

export const strictRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: 'Too many requests. Please try again later.',
});

export const uploadRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: 'Too many upload attempts. Please try again later.',
});
