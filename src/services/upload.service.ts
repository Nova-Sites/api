import { 
  uploadImage, 
  uploadAvatar, 
  uploadProductImage, 
  uploadMultipleImages,
  deleteImageByUrl,
  deleteFromCloudinary,
  isCloudinaryConfigured 
} from '@/utils/cloudinary';
import { MESSAGES } from '@/constants';

// Interface cho upload result
export interface UploadResult {
  success: boolean;
  url?: string | undefined;
  public_id?: string | undefined;
  error?: string | undefined;
}

// Interface cho multiple upload result
export interface MultipleUploadResult {
  success: boolean;
  urls: string[];
  public_ids: string[];
  errors: string[];
  successCount: number;
  totalCount: number;
}

// Interface cho delete result
export interface DeleteResult {
  success: boolean;
  message: string;
  error?: string | undefined;
}

export class UploadService {
  /**
   * Kiểm tra Cloudinary configuration
   */
  static checkCloudinaryConfig(): void {
    if (!isCloudinaryConfigured()) {
      throw new Error('Cloudinary is not configured properly');
    }
  }

  /**
   * Upload single image
   * @param fileBuffer - Buffer của file
   * @param folder - Thư mục upload (mặc định: 'uploads')
   * @param public_id - Public ID tùy chọn
   * @returns Promise với kết quả upload
   */
  static async uploadSingleImage(
    fileBuffer: Buffer,
    folder: string = 'uploads',
    public_id?: string
  ): Promise<UploadResult> {

    try {
      this.checkCloudinaryConfig();
      
      const result = await uploadImage(fileBuffer, folder, public_id);
  
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || MESSAGES.ERROR.INTERNAL_ERROR,
        };
      }

