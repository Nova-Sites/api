import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  softDeleteCategory,
  searchCategories,
  getCategoriesWithProductCount,
} from '@/controllers/category.controller';
import { validate } from '@/middlewares/validator';
import { CATEGORY_ROUTES } from '@/constants';
import { authenticateToken, requireStaff, requireAdmin } from '@/middlewares/auth';
import { uploadSingleWithError } from '@/utils/multer';
import { generalRateLimiter, strictRateLimiter } from '@/middlewares/rateLimiter';
import { securityHeaders, requestSizeLimiter, sqlInjectionProtection, xssProtection, sanitizeRequest } from '@/middlewares/security';
import { requestLogger } from '@/middlewares/logger';
import { asyncHandler } from '@/middlewares/error';

const router = Router();

// Apply security middlewares to all routes
router.use(securityHeaders);
router.use(requestSizeLimiter(5 * 1024 * 1024)); // 5MB limit for categories
router.use(sqlInjectionProtection);
router.use(xssProtection);
router.use(sanitizeRequest);
router.use(requestLogger);

// Validation chains
const validateId = [param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer')];
const validateSlug = [param('slug').notEmpty().withMessage('Slug is required')];
const validateSearch = [query('search').notEmpty().isLength({ min: 2, max: 100 }).withMessage('Search term must be between 2 and 100 characters')];
const validateCreateCategory = [
  body('name').notEmpty().isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
];
const validateUpdateCategory = [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  body('name').optional().isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

// GET /api/v1/categories - Get all categories
router.get(
  CATEGORY_ROUTES.GET_ALL, 
  generalRateLimiter,
  asyncHandler(getAllCategories)
);

// GET /api/v1/categories/search - Search categories
router.get(
  CATEGORY_ROUTES.SEARCH, 
  generalRateLimiter,
  validate(validateSearch),
  asyncHandler(searchCategories)
);

// GET /api/v1/categories/with-product-count - Get categories with product count
router.get(
  CATEGORY_ROUTES.WITH_PRODUCT_COUNT, 
  generalRateLimiter,
  asyncHandler(getCategoriesWithProductCount)
);

// GET /api/v1/categories/:id - Get category by ID
router.get(
  CATEGORY_ROUTES.GET_BY_ID, 
  generalRateLimiter,
  validate(validateId),
  asyncHandler(getCategoryById)
);

// GET /api/v1/categories/slug/:slug - Get category by slug
router.get(
  CATEGORY_ROUTES.GET_BY_SLUG, 
  generalRateLimiter,
  validate(validateSlug),
  asyncHandler(getCategoryBySlug)
);

// POST /api/v1/categories - Create new category
router.post(
  CATEGORY_ROUTES.CREATE, 
  strictRateLimiter,
  authenticateToken,
  requireStaff,
  uploadSingleWithError('image'),
  validate(validateCreateCategory),
  asyncHandler(createCategory)
);

// PUT /api/v1/categories/:id - Update category
router.put(
  CATEGORY_ROUTES.UPDATE, 
  strictRateLimiter,
  authenticateToken,
  requireStaff,
  uploadSingleWithError('image'),
  validate(validateUpdateCategory),
  asyncHandler(updateCategory)
);

// DELETE /api/v1/categories/:id - Delete category
router.delete(
  CATEGORY_ROUTES.DELETE, 
  strictRateLimiter,
  authenticateToken,
  requireAdmin,
  validate(validateId),
  asyncHandler(deleteCategory)
);

// PATCH /api/v1/categories/:id/soft-delete - Soft delete category
router.patch(
  CATEGORY_ROUTES.SOFT_DELETE, 
  strictRateLimiter,
  authenticateToken,
  requireStaff,
  validate(validateId),
  asyncHandler(softDeleteCategory)
);

export default router; 