import { Request, Response } from 'express';
import { TechStackService } from '@/services/tech-stack.service';
import { sendSuccessResponse, sendNotFoundResponse, sendErrorResponse, sendValidationErrorResponse } from '@/utils/responseFormatter';
import { MESSAGES, HTTP_STATUS, PAGINATION } from '@/constants';
import { asyncHandler } from '@/middlewares/error';
import { uploadImage, deleteImageByUrl } from '@/utils/cloudinary';
import { generateSlug } from '@/utils';
import { AuthenticatedRequest, UploadedFile } from '@/types';

// Get all tech stacks
export const getAllTechStacks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { page, limit, sortBy, sortOrder, search, isActive} = req.query as any;

  const filters = {
    ...(search && { search }),
    ...(isActive && { isActive: isActive === 'true' }),
  };

  const pagination = {
    page: parseInt(page) || PAGINATION.DEFAULT_PAGE,
    limit: parseInt(limit) || PAGINATION.DEFAULT_LIMIT,
    sortBy: sortBy || 'createdAt',
    sortOrder: sortOrder || 'DESC',
  };
  
  
  const { count, techStacks } = await TechStackService.getAllTechStacks(filters, pagination);

  sendSuccessResponse(res, {
    items: techStacks,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: count,
      totalPages: Math.ceil(count / pagination.limit),
    },
  }, MESSAGES.SUCCESS.FETCHED);
});

// Get tech stack by ID
export const getTechStackById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.TECH_STACK.REQUIRED_ID);
  }
  
  const techStackId = parseInt(id, 10);
  if (isNaN(techStackId)) {
    return sendValidationErrorResponse(res, MESSAGES.ERROR.TECH_STACK.INVALID_ID);
  }

  const techStack = await TechStackService.getTechStackByIdWithProducts(techStackId);
  if (!techStack) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.TECH_STACK.TECH_STACK_NOT_FOUND);
  }
  
  sendSuccessResponse(res, techStack, MESSAGES.SUCCESS.TECH_STACK.GET_TECH_STACK_BY_ID_SUCCESS);
});

// Get tech stack by slug
export const getTechStackBySlug = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params;
  if (!slug) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.TECH_STACK.REQUIRED_SLUG);
  }
  
  const techStack = await TechStackService.getTechStackBySlugWithProducts(slug);
  if (!techStack) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.TECH_STACK.TECH_STACK_NOT_FOUND);
  }
  
  sendSuccessResponse(res, techStack, MESSAGES.SUCCESS.TECH_STACK.GET_TECH_STACK_BY_SLUG_SUCCESS);
});

// Create tech stack
export const createTechStack = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name, slug, description, isActive = true } = req.body;
  const file = req.file as UploadedFile;

  if (!file) {
    return sendValidationErrorResponse(res, MESSAGES.ERROR.UPLOAD.NO_FILE_UPLOADED);
  }

  try {
    let uploadResult: any = null;

      uploadResult = await uploadImage(
        file.buffer,
        'tech-stacks',
        `tech_stack_${Date.now()}`
      );

      if (!uploadResult.success) {
        return sendErrorResponse(res, uploadResult.error || 'Icon upload failed');
      }

    // Generate slug if not provided
    const finalSlug = slug || generateSlug(name);

    // Check if slug already exists
    const slugExists = await TechStackService.isSlugExists(finalSlug);
    if (slugExists) {
      return sendValidationErrorResponse(res, MESSAGES.ERROR.TECH_STACK.SLUG_ALREADY_EXISTS);
    }

    const payload: any = {
      name,
      iconUrl: uploadResult.url,
      description,
      slug: finalSlug,
      isActive
    };

    const techStack = await TechStackService.createTechStack(payload);

    const responseData: any = { techStack };

    sendSuccessResponse(res, responseData, MESSAGES.SUCCESS.TECH_STACK.CREATE_TECH_STACK_SUCCESS, HTTP_STATUS.CREATED);
  } catch (error) {
    if (error instanceof Error) {
      sendErrorResponse(res, error.message);
    } else {
      sendErrorResponse(res, MESSAGES.ERROR.INTERNAL_ERROR);
    }
  }
});

