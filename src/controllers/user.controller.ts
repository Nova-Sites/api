import { Request, Response } from 'express';
import { UserService } from '@/services/user.service';

import { sendSuccessResponse, sendErrorResponse, sendValidationErrorResponse, sendNotFoundResponse } from '@/utils/responseFormatter';
import { 
  validateId,
  validateStringField,
  validateSearchTerm,
  validateEmail,
  validatePassword
} from '@/utils/validation';
import { MESSAGES } from '@/constants';
import { asyncHandler } from '@/middlewares/error';
import { uploadAvatar } from '@/utils/cloudinary';
import { AuthenticatedRequest, UploadedFile } from '@/types';

export const getAllUsers = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const users = await UserService.getAllUsers();
  sendSuccessResponse(res, users, MESSAGES.SUCCESS.FETCHED);
});

export const getUserById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  // Validate ID
  const idValidation = validateId(id, 'User ID');
  if (!idValidation.isValid) {
    return sendValidationErrorResponse(res, idValidation.error!);
  }
  
  const user = await UserService.getUserById(idValidation.value!);
  if (!user) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.USER.USER_NOT_FOUND);
  }
  
  sendSuccessResponse(res, user, MESSAGES.SUCCESS.FETCHED);
});

export const getUserProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendErrorResponse(res, MESSAGES.ERROR.AUTH.REQUIRED_AUTH);
    }

    const user = await UserService.getUserProfile(userId);
    if (!user) {
      return sendNotFoundResponse(res, MESSAGES.ERROR.USER.USER_NOT_FOUND);
    }

    sendSuccessResponse(res, user, MESSAGES.SUCCESS.USER.GET_USER_PROFILE_SUCCESS);
  } catch (error) {
    if (error instanceof Error) {
      sendErrorResponse(res, error.message);
    } else {
      sendErrorResponse(res, MESSAGES.ERROR.INTERNAL_ERROR);
    }
  }
});

export const updateUserProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendErrorResponse(res, MESSAGES.ERROR.AUTH.REQUIRED_AUTH);
    }

    const { username, email, image } = req.body;
    
    const updateData: { username?: string; email?: string; image?: string } = {};
    
    // Validate optional fields
    if (username !== undefined) {
      const usernameValidation = validateStringField(username, 'Username', true);
      if (!usernameValidation.isValid) {
        return sendValidationErrorResponse(res, usernameValidation.error!);
      }
      updateData.username = usernameValidation.value!;
    }
    
    if (email !== undefined) {
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        return sendValidationErrorResponse(res, emailValidation.error!);
      }
      updateData.email = email;
    }
    
    if (image !== undefined) {
      const imageValidation = validateStringField(image, 'Image URL', false);
      if (!imageValidation.isValid) {
        return sendValidationErrorResponse(res, imageValidation.error!);
      }
      updateData.image = imageValidation.value!;
    }

    const updatedUser = await UserService.updateUserProfile(userId, updateData);
    if (!updatedUser) {
      return sendNotFoundResponse(res, MESSAGES.ERROR.USER.USER_NOT_FOUND);
    }

    sendSuccessResponse(res, updatedUser, MESSAGES.SUCCESS.USER.UPDATE_USER_PROFILE_SUCCESS);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        sendValidationErrorResponse(res, error.message);
      } else {
        sendErrorResponse(res, error.message);
      }
    } else {
      sendErrorResponse(res, MESSAGES.ERROR.USER.PROFILE_UPDATE_FAILED);
    }
  }
});

