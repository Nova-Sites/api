import { Request, Response } from 'express';
import { TechStackService } from '@/services/tech-stack.service';
import { sendSuccessResponse, sendNotFoundResponse, sendErrorResponse, sendValidationErrorResponse } from '@/utils/responseFormatter';
import { 
  validateId,
  validateStringField,
  validateSearchTerm,
  validatePaginationParams,
  validateBooleanField,
  validateSlug
} from '@/utils/validation';
import { MESSAGES, HTTP_STATUS } from '@/constants';
import { asyncHandler } from '@/middlewares/error';
import { uploadImage, deleteImageByUrl } from '@/utils/cloudinary';
import { generateSlug } from '@/utils';
import { AuthenticatedRequest, UploadedFile } from '@/types';

// Get all tech stacks
export const getAllTechStacks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { page, limit, sortBy, sortOrder, search, isActive} = req.query as any;

  // Validate pagination parameters
  const pagination = validatePaginationParams({ page, limit, sortBy, sortOrder });
  
  // Validate and build filters
  const filters: any = {};
  
  // Validate search term
  if (search) {
    const searchValidation = validateSearchTerm(search);
    if (!searchValidation.isValid) {
      return sendValidationErrorResponse(res, searchValidation.error!);
    }
    filters.search = searchValidation.value;
  }
  
  // Validate isActive filter
  if (isActive !== undefined) {
    const isActiveValidation = validateBooleanField(isActive, 'Is Active');
    if (!isActiveValidation.isValid) {
      return sendValidationErrorResponse(res, isActiveValidation.error!);
    }
    filters.isActive = isActiveValidation.value;
  }
  
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
  
  // Validate ID
  const idValidation = validateId(id, 'Tech Stack ID');
  if (!idValidation.isValid) {
    return sendValidationErrorResponse(res, idValidation.error!);
  }

  const techStack = await TechStackService.getTechStackByIdWithProducts(idValidation.value!);
  if (!techStack) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.TECH_STACK.TECH_STACK_NOT_FOUND);
  }
  
  sendSuccessResponse(res, techStack, MESSAGES.SUCCESS.TECH_STACK.GET_TECH_STACK_BY_ID_SUCCESS);
});

// Get tech stack by slug
export const getTechStackBySlug = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params;
  
  // Validate slug
  const slugValidation = validateStringField(slug, 'Slug', true);
  if (!slugValidation.isValid) {
    return sendValidationErrorResponse(res, slugValidation.error!);
  }
  
  const techStack = await TechStackService.getTechStackBySlugWithProducts(slugValidation.value!);
  if (!techStack) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.TECH_STACK.TECH_STACK_NOT_FOUND);
  }
  
  sendSuccessResponse(res, techStack, MESSAGES.SUCCESS.TECH_STACK.GET_TECH_STACK_BY_SLUG_SUCCESS);
});

// Create tech stack
export const createTechStack = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name, slug, description, isActive = true } = req.body;
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

    // Validate slug format
    const slugValidation = validateSlug(finalSlug);
    if (!slugValidation.isValid) {
      return sendValidationErrorResponse(res, slugValidation.error!);
    }

    // Check if slug already exists
    const slugExists = await TechStackService.isSlugExists(finalSlug);
    if (slugExists) {
      return sendValidationErrorResponse(res, MESSAGES.ERROR.TECH_STACK.SLUG_ALREADY_EXISTS);
    }

    const payload: any = {
      name: nameValidation.value,
      iconUrl: uploadResult.url,
      description: descriptionValidation.value,
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
  const { name, slug, description, isActive } = req.body;
  const file = req.file as UploadedFile;

  // Validate ID
  const idValidation = validateId(id, 'Tech Stack ID');
  if (!idValidation.isValid) {
    return sendValidationErrorResponse(res, idValidation.error!);
  }

  try {
    const existingTechStack = await TechStackService.getTechStackById(idValidation.value!);
    if (!existingTechStack) {
      return sendNotFoundResponse(res, MESSAGES.ERROR.TECH_STACK.TECH_STACK_NOT_FOUND);
    }

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
      const isActiveValidation = validateBooleanField(isActive, 'Is Active');
      if (!isActiveValidation.isValid) {
        return sendValidationErrorResponse(res, isActiveValidation.error!);
      }
      updateData.isActive = isActiveValidation.value;
    }

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
      const slugValidation = validateSlug(slug);
      if (!slugValidation.isValid) {
        return sendValidationErrorResponse(res, slugValidation.error!);
      }
      
      const slugExists = await TechStackService.isSlugExists(slug, idValidation.value!);
      if (slugExists) {
        return sendValidationErrorResponse(res, MESSAGES.ERROR.TECH_STACK.SLUG_ALREADY_EXISTS);
      }
      updateData.slug = slug;
    }

    const techStack = await TechStackService.updateTechStack(idValidation.value!, updateData);
    
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
  
  // Validate ID
  const idValidation = validateId(id, 'Tech Stack ID');
  if (!idValidation.isValid) {
    return sendValidationErrorResponse(res, idValidation.error!);
  }

  const deleted = await TechStackService.deleteTechStack(idValidation.value!);
  if (!deleted) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.TECH_STACK.TECH_STACK_NOT_FOUND);
  }
  
  sendSuccessResponse(res, null, MESSAGES.SUCCESS.TECH_STACK.DELETE_TECH_STACK_SUCCESS);
});

// Search tech stacks
export const searchTechStacks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { search } = req.query;
  
  // Validate search term
  const searchValidation = validateSearchTerm(search);
  if (!searchValidation.isValid) {
    return sendValidationErrorResponse(res, searchValidation.error!);
  }
  
  const techStacks = await TechStackService.searchTechStacks(searchValidation.value!);
  sendSuccessResponse(res, techStacks, MESSAGES.SUCCESS.TECH_STACK.SEARCH_TECH_STACKS_SUCCESS);
});

// Get tech stacks with product count
export const getTechStacksWithProductCount = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const techStacksWithCount = await TechStackService.getTechStacksWithProductCount();
  sendSuccessResponse(res, techStacksWithCount, MESSAGES.SUCCESS.TECH_STACK.GET_TECH_STACKS_WITH_PRODUCT_COUNT_SUCCESS);
});
