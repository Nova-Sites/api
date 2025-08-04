import { Request, Response } from 'express';
import { UserService } from '@/services/user.service';
import { sendSuccessResponse, sendErrorResponse, sendValidationErrorResponse } from '@/utils/responseFormatter';
import { MESSAGES, HTTP_STATUS } from '@/constants';
import { asyncHandler } from '@/middlewares/error';

export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { username, email, password, image } = req.body;

  try {
    const result = await UserService.registerUser({
      username,
      email,
      password,
      image,
    });

    // Don't send OTP in response for security
    const { otp, ...userData } = result;
    
    sendSuccessResponse(
      res,
      {
        user: userData.user,
        message: 'Registration successful. Please check your email for OTP verification.',
      },
      'Registration successful. Please check your email for OTP verification.',
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        sendValidationErrorResponse(res, error.message);
      } else if (error.message.includes('Failed to send OTP')) {
        sendErrorResponse(res, 'Failed to send verification email. Please try again.', HTTP_STATUS.INTERNAL_SERVER_ERROR);
      } else {
        sendErrorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
      }
    } else {
      sendErrorResponse(res, 'Registration failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
});

export const verifyOTP = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return sendValidationErrorResponse(res, 'Email and OTP are required');
  }

  try {
    const user = await UserService.verifyOTP(email, otp);
    
    sendSuccessResponse(
      res,
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isActive: user.isActive,
          image: user.image,
          role: user.role,
          createdAt: user.createdAt,
        },
        message: 'Account verified successfully',
      },
      'Account verified successfully'
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Invalid OTP') || error.message.includes('expired')) {
        sendValidationErrorResponse(res, error.message);
      } else {
        sendErrorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
      }
    } else {
      sendErrorResponse(res, 'OTP verification failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
});

export const resendOTP = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    return sendValidationErrorResponse(res, 'Email is required');
  }

  try {
    const result = await UserService.resendOTP(email);
    
    // Don't send OTP in response for security
    const { otp, ...userData } = result;
    
    sendSuccessResponse(
      res,
      {
        user: userData.user,
        message: 'OTP resent successfully. Please check your email.',
      },
      'OTP resent successfully. Please check your email.'
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('already activated')) {
        sendValidationErrorResponse(res, error.message);
      } else if (error.message.includes('Failed to send OTP')) {
        sendErrorResponse(res, 'Failed to send verification email. Please try again.', HTTP_STATUS.INTERNAL_SERVER_ERROR);
      } else {
        sendErrorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
      }
    } else {
      sendErrorResponse(res, 'Failed to resend OTP', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendValidationErrorResponse(res, 'Email and password are required');
  }

  try {
    // This will be implemented when we add JWT authentication
    sendSuccessResponse(res, { message: 'Login endpoint - to be implemented' }, 'Login endpoint');
  } catch (error) {
    sendErrorResponse(res, 'Login failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});

export const logout = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  // This will be implemented when we add JWT authentication
  sendSuccessResponse(res, null, MESSAGES.SUCCESS.LOGOUT_SUCCESS);
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    return sendValidationErrorResponse(res, 'Email is required');
  }

  try {
    // This will be implemented when we add password reset functionality
    sendSuccessResponse(res, { message: 'Password reset email sent' }, 'Password reset email sent');
  } catch (error) {
    sendErrorResponse(res, 'Failed to send password reset email', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});

export const resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return sendValidationErrorResponse(res, 'Token and new password are required');
  }

  try {
    // This will be implemented when we add password reset functionality
    sendSuccessResponse(res, { message: 'Password reset successful' }, 'Password reset successful');
  } catch (error) {
    sendErrorResponse(res, 'Password reset failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}); 