// Update tech stack
export const updateTechStack = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.TECH_STACK.REQUIRED_ID);
  }
  
  const { name, slug, description, isActive } = req.body;
  const file = req.file as UploadedFile;
  const techStackId = parseInt(id, 10);

  if (isNaN(techStackId)) {
    return sendValidationErrorResponse(res, MESSAGES.ERROR.TECH_STACK.INVALID_ID);
  }

  try {
    const existingTechStack = await TechStackService.getTechStackById(techStackId);
    if (!existingTechStack) {
      return sendNotFoundResponse(res, MESSAGES.ERROR.TECH_STACK.TECH_STACK_NOT_FOUND);
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Handle icon upload
    let uploadResult: any = null;
    if (file) {
      uploadResult = await uploadImage(
        file.buffer,
        'tech-stacks',
        `tech_stack_${id}_${Date.now()}`
      );

      if (!uploadResult.success) {
        return sendErrorResponse(res, uploadResult.error || 'Icon upload failed');
      }

      updateData.iconUrl = uploadResult.url;
      
      // Delete old icon from Cloudinary
      if (existingTechStack.iconUrl) {
        await deleteImageByUrl(existingTechStack.iconUrl);
      }
    }

    // Check slug uniqueness if slug is being updated
    if (slug && slug !== existingTechStack.slug) {
      const slugExists = await TechStackService.isSlugExists(slug, techStackId);
      if (slugExists) {
        return sendValidationErrorResponse(res, MESSAGES.ERROR.TECH_STACK.SLUG_ALREADY_EXISTS);
      }
      updateData.slug = slug;
    }

    const techStack = await TechStackService.updateTechStack(techStackId, updateData);
    
    const responseData: any = { techStack };
    if (file && uploadResult && updateData.iconUrl) {
      responseData.iconUrl = updateData.iconUrl;
      responseData.public_id = uploadResult.public_id;
    }
    
    sendSuccessResponse(res, responseData, MESSAGES.SUCCESS.TECH_STACK.UPDATE_TECH_STACK_SUCCESS);
  } catch (error) {
    if (error instanceof Error) {
      sendErrorResponse(res, error.message);
    } else {
      sendErrorResponse(res, MESSAGES.ERROR.INTERNAL_ERROR);
    }
  }
});

// Delete tech stack
export const deleteTechStack = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.TECH_STACK.REQUIRED_ID);
  }
  
  const techStackId = parseInt(id, 10);
  if (isNaN(techStackId)) {
    return sendValidationErrorResponse(res, MESSAGES.ERROR.TECH_STACK.INVALID_ID);
  }

  const deleted = await TechStackService.deleteTechStack(techStackId);
  if (!deleted) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.TECH_STACK.TECH_STACK_NOT_FOUND);
  }
  
  sendSuccessResponse(res, null, MESSAGES.SUCCESS.TECH_STACK.DELETE_TECH_STACK_SUCCESS);
});

// Search tech stacks
export const searchTechStacks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { search } = req.query;
  if (!search || typeof search !== 'string') {
    return sendNotFoundResponse(res, MESSAGES.ERROR.TECH_STACK.REQUIRED_SEARCH);
  }
  
  const techStacks = await TechStackService.searchTechStacks(search);
  sendSuccessResponse(res, techStacks, MESSAGES.SUCCESS.TECH_STACK.SEARCH_TECH_STACKS_SUCCESS);
});

// Get tech stacks with product count
export const getTechStacksWithProductCount = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const techStacksWithCount = await TechStackService.getTechStacksWithProductCount();
  sendSuccessResponse(res, techStacksWithCount, MESSAGES.SUCCESS.TECH_STACK.GET_TECH_STACKS_WITH_PRODUCT_COUNT_SUCCESS);
});
