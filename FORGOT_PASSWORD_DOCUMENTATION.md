# Tài Liệu Tính Năng Quên Mật Khẩu - Forgot Password & Reset Password

## Tổng Quan

Hệ thống quên mật khẩu cho phép người dùng khôi phục tài khoản khi quên mật khẩu bằng cách:
1. Gửi yêu cầu reset password qua email
2. Nhận link reset password trong email
3. Nhập mật khẩu mới qua link đã nhận

## Luồng Hoạt Động (User Flow)

### Flow 1: Quên Mật Khẩu - Gửi Email

```
1. User click "Quên mật khẩu?" trong LoginModal
   ↓
2. ForgotPasswordModal mở ra
   ↓
3. User nhập email và submit
   ↓
4. Frontend gọi API: POST /api/user/forgot-password
   ↓
5. Backend gửi email chứa reset link
   ↓
6. Modal hiển thị thông báo "Kiểm tra email của bạn"
   ↓
7. User click "Quay lại đăng nhập" hoặc "Gửi lại email"
```

### Flow 2: Reset Password

```
1. User mở email và click vào reset link
   Link format: /reset-password/{token}?email={email}
   ↓
2. Browser mở ResetPasswordPage
   ↓
3. Page kiểm tra token và email từ URL
   ↓
4. User nhập mật khẩu mới và xác nhận
   ↓
5. Frontend gọi API: POST /api/user/reset-password
   Payload: { token, email, password, password_confirmation }
   ↓
6. Backend validate và update password
   ↓
7. Hiển thị Result success
   ↓
8. Auto redirect về Home sau 3 giây
   ↓
9. User có thể login với password mới
```

## Chi Tiết Triển Khai

### 1. ForgotPasswordModal Component

**File:** `src/components/Auth/ForgotPasswordModal.tsx`

**Props:**
```typescript
interface ForgotPasswordModalProps {
    visible: boolean;
    onClose: () => void;
    onBackToLogin: () => void;
}
```

**State:**
- `loading`: Trạng thái loading khi gửi email
- `emailSent`: Boolean để chuyển đổi giữa form input và success message

**Features:**
1. **Form Input Email:**
   - Input email với prefix MailOutlined icon
   - Validation: required, email format
   - Button "Gửi Email Khôi Phục"
   - Link "Quay lại đăng nhập"

2. **Success Screen:**
   - Icon email lớn trong vòng tròn
   - Title "Kiểm Tra Email Của Bạn"
   - Mô tả hướng dẫn
   - Button "Quay Lại Đăng Nhập"
   - Link "Gửi lại email"

**API Integration:**
```typescript
const handleSubmit = async (values: { email: string }) => {
    setLoading(true);
    try {
        const response = await authService.forgotPassword({ email: values.email });
        message.success(response.message);
        setEmailSent(true);
    } catch (error) {
        message.error(error.message);
    } finally {
        setLoading(false);
    }
};
```

### 2. ResetPasswordPage Component

**File:** `src/pages/Clients/Auth/ResetPasswordPage.tsx`

**Features:**
1. **URL Parameters:**
   - Token từ path params: `/reset-password/:token`
   - Email từ query params: `?email=user@example.com`

2. **Validation:**
   - Kiểm tra token và email tồn tại
   - Redirect về home nếu không hợp lệ

3. **Form:**
   - Email (disabled, chỉ hiển thị)
   - Mật khẩu mới (required, min 6 ký tự)
   - Xác nhận mật khẩu (required, phải khớp với password)
   - Button "Đặt Lại Mật Khẩu"

4. **Success Screen:**
   - Result component với status="success"
   - Title "Đặt Lại Mật Khẩu Thành Công!"
   - Button "Về Trang Chủ"
   - Auto redirect sau 3 giây

5. **Security Notes:**
   - Badge hiển thị yêu cầu mật khẩu
   - Icon CheckCircle cho từng yêu cầu

**API Integration:**
```typescript
const handleSubmit = async (values) => {
    const response = await authService.resetPassword({
        token,
        email,
        password: values.password,
        password_confirmation: values.password_confirmation,
    });
    
    message.success(response.message);
    setResetSuccess(true);
    
    setTimeout(() => {
        navigate('/');
    }, 3000);
};
```

### 3. CSS Styling

**File:** `src/pages/Clients/Auth/ResetPassword.css`

**Design:**
- Gradient background: #667eea → #764ba2
- Card với border-radius 16px và shadow
- Icon wrapper: Gradient #cb8670 → #a96d5a
- Animation: fadeInUp (0.6s)
- Responsive: Mobile-friendly

**Key Classes:**
- `.reset-password-page`: Full viewport, centered
- `.reset-password-card`: Main card container
- `.icon-wrapper`: Icon khóa với gradient background
- `.security-note`: Badge thông tin bảo mật

### 4. AuthService Updates

**File:** `src/service/authService.ts`

**Methods Added:**

```typescript
// Gửi email reset password
async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    const response = await axiosInstance.post('/user/forgot-password', data);
    return response.data;
}

// Reset password với token
async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    const response = await axiosInstance.post('/user/reset-password', data);
    return response.data;
}
```

