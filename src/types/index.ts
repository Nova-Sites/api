import { SAME_SITE_OPTIONS } from '@/constants';
import { Request } from 'express';
import { Options } from 'sequelize';

export interface DatabaseConfig {
  development: Options;
  test: Options;
  production: Options;
}

// Database Models
export interface ICategory {
  id: number;
  name: string;
  image: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdBy?: number | null;
  updatedBy?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryCreationAttributes {
  name: string;
  image: string;
  slug: string;
  description?: string;
  isActive?: boolean;
}

export interface IProduct {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  views: number;
  slug: string;
  categoryId: number;
  isActive: boolean;
  createdBy?: number | null;
  updatedBy?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCreationAttributes {
  name: string;
  description: string;
  image: string;
  price: number;
  slug: string;
  categoryId: number;
  isActive?: boolean;
  createdBy?: number;
}

export interface ProductFilters {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export interface IUser {
  id: number;
  username: string;
  email: string;
  password: string;
  isActive: boolean;
  otp?: string | null;
  otpExpiresAt?: Date | null;
  image?: string;
  role: string;
  createdBy?: number | null;
  updatedBy?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreationAttributes {
  username: string;
  email: string;
  password: string;
  isActive?: boolean;
  otp?: string;
  otpExpiresAt?: Date;
  image?: string;
  role?: string;
}

// Request Extensions
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    username: string;
    email: string;
    role: string;
  };
}

// Cookie Request
export interface CookieRequest extends Request {
  cookies: {
    access_token?: string;
    refresh_token?: string;
  };
}

// Request with file
export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Log Data
export interface LogData {
  timestamp: string;
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  ip: string;
  userAgent: string;
  requestBody?: any;
  error?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Pagination Types
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// File Upload Types
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

// Environment Variables
export interface EnvironmentVariables {
  NODE_ENV: string;
  PORT: number;
  HOST: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_USER: string;
  EMAIL_PASS: string;
  MAX_FILE_SIZE: number;
  UPLOAD_PATH: string;
  ALLOWED_ORIGINS: string;
  API_VERSION: string;
  API_PREFIX: string;
  FRONTEND_URL: string;
} 

// Interface cho uploaded files
export interface UploadedFile extends Express.Multer.File {
  buffer: Buffer;
}

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

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: typeof SAME_SITE_OPTIONS[keyof typeof SAME_SITE_OPTIONS];
  maxAge: number;
  path: string;
  domain?: string;
}

export interface TokenPayload {
  userId: number;
  username: string;
  email: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

export interface UserValidationData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}