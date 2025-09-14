import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  getAllTechStacks,
  getTechStackById,
  getTechStackBySlug,
  createTechStack,
  updateTechStack,
  deleteTechStack,
  searchTechStacks,
  getTechStacksWithProductCount,
} from '@/controllers/tech-stack.controller';
import { validate } from '@/middlewares/validator';
import { TECH_STACK_ROUTES } from '@/constants';
import { authenticateToken, requireStaff, requireAdmin } from '@/middlewares/auth';
import { uploadSingleWithError } from '@/utils/multer';
import { generalRateLimiter, strictRateLimiter, uploadRateLimiter } from '@/middlewares/rateLimiter';
import { securityHeaders, requestSizeLimiter, sqlInjectionProtection, xssProtection, sanitizeRequest } from '@/middlewares/security';
import { requestLogger } from '@/middlewares/logger';
import { asyncHandler } from '@/middlewares/error';

const router = Router();

// Apply security middlewares to all routes
router.use(securityHeaders);
router.use(requestSizeLimiter(5 * 1024 * 1024)); // 5MB limit for tech stacks
router.use(sqlInjectionProtection);
router.use(xssProtection);
router.use(sanitizeRequest);
router.use(requestLogger);

// Validation chains
const validateId = [param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer')];
const validateSlug = [param('slug').notEmpty().withMessage('Slug is required')];
const validateSearch = [query('search').notEmpty().isLength({ min: 2, max: 100 }).withMessage('Search term must be between 2 and 100 characters')];
const validateCreateTechStack = [
  body('name').notEmpty().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('slug').notEmpty().isLength({ min: 2, max: 100 }).withMessage('Slug must be between 2 and 100 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  body('iconUrl').optional().isURL().withMessage('Icon URL must be a valid URL'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];
const validateUpdateTechStack = [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  body('name').optional().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('slug').optional().isLength({ min: 2, max: 100 }).withMessage('Slug must be between 2 and 100 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  body('iconUrl').optional().isURL().withMessage('Icon URL must be a valid URL'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

// Public routes
router.get(TECH_STACK_ROUTES.GET_ALL, generalRateLimiter, asyncHandler(getAllTechStacks));
router.get(TECH_STACK_ROUTES.GET_BY_ID, generalRateLimiter, validate(validateId), asyncHandler(getTechStackById));
router.get(TECH_STACK_ROUTES.GET_BY_SLUG, generalRateLimiter, validate(validateSlug), asyncHandler(getTechStackBySlug));
router.get(TECH_STACK_ROUTES.SEARCH, generalRateLimiter, validate(validateSearch), asyncHandler(searchTechStacks));
router.get(TECH_STACK_ROUTES.WITH_PRODUCT_COUNT, generalRateLimiter, asyncHandler(getTechStacksWithProductCount));

// Protected routes - require authentication
router.use(authenticateToken);

// Staff routes - require staff role
router.post(
  TECH_STACK_ROUTES.CREATE,
  uploadRateLimiter,
  requireStaff,
  uploadSingleWithError('icon'),
  validate(validateCreateTechStack),
  asyncHandler(createTechStack)
);

router.put(
  TECH_STACK_ROUTES.UPDATE,
  uploadRateLimiter,
  requireStaff,
  uploadSingleWithError('icon'),
  validate(validateUpdateTechStack),
  asyncHandler(updateTechStack)
);

// Admin routes - require admin role
router.delete(
  TECH_STACK_ROUTES.DELETE,
  strictRateLimiter,
  requireAdmin,
  validate(validateId),
  asyncHandler(deleteTechStack)
);

export default router;
