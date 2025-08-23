# Nova Sites API

Backend API cho hệ thống bán website với Node.js, TypeScript, Express và Sequelize.

## 🚀 Features

- **TypeScript**: Type-safe development with strict mode
- **Express.js**: Fast web framework with optimized middleware
- **Sequelize**: ORM cho database với connection pooling
- **MySQL**: Database chính với optimized queries
- **Socket.IO**: Real-time communication
- **JWT Authentication**: Secure authentication với refresh tokens
- **Cookie Management**: HttpOnly cookies với path-based security
- **File Upload**: Hỗ trợ upload ảnh với validation
- **API Documentation**: RESTful API với comprehensive docs
- **Error Handling**: Comprehensive error handling với custom error types
- **Input Validation**: Express-validator với custom validation rules
- **CORS**: Cross-origin resource sharing với security headers
- **Helmet**: Security headers với CSP configuration
- **Logging**: Custom logging với performance monitoring
- **Service Layer**: Separation of concerns với business logic isolation
- **Path Aliases**: Clean imports với `@/` prefix
- **Graceful Shutdown**: Proper cleanup và error handling

## 📁 Project Structure

```
api/
├── src/
│   ├── config/          # Database configuration
│   ├── constants/        # Constants và messages
│   ├── controllers/      # Route controllers (HTTP handling)
│   ├── middlewares/      # Custom middlewares
│   ├── migrations/       # Database migrations
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── services/        # Business logic layer
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   └── server.ts        # Main server file
├── .env.example         # Environment variables example
├── .sequelizerc         # Sequelize CLI configuration
├── nodemon.json         # Nodemon configuration
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

## 🛠️ Installation

### Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Setup

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp env.example .env
   ```
   
   Chỉnh sửa file `.env` với thông tin database và các cấu hình khác:
   ```env
   NODE_ENV=development
   PORT=8000
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=nova_sites_db
   DB_USER=root
   DB_PASSWORD=your_password
   ```

4. **Database setup**
   ```bash
   # Tạo database
   mysql -u root -p
   CREATE DATABASE nova_sites_db;
   
   # Chạy migrations
   npm run db:migrate
   
   # Chạy seeders (nếu có)
   npm run db:seed:all
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Đăng ký tài khoản mới
- `POST /api/v1/auth/verify-otp` - Xác thực OTP để kích hoạt tài khoản
- `POST /api/v1/auth/resend-otp` - Gửi lại OTP
- `POST /api/v1/auth/login` - Đăng nhập (to be implemented)
- `POST /api/v1/auth/logout` - Đăng xuất (to be implemented)
- `POST /api/v1/auth/forgot-password` - Quên mật khẩu (to be implemented)
- `POST /api/v1/auth/reset-password` - Đặt lại mật khẩu (to be implemented)

### Users
- `GET /api/v1/users` - Lấy danh sách tất cả users
- `GET /api/v1/users/:id` - Lấy user theo ID
- `GET /api/v1/users/profile` - Lấy thông tin profile của user hiện tại (to be implemented)
- `PUT /api/v1/users/profile` - Cập nhật profile của user hiện tại (to be implemented)
- `PUT /api/v1/users/profile/avatar` - Cập nhật avatar của user (to be implemented)
- `PUT /api/v1/users/change-password` - Đổi mật khẩu (to be implemented)
- `DELETE /api/v1/users/:id` - Xóa user (soft delete)
- `PATCH /api/v1/users/:id/soft-delete` - Soft delete user
- `GET /api/v1/users/role/:role` - Lấy users theo role
- `GET /api/v1/users/search` - Tìm kiếm users

### Categories
- `GET /api/v1/categories` - Lấy danh sách categories
- `GET /api/v1/categories/search` - Tìm kiếm categories
- `GET /api/v1/categories/with-product-count` - Lấy categories với số lượng products
- `GET /api/v1/categories/:id` - Lấy category theo ID
- `GET /api/v1/categories/slug/:slug` - Lấy category theo slug
- `POST /api/v1/categories` - Tạo category mới
- `PUT /api/v1/categories/:id` - Cập nhật category
- `DELETE /api/v1/categories/:id` - Xóa category
- `PATCH /api/v1/categories/:id/soft-delete` - Soft delete category

### Products
- `GET /api/v1/products` - Lấy danh sách products (có pagination và filtering)
- `GET /api/v1/products/popular` - Lấy popular products
- `GET /api/v1/products/search` - Tìm kiếm products
- `GET /api/v1/products/category/:categoryId` - Lấy products theo category
- `GET /api/v1/products/price-range/:minPrice/:maxPrice` - Lấy products theo khoảng giá
- `GET /api/v1/products/:id` - Lấy product theo ID
- `GET /api/v1/products/slug/:slug` - Lấy product theo slug
- `POST /api/v1/products` - Tạo product mới
- `PUT /api/v1/products/:id` - Cập nhật product
- `DELETE /api/v1/products/:id` - Xóa product
- `PATCH /api/v1/products/:id/soft-delete` - Soft delete product

### Health Check
- `GET /api/v1/health` - Kiểm tra trạng thái API

## 🔧 Constants Structure

### Route Constants
Tất cả routes được định nghĩa trong constants để tránh hard-code:

```typescript
// Constants được tổ chức trong src/constants/routes.ts
export const ROUTES = {
  CATEGORIES: '/categories',
  PRODUCTS: '/products',
  HEALTH: '/health',
}

