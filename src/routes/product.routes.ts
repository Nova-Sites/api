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
  getProductsByTechStack,
  searchProducts,
  getProductsByPriceRange,
} from '@/controllers/product.controller';
import { PRODUCT_ROUTES } from '@/constants';
import { authenticateToken, requireStaff, requireAdmin } from '@/middlewares/auth';
import { uploadFieldsWithError } from '@/utils/multer';
import { validate } from '@/middlewares/validator';
import { generalRateLimiter, strictRateLimiter, uploadRateLimiter } from '@/middlewares/rateLimiter';
import { securityHeaders, requestSizeLimiter, sqlInjectionProtection, xssProtection, sanitizeRequest } from '@/middlewares/security';
import { requestLogger } from '@/middlewares/logger';
import { asyncHandler } from '@/middlewares/error';

const router = Router();

// Apply security middlewares to all routes
router.use(securityHeaders);
router.use(requestSizeLimiter(10 * 1024 * 1024)); // 10MB limit for products (larger due to images)
router.use(sqlInjectionProtection);
router.use(xssProtection);
router.use(sanitizeRequest);
router.use(requestLogger);

// Validation chains
const validateCreateProduct = [
  body('name').notEmpty().isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
  body('description').notEmpty().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('price').notEmpty().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('categoryId').notEmpty().isInt({ min: 1 }).withMessage('Category ID must be a positive integer'),
  body('techStackIds').optional().isArray().withMessage('Tech stack IDs must be an array'),
  body('techStackIds.*').optional().isInt({ min: 1 }).withMessage('Each tech stack ID must be a positive integer'),
];

const validateUpdateProduct = [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  body('name').optional().isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
  body('description').optional().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('categoryId').optional().isInt({ min: 1 }).withMessage('Category ID must be a positive integer'),
  body('techStackIds').optional().isArray().withMessage('Tech stack IDs must be an array'),
  body('techStackIds.*').optional().isInt({ min: 1 }).withMessage('Each tech stack ID must be a positive integer'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

// GET /api/v1/products
router.get(PRODUCT_ROUTES.GET_ALL, generalRateLimiter, asyncHandler(getAllProducts));

// GET /api/v1/products/popular
router.get(PRODUCT_ROUTES.POPULAR, generalRateLimiter, asyncHandler(getPopularProducts));

// GET /api/v1/products/search
router.get(PRODUCT_ROUTES.SEARCH, generalRateLimiter, asyncHandler(searchProducts));

// GET /api/v1/products/category/:categoryId
router.get(PRODUCT_ROUTES.BY_CATEGORY, generalRateLimiter, asyncHandler(getProductsByCategory));

// GET /api/v1/products/tech-stack/:techStackId
router.get(PRODUCT_ROUTES.BY_TECH_STACK, generalRateLimiter, asyncHandler(getProductsByTechStack));

// GET /api/v1/products/price-range/:minPrice/:maxPrice
router.get(PRODUCT_ROUTES.BY_PRICE_RANGE, generalRateLimiter, asyncHandler(getProductsByPriceRange));

// GET /api/v1/products/:id
router.get(PRODUCT_ROUTES.GET_BY_ID, generalRateLimiter, asyncHandler(getProductById));

// GET /api/v1/products/slug/:slug
router.get(PRODUCT_ROUTES.GET_BY_SLUG, generalRateLimiter, asyncHandler(getProductBySlug));

// POST /api/v1/products - Create with main image and additional images
router.post(
  PRODUCT_ROUTES.CREATE,
  uploadRateLimiter,
  authenticateToken,
  requireStaff,
  uploadFieldsWithError([
    { name: 'image', maxCount: 1 }, // Main image
    { name: 'images', maxCount: 10 } // Additional images
  ]),
  validate(validateCreateProduct),
  asyncHandler(createProduct)
);

// PUT /api/v1/products/:id - Update with main image and additional images
router.put(
  PRODUCT_ROUTES.UPDATE,
  uploadRateLimiter,
  authenticateToken,
  requireStaff,
  uploadFieldsWithError([
    { name: 'image', maxCount: 1 }, // Main image
    { name: 'images', maxCount: 10 } // Additional images
  ]),
  validate(validateUpdateProduct),
  asyncHandler(updateProduct)
);

// DELETE /api/v1/products/:id
router.delete(
  PRODUCT_ROUTES.DELETE,
  strictRateLimiter,
  authenticateToken,
  requireAdmin,
  asyncHandler(deleteProduct)
);

// PATCH /api/v1/products/:id/soft-delete
router.patch(
  PRODUCT_ROUTES.SOFT_DELETE,
  strictRateLimiter,
  authenticateToken,
  requireStaff,
  asyncHandler(softDeleteProduct)
);

export default router; 