**Types:**
```typescript
interface ForgotPasswordRequest {
    email: string;
}

interface ResetPasswordRequest {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
}
```

### 5. LoginModal Integration

**File:** `src/components/Auth/LoginModal.tsx`

**Updates:**
- Thêm prop `onSwitchToForgotPassword?: () => void`
- Link "Quên mật khẩu?" có 2 modes:
  - Nếu có `onSwitchToForgotPassword`: Mở ForgotPasswordModal
  - Nếu không: Navigate to `/forgot-password`

```typescript
{onSwitchToForgotPassword ? (
    <Button
        type="link"
        onClick={() => {
            onClose();
            onSwitchToForgotPassword();
        }}
    >
        Quên mật khẩu?
    </Button>
) : (
    <Link to="/forgot-password" onClick={handleCancel}>
        Quên mật khẩu?
    </Link>
)}
```

### 6. Header Component Updates

**File:** `src/components/layout/Header.tsx`

**State Added:**
```typescript
const [isForgotPasswordModalVisible, setIsForgotPasswordModalVisible] = useState(false);
```

**Handlers:**
```typescript
const handleSwitchToForgotPassword = () => {
    setIsLoginModalVisible(false);
    setIsForgotPasswordModalVisible(true);
};

const handleBackToLoginFromForgotPassword = () => {
    setIsForgotPasswordModalVisible(false);
    setIsLoginModalVisible(true);
};
```

**Modal Rendering:**
```tsx
<ForgotPasswordModal
    visible={isForgotPasswordModalVisible}
    onClose={handleCloseForgotPasswordModal}
    onBackToLogin={handleBackToLoginFromForgotPassword}
/>
```

### 7. App.tsx Routes

**File:** `src/App.tsx`

**Route Added:**
```tsx
<Route path="/reset-password/:token" element={<ResetPasswordPage />} />
```

## Backend API

### 1. Forgot Password Endpoint

**Endpoint:** `POST /api/user/forgot-password`

**Request:**
```json
{
    "email": "user@example.com"
}
```

**Response Success (200):**
```json
{
    "message": "Email khôi phục mật khẩu đã được gửi."
}
```

**Response Error (422):**
```json
{
    "message": "...",
    "errors": {
        "email": ["Email này chưa được đăng ký."]
    }
}
```

**Validation Rules:**
- email: required, email format, exists in users table

**Backend Logic:**
1. Validate email
2. Tạo reset token (Laravel Password::sendResetLink)
3. Lưu token vào database (password_reset_tokens table)
4. Gửi email với link reset
5. Return success message

### 2. Reset Password Endpoint

**Endpoint:** `POST /api/user/reset-password`

**Request:**
```json
{
    "token": "abc123xyz...",
    "email": "user@example.com",
    "password": "newpassword123",
    "password_confirmation": "newpassword123"
}
```

**Response Success (200):**
```json
{
    "message": "Đặt lại mật khẩu thành công."
}
```

**Response Error (400):**
```json
{
    "message": "Mã xác nhận không hợp lệ hoặc đã hết hạn."
}
```

**Validation Rules:**
- token: required
- email: required, email format, exists in users
- password: required, min 6, confirmed

**Backend Logic:**
1. Validate input
2. Check token validity (Laravel Password::reset)
3. Update user password với Hash::make()
4. Generate new remember_token
5. Trigger PasswordReset event
6. Return success/error message

### 3. Email Template

**File:** `app/Notifications/ResetPassword.php`

**Email Content:**
- Subject: "Đặt lại mật khẩu"
- Greeting: "Xin chào!"
- Lines:
  - "Bạn nhận được email này vì chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn."
  - Button "Đặt lại mật khẩu" với link
  - "Link này sẽ hết hạn sau 60 phút."
  - "Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này."

**Link Format:**
```
http://localhost:5173/reset-password/{token}?email={email}
```

## Security Features

### 1. Token Security
- Token được hash trong database
- Expire sau 60 phút
- Token chỉ dùng được 1 lần
- Token được generate random bởi Laravel

### 2. Email Verification
- Email phải tồn tại trong database
- Email phải match với token

### 3. Password Requirements
- Minimum 6 ký tự
- Phải có confirmation
- Được hash với bcrypt

### 4. Rate Limiting
- Backend có thể implement rate limiting cho forgot-password endpoint
- Prevent spam email

## Testing

### Test Cases

#### 1. Test Forgot Password - Email Hợp Lệ
**Input:** Email tồn tại trong database
**Expected:**
- API trả về 200
- Message success
- Email được gửi
- Modal hiển thị success screen

#### 2. Test Forgot Password - Email Không Tồn Tại
**Input:** Email không tồn tại
**Expected:**
- API trả về 422
- Error message: "Email này chưa được đăng ký."
- Modal vẫn ở form input

#### 3. Test Forgot Password - Email Không Hợp Lệ
**Input:** Email format sai (example@)
**Expected:**
- Frontend validation lỗi
- Message: "Email không hợp lệ!"

