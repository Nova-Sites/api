// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// API Messages
export const MESSAGES = {
  SUCCESS: {
    CREATED: 'Created successfully',
    UPDATED: 'Updated successfully',
    DELETED: 'Deleted successfully',
    FETCHED: 'Data fetched successfully',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    AUTH: {
      REGISTER_SUCCESS: 'Registration successful. Please check your email for OTP verification.',
      TOKEN_REFRESHED: 'Token refreshed successfully',
      VERIFY_OTP_SUCCESS: 'Account verified successfully',
      RESEND_OTP_SUCCESS: 'OTP resent successfully. Please check your email.',
      PASSWORD_RESET_EMAIL_SENT: 'Password reset email sent',
      PASSWORD_RESET_SUCCESS: 'Password reset successful',
    },
    USER: {
      GET_ALL_USERS_SUCCESS: 'All users fetched successfully',
      GET_USER_BY_ID_SUCCESS: 'User fetched successfully',
      GET_USER_PROFILE_SUCCESS: 'User profile fetched successfully',
      UPDATE_USER_PROFILE_SUCCESS: 'User profile updated successfully',
      UPDATE_USER_AVATAR_SUCCESS: 'User avatar updated successfully',
      PASSWORD_CHANGE_SUCCESS: 'Password changed successfully',
    },
    CATEGORY: {
      GET_ALL_CATEGORIES_SUCCESS: 'All categories fetched successfully',
      GET_CATEGORY_BY_ID_SUCCESS: 'Category fetched successfully',
      GET_CATEGORY_BY_SLUG_SUCCESS: 'Category fetched successfully',
      CREATE_CATEGORY_SUCCESS: 'Category created successfully',
      UPDATE_CATEGORY_SUCCESS: 'Category updated successfully',
    },
    PRODUCT: {
      GET_ALL_PRODUCTS_SUCCESS: 'All products fetched successfully',
      GET_PRODUCT_BY_ID_SUCCESS: 'Product fetched successfully',
      GET_PRODUCT_BY_SLUG_SUCCESS: 'Product fetched successfully',
      CREATE_PRODUCT_SUCCESS: 'Product created successfully',
    },
    UPLOAD: {
      SINGLE_IMAGE_SUCCESS: 'Image uploaded successfully',
      MULTIPLE_IMAGES_SUCCESS: 'Images uploaded successfully',
      AVATAR_UPLOAD_SUCCESS: 'Avatar uploaded successfully',
      PRODUCT_IMAGE_SUCCESS: 'Product image uploaded successfully',
      PRODUCT_IMAGES_SUCCESS: 'Product images uploaded successfully',
      IMAGE_DELETED_SUCCESS: 'Image deleted successfully',
      IMAGES_DELETED_SUCCESS: 'Images deleted successfully',
    }
  },
  ERROR: {
    NOT_FOUND: 'Resource not found',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    VALIDATION_ERROR: 'Validation error',
    INTERNAL_ERROR: 'Internal server error',
    DUPLICATE_ENTRY: 'Duplicate entry',
    INVALID_CREDENTIALS: 'Invalid credentials',
    FILE_TOO_LARGE: 'File size too large',
    INVALID_FILE_TYPE: 'Invalid file type',
    AUTH: {
      FAILED_TO_SEND_OTP: 'Failed to send verification email. Please try again.',
      FAILED_TO_REGISTER: 'Registration failed',
      FAILED_TO_VERIFY_OTP: 'OTP verification failed',
      REQUIRED_EMAIL_OTP: 'Email or OTP are required',
      FAILED_TO_RESEND_OTP: 'Failed to resend OTP.',
      REQUIRED_EMAIL_PASSWORD: 'Email and password are required',
      REQUIRED_REFRESH_TOKEN: 'Refresh token is required from cookies or request body',
      FAILED_TO_REFRESH_TOKEN: 'Token refresh failed',
      REQUIRED_ACCESS_TOKEN: 'Access token is required',
      REQUIRED_AUTH: 'Authentication required',
      INSUFFICIENT_PERMISSION: 'Insufficient permissions',
      INVALID_ACCESS_TOKEN: 'Invalid or expired access token',
      INVALID_REFRESH_TOKEN: 'Invalid or expired refresh token',
      INVALID_TOKEN: 'Invalid token format',
      REQUIRED_EMAIL: 'Email is required',
      FAILED_TO_SEND_PASSWORD_RESET_EMAIL: 'Failed to send password reset email',
      REQUIRED_TOKEN_NEW_PASSWORD: 'Token and new password are required',
      FAILED_TO_RESET_PASSWORD: 'Password reset failed',
    },
    USER: {
      REQUIRED_ID: 'ID is required',
      USER_NOT_FOUND: 'User not found',
      REQUIRED_ROLE: 'Role is required',
      REQUIRED_SEARCH: 'Search term is required',
      PROFILE_UPDATE_FAILED: 'Profile update failed',
      REQUIRED_CURRENT_PASSWORD_NEW_PASSWORD: 'Current password and new password are required',
      PASSWORD_CHANGE_FAILED: 'Password change failed',
      REQUIRED_USERNAME: 'Username is required',
      REQUIRED_PASSWORD: 'Password is required',
      PASSWORD_LENGTH: 'Password must be at least 6 characters long',
      PASSWORD_MATCH: 'Passwords do not match',
      FAILED_TO_HASH_PASSWORD: 'Failed to hash password',
      REQUIRED_CONFIRM_PASSWORD: 'Confirm password is required',
      REQUIRED_IMAGE: 'Image is required',
      INVALID_EMAIL: 'Invalid email format',
      REQUIRED_EMAIL: 'Email is required',
      REQUIRED_OTP: 'OTP is required',
      USERNAME_LENGTH: 'Username must be between 3 and 50 characters',
      USERNAME_FORMAT: 'Username can only contain alphanumeric characters and underscore',
      FAILED_TO_CHECK_USER_EXISTENCE: 'Failed to check user existence',
      USER_ALREADY_EXISTS: 'User with this username or email already exists',
      FAILED_TO_CREATE_USER: 'Failed to create user',
    },
    CATEGORY: {
      REQUIRED_ID: 'ID is required',
      CATEGORY_NOT_FOUND: 'Category not found',
      REQUIRED_SEARCH: 'Search term is required',
      PROFILE_UPDATE_FAILED: 'Profile update failed',
      REQUIRED_CURRENT_PASSWORD_NEW_PASSWORD: 'Current password and new password are required',
      PASSWORD_CHANGE_FAILED: 'Password change failed',
      REQUIRED_SLUG: 'Slug is required',
    },
    PRODUCT: {
      REQUIRED_ID: 'ID is required',
      PRODUCT_NOT_FOUND: 'Product not found',
      REQUIRED_SEARCH: 'Search term is required',
      PROFILE_UPDATE_FAILED: 'Profile update failed',
      REQUIRED_CURRENT_PASSWORD_NEW_PASSWORD: 'Current password and new password are required',
      PASSWORD_CHANGE_FAILED: 'Password change failed',
      REQUIRED_MIN_MAX_PRICE: 'Min and max price are required',
      REQUIRED_SLUG: 'Slug is required',
    },
    UPLOAD: {
      NO_FILE_UPLOADED: 'No file uploaded',
      NO_FILES_UPLOADED: 'No files uploaded',
      UPLOAD_FAILED: 'Upload failed',
      DELETE_FAILED: 'Delete failed',
      CLOUDINARY_NOT_CONFIGURED: 'Cloudinary is not configured properly',
      REQUIRED_PRODUCT_ID: 'Product ID is required',
      REQUIRED_IMAGE_URL: 'Image URL is required',
      REQUIRED_PUBLIC_ID: 'Public ID is required',
      REQUIRED_IMAGE_URLS: 'Image URLs array is required',
      INVALID_IMAGE_URLS: 'All image URLs must be valid strings',
    }
  },
} as const;

