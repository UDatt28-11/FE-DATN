# 🔐 Tích hợp API Authentication - Palatin Hotel

## 📋 Tổng quan

Đã tích hợp thành công API Login và Register từ Laravel Backend sang React Frontend.

## 🎯 Các file đã tạo/cập nhật

### 1. **Service Files**

#### `src/service/axiosConfig.ts`
- Cấu hình axios instance với base URL
- Request interceptor: Tự động thêm Bearer token vào header
- Response interceptor: Xử lý lỗi 401, 403, 500

#### `src/service/authService.ts`
- `register()`: Đăng ký tài khoản mới
- `login()`: Đăng nhập
- `logout()`: Đăng xuất  
- `forgotPassword()`: Quên mật khẩu
- `resetPassword()`: Đặt lại mật khẩu
- `getCurrentUser()`: Lấy thông tin user từ localStorage
- `isAuthenticated()`: Kiểm tra trạng thái đăng nhập
- `getToken()`: Lấy token
- `getGoogleLoginUrl()`: URL Google OAuth

### 2. **Context**

#### `src/context/AuthContext.tsx`
- State management cho authentication
- `isLoggedIn`: Trạng thái đăng nhập
- `user`: Thông tin người dùng
- `login(user, token)`: Lưu user và token
- `logout()`: Xóa user và token
- `loading`: Trạng thái loading

### 3. **Components**

#### `src/components/Auth/LoginModal.tsx`
- Form đăng nhập với validation
- Tích hợp API `authService.login()`
- Loading state khi gọi API
- Hiển thị message success/error
- Google OAuth ready
- Chuyển đổi sang RegisterModal

#### `src/components/Auth/RegisterModal.tsx`
- Form đăng ký với validation
- Fields: Họ tên, Email, SĐT (optional), Password, Confirm Password
- Tích hợp API `authService.register()`
- Loading state khi gọi API
- Sau khi đăng ký thành công → chuyển sang LoginModal
- Google OAuth ready

### 4. **Environment**

#### `.env`
```bash
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Palatin Hotel
VITE_APP_URL=http://localhost:5173
```

## 🚀 API Endpoints (Laravel Backend)

### User Authentication
```
POST /api/user/register       # Đăng ký
POST /api/user/login           # Đăng nhập
POST /api/user/logout          # Đăng xuất (require auth)
POST /api/user/forgot-password # Quên mật khẩu
POST /api/user/reset-password  # Đặt lại mật khẩu
GET  /api/user/google/redirect # Google OAuth
GET  /api/user/google/callback # Google OAuth callback
```

## 📝 Request & Response Format

### Register Request
```typescript
{
  full_name: string;              // required, min: 2
  email: string;                  // required, email, unique
  password: string;               // required, min: 6
  password_confirmation: string;  // required, must match password
  phone_number?: string;          // optional, 9-11 digits
}
```

### Register Response (Success - 201)
```json
{
  "message": "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản."
}
```

### Login Request
```typescript
{
  email: string;    // required, email
  password: string; // required, min: 6
}
```

### Login Response (Success - 200)
```json
{
  "message": "Đăng nhập thành công",
  "user": {
    "id": 1,
    "full_name": "Nguyen Van A",
    "email": "user@example.com",
    "phone_number": "0912345678",
    "role": "user",
    "email_verified_at": "2025-11-16T10:00:00.000000Z",
    "created_at": "2025-11-16T09:00:00.000000Z",
    "updated_at": "2025-11-16T10:00:00.000000Z"
  },
  "token": "1|abc123def456..."
}
```

### Error Response (422 Validation Error)
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["Email không hợp lệ."],
    "password": ["Mật khẩu phải có ít nhất 6 ký tự."]
  }
}
```

## 💾 LocalStorage

Sau khi đăng nhập thành công, hệ thống lưu:
- `auth_token`: Bearer token
- `user_data`: JSON string của user object

## 🔄 Luồng hoạt động

### Đăng ký
1. User điền form → Click "Đăng Ký"
2. Frontend validate → Gọi API `/api/user/register`
3. Backend tạo user → Gửi email xác nhận
4. Response success → Hiển thị message
5. Tự động chuyển sang LoginModal sau 1.5s

### Đăng nhập
1. User điền email/password → Click "Đăng Nhập"
2. Frontend validate → Gọi API `/api/user/login`
3. Backend kiểm tra credentials → Tạo token
4. Response success → Lưu token + user vào:
   - localStorage
   - AuthContext
5. Đóng modal → Redirect về trang chủ

### Logout
1. User click "Đăng xuất"
2. Gọi API `/api/user/logout` (xóa token trên server)
3. Xóa `auth_token` và `user_data` từ localStorage
4. Clear AuthContext state
5. Redirect về trang chủ

## 🛡️ Authorization

Mọi request authenticated đều tự động thêm header:
```
Authorization: Bearer {token}
```

Nhờ axios interceptor trong `axiosConfig.ts`.

## ⚙️ Cách sử dụng

### Trong Component
```typescript
import { useAuth } from '@/context/AuthContext';
import authService from '@/service/authService';

function MyComponent() {
  const { isLoggedIn, user, login, logout } = useAuth();

  // Kiểm tra đã đăng nhập
  if (!isLoggedIn) {
    return <div>Vui lòng đăng nhập</div>;
  }

  // Hiển thị thông tin user
  return (
    <div>
      <p>Xin chào, {user?.full_name}!</p>
      <button onClick={logout}>Đăng xuất</button>
    </div>
  );
}
```

### Gọi API với token
```typescript
import axiosInstance from '@/service/axiosConfig';

// Token tự động được thêm vào header
const response = await axiosInstance.get('/user/profile');
```

## 🔧 Cấu hình Laravel Backend

Đảm bảo file `.env` của Laravel có:
```bash
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

# Email configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="${APP_NAME}"

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/user/google/callback
```

## ✅ Testing

### Test Register
1. Mở modal đăng ký
2. Điền thông tin hợp lệ
3. Click "Đăng Ký"
4. Kiểm tra console network tab
5. Kiểm tra email inbox

### Test Login
1. Mở modal đăng nhập
2. Nhập email/password đã đăng ký
3. Click "Đăng Nhập"
4. Kiểm tra localStorage có token
5. Kiểm tra AuthContext state

### Test Logout
1. Đăng nhập thành công
2. Click "Đăng xuất"
3. Kiểm tra localStorage đã xóa
4. Kiểm tra AuthContext state reset

## 🐛 Troubleshooting

### Lỗi CORS
```bash
# Laravel config/cors.php
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:5173'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

### Lỗi 401 Unauthorized
- Kiểm tra token trong localStorage
- Kiểm tra Laravel Sanctum configuration
- Kiểm tra middleware route

### Email không gửi được
- Kiểm tra cấu hình MAIL trong `.env`
- Kiểm tra queue worker: `php artisan queue:work`
- Kiểm tra log: `storage/logs/laravel.log`

## 📚 Dependencies

### Frontend
- axios: ^1.7.9
- react: ^19.1.1
- antd: ^5.28.0
- react-router-dom: ^7.1.1

### Backend (Laravel)
- laravel/sanctum: ^4.0
- guzzlehttp/guzzle: ^7.2

## 🎉 Hoàn thành!

API Login và Register đã được tích hợp đầy đủ với:
- ✅ Validation form frontend
- ✅ API call với axios
- ✅ Token management
- ✅ Error handling
- ✅ Loading states
- ✅ Success/Error messages
- ✅ Google OAuth ready
- ✅ Email verification
- ✅ LocalStorage persistence
- ✅ Auth Context state management
