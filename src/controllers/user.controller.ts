import { Request, Response } from 'express';
import { UserService } from '@/services/user.service';
import { UploadService } from '@/services/upload.service';
import { sendSuccessResponse, sendErrorResponse, sendValidationErrorResponse, sendNotFoundResponse } from '@/utils/responseFormatter';
import { MESSAGES } from '@/constants';
import { asyncHandler } from '@/middlewares/error';
import { AuthenticatedRequest } from '@/middlewares/auth';

// Interface cho uploaded files
interface UploadedFile extends Express.Multer.File {
  buffer: Buffer;
}

export const getAllUsers = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const users = await UserService.getAllUsers();
  sendSuccessResponse(res, users, MESSAGES.SUCCESS.FETCHED);
});

export const getUserById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    return sendValidationErrorResponse(res, MESSAGES.ERROR.USER.REQUIRED_ID);
  }
  
  const user = await UserService.getUserById(parseInt(id));
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
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (image !== undefined) updateData.image = image;

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
    const uploadResult = await UploadService.uploadUserAvatar(file.buffer, userId);
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
    
    if (!currentPassword || !newPassword) {
      return sendValidationErrorResponse(res, MESSAGES.ERROR.USER.REQUIRED_CURRENT_PASSWORD_NEW_PASSWORD);
    }

    const success = await UserService.changePassword(userId, currentPassword, newPassword);
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
  if (!id) {
    return sendValidationErrorResponse(res, MESSAGES.ERROR.USER.REQUIRED_ID);
  }
  
  const success = await UserService.deleteUser(parseInt(id), req.user?.userId);
  if (!success) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.USER.USER_NOT_FOUND);
  }
  
  sendSuccessResponse(res, null, MESSAGES.SUCCESS.DELETED);
});

export const softDeleteUser = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    return sendValidationErrorResponse(res, MESSAGES.ERROR.USER.REQUIRED_ID);
  }
  
  const success = await UserService.deleteUser(parseInt(id), req.user?.userId);
  if (!success) {
    return sendNotFoundResponse(res, MESSAGES.ERROR.USER.USER_NOT_FOUND);
  }
  
  sendSuccessResponse(res, null, MESSAGES.SUCCESS.DELETED);
});

export const getUsersByRole = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { role } = req.params;
  if (!role) {
    return sendValidationErrorResponse(res, MESSAGES.ERROR.USER.REQUIRED_ROLE);
  }
  
  const users = await UserService.getUsersByRole(role);
  sendSuccessResponse(res, users, MESSAGES.SUCCESS.FETCHED);
});

export const searchUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { search } = req.query;
  if (!search || typeof search !== 'string') {
    return sendValidationErrorResponse(res, MESSAGES.ERROR.USER.REQUIRED_SEARCH);
  }
  
  const users = await UserService.searchUsers(search);
  sendSuccessResponse(res, users, MESSAGES.SUCCESS.FETCHED);
}); 