// Re-export route constants
export * from './routes';

// Database Constants
export const DB_CONSTANTS = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  DEFAULT_PAGE: 1,
  MAX_PAGE_SIZE: 1000,
} as const;

// File Upload Constants
export const UPLOAD_CONSTANTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
  UPLOAD_PATH: 'uploads',
} as const;

// JWT Constants
export const JWT_CONSTANTS = {
  ACCESS_TOKEN_EXPIRES_IN: '24h',
  REFRESH_TOKEN_EXPIRES_IN: '7d',
  ALGORITHM: 'HS256',
} as const;

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
} as const;



// Performance Constants
export const PERFORMANCE_CONSTANTS = {
  SLOW_REQUEST_THRESHOLD: 1000, // 1 second
  MAX_RESPONSE_TIME: 5000, // 5 seconds
} as const;

// User Roles
export const USER_ROLES = {
  ROLE_ADMIN: 'ROLE_ADMIN',
  ROLE_STAFF: 'ROLE_STAFF',
  ROLE_USER: 'ROLE_USER',
  ROLE_GUEST: 'ROLE_GUEST',
  ROLE_SUPER_ADMIN: 'ROLE_SUPER_ADMIN',
} as const;

// OTP Constants
export const OTP_CONSTANTS = {
  LENGTH: 6,
  EXPIRES_IN_MINUTES: 10,
  MAX_ATTEMPTS: 3,
} as const; 

// Cookie Constants
export const COOKIE_CONSTANTS = {
  ACCESS_TOKEN_COOKIE_NAME: 'access_token',
  REFRESH_TOKEN_COOKIE_NAME: 'refresh_token',
  ACCESS_TOKEN_COOKIE_PATH: '/',
  REFRESH_TOKEN_COOKIE_PATH: '/api/v1/auth/refresh-token',
} as const;

// SameSite Options
export const SAME_SITE_OPTIONS = {
  STRICT: 'strict',
  LAX: 'lax',
  NONE: 'none',
} as const;

// Token Types
export const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
} as const;

// Token Expiration Constants
export const TOKEN_EXPIRATION_CONSTANTS = {
  ACCESS_TOKEN_EXPIRES_IN: 24 * 60 * 60, // 24 hours
  REFRESH_TOKEN_EXPIRES_IN: 7 * 24 * 60 * 60, // 7 days
} as const;

// Development Environment
export const DEVELOPMENT_ENVIRONMENT = 'development';

// Production Environment
export const PRODUCTION_ENVIRONMENT = 'production';