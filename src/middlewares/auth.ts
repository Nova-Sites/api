import { Response, NextFunction } from 'express';
import { JWTUtils } from '@/utils/jwtUtils';
import { sendErrorResponse } from '@/utils/responseFormatter';
import { HTTP_STATUS, MESSAGES, USER_ROLES } from '@/constants';
import { AuthenticatedRequest } from '@/types';

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
    console.log('req.headers', req.headers);
    const authHeader = req.headers.authorization;
    const token = JWTUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      return sendErrorResponse(
        res,
        MESSAGES.ERROR.AUTH.REQUIRED_ACCESS_TOKEN,
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
      MESSAGES.ERROR.AUTH.INVALID_ACCESS_TOKEN,
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
        MESSAGES.ERROR.AUTH.REQUIRED_AUTH,
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    if (!requiredRoles.includes(req.user.role)) {
      return sendErrorResponse(
        res,
        MESSAGES.ERROR.AUTH.INSUFFICIENT_PERMISSION,
        HTTP_STATUS.FORBIDDEN
      );
    }

    next();
  };
};

/**
 * Middleware to check if user is admin or super admin
 */
export const requireAdmin = requireRole([USER_ROLES.ROLE_ADMIN, USER_ROLES.ROLE_SUPER_ADMIN]);

/**
 * Middleware to check if user is super admin only
 */
export const requireSuperAdmin = requireRole([USER_ROLES.ROLE_SUPER_ADMIN]);

/**
 * Middleware to check if user is staff or higher
 */
export const requireStaff = requireRole([USER_ROLES.ROLE_STAFF, USER_ROLES.ROLE_ADMIN, USER_ROLES.ROLE_SUPER_ADMIN]);

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
