# Nova Sites API

Backend API for the website marketplace, built with Node.js, TypeScript, Express, and Sequelize.

## 🚀 Features

- **TypeScript**: Type-safe development with strict mode
- **Express.js**: Fast web framework with optimized middleware
- **Sequelize**: ORM for the database with connection pooling
- **MySQL**: Primary database with optimized queries
- **Socket.IO**: Real-time communication
- **JWT Authentication**: Secure auth with refresh tokens
- **Cookie Management**: HttpOnly cookies with path-based security
- **File Upload**: Image uploads with validation
- **API Documentation**: RESTful API with comprehensive docs
- **Error Handling**: Comprehensive error handling with custom error types
- **Input Validation**: Express-validator with custom rules
- **CORS**: Cross-origin resource sharing with security headers
- **Helmet**: Security headers with CSP configuration
- **Logging**: Custom logging with performance monitoring
- **Service Layer**: Separation of concerns with isolated business logic
- **Path Aliases**: Clean imports using the `@/` prefix
- **Graceful Shutdown**: Proper cleanup and error handling

## 📁 Project Structure

```
api/
├── src/
│   ├── config/          # Database configuration
│   ├── constants/       # Constants and messages
│   ├── controllers/     # Route controllers (HTTP handling)
│   ├── middlewares/     # Custom middlewares
│   ├── migrations/      # Database migrations
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── services/        # Business logic layer
│   ├── lib/             # Shared libraries (e.g., env loader)
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   └── server.ts        # Main server file
├── .env.example         # Environment variables example
├── .sequelizerc         # Sequelize CLI configuration
├── nodemon.json         # Nodemon configuration
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript configuration
└── README.md            # This file
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

   Edit the `.env` file with your database connection and other settings:
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
   # Create database
   mysql -u root -p
   CREATE DATABASE nova_sites_db;

   # Run migrations
   npm run db:migrate

   # Run seeders (if available)
   npm run db:seed:all
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new account
- `POST /api/v1/auth/verify-otp` - Verify OTP to activate the account
- `POST /api/v1/auth/resend-otp` - Resend OTP
- `POST /api/v1/auth/login` - Log in (to be implemented)
- `POST /api/v1/auth/logout` - Log out (to be implemented)
- `POST /api/v1/auth/forgot-password` - Forgot password (to be implemented)
- `POST /api/v1/auth/reset-password` - Reset password (to be implemented)

### Users
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get a user by ID
- `GET /api/v1/users/profile` - Get current user's profile (to be implemented)
- `PUT /api/v1/users/profile` - Update current user's profile (to be implemented)
- `PUT /api/v1/users/profile/avatar` - Update user avatar (to be implemented)
- `PUT /api/v1/users/change-password` - Change password (to be implemented)
- `DELETE /api/v1/users/:id` - Delete user (soft delete)
- `PATCH /api/v1/users/:id/soft-delete` - Soft delete user
- `GET /api/v1/users/role/:role` - Get users by role
- `GET /api/v1/users/search` - Search users

### Categories
- `GET /api/v1/categories` - Get all categories
- `GET /api/v1/categories/search` - Search categories
- `GET /api/v1/categories/with-product-count` - Get categories with product counts
- `GET /api/v1/categories/:id` - Get a category by ID
- `GET /api/v1/categories/slug/:slug` - Get a category by slug
- `POST /api/v1/categories` - Create a new category
- `PUT /api/v1/categories/:id` - Update a category
- `DELETE /api/v1/categories/:id` - Delete a category
- `PATCH /api/v1/categories/:id/soft-delete` - Soft delete a category

### Products
- `GET /api/v1/products` - Get all products (with pagination and filtering)
- `GET /api/v1/products/popular` - Get popular products
- `GET /api/v1/products/search` - Search products
- `GET /api/v1/products/category/:categoryId` - Get products by category
- `GET /api/v1/products/price-range/:minPrice/:maxPrice` - Get products by price range
- `GET /api/v1/products/:id` - Get a product by ID
- `GET /api/v1/products/slug/:slug` - Get a product by slug
- `POST /api/v1/products` - Create a new product
- `PUT /api/v1/products/:id` - Update a product
- `DELETE /api/v1/products/:id` - Delete a product
- `PATCH /api/v1/products/:id/soft-delete` - Soft delete a product

### Health Check
- `GET /api/v1/health` - API health check

## 🔧 Constants Structure

### Route Constants
All routes are defined in constants to avoid hard-coding:

```typescript
// Constants organized in src/constants/routes.ts
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

