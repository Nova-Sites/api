import { Request, Response } from 'express';
import { UserService } from '@/services/user.service';
import { sendSuccessResponse, sendErrorResponse, sendValidationErrorResponse, sendNotFoundResponse } from '@/utils/responseFormatter';
import { MESSAGES } from '@/constants';
import { asyncHandler } from '@/middlewares/error';

export const getAllUsers = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const users = await UserService.getAllUsers();
  sendSuccessResponse(res, users, MESSAGES.SUCCESS.FETCHED);
});

export const getUserById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    return sendValidationErrorResponse(res, 'User ID is required');
  }
  
  const user = await UserService.getUserById(parseInt(id));
  if (!user) {
    return sendNotFoundResponse(res, 'User not found');
  }
  
  sendSuccessResponse(res, user, MESSAGES.SUCCESS.FETCHED);
});

export const getUserProfile = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  // This will be implemented when we add authentication middleware
  // For now, return a placeholder response
  sendSuccessResponse(res, { message: 'User profile endpoint - to be implemented' }, 'User profile endpoint');
});

export const updateUserProfile = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  // This will be implemented when we add authentication middleware
  // const { username, email, image } = req.body;
  
  try {
    // Placeholder implementation
    sendSuccessResponse(res, { message: 'Profile update endpoint - to be implemented' }, 'Profile update endpoint');
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        sendValidationErrorResponse(res, error.message);
      } else {
        sendErrorResponse(res, error.message);
      }
    } else {
      sendErrorResponse(res, 'Profile update failed');
    }
  }
});

export const updateUserAvatar = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  // This will be implemented when we add file upload functionality
  sendSuccessResponse(res, { message: 'Avatar update endpoint - to be implemented' }, 'Avatar update endpoint');
});

export const changePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return sendValidationErrorResponse(res, 'Current password and new password are required');
  }
  
  try {
    // This will be implemented when we add authentication middleware
    sendSuccessResponse(res, { message: 'Password change endpoint - to be implemented' }, 'Password change endpoint');
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('incorrect')) {
        sendValidationErrorResponse(res, error.message);
      } else {
        sendErrorResponse(res, error.message);
      }
    } else {
      sendErrorResponse(res, 'Password change failed');
    }
  }
});

export const deleteUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    return sendValidationErrorResponse(res, 'User ID is required');
  }
  
  const success = await UserService.deleteUser(parseInt(id));
  if (!success) {
    return sendNotFoundResponse(res, 'User not found');
  }
  
  sendSuccessResponse(res, null, MESSAGES.SUCCESS.DELETED);
});

export const softDeleteUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    return sendValidationErrorResponse(res, 'User ID is required');
  }
  
  const success = await UserService.deleteUser(parseInt(id));
  if (!success) {
    return sendNotFoundResponse(res, 'User not found');
  }
  
  sendSuccessResponse(res, null, MESSAGES.SUCCESS.DELETED);
});

export const getUsersByRole = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { role } = req.params;
  if (!role) {
    return sendValidationErrorResponse(res, 'Role is required');
  }
  
  const users = await UserService.getUsersByRole(role);
  sendSuccessResponse(res, users, MESSAGES.SUCCESS.FETCHED);
});

export const searchUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { search } = req.query;
  if (!search || typeof search !== 'string') {
    return sendValidationErrorResponse(res, 'Search term is required');
  }
  
  const users = await UserService.searchUsers(search);
  sendSuccessResponse(res, users, MESSAGES.SUCCESS.FETCHED);
}); 