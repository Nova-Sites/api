import { Response } from 'express';
import { HTTP_STATUS, MESSAGES } from '@/constants';
import { ApiResponse } from '@/types';

export const sendResponse = <T = any>(
  res: Response,
  statusCode: number = HTTP_STATUS.OK,
  message: string = MESSAGES.SUCCESS.FETCHED,
  data?: T,
  success: boolean = true,
  error?: string
): void => {
  const response: ApiResponse<T> = {
    success,
    message,
    ...(data && { data }),
    ...(error && { error }),
  };

  res.status(statusCode).json(response);
};

export const sendSuccessResponse = <T = any>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = HTTP_STATUS.OK
): void => {
  sendResponse(res, statusCode, message || MESSAGES.SUCCESS.FETCHED, data, true);
};

export const sendErrorResponse = (
  res: Response,
  message: string = MESSAGES.ERROR.INTERNAL_ERROR,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  error?: string
): void => {
  sendResponse(res, statusCode, message, undefined, false, error);
};

export const sendNotFoundResponse = (
  res: Response,
  message: string = MESSAGES.ERROR.NOT_FOUND
): void => {
  sendErrorResponse(res, message, HTTP_STATUS.NOT_FOUND);
};

export const sendValidationErrorResponse = (
  res: Response,
  message: string = MESSAGES.ERROR.VALIDATION_ERROR,
  error?: string
): void => {
  sendErrorResponse(res, message, HTTP_STATUS.BAD_REQUEST, error);
};

export const sendUnauthorizedResponse = (
  res: Response,
  message: string = MESSAGES.ERROR.UNAUTHORIZED
): void => {
  sendErrorResponse(res, message, HTTP_STATUS.UNAUTHORIZED);
};

export const sendForbiddenResponse = (
  res: Response,
  message: string = MESSAGES.ERROR.FORBIDDEN
): void => {
  sendErrorResponse(res, message, HTTP_STATUS.FORBIDDEN);
}; 