After setting up the database and running migrations, you can create admin accounts using the following commands:

#### Create Super Admin Account
```bash
npm run create:superadmin
```

#### Create Admin Account
```bash
npm run create:admin
```

#### Create User with Custom Role
```bash
npm run create:user
```

The script will prompt you for:
- **Username**: 3–50 characters; letters, numbers, and underscores only
- **Email**: Valid email address
- **Password**: Minimum 6 characters
- **Confirm Password**: Re-enter password
- **Role**: Choose a role from the available list

**Super Admin account** will be created with:
- Role: `ROLE_SUPER_ADMIN`
- Status: `Active` (no OTP verification required)
- Full system access

**Admin account** will be created with:
- Role: `ROLE_ADMIN`
- Status: `Active` (no OTP verification required)
- System management permissions (without super admin privileges)

**User account with custom role**:
- You can choose any role from the list
- Super Admin, Admin, Staff: `Active` (no OTP verification required)
- User, Guest: `Inactive` (OTP verification required to activate)

**Notes**:
- Create only one super admin account for system administration
- You can create multiple admin accounts to distribute management tasks
- The `create:user` script allows flexible user creation with custom roles

## 🔧 Configuration

### TypeScript
- Strict mode enabled
- Path aliases configured (`@/` points to `src/`)
- Source maps enabled
- Declaration files generated
- Advanced type checking

### Sequelize
- MySQL dialect with optimized queries
- Connection pooling with configurable settings
- Timestamps with underscores
- Foreign key constraints
- Query optimization

### Express
- CORS enabled with security headers
- Helmet security headers with CSP
- Custom logging with performance monitoring
- JSON body parser (10MB limit)
- Cookie parser with secure options
- Rate limiting with multiple configurations
- Caching middleware for performance
- Input validation with express-validator

### Lib
- Centralized environment loader at `src/lib/env.ts` with schema validation and typed accessors for config values

## 🔐 Authentication & Cookie Management

### JWT Authentication
- **Access Token**: 24 hours
- **Refresh Token**: 7 days
- **Dual Token System**: Access token for API calls, refresh token for renewal
- **Secure Storage**: HttpOnly cookies with path-based security

### Cookie Configuration
- **Access Token Cookie**:
  - HttpOnly: `true` (not accessible via JavaScript)
  - Secure: `true` in production (HTTPS only)
  - SameSite: `strict` (CSRF protection)
  - Max Age: 24 hours

- **Refresh Token Cookie**:
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
- **Path Isolation**: Refresh token accessible only at a specific endpoint
- **HttpOnly Protection**: Tokens not accessible via XSS
- **Secure Transport**: HTTPS-only in production
- **CSRF Protection**: SameSite strict prevents cross-site requests
- **Automatic Cleanup**: Cookies expire automatically

## 🛡️ Security

- **Helmet.js**: Security headers with CSP configuration
- **CORS**: Cross-origin resource sharing with a whitelist
- **Input Validation**: Express-validator with custom rules
- **SQL Injection Prevention**: Sequelize ORM with parameterized queries
- **XSS Protection**: Content Security Policy headers
- **Rate Limiting**: Multiple rate limiters for different endpoints
- **Authentication**: JWT with secure token handling and HttpOnly cookies
- **File Upload Security**: File type and size validation
- **Error Handling**: Secure error messages without leaking sensitive info

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

If you encounter issues, please open an issue or contact the development team.