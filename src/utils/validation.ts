/**
 * Common validation and sanitization utilities
 * Used across all controllers for input validation and security
 */

/**
 * Sanitize search input to prevent SQL injection
 */
export function sanitizeSearchInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove or escape dangerous characters
  return input
    .trim() // Remove leading/trailing whitespace
    .replace(/[%_\\]/g, '') // Remove SQL wildcards and backslashes
    .replace(/['"]/g, '') // Remove quotes
    .replace(/[;-]/g, '') // Remove SQL comment characters
    .replace(/[<>]/g, '') // Remove comparison operators
    .replace(/[()]/g, '') // Remove parentheses
    .replace(/[{}]/g, '') // Remove braces
    .replace(/[\\[\\]]/g, '') // Remove square brackets
    .replace(/[|&]/g, '') // Remove logical operators
    .replace(/[`~!@#$^&*+=]/g, '') // Remove other special characters
    .substring(0, 100); // Limit length to prevent buffer overflow
}

/**
 * Validate and sanitize pagination parameters
 */
export function validatePaginationParams(pagination: {
  page?: any;
  limit?: any;
  sortBy?: any;
  sortOrder?: any;
}): {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
} {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
  
  // Validate page number
  const validPage = Math.max(1, Math.floor(Number(page)) || 1);
  
  // Validate limit (max 100 items per page)
  const validLimit = Math.min(100, Math.max(1, Math.floor(Number(limit)) || 10));
  
  // Validate sortBy field (whitelist approach)
  const allowedSortFields = ['createdAt', 'updatedAt', 'name', 'price', 'views', 'title'];
  const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  
  // Validate sortOrder
  const validSortOrder = ['ASC', 'DESC'].includes(sortOrder?.toString().toUpperCase()) 
    ? sortOrder.toString().toUpperCase() 
    : 'DESC';
  
  return {
    page: validPage,
    limit: validLimit,
    sortBy: validSortBy,
    sortOrder: validSortOrder as 'ASC' | 'DESC'
  };
}

/**
 * Validate ID parameter
 */
export function validateId(id: any, fieldName: string = 'ID'): { isValid: boolean; value?: number; error?: string } {
  if (!id) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  const numericId = Math.floor(Number(id));
  if (numericId <= 0 || isNaN(numericId)) {
    return { isValid: false, error: `Invalid ${fieldName}` };
  }
  
  return { isValid: true, value: numericId };
}

/**
 * Validate multiple IDs
 */
export function validateIds(ids: any, fieldName: string = 'IDs'): { isValid: boolean; values?: number[]; error?: string } {
  if (!ids) {
    return { isValid: false, error: `${fieldName} are required` };
  }
  
  const idArray = Array.isArray(ids) ? ids : [ids];
  const numericIds = idArray.map(id => Math.floor(Number(id)));
  
  if (numericIds.some(id => id <= 0 || isNaN(id))) {
    return { isValid: false, error: `Invalid ${fieldName}` };
  }
  
  return { isValid: true, values: numericIds };
}

/**
 * Validate price range
 */
export function validatePriceRange(minPrice: any, maxPrice: any): { 
  isValid: boolean; 
  min?: number; 
  max?: number; 
  error?: string 
} {
  const min = parseFloat(minPrice);
  const max = parseFloat(maxPrice);
  
  if (isNaN(min) || isNaN(max)) {
    return { isValid: false, error: 'Invalid price values' };
  }
  
  if (min < 0 || max < 0) {
    return { isValid: false, error: 'Prices cannot be negative' };
  }
  
  if (min > max) {
    return { isValid: false, error: 'Min price cannot be greater than max price' };
  }
  
  return { isValid: true, min, max };
}

/**
 * Validate search term
 */
export function validateSearchTerm(search: any): { isValid: boolean; value?: string; error?: string } {
  if (!search || typeof search !== 'string') {
    return { isValid: false, error: 'Search term is required' };
  }
  
  const sanitized = sanitizeSearchInput(search);
  if (sanitized.length === 0) {
    return { isValid: false, error: 'Invalid search term' };
  }
  
  return { isValid: true, value: sanitized };
}

/**
 * Validate string field
 */
export function validateStringField(value: any, fieldName: string, required: boolean = true): { 
  isValid: boolean; 
  value?: string; 
  error?: string 
} {
  if (required && (!value || typeof value !== 'string' || value.trim().length === 0)) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  if (value && typeof value !== 'string') {
    return { isValid: false, error: `Invalid ${fieldName}` };
  }
  
  return { isValid: true, value: value?.trim() };
}

/**
 * Validate numeric field
 */
export function validateNumericField(value: any, fieldName: string, min: number = 0): { 
  isValid: boolean; 
  value?: number; 
  error?: string 
} {
  if (value === undefined || value === null || value === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  const numericValue = parseFloat(value);
  if (isNaN(numericValue)) {
    return { isValid: false, error: `Invalid ${fieldName}` };
  }
  
  if (numericValue < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min}` };
  }
  
  return { isValid: true, value: numericValue };
}

/**
 * Validate boolean field
 */
export function validateBooleanField(value: any, fieldName: string): { 
  isValid: boolean; 
  value?: boolean; 
  error?: string 
} {
  if (value === undefined || value === null) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  if (typeof value === 'boolean') {
    return { isValid: true, value };
  }
  
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase();
    if (['true', 'false', '1', '0', 'yes', 'no'].includes(lowerValue)) {
      return { isValid: true, value: ['true', '1', 'yes'].includes(lowerValue) };
    }
  }
  
  return { isValid: false, error: `Invalid ${fieldName}` };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  return { isValid: true };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }
  
  return { isValid: true };
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): { isValid: boolean; error?: string } {
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
}

/**
 * Validate slug format
 */
export function validateSlug(slug: string): { isValid: boolean; error?: string } {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugRegex.test(slug)) {
    return { isValid: false, error: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only' };
  }
  return { isValid: true };
}
