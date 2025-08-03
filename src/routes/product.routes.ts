import { Router } from 'express';
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

const router = Router();

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
router.post(PRODUCT_ROUTES.CREATE, createProduct);

// PUT /api/v1/products/:id
router.put(PRODUCT_ROUTES.UPDATE, updateProduct);

// DELETE /api/v1/products/:id
router.delete(PRODUCT_ROUTES.DELETE, deleteProduct);

// PATCH /api/v1/products/:id/soft-delete
router.patch(PRODUCT_ROUTES.SOFT_DELETE, softDeleteProduct);

export default router; 