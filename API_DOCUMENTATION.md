# Nova Sites API Documentation

## 📋 Overview

Backend API cho hệ thống bán website với Node.js, TypeScript, Express và Sequelize.

**Base URL:** `http://localhost:8000/api/v1`

## 🔧 Setup

### Environment Variables
Tạo file `.env` từ `env.example`:
```env
NODE_ENV=development
PORT=8000
HOST=localhost
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nova_sites_db
DB_USER=root
DB_PASSWORD=your_password
ALLOWED_ORIGINS=http://localhost:8000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:3000
```

### Database Setup
```bash
# Tạo database
mysql -u root -p
CREATE DATABASE nova_sites_db;

# Chạy migrations
npm run db:migrate
```

## 🚀 API Endpoints

### Health Check

#### GET /api/v1/health
Kiểm tra trạng thái API

**Response:**
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### Categories

#### GET /api/v1/categories
Lấy danh sách tất cả categories

**Headers:**
```
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": [
    {
      "id": 1,
      "name": "E-commerce",
      "image": "https://example.com/image.jpg",
      "slug": "e-commerce",
      "description": "E-commerce websites",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET /api/v1/categories/:id
Lấy category theo ID

**Parameters:**
- `id` (number): ID của category

**Response:**
```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": {
    "id": 1,
    "name": "E-commerce",
    "image": "https://example.com/image.jpg",
    "slug": "e-commerce",
    "description": "E-commerce websites",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /api/v1/categories/slug/:slug
Lấy category theo slug

**Parameters:**
- `slug` (string): Slug của category

