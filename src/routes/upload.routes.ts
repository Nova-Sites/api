import { Router } from 'express';
import { body } from 'express-validator';
import {
  uploadSingleImage,
  uploadUserAvatar,
  uploadProductImage,
  uploadMultipleImages,
  uploadMultipleProductImages,
  deleteImageByUrl,
  deleteImageByPublicId,
  deleteMultipleImages,
  getUploadInfo,
} from '@/controllers/upload.controller';
import { validate } from '@/middlewares/validator';
import { authenticateToken, requireStaff, requireAdmin } from '@/middlewares/auth';
import { 
  uploadSingleWithError, 
  uploadMultipleWithError 
} from '@/utils/multer';

const router = Router();

// Validation chains
const validateImageUrl = [
  body('imageUrl')
    .notEmpty()
    .isURL()
    .withMessage('Valid image URL is required')
];

const validatePublicId = [
  body('public_id')
    .notEmpty()
    .isString()
    .withMessage('Public ID is required')
];

const validateImageUrls = [
  body('imageUrls')
    .isArray({ min: 1 })
    .withMessage('Image URLs array is required')
    .custom((urls) => {
      if (!Array.isArray(urls)) return false;
      return urls.every(url => typeof url === 'string' && url.length > 0);
    })
    .withMessage('All image URLs must be valid strings')
];

const validateProductId = [
  body('productId')
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage('Valid product ID is required')
];

const validateUploadOptions = [
  body('folder')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Folder name must be 1-50 characters'),
  body('public_id')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Public ID must be 1-100 characters'),
  body('prefix')
    .optional()
    .isString()
    .isLength({ min: 1, max: 30 })
    .withMessage('Prefix must be 1-30 characters')
];

// GET /api/v1/upload/info - Get upload information
router.get('/info', getUploadInfo);

// POST /api/v1/upload/single - Upload single image
router.post(
  '/single',
  authenticateToken,
  uploadSingleWithError('image'),
  validate(validateUploadOptions),
  uploadSingleImage
);

// POST /api/v1/upload/avatar - Upload user avatar
router.post(
  '/avatar',
  authenticateToken,
  uploadSingleWithError('avatar'),
  uploadUserAvatar
);

// POST /api/v1/upload/product - Upload product image
router.post(
  '/product',
  authenticateToken,
  requireStaff,
  uploadSingleWithError('image'),
  validate([
    ...validateProductId,
    body('imageIndex')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Image index must be a non-negative integer')
  ]),
  uploadProductImage
);

// POST /api/v1/upload/multiple - Upload multiple images
router.post(
  '/multiple',
  authenticateToken,
  requireStaff,
  uploadMultipleWithError('images', 10),
  validate(validateUploadOptions),
  uploadMultipleImages
);

// POST /api/v1/upload/product/multiple - Upload multiple product images
router.post(
  '/product/multiple',
  authenticateToken,
  requireStaff,
  uploadMultipleWithError('images', 10),
  validate(validateProductId),
  uploadMultipleProductImages
);

// DELETE /api/v1/upload/url - Delete image by URL
router.delete(
  '/url',
  authenticateToken,
  requireStaff,
  validate(validateImageUrl),
  deleteImageByUrl
);

// DELETE /api/v1/upload/public-id - Delete image by public_id
router.delete(
  '/public-id',
  authenticateToken,
  requireStaff,
  validate(validatePublicId),
  deleteImageByPublicId
);

// DELETE /api/v1/upload/multiple - Delete multiple images
router.delete(
  '/multiple',
  authenticateToken,
  requireAdmin,
  validate(validateImageUrls),
  deleteMultipleImages
);

export default router;
