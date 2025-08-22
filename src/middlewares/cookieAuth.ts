import { Request, Response, NextFunction } from 'express';
import { MESSAGES } from '@/constants';

export interface CookieRequest extends Request {
  cookies: {
    access_token?: string;
    refresh_token?: string;
  };
}

/**
 * Middleware to extract tokens from cookies and add to request
 */
export const extractTokensFromCookies = (
  req: CookieRequest,
  _res: Response,
  next: NextFunction
): void => {
  // Extract tokens from cookies if they exist
  const accessToken = req.cookies?.access_token;
  const refreshToken = req.cookies?.refresh_token;

  // Add tokens to request object for easy access
  (req as any).accessToken = accessToken;
  (req as any).refreshToken = refreshToken;

  next();
};

/**
 * Middleware to check if user has valid access token from cookies
 */
export const requireCookieAuth = (
  req: CookieRequest,
  res: Response,
  next: NextFunction
): void => {
  const accessToken = req.cookies?.access_token;

  if (!accessToken) {
    res.status(401).json({
      success: false,
      message: MESSAGES.ERROR.AUTH.REQUIRED_ACCESS_TOKEN,
      statusCode: 401,
    });
    return;
  }

  next();
};

/**
 * Optional cookie authentication middleware
 */
export const optionalCookieAuth = (
  _req: CookieRequest,
  _res: Response,
  next: NextFunction
): void => {
  // Always continue, tokens are optional
  next();
};
