import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, ValidationError } from 'express-validator';
import { sendValidationErrorResponse } from '@/utils/responseFormatter';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format validation errors
    const errorMessages = errors.array().map((error: ValidationError) => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined,
    }));

    sendValidationErrorResponse(
      res,
      'Validation failed',
      JSON.stringify(errorMessages)
    );
  };
};

// Common validation rules
export const commonValidations = {
  id: {
    in: ['params'],
    isInt: { options: { min: 1 } },
    errorMessage: 'ID must be a positive integer',
  },
  pagination: {
    page: {
      in: ['query'],
      optional: true,
      isInt: { options: { min: 1 } },
      toInt: true,
      errorMessage: 'Page must be a positive integer',
    },
    limit: {
      in: ['query'],
      optional: true,
      isInt: { options: { min: 1, max: 100 } },
      toInt: true,
      errorMessage: 'Limit must be between 1 and 100',
    },
    sortBy: {
      in: ['query'],
      optional: true,
      isIn: { options: [['id', 'name', 'createdAt', 'updatedAt', 'price', 'views']] },
      errorMessage: 'Invalid sort field',
    },
    sortOrder: {
      in: ['query'],
      optional: true,
      isIn: { options: [['ASC', 'DESC']] },
      errorMessage: 'Sort order must be ASC or DESC',
    },
  },
  category: {
    name: {
      in: ['body'],
      notEmpty: true,
      isLength: { options: { min: 2, max: 255 } },
      trim: true,
      errorMessage: 'Category name must be between 2 and 255 characters',
    },
    image: {
      in: ['body'],
      notEmpty: true,
      isURL: true,
      errorMessage: 'Image must be a valid URL',
    },
    description: {
      in: ['body'],
      optional: true,
      isLength: { options: { max: 1000 } },
      trim: true,
      errorMessage: 'Description must not exceed 1000 characters',
    },
  },
  product: {
    name: {
      in: ['body'],
      notEmpty: true,
      isLength: { options: { min: 2, max: 255 } },
      trim: true,
      errorMessage: 'Product name must be between 2 and 255 characters',
    },
    description: {
      in: ['body'],
      notEmpty: true,
      isLength: { options: { min: 10, max: 2000 } },
      trim: true,
      errorMessage: 'Description must be between 10 and 2000 characters',
    },
    image: {
      in: ['body'],
      notEmpty: true,
      isURL: true,
      errorMessage: 'Image must be a valid URL',
    },
    price: {
      in: ['body'],
      notEmpty: true,
      isFloat: { options: { min: 0 } },
      toFloat: true,
      errorMessage: 'Price must be a positive number',
    },
    categoryId: {
      in: ['body'],
      notEmpty: true,
      isInt: { options: { min: 1 } },
      toInt: true,
      errorMessage: 'Category ID must be a positive integer',
    },
  },
  search: {
    search: {
      in: ['query'],
      notEmpty: true,
      isLength: { options: { min: 2, max: 100 } },
      trim: true,
      errorMessage: 'Search term must be between 2 and 100 characters',
    },
  },
  priceRange: {
    minPrice: {
      in: ['params'],
      notEmpty: true,
      isFloat: { options: { min: 0 } },
      toFloat: true,
      errorMessage: 'Min price must be a positive number',
    },
    maxPrice: {
      in: ['params'],
      notEmpty: true,
      isFloat: { options: { min: 0 } },
      toFloat: true,
      errorMessage: 'Max price must be a positive number',
    },
  },
}; 