import jwt from 'jsonwebtoken';
import { IUser } from '@/types';
import { JWT_CONSTANTS, MESSAGES } from '@/constants';

export interface TokenPayload {
  userId: number;
  username: string;
  email: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

export class JWTUtils {
  private static readonly ACCESS_TOKEN_SECRET = process.env['JWT_ACCESS_SECRET'] || 'your-access-secret-key';
  private static readonly REFRESH_TOKEN_SECRET = process.env['JWT_REFRESH_SECRET'] || 'your-refresh-secret-key';

  /**
   * Generate access token
   */
  static generateAccessToken(user: IUser): string {
    const payload: TokenPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, {
      expiresIn: JWT_CONSTANTS.ACCESS_TOKEN_EXPIRES_IN,
      algorithm: JWT_CONSTANTS.ALGORITHM as jwt.Algorithm,
    });
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(user: IUser): string {
    const payload: TokenPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
      expiresIn: JWT_CONSTANTS.REFRESH_TOKEN_EXPIRES_IN,
      algorithm: JWT_CONSTANTS.ALGORITHM as jwt.Algorithm,
    });
  }

  /**
   * Generate both access and refresh tokens
   */
  static generateTokenPair(user: IUser): TokenPair {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Calculate expiration time in seconds
    const expiresIn = this.getExpirationTime(JWT_CONSTANTS.ACCESS_TOKEN_EXPIRES_IN);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): DecodedToken {
    try {
      return jwt.verify(token, this.ACCESS_TOKEN_SECRET, {
        algorithms: [JWT_CONSTANTS.ALGORITHM as jwt.Algorithm],
      }) as DecodedToken;
    } catch (error) {
      throw new Error(MESSAGES.ERROR.AUTH.INVALID_ACCESS_TOKEN);
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): DecodedToken {
    try {
      return jwt.verify(token, this.REFRESH_TOKEN_SECRET, {
        algorithms: [JWT_CONSTANTS.ALGORITHM as jwt.Algorithm],
      }) as DecodedToken;
    } catch (error) {
      throw new Error(MESSAGES.ERROR.AUTH.INVALID_REFRESH_TOKEN);
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decodeToken(token: string): DecodedToken | null {
    try {
      return jwt.decode(token) as DecodedToken;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as DecodedToken;
      if (!decoded || !decoded.exp) return true;
      
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Get token expiration time in seconds
   */
  private static getExpirationTime(expiresIn: string): number {
    const timeUnit = expiresIn.slice(-1);
    const timeValue = parseInt(expiresIn.slice(0, -1));

    switch (timeUnit) {
      case 's':
        return timeValue;
      case 'm':
        return timeValue * 60;
      case 'h':
        return timeValue * 60 * 60;
      case 'd':
        return timeValue * 24 * 60 * 60;
      default:
        return 24 * 60 * 60; // Default 24 hours
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Get token info for debugging
   */
  static getTokenInfo(token: string): {
    isValid: boolean;
    isExpired: boolean;
    payload?: DecodedToken;
    error?: string;
  } {
    try {
      const payload = this.decodeToken(token);
      if (!payload) {
        return {
          isValid: false,
          isExpired: true,
          error: MESSAGES.ERROR.AUTH.INVALID_TOKEN,
        };
      }

      const isExpired = this.isTokenExpired(token);
      return {
        isValid: !isExpired,
        isExpired,
        payload,
      };
    } catch (error) {
      return {
        isValid: false,
        isExpired: true,
        error: error instanceof Error ? error.message : MESSAGES.ERROR.INTERNAL_ERROR,
      };
    }
  }
}
