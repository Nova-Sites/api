import { Response } from 'express';
import { COOKIE_CONSTANTS, SAME_SITE_OPTIONS, TOKEN_TYPES, TOKEN_EXPIRATION_CONSTANTS, PRODUCTION_ENVIRONMENT } from '@/constants';
import { CookieOptions } from '@/types';

export class CookieUtils {
  private static readonly DEFAULT_OPTIONS: Partial<CookieOptions> = {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === PRODUCTION_ENVIRONMENT,
    sameSite: SAME_SITE_OPTIONS.STRICT,
  };

  /**
   * Set access token cookie (path: /)
   */
  static setAccessTokenCookie(res: Response, token: string, expiresIn: number): void {
    const options: CookieOptions = {
      ...this.DEFAULT_OPTIONS,
      maxAge: expiresIn * 1000, // Convert to milliseconds
      path: COOKIE_CONSTANTS.ACCESS_TOKEN_COOKIE_PATH, // Default path for all routes
    } as CookieOptions;

    res.cookie(COOKIE_CONSTANTS.ACCESS_TOKEN_COOKIE_NAME, token, options);
  }

  /**
   * Set refresh token cookie (path: /api/v1/auth/refresh-token)
   */
  static setRefreshTokenCookie(res: Response, token: string): void {
    const options: CookieOptions = {
      ...this.DEFAULT_OPTIONS,
      maxAge: TOKEN_EXPIRATION_CONSTANTS.REFRESH_TOKEN_EXPIRES_IN * 1000, // 7 days in milliseconds
      path: COOKIE_CONSTANTS.REFRESH_TOKEN_COOKIE_PATH, // Specific path for refresh token
    } as CookieOptions;

    res.cookie(COOKIE_CONSTANTS.REFRESH_TOKEN_COOKIE_NAME, token, options);
  }

  /**
   * Clear access token cookie
   */
  static clearAccessTokenCookie(res: Response): void {
    res.clearCookie(COOKIE_CONSTANTS.ACCESS_TOKEN_COOKIE_NAME, {
      path: COOKIE_CONSTANTS.ACCESS_TOKEN_COOKIE_PATH,
      httpOnly: true,
      secure: process.env['NODE_ENV'] === PRODUCTION_ENVIRONMENT,
      sameSite: SAME_SITE_OPTIONS.STRICT,
    });
  }

  /**
   * Clear refresh token cookie
   */
  static clearRefreshTokenCookie(res: Response): void {
    res.clearCookie(COOKIE_CONSTANTS.REFRESH_TOKEN_COOKIE_NAME, {
      path: COOKIE_CONSTANTS.REFRESH_TOKEN_COOKIE_PATH,
      httpOnly: true,
      secure: process.env['NODE_ENV'] === PRODUCTION_ENVIRONMENT,
      sameSite: SAME_SITE_OPTIONS.STRICT,
    });
  }

  /**
   * Clear all authentication cookies
   */
  static clearAllAuthCookies(res: Response): void {
    this.clearAccessTokenCookie(res);
    this.clearRefreshTokenCookie(res);
  }

  /**
   * Set both access and refresh token cookies
   */
  static setAuthCookies(res: Response, accessToken: string, refreshToken: string, expiresIn: number): void {
    this.setAccessTokenCookie(res, accessToken, expiresIn);
    this.setRefreshTokenCookie(res, refreshToken);
  }

  /**
   * Get cookie options for specific token type
   */
  static getCookieOptions(tokenType: typeof TOKEN_TYPES[keyof typeof TOKEN_TYPES], expiresIn?: number): CookieOptions {
    const baseOptions = {
      ...this.DEFAULT_OPTIONS,
    };

    if (tokenType === TOKEN_TYPES.ACCESS) {
      return {
        ...baseOptions,
        maxAge: (expiresIn || TOKEN_EXPIRATION_CONSTANTS.ACCESS_TOKEN_EXPIRES_IN) * 1000, // Default 24 hours
        path: COOKIE_CONSTANTS.ACCESS_TOKEN_COOKIE_PATH,
      } as CookieOptions;
    } else {
      return {
        ...baseOptions,
        maxAge: TOKEN_EXPIRATION_CONSTANTS.REFRESH_TOKEN_EXPIRES_IN * 1000, // 7 days
        path: COOKIE_CONSTANTS.REFRESH_TOKEN_COOKIE_PATH,
      } as CookieOptions;
    }
  }
}
