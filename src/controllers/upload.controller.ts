import { Request, Response } from 'express';
import { UploadService } from '@/services/upload.service';
import { sendSuccessResponse, sendErrorResponse, sendValidationErrorResponse } from '@/utils/responseFormatter';
import { MESSAGES } from '@/constants';
import { asyncHandler } from '@/middlewares/error';
import { AuthenticatedRequest } from '@/middlewares/auth';

// Interface cho uploaded files
interface UploadedFile extends Express.Multer.File {
  buffer: Buffer;
}

/**
 * Upload single image
 */
export const uploadSingleImage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const file = req.file as UploadedFile;
  
  if (!file) {
    return sendValidationErrorResponse(res, 'No file uploaded');
  }

  const { folder, public_id } = req.body;
  
  try {
    const result = await UploadService.uploadSingleImage(
      file.buffer,
      folder || 'uploads',
      public_id
    );

    if (!result.success) {
      return sendErrorResponse(res, result.error || 'Upload failed');
    }

    sendSuccessResponse(res, {
      url: result.url,
      public_id: result.public_id,
    }, 'Image uploaded successfully');
  } catch (error) {
    console.error('Upload single image error:', error);
    sendErrorResponse(res, MESSAGES.ERROR.INTERNAL_ERROR);
  }
});

/**
 * Upload user avatar
 */
export const uploadUserAvatar = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const file = req.file as UploadedFile;
  const userId = req.user?.userId;
  
  if (!file) {
    return sendValidationErrorResponse(res, MESSAGES.ERROR.USER.REQUIRED_IMAGE);
  }

  if (!userId) {
    return sendErrorResponse(res, MESSAGES.ERROR.AUTH.REQUIRED_AUTH);
  }

  try {
    const result = await UploadService.uploadUserAvatar(file.buffer, userId);

    if (!result.success) {
      return sendErrorResponse(res, result.error || 'Avatar upload failed');
    }

    sendSuccessResponse(res, {
      url: result.url,
      public_id: result.public_id,
    }, MESSAGES.SUCCESS.USER.UPDATE_USER_AVATAR_SUCCESS);
  } catch (error) {
    console.error('Upload avatar error:', error);
    sendErrorResponse(res, MESSAGES.ERROR.INTERNAL_ERROR);
  }
});

/**
 * Upload product image
 */
export const uploadProductImage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const file = req.file as UploadedFile;
  const { productId, imageIndex } = req.body;
  
  if (!file) {
    return sendValidationErrorResponse(res, 'No file uploaded');
  }

  if (!productId) {
    return sendValidationErrorResponse(res, 'Product ID is required');
  }

  try {
    const result = await UploadService.uploadProductImage(
      file.buffer,
      parseInt(productId),
      imageIndex ? parseInt(imageIndex) : 0
    );

    if (!result.success) {
      return sendErrorResponse(res, result.error || 'Product image upload failed');
    }

    sendSuccessResponse(res, {
      url: result.url,
      public_id: result.public_id,
    }, 'Product image uploaded successfully');
  } catch (error) {
    console.error('Upload product image error:', error);
    sendErrorResponse(res, MESSAGES.ERROR.INTERNAL_ERROR);
  }
});

/**
 * Upload multiple images
 */
export const uploadMultipleImages = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const files = req.files as UploadedFile[];
  
  if (!files || files.length === 0) {
    return sendValidationErrorResponse(res, 'No files uploaded');
  }

  const { folder, prefix } = req.body;
  const fileBuffers = files.map(file => file.buffer);

  try {
    const result = await UploadService.uploadMultipleImages(
      fileBuffers,
      folder || 'uploads',
      prefix || 'image'
    );

    if (!result.success) {
      return sendErrorResponse(res, `Upload failed: ${result.errors.join(', ')}`);
    }

    sendSuccessResponse(res, {
      urls: result.urls,
      public_ids: result.public_ids,
      successCount: result.successCount,
      totalCount: result.totalCount,
      errors: result.errors,
    }, `${result.successCount}/${result.totalCount} images uploaded successfully`);
  } catch (error) {
    console.error('Upload multiple images error:', error);
    sendErrorResponse(res, MESSAGES.ERROR.INTERNAL_ERROR);
  }
});

