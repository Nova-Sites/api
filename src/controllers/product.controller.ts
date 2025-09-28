import { Request, Response } from 'express';
import { ProductService } from '@/services/product.service';
import sequelize from '@/config/database';

import { 
  sendSuccessResponse, 
  sendNotFoundResponse, 
  sendErrorResponse, 
  sendValidationErrorResponse 
} from '@/utils/responseFormatter';
import { 
  validatePaginationParams,
  validateId,
  validateIds,
  validatePriceRange,
  validateSearchTerm,
  validateStringField,
  validateNumericField,
  validateBooleanField
} from '@/utils/validation';
import { MESSAGES, HTTP_STATUS } from '@/constants';
import { asyncHandler } from '@/middlewares/error';
import { uploadImage, deleteImageByUrl, uploadMultipleImages } from '@/utils/cloudinary';
import { AuthenticatedRequest, UploadedFile } from '@/types';

export const getAllProducts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { page, limit, sortBy, sortOrder, categoryId, techStackIds, search, minPrice, maxPrice } = req.query as any;
  
  // Validate pagination parameters
  const pagination = validatePaginationParams({ page, limit, sortBy, sortOrder });
  
  // Validate and build filters
  const filters: any = {};
  
  // Validate categoryId
  if (categoryId) {
    const categoryValidation = validateId(categoryId, 'Category ID');
    if (!categoryValidation.isValid) {
      return sendValidationErrorResponse(res, categoryValidation.error!);
    }
    filters.categoryId = categoryValidation.value;
  }
  
  // Validate techStackIds
  if (techStackIds) {
    const techStackValidation = validateIds(techStackIds, 'Tech Stack IDs');
    if (!techStackValidation.isValid) {
      return sendValidationErrorResponse(res, techStackValidation.error!);
    }
    filters.techStackIds = techStackValidation.values;
  }
  
  // Validate search term
  if (search) {
    const searchValidation = validateSearchTerm(search);
    if (!searchValidation.isValid) {
      return sendValidationErrorResponse(res, searchValidation.error!);
    }
    filters.search = searchValidation.value;
  }
  
  // Validate price range
  if (minPrice || maxPrice) {
    const priceValidation = validatePriceRange(minPrice || 0, maxPrice || Number.MAX_SAFE_INTEGER);
    if (!priceValidation.isValid) {
      return sendValidationErrorResponse(res, priceValidation.error!);
    }
    if (minPrice) filters.minPrice = priceValidation.min;
    if (maxPrice) filters.maxPrice = priceValidation.max;
  }
  
  const { count, products } = await ProductService.getAllProducts(filters, pagination);
  
  sendSuccessResponse(res, {
    items: products,
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
  
  // Validate ID
  const idValidation = validateId(id, 'Product ID');
  if (!idValidation.isValid) {
    return sendValidationErrorResponse(res, idValidation.error!);
  }
  
  const product = await ProductService.getProductById(idValidation.value!);
  if (!product) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.PRODUCT.PRODUCT_NOT_FOUND);
  }
  
  // Increment views
  await ProductService.incrementViews(idValidation.value!);
  
  sendSuccessResponse(res, product, MESSAGES.SUCCESS.FETCHED);
});

export const getProductBySlug = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params;
  
  // Validate slug
  const slugValidation = validateStringField(slug, 'Slug', true);
  if (!slugValidation.isValid) {
    return sendValidationErrorResponse(res, slugValidation.error!);
  }
  
  const product = await ProductService.getProductBySlug(slugValidation.value!);
  if (!product) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.PRODUCT.PRODUCT_NOT_FOUND);
  }
  
  sendSuccessResponse(res, product, MESSAGES.SUCCESS.FETCHED);
});

