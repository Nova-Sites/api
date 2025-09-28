import { Request, Response } from 'express';
import { CategoryService } from '@/services/category.service';

import { sendSuccessResponse, sendNotFoundResponse, sendErrorResponse, sendValidationErrorResponse } from '@/utils/responseFormatter';
import { 
  validateId,
  validateStringField,
  validateSearchTerm
} from '@/utils/validation';
import { MESSAGES, HTTP_STATUS } from '@/constants';
import { asyncHandler } from '@/middlewares/error';
import { uploadImage, deleteImageByUrl } from '@/utils/cloudinary';
import { AuthenticatedRequest, UploadedFile } from '@/types';

export const getAllCategories = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const categories = await CategoryService.getAllCategories();
  sendSuccessResponse(res, categories, MESSAGES.SUCCESS.FETCHED);
});

export const getCategoryById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  // Validate ID
  const idValidation = validateId(id, 'Category ID');
  if (!idValidation.isValid) {
    return sendValidationErrorResponse(res, idValidation.error!);
  }
  
  const category = await CategoryService.getCategoryById(idValidation.value!);
  if (!category) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.CATEGORY.CATEGORY_NOT_FOUND);
  }
  
  sendSuccessResponse(res, category, MESSAGES.SUCCESS.FETCHED);
});

export const getCategoryBySlug = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params;
  
  // Validate slug
  const slugValidation = validateStringField(slug, 'Slug', true);
  if (!slugValidation.isValid) {
    return sendValidationErrorResponse(res, slugValidation.error!);
  }
  
  const category = await CategoryService.getCategoryBySlug(slugValidation.value!);
  if (!category) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.CATEGORY.CATEGORY_NOT_FOUND);
  }
  
  sendSuccessResponse(res, category, MESSAGES.SUCCESS.FETCHED);
});

export const createCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name, description } = req.body;
  const file = req.file as UploadedFile;

  // Validate required fields
  const nameValidation = validateStringField(name, 'Name', true);
  if (!nameValidation.isValid) {
    return sendValidationErrorResponse(res, nameValidation.error!);
  }

  const descriptionValidation = validateStringField(description, 'Description', true);
  if (!descriptionValidation.isValid) {
    return sendValidationErrorResponse(res, descriptionValidation.error!);
  }

  if (!file) {
    return sendValidationErrorResponse(res, MESSAGES.ERROR.UPLOAD.NO_FILE_UPLOADED);
  }

  try {
    // Upload image to Cloudinary
    const uploadResult = await uploadImage(
      file.buffer,
      'categories',
      `category_${Date.now()}`
    );

    if (!uploadResult.success) {
      return sendErrorResponse(res, uploadResult.error || 'Image upload failed');
    }

    const payload: any = {
      name: nameValidation.value,
      image: uploadResult.url,
      description: descriptionValidation.value,
    };
    if (req.user?.userId !== undefined) {
      payload.createdBy = req.user.userId;
    }
    
    const category = await CategoryService.createCategory(payload);
    
    sendSuccessResponse(res, {
      category,
      imageUrl: uploadResult.url,
      public_id: uploadResult.public_id,
    }, MESSAGES.SUCCESS.CREATED, HTTP_STATUS.CREATED);
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
  const { name, description, isActive } = req.body;
  const file = req.file as UploadedFile;

  // Validate ID
  const idValidation = validateId(id, 'Category ID');
  if (!idValidation.isValid) {
    return sendValidationErrorResponse(res, idValidation.error!);
  }

  try {
    const updateData: any = {};
    
    // Validate optional fields
    if (name !== undefined) {
      const nameValidation = validateStringField(name, 'Name', true);
      if (!nameValidation.isValid) {
        return sendValidationErrorResponse(res, nameValidation.error!);
      }
      updateData.name = nameValidation.value;
    }
    
    if (description !== undefined) {
      const descriptionValidation = validateStringField(description, 'Description', true);
      if (!descriptionValidation.isValid) {
        return sendValidationErrorResponse(res, descriptionValidation.error!);
      }
      updateData.description = descriptionValidation.value;
    }
    
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }
    
    updateData.updatedBy = req.user?.userId;

    // If new image is uploaded
    let uploadResult: any = null;
    if (file) {
      // Upload new image to Cloudinary
      uploadResult = await uploadImage(
        file.buffer,
        'categories',
        `category_${id}_${Date.now()}`
      );

      if (!uploadResult.success) {
        return sendErrorResponse(res, uploadResult.error || 'Image upload failed');
      }

      updateData.image = uploadResult.url;
      
      // Get current category to delete old image
      const currentCategory = await CategoryService.getCategoryById(idValidation.value!);
      if (currentCategory && currentCategory.image) {
        // Delete old image from Cloudinary
        await deleteImageByUrl(currentCategory.image);
      }
    }
    
    const category = await CategoryService.updateCategory(idValidation.value!, updateData);
    
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
  
  // Validate ID
  const idValidation = validateId(id, 'Category ID');
  if (!idValidation.isValid) {
    return sendValidationErrorResponse(res, idValidation.error!);
  }
  
  const success = await CategoryService.deleteCategory(idValidation.value!, req.user?.userId);
  if (!success) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.CATEGORY.CATEGORY_NOT_FOUND);
  }
  
  sendSuccessResponse(res, null, MESSAGES.SUCCESS.DELETED);
});

export const softDeleteCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  
  // Validate ID
  const idValidation = validateId(id, 'Category ID');
  if (!idValidation.isValid) {
    return sendValidationErrorResponse(res, idValidation.error!);
  }
  
  const success = await CategoryService.deleteCategory(idValidation.value!, req.user?.userId);
  if (!success) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.CATEGORY.CATEGORY_NOT_FOUND);
  }
  
  sendSuccessResponse(res, null, MESSAGES.SUCCESS.DELETED);
});

export const searchCategories = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { search } = req.query;
  
  // Validate search term
  const searchValidation = validateSearchTerm(search);
  if (!searchValidation.isValid) {
    return sendValidationErrorResponse(res, searchValidation.error!);
  }
  
  const categories = await CategoryService.searchCategories(searchValidation.value!);
  sendSuccessResponse(res, categories, MESSAGES.SUCCESS.FETCHED);
});

export const getCategoriesWithProductCount = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const categories = await CategoryService.getCategoriesWithProductCount();
  sendSuccessResponse(res, categories, MESSAGES.SUCCESS.FETCHED);
}); 