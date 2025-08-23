import { Request, Response } from 'express';
import { CategoryService } from '@/services/category.service';
import { UploadService } from '@/services/upload.service';
import { sendSuccessResponse, sendNotFoundResponse, sendErrorResponse, sendValidationErrorResponse } from '@/utils/responseFormatter';
import { MESSAGES } from '@/constants';
import { asyncHandler } from '@/middlewares/error';
import { AuthenticatedRequest } from '@/middlewares/auth';

// Interface cho uploaded files
interface UploadedFile extends Express.Multer.File {
  buffer: Buffer;
}

export const getAllCategories = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const categories = await CategoryService.getAllCategories();
  sendSuccessResponse(res, categories, MESSAGES.SUCCESS.FETCHED);
});

export const getCategoryById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.CATEGORY.REQUIRED_ID);
  }
  
  const category = await CategoryService.getCategoryById(parseInt(id));
  if (!category) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.CATEGORY.CATEGORY_NOT_FOUND);
  }
  
  sendSuccessResponse(res, category, MESSAGES.SUCCESS.FETCHED);
});

export const getCategoryBySlug = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params;
  if (!slug) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.CATEGORY.REQUIRED_SLUG);
  }
  
  const category = await CategoryService.getCategoryBySlug(slug);
  if (!category) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.CATEGORY.CATEGORY_NOT_FOUND);
  }
  
  sendSuccessResponse(res, category, MESSAGES.SUCCESS.FETCHED);
});

export const createCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name, description } = req.body;
  const file = req.file as UploadedFile;

  if (!file) {
    return sendValidationErrorResponse(res, MESSAGES.ERROR.UPLOAD.NO_FILE_UPLOADED);
  }

  try {
    // Upload image to Cloudinary
    const uploadResult = await UploadService.uploadSingleImage(
      file.buffer,
      'categories',
      `category_${Date.now()}`
    );

    if (!uploadResult.success) {
      return sendErrorResponse(res, uploadResult.error || 'Image upload failed');
    }

    const payload: any = {
      name,
      image: uploadResult.url,
      description,
    };
    if (req.user?.userId !== undefined) {
      payload.createdBy = req.user.userId;
    }
    
    const category = await CategoryService.createCategory(payload);
    
    sendSuccessResponse(res, {
      category,
      imageUrl: uploadResult.url,
      public_id: uploadResult.public_id,
    }, MESSAGES.SUCCESS.CREATED, 201);
  } catch (error) {
    if (error instanceof Error) {
      sendErrorResponse(res, error.message);
    } else {
      sendErrorResponse(res, MESSAGES.ERROR.INTERNAL_ERROR);
    }
  }
});

export const updateCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.CATEGORY.REQUIRED_ID);
  }
  
  const { name, description, isActive } = req.body;
  const file = req.file as UploadedFile;

  try {
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;
    updateData.updatedBy = req.user?.userId;

    // If new image is uploaded
    let uploadResult: any = null;
    if (file) {
      // Upload new image to Cloudinary
      uploadResult = await UploadService.uploadSingleImage(
        file.buffer,
        'categories',
        `category_${id}_${Date.now()}`
      );

      if (!uploadResult.success) {
        return sendErrorResponse(res, uploadResult.error || 'Image upload failed');
      }

      updateData.image = uploadResult.url;
      
      // Get current category to delete old image
      const currentCategory = await CategoryService.getCategoryById(parseInt(id));
      if (currentCategory && currentCategory.image) {
        // Delete old image from Cloudinary
        await UploadService.deleteImageByUrl(currentCategory.image);
      }
    }
    
    const category = await CategoryService.updateCategory(parseInt(id), updateData);
    
    if (!category) {
      return sendNotFoundResponse(res, MESSAGES.ERROR.CATEGORY.CATEGORY_NOT_FOUND);
    }
    
    const responseData: any = { category };
    if (file && uploadResult && updateData.image) {
      responseData.imageUrl = updateData.image;
      responseData.public_id = uploadResult.public_id;
    }
    
    sendSuccessResponse(res, responseData, MESSAGES.SUCCESS.UPDATED);
  } catch (error) {
    if (error instanceof Error) {
      sendErrorResponse(res, error.message);
    } else {
      sendErrorResponse(res, MESSAGES.ERROR.INTERNAL_ERROR);
    }
  }
});

export const deleteCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.CATEGORY.REQUIRED_ID);
  }
  
  const success = await CategoryService.deleteCategory(parseInt(id), req.user?.userId);
  if (!success) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.CATEGORY.CATEGORY_NOT_FOUND);
  }
  
  sendSuccessResponse(res, null, MESSAGES.SUCCESS.DELETED);
});

export const softDeleteCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.CATEGORY.REQUIRED_ID);
  }
  
  const success = await CategoryService.deleteCategory(parseInt(id), req.user?.userId);
  if (!success) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.CATEGORY.CATEGORY_NOT_FOUND);
  }
  
  sendSuccessResponse(res, null, MESSAGES.SUCCESS.DELETED);
});

export const searchCategories = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { search } = req.query;
  if (!search || typeof search !== 'string') {
    return sendNotFoundResponse(res, MESSAGES.ERROR.CATEGORY.REQUIRED_SEARCH);
  }
  
  const categories = await CategoryService.searchCategories(search);
  sendSuccessResponse(res, categories, MESSAGES.SUCCESS.FETCHED);
});

export const getCategoriesWithProductCount = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const categories = await CategoryService.getCategoriesWithProductCount();
  sendSuccessResponse(res, categories, MESSAGES.SUCCESS.FETCHED);
}); 