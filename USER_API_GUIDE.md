# User & Authentication API Guide

## Overview
Hệ thống API User và Authentication được xây dựng với các chức năng đăng ký, xác thực OTP qua email, và quản lý người dùng.

## Database Schema

### Bảng Users
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  otp VARCHAR(6),
  otp_expires_at DATETIME,
  image VARCHAR(500),
  role ENUM('ROLE_ADMIN', 'ROLE_USER', 'ROLE_STAFF') DEFAULT 'ROLE_USER',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Authentication Endpoints

### 1. Đăng ký tài khoản
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "image": "https://example.com/avatar.jpg" // optional
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
      "isActive": false,
      "image": "https://example.com/avatar.jpg",
      "role": "ROLE_USER",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "Registration successful. Please check your email for OTP verification."
  }
}
```

### 2. Xác thực OTP
```http
POST /api/v1/auth/verify-otp
Content-Type: application/json

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
      "isActive": true,
      "image": "https://example.com/avatar.jpg",
      "role": "ROLE_USER",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "Account verified successfully"
  }
}
```

### 3. Gửi lại OTP
```http
POST /api/v1/auth/resend-otp
Content-Type: application/json

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
      "isActive": false,
      "image": "https://example.com/avatar.jpg",
      "role": "ROLE_USER",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "OTP resent successfully. Please check your email."
  }
}
```

## User Management Endpoints

### 1. Lấy danh sách tất cả users
```http
GET /api/v1/users
```

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
      "isActive": true,
      "image": "https://example.com/avatar.jpg",
      "role": "ROLE_USER",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. Lấy user theo ID
```http
GET /api/v1/users/1
```

### 3. Tìm kiếm users
```http
GET /api/v1/users/search?search=john
```

### 4. Lấy users theo role
```http
GET /api/v1/users/role/ROLE_USER
```

### 5. Cập nhật profile (placeholder)
```http
PUT /api/v1/users/profile
Content-Type: application/json

{
  "username": "new_username",
  "email": "newemail@example.com",
  "image": "https://example.com/new-avatar.jpg"
}
```

### 6. Đổi mật khẩu (placeholder)
```http
PUT /api/v1/users/change-password
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### 7. Xóa user (soft delete)
```http
DELETE /api/v1/users/1
```

## Validation Rules

### Username
- Độ dài: 3-50 ký tự
- Chỉ cho phép: chữ cái, số, dấu gạch dưới
- Phải là duy nhất

### Email
- Phải là email hợp lệ
- Phải là duy nhất

### Password
- Độ dài tối thiểu: 6 ký tự
- Độ dài tối đa: 255 ký tự

### OTP
- Độ dài: 6 ký tự
- Chỉ chứa số
- Hết hạn sau 10 phút

### Role
- Các giá trị hợp lệ: `ROLE_ADMIN`, `ROLE_USER`, `ROLE_STAFF`
- Mặc định: `ROLE_USER`

## Email Configuration

Để sử dụng chức năng gửi email OTP, cần cấu hình các biến môi trường:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Error Handling

### Common Error Responses

**Validation Error:**
```json
{
  "success": false,
  "message": "Validation error",
  "error": "Username must be 3-50 characters, alphanumeric and underscore only"
}
```

**Email Already Exists:**
```json
{
  "success": false,
  "message": "Email already exists"
}
```

**Invalid OTP:**
```json
{
  "success": false,
  "message": "Invalid OTP or OTP expired"
}
```

**User Not Found:**
```json
{
  "success": false,
  "message": "User not found"
}
```

## Security Features

1. **Password Hashing**: Sử dụng bcrypt với salt rounds = 10
2. **OTP Security**: OTP không được trả về trong response
3. **Email Verification**: Tài khoản phải được xác thực qua email
4. **Soft Delete**: Users được xóa mềm thay vì xóa cứng
5. **Input Validation**: Tất cả input đều được validate nghiêm ngặt

## Migration

Để tạo bảng users, chạy migration:

```bash
npm run db:migrate
```

## Testing

Có thể test các API bằng Postman hoặc curl:

```bash
# Đăng ký
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Xác thực OTP
curl -X POST http://localhost:8000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
``` 