export const CATEGORY_ROUTES = {
  GET_ALL: '/',
  GET_BY_ID: '/:id',
  SEARCH: '/search',
  // ...
}

export const PRODUCT_ROUTES = {
  GET_ALL: '/',
  POPULAR: '/popular',
  SEARCH: '/search',
  // ...
}
```

## 🗄️ Database Schema

### Categories Table
- `id` (INT, PK, Auto Increment)
- `name` (VARCHAR(255), NOT NULL)
- `image` (VARCHAR(500), NOT NULL)
- `slug` (VARCHAR(255), UNIQUE, NOT NULL)
- `description` (TEXT, NULL)
- `is_active` (BOOLEAN, DEFAULT TRUE)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Products Table
- `id` (INT, PK, Auto Increment)
- `name` (VARCHAR(255), NOT NULL)
- `description` (TEXT, NOT NULL)
- `image` (VARCHAR(500), NOT NULL)
- `price` (DECIMAL(10,2), NOT NULL)
- `views` (INT, DEFAULT 0)
- `slug` (VARCHAR(255), UNIQUE, NOT NULL)
- `category_id` (INT, FK to categories.id)
- `is_active` (BOOLEAN, DEFAULT TRUE)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Users Table
- `id` (INT, PK, Auto Increment)
- `username` (VARCHAR(50), UNIQUE, NOT NULL)
- `email` (VARCHAR(255), UNIQUE, NOT NULL)
- `password` (VARCHAR(255), NOT NULL)
- `is_active` (BOOLEAN, DEFAULT FALSE)
- `otp` (VARCHAR(6), NULL)
- `otp_expires_at` (DATETIME, NULL)
- `image` (VARCHAR(500), NULL)
- `role` (ENUM('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_USER', 'ROLE_GUEST'), DEFAULT 'ROLE_USER')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## 🚀 Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build TypeScript
npm run watch        # Watch mode for TypeScript

# Database
npm run db:migrate           # Run migrations
npm run db:migrate:undo      # Undo last migration
npm run db:migrate:status    # Check migration status
npm run db:seed:all          # Run all seeders

# User Management
npm run create:superadmin    # Create super admin account
npm run create:admin         # Create admin account
npm run create:user          # Create user with custom role

# Linting
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors

# Testing
npm run test         # Run tests
npm run test:watch   # Watch mode for tests
npm run test:login   # Test login functionality
npm run test:cookies # Test cookie functionality
```

### Creating Admin Accounts

Sau khi setup database và chạy migrations, bạn có thể tạo tài khoản admin bằng các lệnh sau:

#### Tạo Super Admin Account
```bash
npm run create:superadmin
```

#### Tạo Admin Account
```bash
npm run create:admin
```

#### Tạo User với Role Tùy Chọn
```bash
npm run create:user
```

Script sẽ yêu cầu bạn nhập:
- **Username**: 3-50 ký tự, chỉ chứa chữ cái, số và dấu gạch dưới
- **Email**: Email hợp lệ
- **Password**: Tối thiểu 6 ký tự
- **Confirm Password**: Xác nhận lại mật khẩu
- **Role**: Chọn role từ danh sách có sẵn