export const createProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name, description, price, categoryId, videoUrl, techStackIds } = req.body;
  
  // Validate required fields
  const nameValidation = validateStringField(name, 'Name', true);
  if (!nameValidation.isValid) {
    return sendValidationErrorResponse(res, nameValidation.error!);
  }
  
  const descriptionValidation = validateStringField(description, 'Description', true);
  if (!descriptionValidation.isValid) {
    return sendValidationErrorResponse(res, descriptionValidation.error!);
  }
  
  const priceValidation = validateNumericField(price, 'Price', 0);
  if (!priceValidation.isValid) {
    return sendValidationErrorResponse(res, priceValidation.error!);
  }
  
  const categoryIdValidation = validateId(categoryId, 'Category ID');
  if (!categoryIdValidation.isValid) {
    return sendValidationErrorResponse(res, categoryIdValidation.error!);
  }
  
  // Validate optional fields
  let videoUrlValue = '';
  if (videoUrl) {
    const videoUrlValidation = validateStringField(videoUrl, 'Video URL', false);
    if (!videoUrlValidation.isValid) {
      return sendValidationErrorResponse(res, videoUrlValidation.error!);
    }
    videoUrlValue = videoUrlValidation.value!;
  }
  
  // Validate techStackIds if provided
  let techStackIdsValue: number[] = [];
  if (techStackIds) {
    const techStackValidation = validateIds(techStackIds, 'Tech Stack IDs');
    if (!techStackValidation.isValid) {
      return sendValidationErrorResponse(res, techStackValidation.error!);
    }
    techStackIdsValue = techStackValidation.values!;
  }
  
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
      name: nameValidation.value,
      description: descriptionValidation.value,
      videoUrl: videoUrlValue,
      image: mainImageUrl,
      images: additionalImages,
      price: priceValidation.value,
      categoryId: categoryIdValidation.value,
      ...(techStackIdsValue.length > 0 && { techStackIds: techStackIdsValue }),
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
  const { name, description, price, categoryId, techStackIds, isActive } = req.body;
  
  // Validate ID
  const idValidation = validateId(id, 'Product ID');
  if (!idValidation.isValid) {
    return sendValidationErrorResponse(res, idValidation.error!);
  }
  
  // Handle files from multer.fields
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const mainImageFile = files?.['image']?.[0] as UploadedFile;
  const additionalImageFiles = files?.['images'] as UploadedFile[];

  const transaction = await sequelize.transaction();

  try {
    const updateData: any = {};
    
    // Validate optional fields
    if (name !== undefined) {
      const nameValidation = validateStringField(name, 'Name', true);
      if (!nameValidation.isValid) {
        await transaction.rollback();
        return sendValidationErrorResponse(res, nameValidation.error!);
      }
      updateData.name = nameValidation.value;
    }
    
    if (description !== undefined) {
      const descriptionValidation = validateStringField(description, 'Description', true);
      if (!descriptionValidation.isValid) {
        await transaction.rollback();
        return sendValidationErrorResponse(res, descriptionValidation.error!);
      }
      updateData.description = descriptionValidation.value;
    }
    
    if (price !== undefined) {
      const priceValidation = validateNumericField(price, 'Price', 0);
      if (!priceValidation.isValid) {
        await transaction.rollback();
        return sendValidationErrorResponse(res, priceValidation.error!);
      }
      updateData.price = priceValidation.value;
    }
    
    if (categoryId !== undefined) {
      const categoryIdValidation = validateId(categoryId, 'Category ID');
      if (!categoryIdValidation.isValid) {
        await transaction.rollback();
        return sendValidationErrorResponse(res, categoryIdValidation.error!);
      }
      updateData.categoryId = categoryIdValidation.value;
    }
    
    if (isActive !== undefined) {
      const isActiveValidation = validateBooleanField(isActive, 'Is Active');
      if (!isActiveValidation.isValid) {
        await transaction.rollback();
        return sendValidationErrorResponse(res, isActiveValidation.error!);
      }
      updateData.isActive = isActiveValidation.value;
    }
    
    if (techStackIds !== undefined) {
      const techStackValidation = validateIds(techStackIds, 'Tech Stack IDs');
      if (!techStackValidation.isValid) {
        await transaction.rollback();
        return sendValidationErrorResponse(res, techStackValidation.error!);
      }
      updateData.techStackIds = techStackValidation.values;
    }
    
    updateData.updatedBy = req.user?.userId;

    // Get current product to delete old images if needed
    const currentProduct = await ProductService.getProductById(idValidation.value!);
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
    
    const product = await ProductService.updateProduct(idValidation.value!, updateData, transaction);
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
  
  // Validate ID
  const idValidation = validateId(id, 'Product ID');
  if (!idValidation.isValid) {
    return sendValidationErrorResponse(res, idValidation.error!);
  }
  
  const success = await ProductService.deleteProduct(idValidation.value!, req.user?.userId);
  if (!success) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.PRODUCT.PRODUCT_NOT_FOUND);
  }
  
  sendSuccessResponse(res, null, MESSAGES.SUCCESS.DELETED);
});

