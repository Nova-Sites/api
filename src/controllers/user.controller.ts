import { Request, Response } from 'express';
import { UserService } from '@/services/user.service';
import { sendSuccessResponse, sendErrorResponse, sendValidationErrorResponse, sendNotFoundResponse } from '@/utils/responseFormatter';
import { MESSAGES } from '@/constants';
import { asyncHandler } from '@/middlewares/error';
import { AuthenticatedRequest } from '@/middlewares/auth';

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

export const getUserProfile = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  // This will be implemented when we add authentication middleware
  // For now, return a placeholder response
  sendSuccessResponse(res, { message: MESSAGES.SUCCESS.USER.GET_USER_PROFILE_SUCCESS }, MESSAGES.SUCCESS.USER.GET_USER_PROFILE_SUCCESS);
});

export const updateUserProfile = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  // This will be implemented when we add authentication middleware
  // const { username, email, image } = req.body;
  
  try {
    // Placeholder implementation
    sendSuccessResponse(res, { message: MESSAGES.SUCCESS.USER.UPDATE_USER_PROFILE_SUCCESS }, MESSAGES.SUCCESS.USER.UPDATE_USER_PROFILE_SUCCESS);
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

export const updateUserAvatar = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  // This will be implemented when we add file upload functionality
  sendSuccessResponse(res, { message: MESSAGES.SUCCESS.USER.UPDATE_USER_AVATAR_SUCCESS }, MESSAGES.SUCCESS.USER.UPDATE_USER_AVATAR_SUCCESS);
});

export const changePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return sendValidationErrorResponse(res, MESSAGES.ERROR.USER.REQUIRED_CURRENT_PASSWORD_NEW_PASSWORD);
  }
  
  try {
    // This will be implemented when we add authentication middleware
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