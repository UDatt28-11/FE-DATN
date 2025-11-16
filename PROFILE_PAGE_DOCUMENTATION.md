# Profile Page Documentation

## Tổng quan
Trang thông tin cá nhân cho phép người dùng xem và cập nhật thông tin tài khoản của họ.

## Đường dẫn
- Route: `/profile`
- Component: `src/pages/Clients/Profile/Profile.tsx`
- CSS: `src/pages/Clients/Profile/Profile.css`

## Tính năng

### 1. Hiển thị thông tin người dùng
- Avatar (hình đại diện)
- Họ và tên
- Email
- Số điện thoại
- Ngày tham gia

### 2. Cập nhật thông tin cơ bản
- **Form fields:**
  - Họ và tên (required, min: 2 ký tự)
  - Email (disabled - không cho phép thay đổi)
  - Số điện thoại (optional, format: 9-11 số)

- **Validation:**
  ```typescript
  - full_name: required, min 2 characters
  - email: disabled (read-only)
  - phone_number: optional, pattern /^[0-9]{9,11}$/
  ```

- **API Call:**
  ```typescript
  PUT /api/user/profile
  Body: {
    full_name: string,
    phone_number?: string
  }
  Response: {
    message: string,
    user: UserObject
  }
  ```

### 3. Đổi mật khẩu
- **Form fields:**
  - Mật khẩu hiện tại (required)
  - Mật khẩu mới (required, min: 6 ký tự)
  - Xác nhận mật khẩu mới (required, must match)

- **Validation:**
  ```typescript
  - current_password: required
  - new_password: required, min 6 characters
  - new_password_confirmation: required, must match new_password
  ```

- **API Call:**
  ```typescript
  POST /api/user/change-password
  Body: {
    current_password: string,
    new_password: string,
    new_password_confirmation: string
  }
  Response: {
    message: string
  }
  ```