export const updateUserAvatar = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const file = req.file as UploadedFile;
    
    if (!userId) {
      return sendErrorResponse(res, MESSAGES.ERROR.AUTH.REQUIRED_AUTH);
    }

    if (!file) {
      return sendValidationErrorResponse(res, MESSAGES.ERROR.USER.REQUIRED_IMAGE);
    }

    // Upload avatar to Cloudinary
    const uploadResult = await uploadAvatar(file.buffer, userId);
    if (!uploadResult.success) {
      return sendErrorResponse(res, uploadResult.error || 'Avatar upload failed');
    }

    // Update user with new avatar URL
    const updatedUser = await UserService.updateUserAvatar(userId, uploadResult.url!);
    if (!updatedUser) {
      return sendNotFoundResponse(res, MESSAGES.ERROR.USER.USER_NOT_FOUND);
    }

    sendSuccessResponse(res, {
      user: updatedUser,
      avatarUrl: uploadResult.url,
      public_id: uploadResult.public_id,
    }, MESSAGES.SUCCESS.USER.UPDATE_USER_AVATAR_SUCCESS);
  } catch (error) {
    if (error instanceof Error) {
      sendErrorResponse(res, error.message);
    } else {
      sendErrorResponse(res, MESSAGES.ERROR.USER.PROFILE_UPDATE_FAILED);
    }
  }
});

export const changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendErrorResponse(res, MESSAGES.ERROR.AUTH.REQUIRED_AUTH);
    }

    const { currentPassword, newPassword } = req.body;
    
    // Validate current password
    const currentPasswordValidation = validateStringField(currentPassword, 'Current Password', true);
    if (!currentPasswordValidation.isValid) {
      return sendValidationErrorResponse(res, currentPasswordValidation.error!);
    }
    
    // Validate new password
    const newPasswordValidation = validatePassword(newPassword);
    if (!newPasswordValidation.isValid) {
      return sendValidationErrorResponse(res, newPasswordValidation.error!);
    }

    const success = await UserService.changePassword(userId, currentPasswordValidation.value!, newPassword);
    if (!success) {
      return sendNotFoundResponse(res, MESSAGES.ERROR.USER.USER_NOT_FOUND);
    }

    sendSuccessResponse(res, { message: MESSAGES.SUCCESS.USER.PASSWORD_CHANGE_SUCCESS }, MESSAGES.SUCCESS.USER.PASSWORD_CHANGE_SUCCESS);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('incorrect')) {
        sendValidationErrorResponse(res, error.message);
      } else {
        sendErrorResponse(res, error.message);
      }
    } else {
      sendErrorResponse(res, MESSAGES.ERROR.USER.PASSWORD_CHANGE_FAILED);
    }
  }
});

export const deleteUser = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  
  // Validate ID
  const idValidation = validateId(id, 'User ID');
  if (!idValidation.isValid) {
    return sendValidationErrorResponse(res, idValidation.error!);
  }
  
  const success = await UserService.deleteUser(idValidation.value!, req.user?.userId);
  if (!success) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.USER.USER_NOT_FOUND);
  }
  
  sendSuccessResponse(res, null, MESSAGES.SUCCESS.DELETED);
});

export const softDeleteUser = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  
  // Validate ID
  const idValidation = validateId(id, 'User ID');
  if (!idValidation.isValid) {
    return sendValidationErrorResponse(res, idValidation.error!);
  }
  
  const success = await UserService.deleteUser(idValidation.value!, req.user?.userId);
  if (!success) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.USER.USER_NOT_FOUND);
  }
  
  sendSuccessResponse(res, null, MESSAGES.SUCCESS.DELETED);
});

export const getUsersByRole = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { role } = req.params;
  
  // Validate role
  const roleValidation = validateStringField(role, 'Role', true);
  if (!roleValidation.isValid) {
    return sendValidationErrorResponse(res, roleValidation.error!);
  }
  
  const users = await UserService.getUsersByRole(roleValidation.value!);
  sendSuccessResponse(res, users, MESSAGES.SUCCESS.FETCHED);
});

export const searchUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { search } = req.query;
  
  // Validate search term
  const searchValidation = validateSearchTerm(search);
  if (!searchValidation.isValid) {
    return sendValidationErrorResponse(res, searchValidation.error!);
  }
  
  const users = await UserService.searchUsers(searchValidation.value!);
  sendSuccessResponse(res, users, MESSAGES.SUCCESS.FETCHED);
}); 