import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import streamifier from 'streamifier';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env['CLOUDINARY_CLOUD_NAME'] || '',
  api_key: process.env['CLOUDINARY_API_KEY'] || '',
  api_secret: process.env['CLOUDINARY_API_SECRET'] || '',
});



// Interface cho upload options
export interface CloudinaryUploadOptions {
  folder?: string;
  public_id?: string;
  transformation?: any[];
  quality?: string | number;
  format?: string;
}

// Interface cho upload result
export interface CloudinaryUploadResult {
  success: boolean;
  url?: string;
  public_id?: string;
  error?: string;
}

// Interface cho delete result
export interface CloudinaryDeleteResult {
  success: boolean;
  result?: string;
  error?: string;
}

/**
 * Upload file buffer lên Cloudinary
 * @param fileBuffer - Buffer của file
 * @param options - Tùy chọn upload
 * @returns Promise với kết quả upload
 */
export const uploadToCloudinary = (
  fileBuffer: Buffer,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve) => {
    const uploadOptions: any = {
      resource_type: 'auto',
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          resolve({
            success: false,
            error: error.message || 'Upload failed',
          });
        } else if (result) {
          resolve({
            success: true,
            url: result.secure_url,
            public_id: result.public_id,
          });
        } else {
          resolve({
            success: false,
            error: 'Unknown upload error',
          });
        }
      }
    );

    // Chuyển buffer thành stream và pipe vào uploadStream
    const readStream = streamifier.createReadStream(fileBuffer);
    
    readStream.on('error', (streamError) => {
      console.error('Stream error:', streamError);
      resolve({
        success: false,
        error: `Stream error: ${streamError.message}`,
      });
    });

    readStream.pipe(uploadStream);
  });
};

/**
 * Upload single image với các tùy chọn tối ưu hóa
 * @param fileBuffer - Buffer của file
 * @param folder - Thư mục trên Cloudinary
 * @param public_id - ID công khai (optional)
 * @returns Promise với kết quả upload
 */
export const uploadImage = async (
  fileBuffer: Buffer,
  folder: string = 'uploads',
  public_id?: string
): Promise<CloudinaryUploadResult> => {
  const options: CloudinaryUploadOptions = {
    folder,
    quality: 'auto:good',
    format: 'webp',
    transformation: [
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  };


  if (public_id) {
    options.public_id = public_id;
  }

  return uploadToCloudinary(fileBuffer, options);
};

/**
 * Upload avatar với kích thước tối ưu
 * @param fileBuffer - Buffer của file
 * @param userId - ID của user
 * @returns Promise với kết quả upload
 */
export const uploadAvatar = async (
  fileBuffer: Buffer,
  userId: number
): Promise<CloudinaryUploadResult> => {
  const options: CloudinaryUploadOptions = {
    folder: 'avatars',
    public_id: `user_${userId}_avatar`,
    quality: 'auto:good',
    format: 'webp',
    transformation: [
      { width: 300, height: 300, crop: 'fill', gravity: 'face' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  };

  return uploadToCloudinary(fileBuffer, options);
};

/**
 * Upload product images với nhiều kích thước
 * @param fileBuffer - Buffer của file
 * @param productId - ID của product
 * @param imageIndex - Index của ảnh
 * @returns Promise với kết quả upload
 */
export const uploadProductImage = async (
  fileBuffer: Buffer,
  productId: number,
  imageIndex: number = 0
): Promise<CloudinaryUploadResult> => {
  const options: CloudinaryUploadOptions = {
    folder: 'products',
    public_id: `product_${productId}_image_${imageIndex}`,
    quality: 'auto:good',
    format: 'webp',
    transformation: [
      { width: 800, height: 600, crop: 'fit' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  };

  return uploadToCloudinary(fileBuffer, options);
};

/**
 * Xóa ảnh trên Cloudinary theo public_id
 * @param public_id - Public ID của ảnh
 * @returns Promise với kết quả xóa
 */
export const deleteFromCloudinary = async (
  public_id: string
): Promise<CloudinaryDeleteResult> => {
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    
    return {
      success: result.result === 'ok',
      result: result.result,
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
};

/**
 * Xóa ảnh trên Cloudinary theo URL
 * @param imageUrl - URL của ảnh
 * @returns Promise với kết quả xóa
 */
export const deleteImageByUrl = async (
  imageUrl: string
): Promise<CloudinaryDeleteResult> => {
  try {
    // Extract public_id from URL
    const urlParts = imageUrl.split('/');
    const fileNameWithExtension = urlParts[urlParts.length - 1];
    const fileName = fileNameWithExtension?.split('.')[0];
    
    if (!fileName) {
      return {
        success: false,
        error: 'Invalid image URL format',
      };
    }
    
    // Find folder from URL
    const folderIndex = urlParts.findIndex(part => part === 'upload');
    if (folderIndex !== -1 && folderIndex + 2 < urlParts.length) {
      const folder = urlParts[folderIndex + 2];
      const public_id = `${folder}/${fileName}`;
      return deleteFromCloudinary(public_id);
    }
    
    return deleteFromCloudinary(fileName);
  } catch (error) {
    console.error('Error extracting public_id from URL:', error);
    return {
      success: false,
      error: 'Failed to extract public_id from URL',
    };
  }
};

/**
 * Upload multiple images
 * @param fileBuffers - Array of file buffers
 * @param folder - Thư mục trên Cloudinary
 * @param prefix - Prefix cho public_id
 * @returns Promise với array kết quả upload
 */
export const uploadMultipleImages = async (
  fileBuffers: Buffer[],
  folder: string = 'uploads',
  prefix: string = 'image'
): Promise<CloudinaryUploadResult[]> => {
  const uploadPromises = fileBuffers.map((buffer, index) => {
    const options: CloudinaryUploadOptions = {
      folder,
      public_id: `${prefix}_${Date.now()}_${index}`,
      quality: 'auto:good',
      format: 'webp',
    };
    
    return uploadToCloudinary(buffer, options);
  });

  return Promise.all(uploadPromises);
};

/**
 * Kiểm tra xem Cloudinary đã được cấu hình chưa
 */
export const isCloudinaryConfigured = (): boolean => {
  return !!(
    process.env['CLOUDINARY_CLOUD_NAME'] &&
    process.env['CLOUDINARY_API_KEY'] &&
    process.env['CLOUDINARY_API_SECRET']
  );
};

export default {
  uploadToCloudinary,
  uploadImage,
  uploadAvatar,
  uploadProductImage,
  deleteFromCloudinary,
  deleteImageByUrl,
  uploadMultipleImages,
  isCloudinaryConfigured,
};