/**
 * Upload multiple product images
 */
export const uploadMultipleProductImages = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const files = req.files as UploadedFile[];
  const { productId } = req.body;
  
  if (!files || files.length === 0) {
    return sendValidationErrorResponse(res, 'No files uploaded');
  }

  if (!productId) {
    return sendValidationErrorResponse(res, 'Product ID is required');
  }

  const fileBuffers = files.map(file => file.buffer);

  try {
    const result = await UploadService.uploadMultipleProductImages(
      fileBuffers,
      parseInt(productId)
    );

    if (!result.success) {
      return sendErrorResponse(res, `Upload failed: ${result.errors.join(', ')}`);
    }

    sendSuccessResponse(res, {
      urls: result.urls,
      public_ids: result.public_ids,
      successCount: result.successCount,
      totalCount: result.totalCount,
      errors: result.errors,
    }, `${result.successCount}/${result.totalCount} product images uploaded successfully`);
  } catch (error) {
    console.error('Upload multiple product images error:', error);
    sendErrorResponse(res, MESSAGES.ERROR.INTERNAL_ERROR);
  }
});

/**
 * Delete image by URL
 */
export const deleteImageByUrl = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { imageUrl } = req.body;
  
  if (!imageUrl) {
    return sendValidationErrorResponse(res, 'Image URL is required');
  }

  try {
    const result = await UploadService.deleteImageByUrl(imageUrl);

    if (!result.success) {
      return sendErrorResponse(res, result.error || 'Delete failed');
    }

    sendSuccessResponse(res, null, result.message);
  } catch (error) {
    console.error('Delete image by URL error:', error);
    sendErrorResponse(res, MESSAGES.ERROR.INTERNAL_ERROR);
  }
});

/**
 * Delete image by public_id
 */
export const deleteImageByPublicId = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { public_id } = req.body;
  
  if (!public_id) {
    return sendValidationErrorResponse(res, 'Public ID is required');
  }

  try {
    const result = await UploadService.deleteImageByPublicId(public_id);

    if (!result.success) {
      return sendErrorResponse(res, result.error || 'Delete failed');
    }

    sendSuccessResponse(res, null, result.message);
  } catch (error) {
    console.error('Delete image by public_id error:', error);
    sendErrorResponse(res, MESSAGES.ERROR.INTERNAL_ERROR);
  }
});

/**
 * Delete multiple images
 */
export const deleteMultipleImages = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { imageUrls } = req.body;
  
  if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
    return sendValidationErrorResponse(res, 'Image URLs array is required');
  }

  try {
    const result = await UploadService.deleteMultipleImages(imageUrls);

    if (!result.success && result.successCount === 0) {
      return sendErrorResponse(res, `Delete failed: ${result.errors.join(', ')}`);
    }

    sendSuccessResponse(res, {
      successCount: result.successCount,
      totalCount: result.totalCount,
      errors: result.errors,
    }, result.message);
  } catch (error) {
    console.error('Delete multiple images error:', error);
    sendErrorResponse(res, MESSAGES.ERROR.INTERNAL_ERROR);
  }
});

/**
 * Get upload info (for testing/debugging)
 */
export const getUploadInfo = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  try {
    const info = {
      cloudinaryConfigured: process.env['CLOUDINARY_CLOUD_NAME'] ? true : false,
      maxFileSize: '5MB',
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      folders: {
        avatars: 'User avatars',
        products: 'Product images',
        uploads: 'General uploads',
      },
    };

    sendSuccessResponse(res, info, 'Upload info retrieved successfully');
  } catch (error) {
    console.error('Get upload info error:', error);
    sendErrorResponse(res, MESSAGES.ERROR.INTERNAL_ERROR);
  }
});