**Tài khoản Super Admin** sẽ được tạo với:
- Role: `ROLE_SUPER_ADMIN`
- Status: `Active` (không cần xác thực OTP)
- Quyền truy cập đầy đủ vào hệ thống

**Tài khoản Admin** sẽ được tạo với:
- Role: `ROLE_ADMIN`
- Status: `Active` (không cần xác thực OTP)
- Quyền quản lý hệ thống (nhưng không có quyền super admin)

**Tài khoản User với Role Tùy Chọn**:
- Có thể chọn bất kỳ role nào từ danh sách có sẵn
- Super Admin, Admin, Staff: `Active` (không cần xác thực OTP)
- User, Guest: `Inactive` (cần xác thực OTP để kích hoạt)

**Lưu ý**: 
- Chỉ tạo một tài khoản super admin duy nhất để quản lý hệ thống
- Có thể tạo nhiều tài khoản admin để phân chia công việc quản lý
- Script `create:user` cho phép tạo user với role linh hoạt

## 🔧 Configuration

### TypeScript
- Strict mode enabled
- Path aliases configured (`@/` points to `src/`)
- Source maps enabled
- Declaration files generated
- Advanced type checking

### Sequelize
- MySQL dialect với optimized queries
- Connection pooling với configurable settings
- Timestamps with underscores
- Foreign key constraints
- Query optimization

### Express
- CORS enabled với security headers
- Helmet security headers với CSP
- Custom logging với performance monitoring
- JSON body parser (10MB limit)
- Cookie parser với secure options
- Rate limiting với multiple configurations
- Caching middleware cho performance
- Input validation với express-validator

## 🔐 Authentication & Cookie Management

### JWT Authentication
- **Access Token**: 24 giờ với path `/`
- **Refresh Token**: 7 ngày với path `/api/v1/auth/refresh-token`
- **Dual Token System**: Access token cho API calls, refresh token cho token renewal
- **Secure Storage**: HttpOnly cookies với path-based security

### Cookie Configuration
- **Access Token Cookie**:
  - Path: `/` (available for all routes)
  - HttpOnly: `true` (not accessible via JavaScript)
  - Secure: `true` in production (HTTPS only)
  - SameSite: `strict` (CSRF protection)
  - Max Age: 24 hours

- **Refresh Token Cookie**:
  - Path: `/api/v1/auth/refresh-token` (restricted access)
  - HttpOnly: `true` (not accessible via JavaScript)
  - Secure: `true` in production (HTTPS only)
  - SameSite: `strict` (CSRF protection)
  - Max Age: 7 days

### Authentication Flow
1. **Login**: User credentials → Access + Refresh tokens → HttpOnly cookies
2. **API Access**: Access token from cookies → API authorization
3. **Token Refresh**: Refresh token from cookies → New access token
4. **Logout**: Clear all authentication cookies

### Security Benefits
- **Path Isolation**: Refresh token only accessible at specific endpoint
- **HttpOnly Protection**: Tokens not accessible via XSS attacks
- **Secure Transport**: HTTPS-only in production
- **CSRF Protection**: SameSite strict prevents cross-site requests
- **Automatic Cleanup**: Cookies expire automatically

## 🛡️ Security

- **Helmet.js**: Security headers với CSP configuration
- **CORS**: Cross-origin resource sharing với whitelist
- **Input Validation**: Express-validator với custom rules
- **SQL Injection Prevention**: Sequelize ORM với parameterized queries
- **XSS Protection**: Content Security Policy headers
- **Rate Limiting**: Multiple rate limiters cho different endpoints
- **Authentication**: JWT với secure token handling và HttpOnly cookies
- **File Upload Security**: File type và size validation
- **Error Handling**: Secure error messages không leak sensitive info

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `8000` |
| `HOST` | Server host | `localhost` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `3306` |
| `DB_NAME` | Database name | `nova_sites_db` |
| `DB_USER` | Database user | `root` |
| `DB_PASSWORD` | Database password | - |
| `JWT_SECRET` | JWT secret key | - |
| `ALLOWED_ORIGINS` | CORS origins | `http://localhost:8000` |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | Email username | - |
| `EMAIL_PASS` | Email password/app password | - |
| `FRONTEND_URL` | Frontend URL | `http://localhost:3000` |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

Nếu có vấn đề, vui lòng tạo issue hoặc liên hệ team development.