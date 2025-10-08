import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '@/constants';
import { Logger } from '@/lib';

const formatRequest = (method: string, url: string, status: number, time: number, ip: string, msg?: string) => {
  return `${method} ${url} ${status} ${time}ms - ${ip}${msg ? ' - ' + msg : ''}`;
};

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  Logger.info(formatRequest(req.method, req.originalUrl, 0, 0, req.ip || 'unknown', 'Request started'));

  const originalEnd = res.end;
  res.end = function (chunk?: any, encoding?: any): Response {
    const responseTime = Date.now() - startTime;
    Logger.info(formatRequest(req.method, req.originalUrl, res.statusCode, responseTime, req.ip || 'unknown'));
    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

export const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  const responseTime = Date.now() - (req as any).startTime || 0;
  Logger.error(formatRequest(
    req.method,
    req.originalUrl,
    res.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
    responseTime,
    req.ip || 'unknown',
    error.message
  ));
  next(error);
};

export const performanceMonitor = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  (req as any).startTime = startTime;

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    if (responseTime > 1000) {
      Logger.warn(formatRequest(
        req.method,
        req.originalUrl,
        res.statusCode,
        responseTime,
        req.ip || 'unknown',
        `Slow request: ${responseTime}ms`
      ));
    }
  });

  next();
};
