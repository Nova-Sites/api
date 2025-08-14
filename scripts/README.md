# Scripts Documentation

Thư mục này chứa các script tiện ích để quản lý hệ thống Nova Sites API.

## 📁 Available Scripts

### 1. `create-superadmin.ts`
Tạo tài khoản Super Admin với quyền cao nhất trong hệ thống.

**Usage:**
```bash
npm run create:superadmin
```

**Features:**
- Tự động kết nối database
- Validation đầy đủ thông tin đầu vào
- Kiểm tra trùng lặp username/email
- Hash password an toàn với bcrypt
- Tạo tài khoản với role `ROLE_SUPER_ADMIN`
- Tài khoản được kích hoạt ngay lập tức (không cần OTP)

### 2. `create-admin.ts`
Tạo tài khoản Admin với quyền quản lý hệ thống.

**Usage:**
```bash
npm run create:admin
```

**Features:**
- Tương tự như create-superadmin nhưng với role `ROLE_ADMIN`
- Tài khoản được kích hoạt ngay lập tức
- Phù hợp cho việc phân chia công việc quản lý

### 3. `create-user.ts`
Tạo tài khoản user với role tùy chọn.

**Usage:**
```bash
npm run create:user
```

**Features:**
- Cho phép chọn role từ danh sách có sẵn
- Hiển thị danh sách roles có thể chọn
- Tự động xác định trạng thái kích hoạt dựa trên role:
  - Super Admin, Admin, Staff: `Active` (không cần OTP)
  - User, Guest: `Inactive` (cần OTP để kích hoạt)
- Linh hoạt nhất trong các script tạo user

## 🔧 Technical Details

### Database Connection
Tất cả scripts đều sử dụng cấu hình database từ `src/config/database.ts` và tự động:
- Kết nối database
- Kiểm tra kết nối thành công
- Đóng kết nối sau khi hoàn thành

### Validation & Performance Optimization
Scripts sử dụng `UserValidationUtils` từ `src/utils/userValidation.ts` để:
- **Centralized Validation**: Tất cả validation logic được tập trung trong một module
- **Performance Optimization**: Database queries được tối ưu với `attributes` selection
- **Code Reusability**: Tránh duplicate code giữa các scripts và services
- **Better Error Handling**: Xử lý lỗi nhất quán và chi tiết
- **Type Safety**: TypeScript interfaces cho validation data

### Validation Rules
- **Username**: 3-50 ký tự, chỉ chứa chữ cái, số và dấu gạch dưới
- **Email**: Format email hợp lệ
- **Password**: Tối thiểu 6 ký tự
- **Role**: Phải thuộc danh sách roles được định nghĩa trong constants

### Security Features
- Hash password với bcrypt (salt rounds: 10)
- Kiểm tra trùng lặp username/email với optimized queries
- Validation đầy đủ trước khi tạo user
- Xử lý lỗi an toàn và nhất quán

## 🚀 Usage Examples

### Tạo Super Admin đầu tiên
```bash
# Sau khi setup database và chạy migrations
npm run create:superadmin
```

### Tạo Admin để quản lý
```bash
npm run create:admin
```

### Tạo Staff member
```bash
npm run create:user
# Chọn role: ROLE_STAFF
```

### Tạo User thông thường
```bash
npm run create:user
# Chọn role: ROLE_USER
```

## 📊 Performance Improvements

### Before (Duplicate Code)
- ❌ Validation logic duplicated across 3 scripts (~150 lines each)
- ❌ Database queries without optimization
- ❌ Inconsistent error handling
- ❌ Manual password hashing in each script

### After (Optimized)
- ✅ Centralized validation in `UserValidationUtils` (~200 lines total)
- ✅ Optimized database queries with `attributes` selection
- ✅ Consistent error handling and validation
- ✅ Reusable password hashing and user creation
- ✅ Better UX with role descriptions
- ✅ Type-safe validation with TypeScript interfaces

## ⚠️ Important Notes

1. **Super Admin**: Chỉ nên tạo một tài khoản super admin duy nhất
2. **Database**: Đảm bảo database đã được setup và migrations đã chạy
3. **Environment**: Đảm bảo file `.env` đã được cấu hình đúng
4. **Permissions**: Scripts cần quyền đọc/ghi database
5. **Backup**: Nên backup database trước khi chạy scripts

## 🐛 Troubleshooting

### Lỗi kết nối database
- Kiểm tra cấu hình database trong `.env`
- Đảm bảo MySQL service đang chạy
- Kiểm tra quyền truy cập database

### Lỗi validation
- Kiểm tra format username/email/password
- Đảm bảo không trùng lặp với user đã tồn tại
- Kiểm tra role có hợp lệ không

### Lỗi TypeScript
- Đảm bảo đã cài đặt `ts-node`
- Kiểm tra cấu hình TypeScript trong `tsconfig.json`
- Đảm bảo path aliases được cấu hình đúng
