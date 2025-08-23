import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getAllProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  softDeleteProduct,
  getPopularProducts,
  getProductsByCategory,
  searchProducts,
  getProductsByPriceRange,
} from '@/controllers/product.controller';
import { PRODUCT_ROUTES } from '@/constants';
import { authenticateToken, requireStaff, requireAdmin } from '@/middlewares/auth';
import { uploadSingleWithError } from '@/utils/multer';
import { validate } from '@/middlewares/validator';

const router = Router();

// Validation chains
const validateCreateProduct = [
  body('name').notEmpty().isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
  body('description').notEmpty().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('price').notEmpty().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('categoryId').notEmpty().isInt({ min: 1 }).withMessage('Category ID must be a positive integer'),
];

const validateUpdateProduct = [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  body('name').optional().isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
  body('description').optional().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('categoryId').optional().isInt({ min: 1 }).withMessage('Category ID must be a positive integer'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

// GET /api/v1/products
router.get(PRODUCT_ROUTES.GET_ALL, getAllProducts);

// GET /api/v1/products/popular
router.get(PRODUCT_ROUTES.POPULAR, getPopularProducts);

// GET /api/v1/products/search
router.get(PRODUCT_ROUTES.SEARCH, searchProducts);

// GET /api/v1/products/category/:categoryId
router.get(PRODUCT_ROUTES.BY_CATEGORY, getProductsByCategory);

// GET /api/v1/products/price-range/:minPrice/:maxPrice
router.get(PRODUCT_ROUTES.BY_PRICE_RANGE, getProductsByPriceRange);

// GET /api/v1/products/:id
router.get(PRODUCT_ROUTES.GET_BY_ID, getProductById);

// GET /api/v1/products/slug/:slug
router.get(PRODUCT_ROUTES.GET_BY_SLUG, getProductBySlug);

// POST /api/v1/products
router.post(
  PRODUCT_ROUTES.CREATE,
  authenticateToken,
  requireStaff,
  uploadSingleWithError('image'),
  validate(validateCreateProduct),
  createProduct
);

// PUT /api/v1/products/:id
router.put(
  PRODUCT_ROUTES.UPDATE,
  authenticateToken,
  requireStaff,
  uploadSingleWithError('image'),
  validate(validateUpdateProduct),
  updateProduct
);

// DELETE /api/v1/products/:id
router.delete(
  PRODUCT_ROUTES.DELETE,
  authenticateToken,
  requireAdmin,
  deleteProduct
);

// PATCH /api/v1/products/:id/soft-delete
router.patch(
  PRODUCT_ROUTES.SOFT_DELETE,
  authenticateToken,
  requireStaff,
  softDeleteProduct
);

export default router; 