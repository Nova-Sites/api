// Route Constants
export const ROUTES = {
  // Main Resources
  CATEGORIES: '/categories',
  PRODUCTS: '/products',
  AUTH: '/auth',
  USERS: '/users',
  UPLOAD: '/upload',
  
  // Health Check
  HEALTH: '/health',
} as const;

// Category Route Paths
export const CATEGORY_ROUTES = {
  BASE: '/',
  GET_ALL: '/',
  GET_BY_ID: '/:id',
  GET_BY_SLUG: '/slug/:slug',
  SEARCH: '/search',
  WITH_PRODUCT_COUNT: '/with-product-count',
  CREATE: '/',
  UPDATE: '/:id',
  DELETE: '/:id',
  SOFT_DELETE: '/:id/soft-delete',
} as const;

// Product Route Paths
export const PRODUCT_ROUTES = {
  BASE: '/',
  GET_ALL: '/',
  GET_BY_ID: '/:id',
  GET_BY_SLUG: '/slug/:slug',
  POPULAR: '/popular',
  SEARCH: '/search',
  BY_CATEGORY: '/category/:categoryId',
  BY_PRICE_RANGE: '/price-range/:minPrice/:maxPrice',
  CREATE: '/',
  UPDATE: '/:id',
  DELETE: '/:id',
  SOFT_DELETE: '/:id/soft-delete',
} as const;

// Auth Route Paths
export const AUTH_ROUTES = {
  BASE: '/',
  REGISTER: '/register',
  VERIFY_OTP: '/verify-otp',
  RESEND_OTP: '/resend-otp',
  LOGIN: '/login',
  LOGOUT: '/logout',
  REFRESH_TOKEN: '/refresh-token',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
} as const;

// User Route Paths
export const USER_ROUTES = {
  BASE: '/',
  GET_ALL: '/',
  GET_BY_ID: '/:id',
  GET_PROFILE: '/profile',
  UPDATE_PROFILE: '/profile',
  UPDATE_AVATAR: '/profile/avatar',
  CHANGE_PASSWORD: '/change-password',
  DELETE: '/:id',
  SOFT_DELETE: '/:id/soft-delete',
} as const;

// Full API Paths (for documentation and testing)
export const API_PATHS = {
  // Categories
  CATEGORIES: {
    GET_ALL: '/api/v1/categories',
    GET_BY_ID: '/api/v1/categories/:id',
    GET_BY_SLUG: '/api/v1/categories/slug/:slug',
    SEARCH: '/api/v1/categories/search',
    WITH_PRODUCT_COUNT: '/api/v1/categories/with-product-count',
    CREATE: '/api/v1/categories',
    UPDATE: '/api/v1/categories/:id',
    DELETE: '/api/v1/categories/:id',
    SOFT_DELETE: '/api/v1/categories/:id/soft-delete',
  },
  
  // Products
  PRODUCTS: {
    GET_ALL: '/api/v1/products',
    GET_BY_ID: '/api/v1/products/:id',
    GET_BY_SLUG: '/api/v1/products/slug/:slug',
    POPULAR: '/api/v1/products/popular',
    SEARCH: '/api/v1/products/search',
    BY_CATEGORY: '/api/v1/products/category/:categoryId',
    BY_PRICE_RANGE: '/api/v1/products/price-range/:minPrice/:maxPrice',
    CREATE: '/api/v1/products',
    UPDATE: '/api/v1/products/:id',
    DELETE: '/api/v1/products/:id',
    SOFT_DELETE: '/api/v1/products/:id/soft-delete',
  },
  
  // Auth
  AUTH: {
    REGISTER: '/api/v1/auth/register',
    VERIFY_OTP: '/api/v1/auth/verify-otp',
    RESEND_OTP: '/api/v1/auth/resend-otp',
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH_TOKEN: '/api/v1/auth/refresh-token',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
  },
  
  // Users
  USERS: {
    GET_ALL: '/api/v1/users',
    GET_BY_ID: '/api/v1/users/:id',
    GET_PROFILE: '/api/v1/users/profile',
    UPDATE_PROFILE: '/api/v1/users/profile',
    UPDATE_AVATAR: '/api/v1/users/profile/avatar',
    CHANGE_PASSWORD: '/api/v1/users/change-password',
    DELETE: '/api/v1/users/:id',
    SOFT_DELETE: '/api/v1/users/:id/soft-delete',
  },
  
  // Health Check
  HEALTH: '/api/v1/health',
} as const;

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

