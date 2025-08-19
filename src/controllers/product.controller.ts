import { Request, Response } from 'express';
import { ProductService } from '@/services/product.service';
import { sendSuccessResponse, sendNotFoundResponse } from '@/utils/responseFormatter';
import { MESSAGES, PAGINATION } from '@/constants';
import { asyncHandler } from '@/middlewares/error';
import { AuthenticatedRequest } from '@/middlewares/auth';

export const getAllProducts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { page, limit, sortBy, sortOrder, categoryId, search, minPrice, maxPrice } = req.query as any;
  
  const filters = {
    ...(categoryId && { categoryId: parseInt(categoryId) }),
    ...(search && { search }),
    ...(minPrice && { minPrice: parseFloat(minPrice) }),
    ...(maxPrice && { maxPrice: parseFloat(maxPrice) }),
  };
  
  const pagination = {
    page: parseInt(page) || PAGINATION.DEFAULT_PAGE,
    limit: parseInt(limit) || PAGINATION.DEFAULT_LIMIT,
    sortBy: sortBy || 'createdAt',
    sortOrder: sortOrder || 'DESC',
  };
  
  const { count, products } = await ProductService.getAllProducts(filters, pagination);
  
  sendSuccessResponse(res, {
    products,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: count,
      totalPages: Math.ceil(count / pagination.limit),
    },
  }, MESSAGES.SUCCESS.FETCHED);
});

export const getProductById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.PRODUCT.REQUIRED_ID);
  }
  
  const product = await ProductService.getProductById(parseInt(id));
  if (!product) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.PRODUCT.PRODUCT_NOT_FOUND);
  }
  
  // Increment views
  await ProductService.incrementViews(parseInt(id));
  
  sendSuccessResponse(res, product, MESSAGES.SUCCESS.FETCHED);
});

export const getProductBySlug = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params;
  if (!slug) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.PRODUCT.REQUIRED_SLUG);
  }
  
  const product = await ProductService.getProductBySlug(slug);
  if (!product) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.PRODUCT.PRODUCT_NOT_FOUND);
  }
  
  sendSuccessResponse(res, product, MESSAGES.SUCCESS.FETCHED);
});

export const createProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name, description, image, price, categoryId } = req.body;
  
  const payload: any = {
    name,
    description,
    image,
    price: parseFloat(price),
    categoryId: parseInt(categoryId),
  };
  if (req.user?.userId !== undefined) {
    payload.createdBy = req.user.userId;
  }
  const product = await ProductService.createProduct(payload);
  
  sendSuccessResponse(res, product, MESSAGES.SUCCESS.CREATED, 201);
});

export const updateProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.PRODUCT.REQUIRED_ID);
  }
  
  const { name, description, image, price, categoryId, isActive } = req.body;
  
  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (image !== undefined) updateData.image = image;
  if (price !== undefined) updateData.price = parseFloat(price);
  if (categoryId !== undefined) updateData.categoryId = parseInt(categoryId);
  if (isActive !== undefined) updateData.isActive = isActive;
  updateData.updatedBy = req.user?.userId;
  
  const product = await ProductService.updateProduct(parseInt(id), updateData);
  if (!product) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.PRODUCT.PRODUCT_NOT_FOUND);
  }
  
  sendSuccessResponse(res, product, MESSAGES.SUCCESS.UPDATED);
});

export const deleteProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.PRODUCT.REQUIRED_ID);
  }
  
  const success = await ProductService.deleteProduct(parseInt(id), req.user?.userId);
  if (!success) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.PRODUCT.PRODUCT_NOT_FOUND);
  }
  
  sendSuccessResponse(res, null, MESSAGES.SUCCESS.DELETED);
});

export const softDeleteProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.PRODUCT.REQUIRED_ID);
  }
  
  const success = await ProductService.deleteProduct(parseInt(id), req.user?.userId);
  if (!success) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.PRODUCT.PRODUCT_NOT_FOUND);
  }
  
  sendSuccessResponse(res, null, MESSAGES.SUCCESS.DELETED);
});

export const getPopularProducts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { limit } = req.query;
  const limitNum = limit ? parseInt(limit as string) : 10;
  
  const products = await ProductService.getFeaturedProducts(limitNum);
  sendSuccessResponse(res, products, MESSAGES.SUCCESS.FETCHED);
});

export const getProductsByCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { categoryId } = req.params;
  if (!categoryId) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.PRODUCT.REQUIRED_ID);
  }
  
  const { page, limit, sortBy, sortOrder } = req.query as any;
  
  const pagination = {
    page: parseInt(page) || PAGINATION.DEFAULT_PAGE,
    limit: parseInt(limit) || PAGINATION.DEFAULT_LIMIT,
    sortBy: sortBy || 'createdAt',
    sortOrder: sortOrder || 'DESC',
  };
  
  const { count, products } = await ProductService.getProductsByCategory(parseInt(categoryId), pagination);
  
  sendSuccessResponse(res, {
    products,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: count,
      totalPages: Math.ceil(count / pagination.limit),
    },
  }, MESSAGES.SUCCESS.FETCHED);
});

export const searchProducts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { search } = req.query;
  if (!search || typeof search !== 'string') {
    return sendNotFoundResponse(res, MESSAGES.ERROR.PRODUCT.REQUIRED_SEARCH);
  }
  
  const { page, limit, sortBy, sortOrder } = req.query as any;
  
  const pagination = {
    page: parseInt(page) || PAGINATION.DEFAULT_PAGE,
    limit: parseInt(limit) || PAGINATION.DEFAULT_LIMIT,
    sortBy: sortBy || 'createdAt',
    sortOrder: sortOrder || 'DESC',
  };
  
  const { count, products } = await ProductService.searchProducts(search, pagination);
  
  sendSuccessResponse(res, {
    products,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: count,
      totalPages: Math.ceil(count / pagination.limit),
    },
  }, MESSAGES.SUCCESS.FETCHED);
});

export const getProductsByPriceRange = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { minPrice, maxPrice } = req.params;
  if (!minPrice || !maxPrice) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.PRODUCT.REQUIRED_MIN_MAX_PRICE);
  }
  
  const { page, limit, sortBy, sortOrder } = req.query as any;
  
  const pagination = {
    page: parseInt(page) || PAGINATION.DEFAULT_PAGE,
    limit: parseInt(limit) || PAGINATION.DEFAULT_LIMIT,
    sortBy: sortBy || 'createdAt',
    sortOrder: sortOrder || 'DESC',
  };
  
  const { count, products } = await ProductService.getProductsByPriceRange(
    parseFloat(minPrice),
    parseFloat(maxPrice),
    pagination
  );
  
  sendSuccessResponse(res, {
    products,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: count,
      totalPages: Math.ceil(count / pagination.limit),
    },
  }, MESSAGES.SUCCESS.FETCHED);
}); 