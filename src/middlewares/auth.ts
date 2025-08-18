import { Request, Response, NextFunction } from 'express';
import { JWTUtils } from '@/utils/jwtUtils';
import { sendErrorResponse } from '@/utils/responseFormatter';
import { HTTP_STATUS } from '@/constants';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    username: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware to authenticate JWT access token
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = JWTUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      return sendErrorResponse(
        res,
        'Access token is required',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    // Verify token
    const decoded = JWTUtils.verifyAccessToken(token);
    
    // Add user info to request
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return sendErrorResponse(
      res,
      'Invalid or expired access token',
      HTTP_STATUS.UNAUTHORIZED
    );
  }
};

/**
 * Middleware to check if user has required role
 */
export const requireRole = (requiredRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return sendErrorResponse(
        res,
        'Authentication required',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    if (!requiredRoles.includes(req.user.role)) {
      return sendErrorResponse(
        res,
        'Insufficient permissions',
        HTTP_STATUS.FORBIDDEN
      );
    }

    next();
  };
};

/**
 * Middleware to check if user is admin or super admin
 */
export const requireAdmin = requireRole(['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']);

/**
 * Middleware to check if user is super admin only
 */
export const requireSuperAdmin = requireRole(['ROLE_SUPER_ADMIN']);

/**
 * Middleware to check if user is staff or higher
 */
export const requireStaff = requireRole(['ROLE_STAFF', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN']);

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTUtils.extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = JWTUtils.verifyAccessToken(token);
      req.user = {
        userId: decoded.userId,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role,
      };
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
