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