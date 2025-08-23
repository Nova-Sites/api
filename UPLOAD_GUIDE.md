# Nova Sites API - Upload System Guide

## 📋 Overview

Hệ thống upload ảnh sử dụng Multer và Cloudinary với TypeScript cho Nova Sites API.

## 🛠️ Setup

### 1. Environment Variables

Thêm các biến môi trường vào file `.env`:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 2. Dependencies

Các package đã được cài đặt:
- `multer`: File upload middleware
- `cloudinary`: Cloud storage service
- `streamifier`: Stream utility for Cloudinary
- `@types/streamifier`: TypeScript types

## 🚀 API Endpoints

### Upload Endpoints

#### 1. Upload Single Image
```http
POST /api/v1/upload/single
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
- image: File (required)
- folder: String (optional, default: "uploads")
- public_id: String (optional)
```

#### 2. Upload User Avatar
```http
POST /api/v1/upload/avatar
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
- avatar: File (required)
```

#### 3. Upload Product Image
```http
POST /api/v1/upload/product
Content-Type: multipart/form-data
Authorization: Bearer <token> (Staff required)

Body:
- image: File (required)
- productId: Number (required)
- imageIndex: Number (optional, default: 0)
```

#### 4. Upload Multiple Images
```http
POST /api/v1/upload/multiple
Content-Type: multipart/form-data
Authorization: Bearer <token> (Staff required)

Body:
- images: File[] (required, max 10 files)
- folder: String (optional, default: "uploads")
- prefix: String (optional, default: "image")
```

#### 5. Upload Multiple Product Images
```http
POST /api/v1/upload/product/multiple
Content-Type: multipart/form-data
Authorization: Bearer <token> (Staff required)

Body:
- images: File[] (required, max 10 files)
- productId: Number (required)
```

### Delete Endpoints

#### 1. Delete Image by URL
```http
DELETE /api/v1/upload/url
Content-Type: application/json
Authorization: Bearer <token> (Staff required)

Body:
{
  "imageUrl": "https://res.cloudinary.com/..."
}
```

#### 2. Delete Image by Public ID
```http
DELETE /api/v1/upload/public-id
Content-Type: application/json
Authorization: Bearer <token> (Staff required)

Body:
{
  "public_id": "folder/image_name"
}
```

#### 3. Delete Multiple Images
```http
DELETE /api/v1/upload/multiple
Content-Type: application/json
Authorization: Bearer <token> (Admin required)

Body:
{
  "imageUrls": [
    "https://res.cloudinary.com/...",
    "https://res.cloudinary.com/..."
  ]
}
```

### Info Endpoint

#### Get Upload Info
```http
GET /api/v1/upload/info
```

## 📁 File Structure

```
src/
├── utils/
│   ├── multer.ts          # Multer configuration
│   └── cloudinary.ts      # Cloudinary utilities
├── services/
│   └── upload.service.ts  # Upload business logic
├── controllers/
│   └── upload.controller.ts # Upload controllers
└── routes/
    └── upload.routes.ts   # Upload routes
```

## 🔧 Configuration

### Multer Configuration
- **Storage**: Memory storage (for Cloudinary upload)
- **File Filter**: Only image files (jpeg, png, webp)
- **Size Limit**: 5MB per file
- **Max Files**: 10 files for multiple upload

### Cloudinary Configuration
- **Folders**:
  - `avatars/`: User avatars (300x300, optimized)
  - `products/`: Product images (800x600, optimized)
  - `uploads/`: General uploads
- **Format**: Auto-convert to WebP for optimization
- **Quality**: Auto-optimize quality
- **Transformations**: Automatic resizing and optimization

## 📝 Usage Examples

### Frontend Upload (JavaScript)

```javascript
// Upload single image
const formData = new FormData();
formData.append('image', file);
formData.append('folder', 'uploads');

const response = await fetch('/api/v1/upload/single', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log(result.data.url); // Cloudinary URL
```

### Upload Avatar
```javascript
const formData = new FormData();
formData.append('avatar', file);

const response = await fetch('/api/v1/upload/avatar', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Upload Multiple Product Images
```javascript
const formData = new FormData();
files.forEach(file => {
  formData.append('images', file);
});
formData.append('productId', '123');

const response = await fetch('/api/v1/upload/product/multiple', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

## 🛡️ Security Features

### Authentication & Authorization
- **Avatar Upload**: Requires authentication
- **Product Images**: Requires Staff role or higher
- **Delete Operations**: Requires Staff role or higher
- **Bulk Delete**: Requires Admin role

### File Validation
- **File Type**: Only image files allowed
- **File Size**: Maximum 5MB per file
- **File Count**: Maximum 10 files per request

### Error Handling
- Comprehensive error messages
- Proper HTTP status codes
- Rollback on partial failures

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/...",
    "public_id": "folder/image_name"
  },
  "statusCode": 200
}
```

### Multiple Upload Response
```json
{
  "success": true,
  "message": "3/3 images uploaded successfully",
  "data": {
    "urls": ["https://...", "https://...", "https://..."],
    "public_ids": ["id1", "id2", "id3"],
    "successCount": 3,
    "totalCount": 3,
    "errors": []
  },
  "statusCode": 200
}
```

### Error Response
```json
{
  "success": false,
  "message": "File size too large",
  "statusCode": 400
}
```

## 🔍 Troubleshooting

### Common Issues

1. **Cloudinary not configured**
   - Check environment variables
   - Verify Cloudinary account settings

2. **File upload fails**
   - Check file size (max 5MB)
   - Verify file type (images only)
   - Check network connection

3. **Authentication errors**
   - Verify JWT token
   - Check user roles and permissions

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

## 📚 Additional Resources

- [Multer Documentation](https://github.com/expressjs/multer)
- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Express File Upload Guide](https://expressjs.com/en/resources/middleware/multer.html)
