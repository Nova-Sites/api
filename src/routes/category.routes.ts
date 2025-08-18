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

const router = Router();

// Validation chains
const validateId = [param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer')];
const validateSlug = [param('slug').notEmpty().withMessage('Slug is required')];
const validateSearch = [query('search').notEmpty().isLength({ min: 2, max: 100 }).withMessage('Search term must be between 2 and 100 characters')];
const validateCreateCategory = [
  body('name').notEmpty().isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
  body('image').notEmpty().isURL().withMessage('Image must be a valid URL'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
];
const validateUpdateCategory = [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  body('name').optional().isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
  body('image').optional().isURL().withMessage('Image must be a valid URL'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

// GET /api/v1/categories - Get all categories
router.get(
  CATEGORY_ROUTES.GET_ALL, 
  getAllCategories
);

// GET /api/v1/categories/search - Search categories
router.get(
  CATEGORY_ROUTES.SEARCH, 
  validate(validateSearch),
  searchCategories
);

// GET /api/v1/categories/with-product-count - Get categories with product count
router.get(
  CATEGORY_ROUTES.WITH_PRODUCT_COUNT, 
  getCategoriesWithProductCount
);

// GET /api/v1/categories/:id - Get category by ID
router.get(
  CATEGORY_ROUTES.GET_BY_ID, 
  validate(validateId),
  getCategoryById
);

// GET /api/v1/categories/slug/:slug - Get category by slug
router.get(
  CATEGORY_ROUTES.GET_BY_SLUG, 
  validate(validateSlug),
  getCategoryBySlug
);

// POST /api/v1/categories - Create new category
router.post(
  CATEGORY_ROUTES.CREATE, 
  authenticateToken,
  requireStaff,
  validate(validateCreateCategory),
  createCategory
);

// PUT /api/v1/categories/:id - Update category
router.put(
  CATEGORY_ROUTES.UPDATE, 
  authenticateToken,
  requireStaff,
  validate(validateUpdateCategory),
  updateCategory
);

// DELETE /api/v1/categories/:id - Delete category
router.delete(
  CATEGORY_ROUTES.DELETE, 
  authenticateToken,
  requireAdmin,
  validate(validateId),
  deleteCategory
);

// PATCH /api/v1/categories/:id/soft-delete - Soft delete category
router.patch(
  CATEGORY_ROUTES.SOFT_DELETE, 
  authenticateToken,
  requireStaff,
  validate(validateId),
  softDeleteCategory
);

export default router; 