// Route Metadata for Documentation
export const ROUTE_METADATA = {
  CATEGORIES: {
    GET_ALL: {
      method: HTTP_METHODS.GET,
      path: CATEGORY_ROUTES.GET_ALL,
      description: 'Get all active categories',
      tags: ['Categories'],
    },
    GET_BY_ID: {
      method: HTTP_METHODS.GET,
      path: CATEGORY_ROUTES.GET_BY_ID,
      description: 'Get category by ID',
      tags: ['Categories'],
    },
    GET_BY_SLUG: {
      method: HTTP_METHODS.GET,
      path: CATEGORY_ROUTES.GET_BY_SLUG,
      description: 'Get category by slug',
      tags: ['Categories'],
    },
    SEARCH: {
      method: HTTP_METHODS.GET,
      path: CATEGORY_ROUTES.SEARCH,
      description: 'Search categories by name',
      tags: ['Categories'],
    },
    WITH_PRODUCT_COUNT: {
      method: HTTP_METHODS.GET,
      path: CATEGORY_ROUTES.WITH_PRODUCT_COUNT,
      description: 'Get categories with product count',
      tags: ['Categories'],
    },
    CREATE: {
      method: HTTP_METHODS.POST,
      path: CATEGORY_ROUTES.CREATE,
      description: 'Create a new category',
      tags: ['Categories'],
    },
    UPDATE: {
      method: HTTP_METHODS.PUT,
      path: CATEGORY_ROUTES.UPDATE,
      description: 'Update category by ID',
      tags: ['Categories'],
    },
    DELETE: {
      method: HTTP_METHODS.DELETE,
      path: CATEGORY_ROUTES.DELETE,
      description: 'Delete category by ID',
      tags: ['Categories'],
    },
    SOFT_DELETE: {
      method: HTTP_METHODS.PATCH,
      path: CATEGORY_ROUTES.SOFT_DELETE,
      description: 'Soft delete category by ID',
      tags: ['Categories'],
    },
  },
  
  PRODUCTS: {
    GET_ALL: {
      method: HTTP_METHODS.GET,
      path: PRODUCT_ROUTES.GET_ALL,
      description: 'Get all products with pagination and filtering',
      tags: ['Products'],
    },
    GET_BY_ID: {
      method: HTTP_METHODS.GET,
      path: PRODUCT_ROUTES.GET_BY_ID,
      description: 'Get product by ID',
      tags: ['Products'],
    },
    GET_BY_SLUG: {
      method: HTTP_METHODS.GET,
      path: PRODUCT_ROUTES.GET_BY_SLUG,
      description: 'Get product by slug',
      tags: ['Products'],
    },
    POPULAR: {
      method: HTTP_METHODS.GET,
      path: PRODUCT_ROUTES.POPULAR,
      description: 'Get popular products (by views)',
      tags: ['Products'],
    },
    SEARCH: {
      method: HTTP_METHODS.GET,
      path: PRODUCT_ROUTES.SEARCH,
      description: 'Search products by name or description',
      tags: ['Products'],
    },
    BY_CATEGORY: {
      method: HTTP_METHODS.GET,
      path: PRODUCT_ROUTES.BY_CATEGORY,
      description: 'Get products by category',
      tags: ['Products'],
    },
    BY_PRICE_RANGE: {
      method: HTTP_METHODS.GET,
      path: PRODUCT_ROUTES.BY_PRICE_RANGE,
      description: 'Get products by price range',
      tags: ['Products'],
    },
    CREATE: {
      method: HTTP_METHODS.POST,
      path: PRODUCT_ROUTES.CREATE,
      description: 'Create a new product',
      tags: ['Products'],
    },
    UPDATE: {
      method: HTTP_METHODS.PUT,
      path: PRODUCT_ROUTES.UPDATE,
      description: 'Update product by ID',
      tags: ['Products'],
    },
    DELETE: {
      method: HTTP_METHODS.DELETE,
      path: PRODUCT_ROUTES.DELETE,
      description: 'Delete product by ID',
      tags: ['Products'],
    },
    SOFT_DELETE: {
      method: HTTP_METHODS.PATCH,
      path: PRODUCT_ROUTES.SOFT_DELETE,
      description: 'Soft delete product by ID',
      tags: ['Products'],
    },
  },
  
  HEALTH: {
    GET: {
      method: HTTP_METHODS.GET,
      path: ROUTES.HEALTH,
      description: 'Health check endpoint',
      tags: ['System'],
    },
  },
} as const; 