**Response:**
```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": {
    "id": 1,
    "name": "E-commerce",
    "image": "https://example.com/image.jpg",
    "slug": "e-commerce",
    "description": "E-commerce websites",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST /api/v1/categories
Tạo category mới

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Portfolio",
  "image": "https://example.com/portfolio.jpg",
  "description": "Portfolio websites"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Resource created successfully",
  "data": {
    "id": 2,
    "name": "Portfolio",
    "image": "https://example.com/portfolio.jpg",
    "slug": "portfolio",
    "description": "Portfolio websites",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT /api/v1/categories/:id
Cập nhật category

**Headers:**
```
Content-Type: application/json
```

**Parameters:**
- `id` (number): ID của category

**Body:**
```json
{
  "name": "Updated Portfolio",
  "image": "https://example.com/updated-portfolio.jpg",
  "description": "Updated portfolio websites",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Resource updated successfully",
  "data": {
    "id": 2,
    "name": "Updated Portfolio",
    "image": "https://example.com/updated-portfolio.jpg",
    "slug": "updated-portfolio",
    "description": "Updated portfolio websites",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### DELETE /api/v1/categories/:id
Xóa category (soft delete)

**Parameters:**
- `id` (number): ID của category

**Response:**
```json
{
  "success": true,
  "message": "Resource deleted successfully",
  "data": null
}
```

#### PATCH /api/v1/categories/:id/soft-delete
Soft delete category

**Parameters:**
- `id` (number): ID của category

**Response:**
```json
{
  "success": true,
  "message": "Resource deleted successfully",
  "data": null
}
```

#### GET /api/v1/categories/search?search=keyword
Tìm kiếm categories

**Query Parameters:**
- `search` (string): Từ khóa tìm kiếm

**Response:**
```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": [
    {
      "id": 1,
      "name": "E-commerce",
      "image": "https://example.com/image.jpg",
      "slug": "e-commerce",
      "description": "E-commerce websites",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET /api/v1/categories/with-product-count
Lấy categories với số lượng products

**Response:**
```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": [
    {
      "id": 1,
      "name": "E-commerce",
      "image": "https://example.com/image.jpg",
      "slug": "e-commerce",
      "description": "E-commerce websites",
      "isActive": true,
      "productCount": 5,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Products

#### GET /api/v1/products
Lấy danh sách products với pagination và filtering

**Query Parameters:**
- `page` (number, optional): Trang hiện tại (default: 1)
- `limit` (number, optional): Số items per page (default: 10, max: 100)
- `sortBy` (string, optional): Field để sort (id, name, createdAt, updatedAt, price, views)
- `sortOrder` (string, optional): ASC hoặc DESC (default: DESC)
- `categoryId` (number, optional): Filter theo category ID
- `search` (string, optional): Tìm kiếm theo tên hoặc mô tả
- `minPrice` (number, optional): Giá tối thiểu
- `maxPrice` (number, optional): Giá tối đa

**Example Request:**
```
GET /api/v1/products?page=1&limit=10&sortBy=price&sortOrder=ASC&categoryId=1&minPrice=100&maxPrice=1000
```

**Response:**
```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": {
    "products": [
      {
        "id": 1,
        "name": "E-commerce Website",
        "description": "Full-featured e-commerce website",
        "image": "https://example.com/ecommerce.jpg",
        "price": 999.99,
        "views": 150,
        "slug": "e-commerce-website",
        "categoryId": 1,
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "category": {
          "id": 1,
          "name": "E-commerce",
          "slug": "e-commerce"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

#### GET /api/v1/products/:id
Lấy product theo ID (tự động tăng views)

**Parameters:**
- `id` (number): ID của product

**Response:**
```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": {
    "id": 1,
    "name": "E-commerce Website",
    "description": "Full-featured e-commerce website",
    "image": "https://example.com/ecommerce.jpg",
    "price": 999.99,
    "views": 151,
    "slug": "e-commerce-website",
    "categoryId": 1,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "category": {
      "id": 1,
      "name": "E-commerce",
      "slug": "e-commerce"
    }
  }
}
```

#### GET /api/v1/products/slug/:slug
Lấy product theo slug

**Parameters:**
- `slug` (string): Slug của product

**Response:**
```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": {
    "id": 1,
    "name": "E-commerce Website",
    "description": "Full-featured e-commerce website",
    "image": "https://example.com/ecommerce.jpg",
    "price": 999.99,
    "views": 150,
    "slug": "e-commerce-website",
    "categoryId": 1,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "category": {
      "id": 1,
      "name": "E-commerce",
      "slug": "e-commerce"
    }
  }
}
```

#### POST /api/v1/products
Tạo product mới

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Portfolio Website",
  "description": "Professional portfolio website with modern design",
  "image": "https://example.com/portfolio.jpg",
  "price": 499.99,
  "categoryId": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Resource created successfully",
  "data": {
    "id": 2,
    "name": "Portfolio Website",
    "description": "Professional portfolio website with modern design",
    "image": "https://example.com/portfolio.jpg",
    "price": 499.99,
    "views": 0,
    "slug": "portfolio-website",
    "categoryId": 2,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT /api/v1/products/:id
Cập nhật product

**Headers:**
```
Content-Type: application/json
```

**Parameters:**
- `id` (number): ID của product

**Body:**
```json
{
  "name": "Updated Portfolio Website",
  "description": "Updated portfolio website description",
  "image": "https://example.com/updated-portfolio.jpg",
  "price": 599.99,
  "categoryId": 2,
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Resource updated successfully",
  "data": {
    "id": 2,
    "name": "Updated Portfolio Website",
    "description": "Updated portfolio website description",
    "image": "https://example.com/updated-portfolio.jpg",
    "price": 599.99,
    "views": 0,
    "slug": "updated-portfolio-website",
    "categoryId": 2,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### DELETE /api/v1/products/:id
Xóa product (soft delete)

**Parameters:**
- `id` (number): ID của product

**Response:**
```json
{
  "success": true,
  "message": "Resource deleted successfully",
  "data": null
}
```

#### PATCH /api/v1/products/:id/soft-delete
Soft delete product

**Parameters:**
- `id` (number): ID của product

**Response:**
```json
{
  "success": true,
  "message": "Resource deleted successfully",
  "data": null
}
```

#### GET /api/v1/products/popular?limit=10
Lấy popular products (theo views)

**Query Parameters:**
- `limit` (number, optional): Số lượng products (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": [
    {
      "id": 1,
      "name": "E-commerce Website",
      "description": "Full-featured e-commerce website",
      "image": "https://example.com/ecommerce.jpg",
      "price": 999.99,
      "views": 150,
      "slug": "e-commerce-website",
      "categoryId": 1,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "category": {
        "id": 1,
        "name": "E-commerce",
        "slug": "e-commerce"
      }
    }
  ]
}
```

#### GET /api/v1/products/category/:categoryId
Lấy products theo category

**Parameters:**
- `categoryId` (number): ID của category

**Query Parameters:**
- `page` (number, optional): Trang hiện tại (default: 1)
- `limit` (number, optional): Số items per page (default: 10)
- `sortBy` (string, optional): Field để sort
- `sortOrder` (string, optional): ASC hoặc DESC

**Response:**
```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": {
    "products": [
      {
        "id": 1,
        "name": "E-commerce Website",
        "description": "Full-featured e-commerce website",
        "image": "https://example.com/ecommerce.jpg",
        "price": 999.99,
        "views": 150,
        "slug": "e-commerce-website",
        "categoryId": 1,
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "category": {
          "id": 1,
          "name": "E-commerce",
          "slug": "e-commerce"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

#### GET /api/v1/products/search?search=keyword
Tìm kiếm products

**Query Parameters:**
- `search` (string): Từ khóa tìm kiếm
- `page` (number, optional): Trang hiện tại (default: 1)
- `limit` (number, optional): Số items per page (default: 10)
- `sortBy` (string, optional): Field để sort
- `sortOrder` (string, optional): ASC hoặc DESC

**Response:**
```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": {
    "products": [
      {
        "id": 1,
        "name": "E-commerce Website",
        "description": "Full-featured e-commerce website",
        "image": "https://example.com/ecommerce.jpg",
        "price": 999.99,
        "views": 150,
        "slug": "e-commerce-website",
        "categoryId": 1,
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "category": {
          "id": 1,
          "name": "E-commerce",
          "slug": "e-commerce"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

#### GET /api/v1/products/price-range/:minPrice/:maxPrice
Lấy products theo khoảng giá

**Parameters:**
- `minPrice` (number): Giá tối thiểu
- `maxPrice` (number): Giá tối đa

**Query Parameters:**
- `page` (number, optional): Trang hiện tại (default: 1)
- `limit` (number, optional): Số items per page (default: 10)
- `sortBy` (string, optional): Field để sort
- `sortOrder` (string, optional): ASC hoặc DESC

**Example Request:**
```
GET /api/v1/products/price-range/100/1000?page=1&limit=10&sortBy=price&sortOrder=ASC
```

**Response:**
```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": {
    "products": [
      {
        "id": 1,
        "name": "E-commerce Website",
        "description": "Full-featured e-commerce website",
        "image": "https://example.com/ecommerce.jpg",
        "price": 999.99,
        "views": 150,
        "slug": "e-commerce-website",
        "categoryId": 1,
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "category": {
          "id": 1,
          "name": "E-commerce",
          "slug": "e-commerce"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

### Authentication

#### POST /api/v1/auth/register
Đăng ký tài khoản mới

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "image": "https://example.com/avatar.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for OTP verification.",
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "image": "https://example.com/avatar.jpg",
      "isActive": false,
      "role": "ROLE_USER",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "Registration successful. Please check your email for OTP verification."
  }
}
```

#### POST /api/v1/auth/verify-otp
Xác thực OTP để kích hoạt tài khoản

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account verified successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "image": "https://example.com/avatar.jpg",
      "isActive": true,
      "role": "ROLE_USER",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "Account verified successfully"
  }
}
```

#### POST /api/v1/auth/resend-otp
Gửi lại OTP

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP resent successfully. Please check your email.",
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "image": "https://example.com/avatar.jpg",
      "isActive": false,
      "role": "ROLE_USER",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "OTP resent successfully. Please check your email."
  }
}
```

#### POST /api/v1/auth/login
Đăng nhập (to be implemented)

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login endpoint - to be implemented",
  "data": {
    "message": "Login endpoint - to be implemented"
  }
}
```

#### POST /api/v1/auth/logout
Đăng xuất (to be implemented)

**Response:**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

#### POST /api/v1/auth/forgot-password
Quên mật khẩu (to be implemented)

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent",
  "data": {
    "message": "Password reset email sent"
  }
}
```

#### POST /api/v1/auth/reset-password
Đặt lại mật khẩu (to be implemented)

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "token": "reset_token_here",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successful",
  "data": {
    "message": "Password reset successful"
  }
}
```

---

### Users

#### GET /api/v1/users
Lấy danh sách tất cả users

**Response:**
```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "image": "https://example.com/avatar.jpg",
      "isActive": true,
      "role": "ROLE_USER",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET /api/v1/users/:id
Lấy user theo ID

**Parameters:**
- `id` (number): ID của user

**Response:**
```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "image": "https://example.com/avatar.jpg",
    "isActive": true,
    "role": "ROLE_USER",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /api/v1/users/profile
Lấy thông tin profile của user hiện tại (to be implemented)

**Response:**
```json
{
  "success": true,
  "message": "User profile endpoint - to be implemented",
  "data": {
    "message": "User profile endpoint - to be implemented"
  }
}
```

#### PUT /api/v1/users/profile
Cập nhật profile của user hiện tại (to be implemented)

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "username": "new_username",
  "email": "newemail@example.com",
  "image": "https://example.com/new-avatar.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile update endpoint - to be implemented",
  "data": {
    "message": "Profile update endpoint - to be implemented"
  }
}
```

#### PUT /api/v1/users/profile/avatar
Cập nhật avatar của user (to be implemented)

**Response:**
```json
{
  "success": true,
  "message": "Avatar update endpoint - to be implemented",
  "data": {
    "message": "Avatar update endpoint - to be implemented"
  }
}
```

#### PUT /api/v1/users/change-password
Đổi mật khẩu (to be implemented)

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password change endpoint - to be implemented",
  "data": {
    "message": "Password change endpoint - to be implemented"
  }
}
```

#### DELETE /api/v1/users/:id
Xóa user (soft delete)

**Parameters:**
- `id` (number): ID của user

**Response:**
```json
{
  "success": true,
  "message": "Resource deleted successfully",
  "data": null
}
```

#### PATCH /api/v1/users/:id/soft-delete
Soft delete user

**Parameters:**
- `id` (number): ID của user

**Response:**
```json
{
  "success": true,
  "message": "Resource deleted successfully",
  "data": null
}
```

#### GET /api/v1/users/role/:role
Lấy users theo role

**Parameters:**
- `role` (string): Role của user (ROLE_ADMIN, ROLE_USER, ROLE_STAFF)

**Response:**
```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "image": "https://example.com/avatar.jpg",
      "isActive": true,
      "role": "ROLE_USER",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET /api/v1/users/search?search=keyword
Tìm kiếm users

**Query Parameters:**
- `search` (string): Từ khóa tìm kiếm (username hoặc email)

**Response:**
```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "image": "https://example.com/avatar.jpg",
      "isActive": true,
      "role": "ROLE_USER",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 🔒 Security Features

### Validation
- Input validation với express-validator
- File upload validation
- SQL injection prevention
- XSS protection

---

## 📝 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Field validation errors",
  "statusCode": 400
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found",
  "error": "Category not found",
  "statusCode": 404
}
```



### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Database connection failed",
  "statusCode": 500
}
```

