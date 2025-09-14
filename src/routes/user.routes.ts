import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  getAllUsers,
  getUserById,
  getUserProfile,
  updateUserProfile,
  updateUserAvatar,
  changePassword,
  deleteUser,
  softDeleteUser,
  getUsersByRole,
  searchUsers,
} from '@/controllers/user.controller';
import { validate } from '@/middlewares/validator';
import { USER_ROUTES } from '@/constants';
import { authenticateToken, requireAdmin, requireStaff } from '@/middlewares/auth';
import { uploadSingleWithError } from '@/utils/multer';
import { generalRateLimiter, strictRateLimiter, uploadRateLimiter } from '@/middlewares/rateLimiter';
import { securityHeaders, requestSizeLimiter, sqlInjectionProtection, xssProtection, sanitizeRequest } from '@/middlewares/security';
import { requestLogger } from '@/middlewares/logger';
import { asyncHandler } from '@/middlewares/error';

const router = Router();

// Apply security middlewares to all routes
router.use(securityHeaders);
router.use(requestSizeLimiter(5 * 1024 * 1024)); // 5MB limit for users
router.use(sqlInjectionProtection);
router.use(xssProtection);
router.use(sanitizeRequest);
router.use(requestLogger);

// Validation chains
const validateId = [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer')
];

const validateRole = [
  param('role').isIn(['ROLE_ADMIN', 'ROLE_USER', 'ROLE_STAFF']).withMessage('Invalid role')
];

const validateSearch = [
  query('search').notEmpty().isLength({ min: 2, max: 100 }).withMessage('Search term must be between 2 and 100 characters')
];

const validateUpdateProfile = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-50 characters, alphanumeric and underscore only'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Valid email is required'),
  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL'),
];

const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .notEmpty()
    .isLength({ min: 6, max: 255 })
    .withMessage('New password must be at least 6 characters'),
];

// GET /api/v1/users - Get all users
router.get(
  USER_ROUTES.GET_ALL,
  generalRateLimiter,
  authenticateToken,
  requireStaff,
  asyncHandler(getAllUsers)
);

// GET /api/v1/users/search - Search users
router.get(
  '/search',
  generalRateLimiter,
  validate(validateSearch),
  authenticateToken,
  requireStaff,
  asyncHandler(searchUsers)
);

// GET /api/v1/users/role/:role - Get users by role
router.get(
  '/role/:role',
  generalRateLimiter,
  validate(validateRole),
  authenticateToken,
  requireAdmin,
  asyncHandler(getUsersByRole)
);

// GET /api/v1/users/profile - Get user profile
router.get(
  USER_ROUTES.GET_PROFILE,
  generalRateLimiter,
  authenticateToken,
  asyncHandler(getUserProfile)
);

// GET /api/v1/users/:id - Get user by ID
router.get(
  USER_ROUTES.GET_BY_ID,
  generalRateLimiter,
  validate(validateId),
  authenticateToken,
  requireStaff,
  asyncHandler(getUserById)
);

// PUT /api/v1/users/profile - Update user profile
router.put(
  USER_ROUTES.UPDATE_PROFILE,
  strictRateLimiter,
  authenticateToken,
  validate(validateUpdateProfile),
  asyncHandler(updateUserProfile)
);

// PUT /api/v1/users/profile/avatar - Update user avatar
router.put(
  USER_ROUTES.UPDATE_AVATAR,
  uploadRateLimiter,
  authenticateToken,
  uploadSingleWithError('avatar'),
  asyncHandler(updateUserAvatar)
);

// PUT /api/v1/users/change-password - Change password
router.put(
  USER_ROUTES.CHANGE_PASSWORD,
  strictRateLimiter,
  authenticateToken,
  validate(validateChangePassword),
  asyncHandler(changePassword)
);

// DELETE /api/v1/users/:id - Delete user
router.delete(
  USER_ROUTES.DELETE,
  strictRateLimiter,
  validate(validateId),
  authenticateToken,
  requireAdmin,
  asyncHandler(deleteUser)
);

// PATCH /api/v1/users/:id/soft-delete - Soft delete user
router.patch(
  USER_ROUTES.SOFT_DELETE,
  strictRateLimiter,
  validate(validateId),
  authenticateToken,
  requireAdmin,
  asyncHandler(softDeleteUser)
);

export default router; 