### 4. Upload Avatar
- **Supported formats:** image/* (jpg, png, gif, etc.)
- **Max file size:** 2MB
- **Preview:** Hiển thị preview ngay lập tức
- **Upload:** Auto upload khi chọn file

- **API Call:**
  ```typescript
  POST /api/user/avatar
  Content-Type: multipart/form-data
  Body: FormData with 'avatar' field
  Response: {
    message: string,
    avatar_url: string
  }
  ```

## Cấu trúc Component

### State Management
```typescript
const { user, login } = useAuth(); // From AuthContext
const [loading, setLoading] = useState(false);
const [profileForm] = Form.useForm();
const [passwordForm] = Form.useForm();
const [avatarUrl, setAvatarUrl] = useState<string>('');
```

### Layout
```
┌─────────────────────────────────────────────────┐
│            Profile Page Header                   │
│       Thông Tin Cá Nhân                          │
│  Quản lý thông tin và bảo mật tài khoản          │
└─────────────────────────────────────────────────┘

┌──────────────┬──────────────────────────────────┐
│              │  ┌──────────────────────────────┐ │
│   User Card  │  │  Thông tin cơ bản | Đổi MK   │ │
│              │  └──────────────────────────────┘ │
│  ┌────────┐  │                                   │
│  │ Avatar │  │  Form: Họ tên, Email, SĐT        │
│  └────────┘  │  [Lưu thay đổi]                   │
│              │                                   │
│   Tên user   │                                   │
│   Email      │                                   │
│              │                                   │
│   Details    │                                   │
│   - Email    │                                   │
│   - Phone    │                                   │
│   - Joined   │                                   │
└──────────────┴──────────────────────────────────┘
```

### Responsive Design
- **Desktop (≥992px):** 2 cột (User Card | Forms)
- **Tablet (768-991px):** 2 cột stack
- **Mobile (<768px):** 1 cột, avatar nhỏ hơn

## AuthService Integration

### Các phương thức mới đã thêm:

#### 1. updateProfile
```typescript
async updateProfile(data: UpdateProfileRequest): Promise<AuthResponse>

Parameters:
- data.full_name: string
- data.phone_number?: string

Returns:
- AuthResponse with updated user object

Features:
- Gọi API PUT /user/profile
- Tự động cập nhật localStorage
- Xử lý validation errors (422)
```

#### 2. changePassword
```typescript
async changePassword(data: ChangePasswordRequest): Promise<{message: string}>

Parameters:
- data.current_password: string
- data.new_password: string
- data.new_password_confirmation: string

Returns:
- Success message

Features:
- Gọi API POST /user/change-password
- Xử lý validation errors (422, 400)
```

#### 3. uploadAvatar
```typescript
async uploadAvatar(file: File): Promise<UploadAvatarResponse>

Parameters:
- file: File (image file)

Returns:
- message: string
- avatar_url: string

Features:
- Gọi API POST /user/avatar
- Content-Type: multipart/form-data
- Tự động cập nhật localStorage với avatar mới
- Xử lý validation errors
```

## Backend API Requirements

### 1. Update Profile Endpoint
```php
Route: PUT /api/user/profile
Middleware: auth:sanctum

Request Body:
{
  "full_name": "string|required|min:2",
  "phone_number": "string|nullable|regex:/^[0-9]{9,11}$/"
}

Response (200):
{
  "message": "Cập nhật thông tin thành công",
  "user": {
    "id": 1,
    "full_name": "Nguyễn Văn A",
    "email": "user@example.com",
    "phone_number": "0123456789",
    "avatar": "http://...",
    "created_at": "2025-01-01T00:00:00.000000Z",
    "updated_at": "2025-01-01T00:00:00.000000Z"
  }
}

Response (422):
{
  "message": "Validation errors",
  "errors": {
    "full_name": ["Họ tên không được để trống"],
    "phone_number": ["Số điện thoại không hợp lệ"]
  }
}
```

### 2. Change Password Endpoint
```php
Route: POST /api/user/change-password
Middleware: auth:sanctum

Request Body:
{
  "current_password": "string|required",
  "new_password": "string|required|min:6",
  "new_password_confirmation": "string|required|same:new_password"
}

Response (200):
{
  "message": "Đổi mật khẩu thành công"
}

Response (400):
{
  "message": "Mật khẩu hiện tại không đúng"
}

Response (422):
{
  "message": "Validation errors",
  "errors": {
    "new_password": ["Mật khẩu phải có ít nhất 6 ký tự"]
  }
}
```

### 3. Upload Avatar Endpoint
```php
Route: POST /api/user/avatar
Middleware: auth:sanctum

Request Body (multipart/form-data):
{
  "avatar": File (image file)
}

Validation:
- File type: image/*
- Max size: 2MB (2048KB)

Response (200):
{
  "message": "Upload avatar thành công",
  "avatar_url": "http://localhost:8000/storage/avatars/user-123.jpg"
}

Response (422):
{
  "message": "Validation errors",
  "errors": {
    "avatar": ["File phải là hình ảnh", "File không được lớn hơn 2MB"]
  }
}
```

## Laravel Backend Implementation (Suggested)

### Controller: UserController.php
```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        $request->validate([
            'full_name' => 'required|string|min:2|max:255',
            'phone_number' => 'nullable|string|regex:/^[0-9]{9,11}$/',
        ]);

        $user = $request->user();
        $user->update($request->only(['full_name', 'phone_number']));

        return response()->json([
            'message' => 'Cập nhật thông tin thành công',
            'user' => $user,
        ]);
    }

    /**
     * Change password
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        $user = $request->user();

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Mật khẩu hiện tại không đúng'],
            ]);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json([
            'message' => 'Đổi mật khẩu thành công',
        ]);
    }

    /**
     * Upload avatar
     */
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = $request->user();

        // Delete old avatar if exists
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        // Store new avatar
        $path = $request->file('avatar')->store('avatars', 'public');
        
        // Update user
        $user->update([
            'avatar' => $path,
        ]);

        return response()->json([
            'message' => 'Upload avatar thành công',
            'avatar_url' => Storage::url($path),
        ]);
    }
}
```

### Routes: api.php
```php
Route::middleware('auth:sanctum')->group(function () {
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::post('/user/change-password', [UserController::class, 'changePassword']);
    Route::post('/user/avatar', [UserController::class, 'uploadAvatar']);
});
```

### Database Migration (if avatar column doesn't exist)
```php
Schema::table('users', function (Blueprint $table) {
    $table->string('avatar')->nullable()->after('phone_number');
});
```

## Testing Checklist

### Frontend Testing:
- [ ] Trang profile load đúng thông tin user
- [ ] Form cập nhật thông tin hoạt động
- [ ] Validation form hiển thị lỗi đúng
- [ ] Đổi mật khẩu thành công
- [ ] Upload avatar preview ngay lập tức
- [ ] Upload avatar gọi API thành công
- [ ] Loading state hiển thị khi submit form
- [ ] Success/Error messages hiển thị đúng
- [ ] Responsive design hoạt động trên mobile/tablet
- [ ] User context update sau khi cập nhật thông tin

### Backend Testing:
- [ ] API endpoint `/user/profile` hoạt động
- [ ] API endpoint `/user/change-password` hoạt động
- [ ] API endpoint `/user/avatar` hoạt động
- [ ] Validation rules hoạt động đúng
- [ ] Authentication middleware bảo vệ routes
- [ ] Avatar được lưu vào storage
- [ ] Avatar cũ bị xóa khi upload mới
- [ ] Database được update đúng

## Security Considerations

1. **Authentication**: Tất cả endpoints yêu cầu auth:sanctum
2. **Validation**: Server-side validation cho tất cả input
3. **Password**: Current password phải verify trước khi đổi
4. **File Upload**: Validate file type và size
5. **CSRF Protection**: Sử dụng Sanctum CSRF token
6. **SQL Injection**: Sử dụng Eloquent ORM
7. **XSS Prevention**: Ant Design tự động escape input

## Next Steps

1. ✅ Tạo Profile page component
2. ✅ Tạo CSS styling
3. ✅ Thêm route `/profile`
4. ✅ Cập nhật authService với các phương thức mới
5. ⏳ Implement backend API endpoints
6. ⏳ Test full flow từ frontend đến backend
7. ⏳ Thêm avatar storage configuration
8. ⏳ Tạo My Bookings page
9. ⏳ Tạo Settings page