---

## 🧪 Testing với Postman

### 1. Health Check
```
GET http://localhost:8000/api/v1/health
```

### 2. Tạo Category
```
POST http://localhost:8000/api/v1/categories
Content-Type: application/json

{
  "name": "E-commerce",
  "image": "https://example.com/ecommerce.jpg",
  "description": "E-commerce websites"
}
```

### 3. Đăng ký User
```
POST http://localhost:8000/api/v1/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "image": "https://example.com/avatar.jpg"
}
```

### 4. Xác thực OTP
```
POST http://localhost:8000/api/v1/auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```

### 5. Tạo Product
```
POST http://localhost:8000/api/v1/products
Content-Type: application/json

{
  "name": "E-commerce Website",
  "description": "Full-featured e-commerce website",
  "image": "https://example.com/ecommerce.jpg",
  "price": 999.99,
  "categoryId": 1
}
```

### 6. Lấy Users
```
GET http://localhost:8000/api/v1/users
```

### 7. Tìm kiếm Users
```
GET http://localhost:8000/api/v1/users/search?search=john
```

### 8. Lấy Users theo Role
```
GET http://localhost:8000/api/v1/users/role/ROLE_USER
```

### 9. Lấy Products với Filter
```
GET http://localhost:8000/api/v1/products?page=1&limit=10&sortBy=price&sortOrder=ASC&categoryId=1&minPrice=100&maxPrice=1000
```

### 10. Tìm kiếm Products
```
GET http://localhost:8000/api/v1/products/search?search=ecommerce&page=1&limit=10
```

### 11. Lấy Products theo Price Range
```
GET http://localhost:8000/api/v1/products/price-range/100/1000?page=1&limit=10
```

---

## 📊 Database Schema

### Categories Table
```sql
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  image VARCHAR(500) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);
```

### Products Table
```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image VARCHAR(500) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  views INT DEFAULT 0,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category_id INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
```

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  otp VARCHAR(6) NULL,
  otp_expires_at DATETIME NULL,
  image VARCHAR(500) NULL,
  role ENUM('ROLE_ADMIN', 'ROLE_USER', 'ROLE_STAFF') DEFAULT 'ROLE_USER',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);
```

---

## 🚀 Performance Features

- **Connection Pooling**: MySQL connection pooling
- **Compression**: Response compression
- **Security Headers**: Helmet.js security headers
- **CORS**: Cross-origin resource sharing
- **Logging**: Custom logging với performance monitoring

---

## 📞 Support

Nếu có vấn đề, vui lòng kiểm tra:
1. Database connection
2. Environment variables
3. Port availability (8000)
4. MySQL service status 