#### 4. Test Reset Password - Success
**Input:** Token hợp lệ, email đúng, password match
**Expected:**
- API trả về 200
- Password được update
- Hiển thị Result success
- Auto redirect sau 3s
- User có thể login với password mới

#### 5. Test Reset Password - Token Hết Hạn
**Input:** Token quá 60 phút
**Expected:**
- API trả về 400
- Message: "Mã xác nhận không hợp lệ hoặc đã hết hạn."

#### 6. Test Reset Password - Password Không Khớp
**Input:** password !== password_confirmation
**Expected:**
- Frontend validation lỗi
- Message: "Mật khẩu xác nhận không khớp!"

#### 7. Test Reset Password - Password Quá Ngắn
**Input:** password.length < 6
**Expected:**
- Frontend validation lỗi
- Message: "Mật khẩu phải có ít nhất 6 ký tự!"

#### 8. Test Modal Navigation
**Input:** Click "Quên mật khẩu?" trong LoginModal
**Expected:**
- LoginModal đóng
- ForgotPasswordModal mở

**Input:** Click "Quay lại đăng nhập" trong ForgotPasswordModal
**Expected:**
- ForgotPasswordModal đóng
- LoginModal mở

## Cấu Trúc File

```
FE-DATN/
├── src/
│   ├── components/
│   │   └── Auth/
│   │       ├── LoginModal.tsx              # Cập nhật: Thêm onSwitchToForgotPassword
│   │       ├── ForgotPasswordModal.tsx     # MỚI: Modal quên mật khẩu
│   │       └── index.ts                    # Export ForgotPasswordModal
│   ├── pages/
│   │   └── Clients/
│   │       └── Auth/
│   │           ├── ResetPasswordPage.tsx   # MỚI: Trang reset password
│   │           ├── ResetPassword.css       # MỚI: Styling
│   │           └── index.ts                # Export ResetPasswordPage
│   ├── components/
│   │   └── layout/
│   │       └── Header.tsx                  # Cập nhật: Thêm ForgotPasswordModal
│   ├── service/
│   │   └── authService.ts                  # Có sẵn: forgotPassword, resetPassword
│   └── App.tsx                             # Cập nhật: Route /reset-password/:token

BE-DATN/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       └── User/
│   │           └── AuthController.php      # Có sẵn: forgotPassword, resetPassword
│   └── Notifications/
│       └── ResetPassword.php               # Có sẵn: Email template
└── routes/
    └── api.php                             # Có sẵn: Routes đã định nghĩa
```

## Environment Variables

**Frontend (.env):**
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

**Backend (.env):**
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io  # Hoặc Gmail, etc.
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@palatinhotel.com
MAIL_FROM_NAME="Palatin Hotel"

APP_URL=http://localhost:5173  # Frontend URL cho reset link
```

## Troubleshooting

### Issue 1: Email Không Được Gửi
**Nguyên nhân:**
- Cấu hình MAIL trong .env chưa đúng
- SMTP server không hoạt động

**Giải pháp:**
- Kiểm tra log: `storage/logs/laravel.log`
- Test SMTP connection
- Dùng Mailtrap cho development

### Issue 2: Token Không Hợp Lệ
**Nguyên nhân:**
- Token đã hết hạn (>60 phút)
- Token đã được sử dụng
- Email không match với token

**Giải pháp:**
- Request lại forgot password
- Kiểm tra bảng `password_reset_tokens`

### Issue 3: Reset Link Không Hoạt Động
**Nguyên nhân:**
- APP_URL trong backend .env không đúng
- Frontend route chưa setup

**Giải pháp:**
- Set APP_URL = Frontend URL
- Kiểm tra route `/reset-password/:token` exists

## Cải Tiến Tương Lai

### 1. Two-Factor Reset
- Gửi OTP qua SMS
- Verify OTP trước khi show form reset

### 2. Password Strength Meter
- Real-time check password strength
- Visual indicator (weak/medium/strong)

### 3. History Tracking
- Log tất cả reset password attempts
- Alert user nếu có attempt đáng ngờ

### 4. Rate Limiting
- Giới hạn số lần request forgot password
- Cooldown period giữa các request

### 5. Custom Email Template
- Design email đẹp hơn với HTML/CSS
- Thêm logo, brand colors
- Responsive email design

## Tóm Tắt

✅ **Đã hoàn thành:**
- ForgotPasswordModal component với form và success screen
- ResetPasswordPage với validation và auto-redirect
- Integration với backend API đầy đủ
- Modal navigation flow (Login ↔ ForgotPassword)
- Security features (token expiry, validation)
- Error handling và user feedback
- Responsive design

🎯 **Mục tiêu đạt được:**
- User có thể reset password khi quên
- Email được gửi tự động với reset link
- Token-based security với expiry
- UX mượt mà với modal flow
- Code dễ maintain và mở rộng

📧 **Email Flow:**
1. User nhập email → Gửi request
2. Backend tạo token và gửi email
3. User click link trong email
4. Reset password thành công
5. User login với password mới
