import { Request, Response } from 'express';
import { CategoryService } from '@/services/category.service';
import { sendSuccessResponse, sendNotFoundResponse } from '@/utils/responseFormatter';
import { MESSAGES } from '@/constants';
import { asyncHandler } from '@/middlewares/error';

export const getAllCategories = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const categories = await CategoryService.getAllCategories();
  sendSuccessResponse(res, categories, MESSAGES.SUCCESS.FETCHED);
});

export const getCategoryById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    return sendNotFoundResponse(res, 'Category ID is required');
  }
  
  const category = await CategoryService.getCategoryById(parseInt(id));
  if (!category) {
    return sendNotFoundResponse(res, 'Category not found');
  }
  
  sendSuccessResponse(res, category, MESSAGES.SUCCESS.FETCHED);
});

export const getCategoryBySlug = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params;
  if (!slug) {
    return sendNotFoundResponse(res, 'Category slug is required');
  }
  
  const category = await CategoryService.getCategoryBySlug(slug);
  if (!category) {
    return sendNotFoundResponse(res, 'Category not found');
  }
  
  sendSuccessResponse(res, category, MESSAGES.SUCCESS.FETCHED);
});

export const createCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, image, description } = req.body;
  
  const category = await CategoryService.createCategory({
    name,
    image,
    description,
  });
  
  sendSuccessResponse(res, category, MESSAGES.SUCCESS.CREATED, 201);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    return sendNotFoundResponse(res, 'Category ID is required');
  }
  
  const { name, image, description, isActive } = req.body;
  
  const category = await CategoryService.updateCategory(parseInt(id), {
    name,
    image,
    description,
    isActive,
  });
  
  if (!category) {
    return sendNotFoundResponse(res, 'Category not found');
  }
  
  sendSuccessResponse(res, category, MESSAGES.SUCCESS.UPDATED);
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    return sendNotFoundResponse(res, 'Category ID is required');
  }
  
  const success = await CategoryService.deleteCategory(parseInt(id));
  if (!success) {
    return sendNotFoundResponse(res, 'Category not found');
  }
  
  sendSuccessResponse(res, null, MESSAGES.SUCCESS.DELETED);
});

export const softDeleteCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    return sendNotFoundResponse(res, 'Category ID is required');
  }
  
  const success = await CategoryService.deleteCategory(parseInt(id));
  if (!success) {
    return sendNotFoundResponse(res, 'Category not found');
  }
  
  sendSuccessResponse(res, null, MESSAGES.SUCCESS.DELETED);
});

export const searchCategories = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { search } = req.query;
  if (!search || typeof search !== 'string') {
    return sendNotFoundResponse(res, 'Search term is required');
  }
  
  const categories = await CategoryService.searchCategories(search);
  sendSuccessResponse(res, categories, MESSAGES.SUCCESS.FETCHED);
});

export const getCategoriesWithProductCount = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const categories = await CategoryService.getCategoriesWithProductCount();
  sendSuccessResponse(res, categories, MESSAGES.SUCCESS.FETCHED);
}); 