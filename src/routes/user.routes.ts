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

const router = Router();

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
  authenticateToken,
  requireStaff,
  getAllUsers
);

// GET /api/v1/users/search - Search users
router.get(
  '/search',
  validate(validateSearch),
  authenticateToken,
  requireStaff,
  searchUsers
);

// GET /api/v1/users/role/:role - Get users by role
router.get(
  '/role/:role',
  validate(validateRole),
  authenticateToken,
  requireAdmin,
  getUsersByRole
);

// GET /api/v1/users/profile - Get user profile
router.get(
  USER_ROUTES.GET_PROFILE,
  authenticateToken,
  getUserProfile
);

// GET /api/v1/users/:id - Get user by ID
router.get(
  USER_ROUTES.GET_BY_ID,
  validate(validateId),
  authenticateToken,
  requireStaff,
  getUserById
);

// PUT /api/v1/users/profile - Update user profile
router.put(
  USER_ROUTES.UPDATE_PROFILE,
  authenticateToken,
  validate(validateUpdateProfile),
  updateUserProfile
);

// PUT /api/v1/users/profile/avatar - Update user avatar
router.put(
  USER_ROUTES.UPDATE_AVATAR,
  authenticateToken,
  uploadSingleWithError('avatar'),
  updateUserAvatar
);

// PUT /api/v1/users/change-password - Change password
router.put(
  USER_ROUTES.CHANGE_PASSWORD,
  authenticateToken,
  validate(validateChangePassword),
  changePassword
);

// DELETE /api/v1/users/:id - Delete user
router.delete(
  USER_ROUTES.DELETE,
  validate(validateId),
  authenticateToken,
  requireAdmin,
  deleteUser
);

// PATCH /api/v1/users/:id/soft-delete - Soft delete user
router.patch(
  USER_ROUTES.SOFT_DELETE,
  validate(validateId),
  authenticateToken,
  requireAdmin,
  softDeleteUser
);

export default router; 