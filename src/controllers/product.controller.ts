import { Request, Response } from 'express';
import { ProductService } from '@/services/product.service';
import sequelize from '@/config/database';

import { sendSuccessResponse, sendNotFoundResponse, sendErrorResponse, sendValidationErrorResponse } from '@/utils/responseFormatter';
import { MESSAGES, PAGINATION, HTTP_STATUS } from '@/constants';
import { asyncHandler } from '@/middlewares/error';
import { uploadImage, deleteImageByUrl, uploadMultipleImages } from '@/utils/cloudinary';
import { AuthenticatedRequest, UploadedFile } from '@/types';

export const getAllProducts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { page, limit, sortBy, sortOrder, categoryId, techStackIds, search, minPrice, maxPrice } = req.query as any;
  
  const filters = {
    ...(categoryId && { categoryId: parseInt(categoryId) }),
    ...(techStackIds && { techStackIds: Array.isArray(techStackIds) ? techStackIds.map(Number) : [parseInt(techStackIds)] }),
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
  const { name, description, price, categoryId, techStackIds } = req.body;
  
  // Handle files from multer.fields
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const mainImageFile = files?.['image']?.[0] as UploadedFile;
  const additionalImageFiles = files?.['images'] as UploadedFile[];

  // Check if we have at least one image
  if (!mainImageFile && (!additionalImageFiles || additionalImageFiles.length === 0)) {
    return sendValidationErrorResponse(res, MESSAGES.ERROR.UPLOAD.NO_FILE_UPLOADED);
  }

  const transaction = await sequelize.transaction();

  try {
    let mainImageUrl = '';
    let additionalImages: string[] = [];

    // Upload main image
    if (mainImageFile) {
      const uploadResult = await uploadImage(
        mainImageFile.buffer,
        'products',
        `product_${Date.now()}_main`
      );

      if (!uploadResult.success) {
        await transaction.rollback();
        return sendErrorResponse(res, uploadResult.error || 'Main image upload failed');
      }
      mainImageUrl = uploadResult.url!;
    }

    // Upload additional images
    if (additionalImageFiles && additionalImageFiles.length > 0) {
      const fileBuffers = additionalImageFiles.map(file => file.buffer);
      const uploadResults = await uploadMultipleImages(
        fileBuffers,
        'products',
        `product_${Date.now()}_additional`
      );

      // Check if all uploads were successful
      const failedUploads = uploadResults.filter(result => !result.success);
      if (failedUploads.length > 0) {
        await transaction.rollback();
        return sendErrorResponse(res, failedUploads[0]?.error || 'Additional images upload failed');
      }

      const successfulUploads = uploadResults.filter(result => result.success);
      additionalImages = successfulUploads.map(result => result.url!);
    }

    const payload: any = {
      name,
      description,
      image: mainImageUrl,
      images: additionalImages,
      price: parseFloat(price),
      categoryId: parseInt(categoryId),
      ...(techStackIds && { techStackIds: Array.isArray(techStackIds) ? techStackIds.map(Number) : [parseInt(techStackIds)] }),
    };
    if (req.user?.userId !== undefined) {
      payload.createdBy = req.user.userId;
    }
    
    const product = await ProductService.createProduct(payload, transaction);
    
    await transaction.commit();
    
    sendSuccessResponse(res, {
      product,
      imageUrl: mainImageUrl,
      additionalImages,
    }, MESSAGES.SUCCESS.CREATED, HTTP_STATUS.CREATED);
  } catch (error) {
    await transaction.rollback();
    if (error instanceof Error) {
      sendErrorResponse(res, error.message);
    } else {
      sendErrorResponse(res, MESSAGES.ERROR.INTERNAL_ERROR);
    }
  }
});

export const updateProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.PRODUCT.REQUIRED_ID);
  }
  
  const { name, description, price, categoryId, techStackIds, isActive } = req.body;
  
  // Handle files from multer.fields
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const mainImageFile = files?.['image']?.[0] as UploadedFile;
  const additionalImageFiles = files?.['images'] as UploadedFile[];

  const transaction = await sequelize.transaction();

  try {
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (categoryId !== undefined) updateData.categoryId = parseInt(categoryId);
    if (isActive !== undefined) updateData.isActive = isActive;
    if (techStackIds !== undefined) {
      updateData.techStackIds = Array.isArray(techStackIds) ? techStackIds.map(Number) : [parseInt(techStackIds)];
    }
    updateData.updatedBy = req.user?.userId;

    // Get current product to delete old images if needed
    const currentProduct = await ProductService.getProductById(parseInt(id));
    if (!currentProduct) {
      await transaction.rollback();
      return sendNotFoundResponse(res, MESSAGES.ERROR.PRODUCT.PRODUCT_NOT_FOUND);
    }

    // Handle main image upload
    if (mainImageFile) {
      const uploadResult = await uploadImage(
        mainImageFile.buffer,
        'products',
        `product_${id}_${Date.now()}_main`
      );

      if (!uploadResult.success) {
        await transaction.rollback();
        return sendErrorResponse(res, uploadResult.error || 'Main image upload failed');
      }

      updateData.image = uploadResult.url;
      
      // Delete old main image from Cloudinary
      if (currentProduct.image) {
        await deleteImageByUrl(currentProduct.image);
      }
    }

    // Handle additional images upload
    if (additionalImageFiles && additionalImageFiles.length > 0) {
      const fileBuffers = additionalImageFiles.map(file => file.buffer);
      const uploadResults = await uploadMultipleImages(
        fileBuffers,
        'products',
        `product_${id}_${Date.now()}_additional`
      );

      // Check if all uploads were successful
      const failedUploads = uploadResults.filter(result => !result.success);
      if (failedUploads.length > 0) {
        await transaction.rollback();
        return sendErrorResponse(res, failedUploads[0]?.error || 'Additional images upload failed');
      }

      const successfulUploads = uploadResults.filter(result => result.success);
      updateData.images = successfulUploads.map(result => result.url!);
    }
    
    const product = await ProductService.updateProduct(parseInt(id), updateData, transaction);
    if (!product) {
      await transaction.rollback();
      return sendNotFoundResponse(res, MESSAGES.ERROR.PRODUCT.PRODUCT_NOT_FOUND);
    }
    
    await transaction.commit();
    
    const responseData: any = { product };
    if (updateData.image) {
      responseData.imageUrl = updateData.image;
    }
    if (updateData.images) {
      responseData.additionalImages = updateData.images;
    }
    
    sendSuccessResponse(res, responseData, MESSAGES.SUCCESS.UPDATED);
  } catch (error) {
    await transaction.rollback();
    if (error instanceof Error) {
      sendErrorResponse(res, error.message);
    } else {
      sendErrorResponse(res, MESSAGES.ERROR.INTERNAL_ERROR);
    }
  }
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

export const getProductsByTechStack = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { techStackId } = req.params;
  if (!techStackId) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.PRODUCT.REQUIRED_ID);
  }
  
  const { page, limit, sortBy, sortOrder } = req.query as any;
  
  const pagination = {
    page: parseInt(page) || PAGINATION.DEFAULT_PAGE,
    limit: parseInt(limit) || PAGINATION.DEFAULT_LIMIT,
    sortBy: sortBy || 'createdAt',
    sortOrder: sortOrder || 'DESC',
  };
  
  const { count, products } = await ProductService.getProductsByTechStack(parseInt(techStackId), pagination);
  
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