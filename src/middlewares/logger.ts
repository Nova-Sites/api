import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '@/constants';

interface LogData {
  timestamp: string;
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  ip: string;
  userAgent: string;
  requestBody?: any;
  error?: string;
}

class Logger {
  private static formatLog(data: LogData): string {
    const { timestamp, method, url, statusCode, responseTime, ip, error } = data;
    
    const baseLog = `[${timestamp}] ${method} ${url} ${statusCode} ${responseTime}ms - ${ip}`;
    
    if (error) {
      return `${baseLog} - ERROR: ${error}`;
    }
    
    return baseLog;
  }

  static info(data: LogData): void {
    console.log(this.formatLog(data));
  }

  static error(data: LogData): void {
    console.error(this.formatLog(data));
  }

  static warn(data: LogData): void {
    console.warn(this.formatLog(data));
  }
}

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  // Log request start
  Logger.info({
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    statusCode: 0,
    responseTime: 0,
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
    requestBody: req.method !== 'GET' ? req.body : undefined,
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any): Response {
    const responseTime = Date.now() - startTime;
    
    Logger.info({
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime,
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
    });

    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

export const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  const responseTime = Date.now() - (req as any).startTime || 0;
  
  Logger.error({
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
    responseTime,
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
    error: error.message,
  });

  next(error);
};

// Performance monitoring middleware
export const performanceMonitor = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  // Add start time to request object
  (req as any).startTime = startTime;
  
  // Monitor slow requests (> 1 second)
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    
    if (responseTime > 1000) {
      Logger.warn({
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseTime,
        ip: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        error: `Slow request: ${responseTime}ms`,
      });
    }
  });

  next();
}; 