      return {
        success: true,
        url: result.url,
        public_id: result.public_id,
      };
    } catch (error) {
      console.error('Upload service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.ERROR.INTERNAL_ERROR,
      };
    }
  }

  /**
   * Upload user avatar
   * @param fileBuffer - Buffer của file
   * @param userId - ID của user
   * @returns Promise với kết quả upload
   */
  static async uploadUserAvatar(
    fileBuffer: Buffer,
    userId: number
  ): Promise<UploadResult> {
    try {
      this.checkCloudinaryConfig();
      
      const result = await uploadAvatar(fileBuffer, userId);
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || MESSAGES.ERROR.INTERNAL_ERROR,
        };
      }

      return {
        success: true,
        url: result.url,
        public_id: result.public_id,
      };
    } catch (error) {
      console.error('Avatar upload service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.ERROR.INTERNAL_ERROR,
      };
    }
  }

  /**
   * Upload product image
   * @param fileBuffer - Buffer của file
   * @param productId - ID của product
   * @param imageIndex - Index của ảnh
   * @returns Promise với kết quả upload
   */
  static async uploadProductImage(
    fileBuffer: Buffer,
    productId: number,
    imageIndex: number = 0
  ): Promise<UploadResult> {
    try {
      this.checkCloudinaryConfig();
      
      const result = await uploadProductImage(fileBuffer, productId, imageIndex);
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || MESSAGES.ERROR.INTERNAL_ERROR,
        };
      }

      return {
        success: true,
        url: result.url,
        public_id: result.public_id,
      };
    } catch (error) {
      console.error('Product image upload service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.ERROR.INTERNAL_ERROR,
      };
    }
  }

  /**
   * Upload multiple images
   * @param fileBuffers - Array buffer của files
   * @param folder - Thư mục upload
   * @param prefix - Prefix cho public_id
   * @returns Promise với kết quả upload
   */
  static async uploadMultipleImages(
    fileBuffers: Buffer[],
    folder: string = 'uploads',
    prefix: string = 'image'
  ): Promise<MultipleUploadResult> {
    try {
      this.checkCloudinaryConfig();
      
      if (fileBuffers.length === 0) {
        return {
          success: false,
          urls: [],
          public_ids: [],
          errors: ['No files provided'],
          successCount: 0,
          totalCount: 0,
        };
      }

      const results = await uploadMultipleImages(fileBuffers, folder, prefix);
      
      const urls: string[] = [];
      const public_ids: string[] = [];
      const errors: string[] = [];
      let successCount = 0;

      results.forEach((result, index) => {
        if (result.success && result.url && result.public_id) {
          urls.push(result.url);
          public_ids.push(result.public_id);
          successCount++;
        } else {
          errors.push(`Image ${index + 1}: ${result.error || 'Upload failed'}`);
        }
      });

      return {
        success: successCount > 0,
        urls,
        public_ids,
        errors,
        successCount,
        totalCount: fileBuffers.length,
      };
    } catch (error) {
      console.error('Multiple upload service error:', error);
      return {
        success: false,
        urls: [],
        public_ids: [],
        errors: [error instanceof Error ? error.message : MESSAGES.ERROR.INTERNAL_ERROR],
        successCount: 0,
        totalCount: fileBuffers.length,
      };
    }
  }

  /**
   * Upload multiple product images
   * @param fileBuffers - Array buffer của files
   * @param productId - ID của product
   * @returns Promise với kết quả upload
   */
  static async uploadMultipleProductImages(
    fileBuffers: Buffer[],
    productId: number
  ): Promise<MultipleUploadResult> {
    try {
      this.checkCloudinaryConfig();
      
      if (fileBuffers.length === 0) {
        return {
          success: false,
          urls: [],
          public_ids: [],
          errors: ['No files provided'],
          successCount: 0,
          totalCount: 0,
        };
      }

      const uploadPromises = fileBuffers.map((buffer, index) =>
        uploadProductImage(buffer, productId, index)
      );

      const results = await Promise.all(uploadPromises);
      
      const urls: string[] = [];
      const public_ids: string[] = [];
      const errors: string[] = [];
      let successCount = 0;

      results.forEach((result, index) => {
        if (result.success && result.url && result.public_id) {
          urls.push(result.url);
          public_ids.push(result.public_id);
          successCount++;
        } else {
          errors.push(`Image ${index + 1}: ${result.error || 'Upload failed'}`);
        }
      });

      return {
        success: successCount > 0,
        urls,
        public_ids,
        errors,
        successCount,
        totalCount: fileBuffers.length,
      };
    } catch (error) {
      console.error('Multiple product upload service error:', error);
      return {
        success: false,
        urls: [],
        public_ids: [],
        errors: [error instanceof Error ? error.message : MESSAGES.ERROR.INTERNAL_ERROR],
        successCount: 0,
        totalCount: fileBuffers.length,
      };
    }
  }

  /**
   * Delete image by URL
   * @param imageUrl - URL của ảnh
   * @returns Promise với kết quả xóa
   */
  static async deleteImageByUrl(imageUrl: string): Promise<DeleteResult> {
    try {
      this.checkCloudinaryConfig();
      
      if (!imageUrl) {
        return {
          success: false,
          message: 'Image URL is required',
        };
      }

      const result = await deleteImageByUrl(imageUrl);
      
      if (!result.success) {
        return {
          success: false,
          message: 'Failed to delete image',
          error: result.error,
        };
      }

      return {
        success: true,
        message: 'Image deleted successfully',
      };
    } catch (error) {
      console.error('Delete image service error:', error);
      return {
        success: false,
        message: 'Failed to delete image',
        error: error instanceof Error ? error.message : MESSAGES.ERROR.INTERNAL_ERROR,
      };
    }
  }

  /**
   * Delete image by public_id
   * @param public_id - Public ID của ảnh
   * @returns Promise với kết quả xóa
   */
  static async deleteImageByPublicId(public_id: string): Promise<DeleteResult> {
    try {
      this.checkCloudinaryConfig();
      
      if (!public_id) {
        return {
          success: false,
          message: 'Public ID is required',
        };
      }

      const result = await deleteFromCloudinary(public_id);
      
      if (!result.success) {
        return {
          success: false,
          message: 'Failed to delete image',
          error: result.error,
        };
      }

      return {
        success: true,
        message: 'Image deleted successfully',
      };
    } catch (error) {
      console.error('Delete image by public_id service error:', error);
      return {
        success: false,
        message: 'Failed to delete image',
        error: error instanceof Error ? error.message : MESSAGES.ERROR.INTERNAL_ERROR,
      };
    }
  }

  /**
   * Delete multiple images by URLs
   * @param imageUrls - Array URLs của ảnh
   * @returns Promise với kết quả xóa
   */
  static async deleteMultipleImages(imageUrls: string[]): Promise<{
    success: boolean;
    message: string;
    successCount: number;
    totalCount: number;
    errors: string[];
  }> {
    try {
      this.checkCloudinaryConfig();
      
      if (imageUrls.length === 0) {
        return {
          success: false,
          message: 'No image URLs provided',
          successCount: 0,
          totalCount: 0,
          errors: ['No image URLs provided'],
        };
      }

      const deletePromises = imageUrls.map(url => this.deleteImageByUrl(url));
      const results = await Promise.all(deletePromises);
      
      let successCount = 0;
      const errors: string[] = [];

      results.forEach((result, index) => {
        if (result.success) {
          successCount++;
        } else {
          errors.push(`Image ${index + 1}: ${result.error || 'Delete failed'}`);
        }
      });

      return {
        success: successCount > 0,
        message: `${successCount}/${imageUrls.length} images deleted successfully`,
        successCount,
        totalCount: imageUrls.length,
        errors,
      };
    } catch (error) {
      console.error('Delete multiple images service error:', error);
      return {
        success: false,
        message: 'Failed to delete images',
        successCount: 0,
        totalCount: imageUrls.length,
        errors: [error instanceof Error ? error.message : MESSAGES.ERROR.INTERNAL_ERROR],
      };
    }
  }
}
