import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '@/constants';
import { ENV } from '@/lib';

interface CorsOptions {
  origin?: string | string[] | boolean | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void);
  methods?: string | string[];
  allowedHeaders?: string | string[];
  exposedHeaders?: string | string[];
  credentials?: boolean;
  maxAge?: number;
  preflightContinue?: boolean;
  optionsSuccessStatus?: number;
}

export const createCorsMiddleware = (options: CorsOptions = {}) => {
  const {
    origin = true,
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders = [],
    credentials = true,
    maxAge = 86400, // 24 hours
    preflightContinue = false,
    optionsSuccessStatus = 204,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin;

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      // Set CORS headers
      if (typeof origin === 'function') {
        origin(requestOrigin, (err, allow) => {
          if (err || !allow) {
            res.status(HTTP_STATUS.FORBIDDEN).end();
            return;
          }
          setCorsHeaders(res, requestOrigin || '*', methods, allowedHeaders, exposedHeaders, credentials, maxAge);
          if (preflightContinue) {
            next();
          } else {
            res.status(optionsSuccessStatus).end();
          }
        });
      } else {
        const allowOrigin = getAllowOrigin(origin, requestOrigin);
        if (allowOrigin) {
        setCorsHeaders(res, allowOrigin || '*', methods, allowedHeaders, exposedHeaders, credentials, maxAge);
        if (preflightContinue) {
          next();
        } else {
          res.status(optionsSuccessStatus).end();
        }
        } else {
          res.status(HTTP_STATUS.FORBIDDEN).end();
        }
      }
      return;
    }

    // Handle actual requests
    if (typeof origin === 'function') {
      origin(requestOrigin, (err, allow) => {
        if (err || !allow) {
          res.status(HTTP_STATUS.FORBIDDEN).end();
          return;
        }
        setCorsHeaders(res, requestOrigin || '*', methods, allowedHeaders, exposedHeaders, credentials, maxAge);
        next();
      });
    } else {
      const allowOrigin = getAllowOrigin(origin, requestOrigin);
      if (allowOrigin) {
        setCorsHeaders(res, allowOrigin || '*', methods, allowedHeaders, exposedHeaders, credentials, maxAge);
        next();
      } else {
        res.status(HTTP_STATUS.FORBIDDEN).end();
      }
    }
  };
};

const getAllowOrigin = (origin: string | string[] | boolean, requestOrigin: string | undefined): string | null => {
  if (origin === true) {
    return requestOrigin || '*';
  }
  if (origin === false) {
    return null;
  }
  if (typeof origin === 'string') {
    return origin;
  }
  if (Array.isArray(origin)) {
    return origin.includes(requestOrigin || '') ? requestOrigin || null : null;
  }
  return null;
};

const setCorsHeaders = (
  res: Response,
  allowOrigin: string,
  methods: string | string[],
  allowedHeaders: string | string[],
  exposedHeaders: string | string[],
  credentials: boolean,
  maxAge: number
): void => {
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Methods', Array.isArray(methods) ? methods.join(', ') : methods);
  res.setHeader('Access-Control-Allow-Headers', Array.isArray(allowedHeaders) ? allowedHeaders.join(', ') : allowedHeaders);
  
  if (exposedHeaders.length > 0) {
    res.setHeader('Access-Control-Expose-Headers', Array.isArray(exposedHeaders) ? exposedHeaders.join(', ') : exposedHeaders);
  }
  
  if (credentials) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  res.setHeader('Access-Control-Max-Age', maxAge.toString());
};

// Predefined CORS configurations
export const corsMiddleware = createCorsMiddleware({
  origin: ENV.NODE_ENV === 'production' 
    ? ['https://yourdomain.com', 'https://www.yourdomain.com']
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  maxAge: 86400,
});

export const publicCorsMiddleware = createCorsMiddleware({
  origin: true,
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
  credentials: false,
  maxAge: 3600,
});
