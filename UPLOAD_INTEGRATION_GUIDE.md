# Nova Sites API - Upload Integration Guide

## 📋 Overview

Hướng dẫn tích hợp upload ảnh cho Product, Category và User trong Nova Sites API.

## 🚀 API Endpoints với Upload

### Category Endpoints

#### 1. Create Category với Image Upload
```http
POST /api/v1/categories
Content-Type: multipart/form-data
Authorization: Bearer <token> (Staff required)

Body:
- image: File (required) - Category image
- name: String (required) - Category name
- description: String (optional) - Category description
```

#### 2. Update Category với Image Upload
```http
PUT /api/v1/categories/:id
Content-Type: multipart/form-data
Authorization: Bearer <token> (Staff required)

Body:
- image: File (optional) - New category image
- name: String (optional) - Category name
- description: String (optional) - Category description
- isActive: Boolean (optional) - Category status
```

### Product Endpoints

#### 1. Create Product với Image Upload
```http
POST /api/v1/products
Content-Type: multipart/form-data
Authorization: Bearer <token> (Staff required)

Body:
- image: File (required) - Product image
- name: String (required) - Product name
- description: String (required) - Product description
- price: Number (required) - Product price
- categoryId: Number (required) - Category ID
```

#### 2. Update Product với Image Upload
```http
PUT /api/v1/products/:id
Content-Type: multipart/form-data
Authorization: Bearer <token> (Staff required)

Body:
- image: File (optional) - New product image
- name: String (optional) - Product name
- description: String (optional) - Product description
- price: Number (optional) - Product price
- categoryId: Number (optional) - Category ID
- isActive: Boolean (optional) - Product status
```

### User Endpoints

#### 1. Update User Avatar
```http
PUT /api/v1/users/profile/avatar
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
- avatar: File (required) - User avatar image
```

## 📝 Usage Examples

### Frontend Upload Examples

#### Create Category với Image
```javascript
const formData = new FormData();
formData.append('image', file);
formData.append('name', 'Electronics');
formData.append('description', 'Electronic products category');

const response = await fetch('/api/v1/categories', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log('Category created:', result.data.category);
console.log('Image URL:', result.data.imageUrl);
```

#### Create Product với Image
```javascript
const formData = new FormData();
formData.append('image', file);
formData.append('name', 'iPhone 15 Pro');
formData.append('description', 'Latest iPhone with advanced features');
formData.append('price', '999.99');
formData.append('categoryId', '1');

const response = await fetch('/api/v1/products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log('Product created:', result.data.product);
console.log('Image URL:', result.data.imageUrl);
```

#### Update User Avatar
```javascript
const formData = new FormData();
formData.append('avatar', file);

const response = await fetch('/api/v1/users/profile/avatar', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log('Avatar updated:', result.data.user);
console.log('Avatar URL:', result.data.avatarUrl);
```

#### Update Category với New Image
```javascript
const formData = new FormData();
formData.append('image', newImageFile);
formData.append('name', 'Updated Category Name');
formData.append('description', 'Updated description');

const response = await fetch('/api/v1/categories/1', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log('Category updated:', result.data.category);
if (result.data.imageUrl) {
  console.log('New image URL:', result.data.imageUrl);
}
```

## 🔧 Configuration

### File Upload Settings
- **Max File Size**: 5MB per file
- **Allowed Types**: JPEG, PNG, WebP
- **Storage**: Cloudinary cloud storage
- **Optimization**: Automatic WebP conversion and quality optimization

### Cloudinary Folders
- **Categories**: `categories/` - Category images
- **Products**: `products/` - Product images  
- **Users**: `avatars/` - User avatars
- **General**: `uploads/` - General uploads

### Image Transformations
- **Category Images**: Optimized for display
- **Product Images**: 800x600 fit, optimized for product showcase
- **User Avatars**: 300x300 crop with face detection

## 📊 Response Format

### Success Response (Create/Update with Image)
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "category": {
      "id": 1,
      "name": "Electronics",
      "image": "https://res.cloudinary.com/...",
      "slug": "electronics",
      "description": "Electronic products",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "imageUrl": "https://res.cloudinary.com/...",
    "public_id": "categories/category_1234567890"
  },
  "statusCode": 201
}
```

### Success Response (Update without Image)
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "category": {
      "id": 1,
      "name": "Updated Electronics",
      "image": "https://res.cloudinary.com/...",
      "slug": "updated-electronics",
      "description": "Updated description",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "statusCode": 200
}
```

## 🛡️ Security Features

### Authentication & Authorization
- **Category Operations**: Requires Staff role or higher
- **Product Operations**: Requires Staff role or higher
- **User Avatar**: Requires authentication

### File Validation
- **File Type**: Only image files (JPEG, PNG, WebP)
- **File Size**: Maximum 5MB per file
- **Content Validation**: Multer middleware validation

### Automatic Cleanup
- **Old Image Deletion**: When updating with new image, old image is automatically deleted from Cloudinary
- **Error Handling**: Comprehensive error handling with rollback

## 🔍 Error Handling

### Common Error Responses

#### No File Uploaded
```json
{
  "success": false,
  "message": "No file uploaded",
  "statusCode": 400
}
```

#### Invalid File Type
```json
{
  "success": false,
  "message": "Only image files are allowed",
  "statusCode": 400
}
```

#### File Too Large
```json
{
  "success": false,
  "message": "File too large",
  "statusCode": 400
}
```

#### Upload Failed
```json
{
  "success": false,
  "message": "Image upload failed",
  "statusCode": 500
}
```

## 🧪 Testing

### Run Integration Tests
```bash
# Test upload functionality
npm run test:upload

# Test upload integration for all entities
npm run test:upload-integration
```

### Manual Testing với Postman
1. Set request method to POST/PUT
2. Set Content-Type to `multipart/form-data`
3. Add Authorization header with Bearer token
4. Add file field with image file
5. Add other required fields
6. Send request and check response

## 📚 Additional Resources

- [Multer Documentation](https://github.com/expressjs/multer)
- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Express File Upload Guide](https://expressjs.com/en/resources/middleware/multer.html)
- [API Documentation](./API_DOCUMENTATION.md)
- [Upload System Guide](./UPLOAD_GUIDE.md)