export const softDeleteProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  
  // Validate ID
  const idValidation = validateId(id, 'Product ID');
  if (!idValidation.isValid) {
    return sendValidationErrorResponse(res, idValidation.error!);
  }
  
  const success = await ProductService.deleteProduct(idValidation.value!, req.user?.userId);
  if (!success) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.PRODUCT.PRODUCT_NOT_FOUND);
  }
  
  sendSuccessResponse(res, null, MESSAGES.SUCCESS.DELETED);
});

export const getPopularProducts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { limit } = req.query;
  
  // Validate limit parameter
  const limitValidation = validateNumericField(limit || 10, 'Limit', 1);
  if (!limitValidation.isValid) {
    return sendValidationErrorResponse(res, limitValidation.error!);
  }
  
  // Ensure limit doesn't exceed maximum
  const limitNum = Math.min(limitValidation.value!, 50);
  
  const products = await ProductService.getFeaturedProducts(limitNum);
  sendSuccessResponse(res, products, MESSAGES.SUCCESS.FETCHED);
});

export const getProductsByCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { categoryId } = req.params;
  const { page, limit, sortBy, sortOrder } = req.query as any;
  
  // Validate categoryId
  const categoryIdValidation = validateId(categoryId, 'Category ID');
  if (!categoryIdValidation.isValid) {
    return sendValidationErrorResponse(res, categoryIdValidation.error!);
  }
  
  // Validate pagination parameters
  const pagination = validatePaginationParams({ page, limit, sortBy, sortOrder });
  
  const { count, products } = await ProductService.getProductsByCategory(categoryIdValidation.value!, pagination);
  
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
  const { search, page, limit, sortBy, sortOrder } = req.query as any;
  
  // Validate search term
  const searchValidation = validateSearchTerm(search);
  if (!searchValidation.isValid) {
    return sendValidationErrorResponse(res, searchValidation.error!);
  }
  
  // Validate pagination parameters
  const pagination = validatePaginationParams({ page, limit, sortBy, sortOrder });
  
  const { count, products } = await ProductService.searchProducts(searchValidation.value!, pagination);
  
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
  const { page, limit, sortBy, sortOrder } = req.query as any;
  
  // Validate price range
  const priceValidation = validatePriceRange(minPrice, maxPrice);
  if (!priceValidation.isValid) {
    return sendValidationErrorResponse(res, priceValidation.error!);
  }
  
  // Validate pagination parameters
  const pagination = validatePaginationParams({ page, limit, sortBy, sortOrder });
  
  const { count, products } = await ProductService.getProductsByPriceRange(
    priceValidation.min!,
    priceValidation.max!,
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
  const { page, limit, sortBy, sortOrder } = req.query as any;
  
  // Validate techStackId
  const techStackIdValidation = validateId(techStackId, 'Tech Stack ID');
  if (!techStackIdValidation.isValid) {
    return sendValidationErrorResponse(res, techStackIdValidation.error!);
  }
  
  // Validate pagination parameters
  const pagination = validatePaginationParams({ page, limit, sortBy, sortOrder });
  
  const { count, products } = await ProductService.getProductsByTechStack(techStackIdValidation.value!, pagination);
  
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