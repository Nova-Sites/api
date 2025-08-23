import multer from 'multer';
import { Request } from 'express';
import { UPLOAD_CONSTANTS, MESSAGES } from '@/constants';

// Memory storage vì sẽ upload lên Cloudinary
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  // Kiểm tra MIME type
  if (UPLOAD_CONSTANTS.ALLOWED_IMAGE_TYPES.includes(file.mimetype as any)) {
    cb(null, true);
  } else {
    cb(new Error(MESSAGES.ERROR.INVALID_FILE_TYPE));
  }
};

// Cấu hình cơ bản cho multer
const multerConfig: multer.Options = {
  storage,
  fileFilter,
  limits: {
    fileSize: UPLOAD_CONSTANTS.MAX_FILE_SIZE,
  },
};

// Khởi tạo multer với cấu hình cơ bản
const upload = multer(multerConfig);

/**
 * Middleware cho upload single file
 */
export const uploadSingle = (fieldName: string) => upload.single(fieldName);

/**
 * Middleware cho upload multiple files (dành cho product images)
 */
export const uploadMultiple = (fieldName: string, maxCount: number = 10) => 
  upload.array(fieldName, maxCount);

/**
 * Middleware xử lý lỗi upload
 */
export const handleUploadError = (): multer.Multer => {
  return multer({
    ...multerConfig,
    fileFilter: (req, file, cb) => {
      try {
        fileFilter(req, file, cb);
      } catch (err) {
        cb(err as Error);
      }
    },
  });
};

/**
 * Wrapper middleware để xử lý lỗi upload
 */
export const createUploadMiddleware = (
  uploadFunction: any,
  errorMessage: string = MESSAGES.ERROR.INTERNAL_ERROR
) => {
  return (req: Request, res: any, next: any) => {
    uploadFunction(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: MESSAGES.ERROR.FILE_TOO_LARGE,
            statusCode: 400,
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message,
          statusCode: 400,
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || errorMessage,
          statusCode: 400,
        });
      }
      next();
    });
  };
};

// Export các middleware đã được wrap
export const uploadSingleWithError = (fieldName: string) =>
  createUploadMiddleware(upload.single(fieldName));

export const uploadMultipleWithError = (fieldName: string, maxCount: number = 10) =>
  createUploadMiddleware(upload.array(fieldName, maxCount));

export default upload;
