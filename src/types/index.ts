import { Request } from 'express';

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

// Request Extensions
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
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