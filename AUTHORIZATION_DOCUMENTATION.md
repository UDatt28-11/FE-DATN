# Tài Liệu Phân Quyền - Authentication & Authorization

## Tổng Quan

Hệ thống phân quyền đã được triển khai để đảm bảo chỉ người dùng đã đăng nhập mới có thể đặt phòng và thanh toán. Điều này giúp:
- Bảo vệ các trang nhạy cảm
- Cải thiện trải nghiệm người dùng
- Đảm bảo tính bảo mật cho dữ liệu booking
- Ngăn chặn spam và booking ảo

## Các Trang Được Bảo Vệ

### 1. Trang Thông Tin Đặt Phòng (`/booking/info`)
- **Yêu cầu**: Người dùng phải đăng nhập
- **Hành vi**: Nếu chưa đăng nhập, hiển thị trang cảnh báo với nút "Về trang chủ để đăng nhập"
- **Mục đích**: Thu thập thông tin người đặt phòng (họ tên, SĐT, email, CCCD)

### 2. Trang Thanh Toán (`/booking/payment`)
- **Yêu cầu**: Người dùng phải đăng nhập
- **Hành vi**: Tương tự `/booking/info`
- **Mục đích**: Xác nhận phương thức thanh toán và hoàn tất booking

### 3. Trang Quản Lý Booking (`/my-bookings`)
- **Yêu cầu**: Người dùng phải đăng nhập
- **Hành vi**: Tương tự các trang trên
- **Mục đích**: Xem lịch sử và quản lý các booking đã tạo

### 4. Trang Profile (`/profile`)
- **Yêu cầu**: Người dùng phải đăng nhập
- **Hành vi**: Tương tự các trang trên
- **Mục đích**: Quản lý thông tin cá nhân, đổi mật khẩu, upload avatar

### 5. Trang Settings (`/settings`)
- **Yêu cầu**: Người dùng phải đăng nhập
- **Hành vi**: Tương tự các trang trên
- **Mục đích**: Cài đặt tùy chọn cá nhân

## Triển Khai Chi Tiết

### 1. Component `ProtectedRoute`

**File**: `src/components/Auth/ProtectedRoute.tsx`

```tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}
```

**Chức năng**:
- Kiểm tra trạng thái đăng nhập từ `AuthContext`
- Hiển thị loading khi đang kiểm tra authentication
- Hiển thị trang cảnh báo nếu chưa đăng nhập
- Cho phép truy cập nếu đã đăng nhập

**Giao diện cảnh báo**:
- Icon khóa (LockOutlined)
- Tiêu đề: "Yêu cầu đăng nhập"
- Mô tả: "Bạn cần đăng nhập để thực hiện đặt phòng và thanh toán."
- Nút: "Về trang chủ để đăng nhập"

### 2. Áp Dụng trong `App.tsx`

**Các route được bảo vệ**:
```tsx
<Route 
  path="/booking/info" 
  element={
    <ProtectedRoute>
      <BookingInfoPage />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/booking/payment" 
  element={
    <ProtectedRoute>
      <PaymentPage />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/my-bookings" 
  element={
    <ProtectedRoute>
      <MyBookingsPage />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/profile" 
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/settings" 
  element={
    <ProtectedRoute>
      <Settings />
    </ProtectedRoute>
  } 
/>
```

### 3. Cải Tiến `RoomDetailPage`

**Thay đổi**:
1. Import `useAuth`, `LoginModal`, `RegisterModal`
2. Thêm state cho modal đăng nhập/đăng ký
3. Kiểm tra đăng nhập trong hàm `handleBooking()`
4. Hiển thị modal đăng nhập nếu chưa đăng nhập

**Code mới trong `handleBooking()`**:
```tsx
// Kiểm tra đăng nhập
if (!isLoggedIn) {
    message.warning('Vui lòng đăng nhập để đặt phòng!');
    setIsLoginModalVisible(true);
    return;
}
```

**Modal components**:
```tsx
<LoginModal
    visible={isLoginModalVisible}
    onClose={() => setIsLoginModalVisible(false)}
    onSwitchToRegister={() => {
        setIsLoginModalVisible(false);
        setIsRegisterModalVisible(true);
    }}
/>
<RegisterModal
    visible={isRegisterModalVisible}
    onClose={() => setIsRegisterModalVisible(false)}
    onSwitchToLogin={() => {
        setIsRegisterModalVisible(false);
        setIsLoginModalVisible(true);
    }}
/>
```

## User Flow

### Flow Người Dùng Chưa Đăng Nhập

1. **Bước 1**: User vào trang chi tiết phòng (`/rooms/:id`)
2. **Bước 2**: User chọn ngày, số khách, nhấn "Đặt phòng ngay"
3. **Bước 3**: Hệ thống kiểm tra authentication
4. **Bước 4**: Hiển thị modal đăng nhập với thông báo
5. **Bước 5**: User đăng nhập/đăng ký
6. **Bước 6**: Sau khi đăng nhập thành công, modal đóng
7. **Bước 7**: User nhấn lại "Đặt phòng ngay"
8. **Bước 8**: Chuyển đến `/booking/info`

### Flow Người Dùng Đã Đăng Nhập

1. **Bước 1**: User vào trang chi tiết phòng
2. **Bước 2**: User chọn ngày, số khách, nhấn "Đặt phòng ngay"
3. **Bước 3**: Chuyển thẳng đến `/booking/info`
4. **Bước 4**: User nhập thông tin → Chuyển đến `/booking/payment`
5. **Bước 5**: User chọn phương thức thanh toán → Hoàn tất booking

### Flow Truy Cập Trực Tiếp URL Được Bảo Vệ

1. **Bước 1**: User gõ trực tiếp URL `/booking/info` hoặc `/booking/payment`
2. **Bước 2**: `ProtectedRoute` kiểm tra authentication
3. **Bước 3**: Hiển thị trang cảnh báo với Result component
4. **Bước 4**: User nhấn "Về trang chủ để đăng nhập"
5. **Bước 5**: Redirect về trang chủ
6. **Bước 6**: User đăng nhập từ header
7. **Bước 7**: User phải bắt đầu lại flow booking từ trang phòng

## Lợi Ích

### 1. Bảo Mật
- Ngăn chặn anonymous booking
- Đảm bảo mọi booking đều có thông tin user hợp lệ
- Dễ dàng tracking và quản lý booking

### 2. Trải Nghiệm Người Dùng
- Thông báo rõ ràng khi cần đăng nhập
- Modal đăng nhập/đăng ký tiện lợi ngay tại trang
- Không cần redirect phức tạp

### 3. Quản Lý Dữ Liệu
- Liên kết booking với user account
- Cho phép user xem lịch sử booking
- Hỗ trợ tính năng notification và email

### 4. Tính Năng Mở Rộng
- Dễ dàng thêm loyalty points
- Hỗ trợ member pricing
- Lưu thông tin thanh toán cho lần sau
- Booking history và analytics

## Testing

### Test Cases

1. **Test truy cập trang được bảo vệ khi chưa đăng nhập**
   - Expected: Hiển thị Result component với thông báo
   - Action: Truy cập `/booking/info`, `/booking/payment`, `/my-bookings`, `/profile`, `/settings`

2. **Test truy cập trang được bảo vệ khi đã đăng nhập**
   - Expected: Hiển thị nội dung trang bình thường
   - Action: Đăng nhập → Truy cập các trang được bảo vệ

3. **Test booking từ RoomDetailPage khi chưa đăng nhập**
   - Expected: Hiển thị modal đăng nhập
   - Action: Vào `/rooms/1` → Chọn ngày → Nhấn "Đặt phòng ngay"

4. **Test booking từ RoomDetailPage khi đã đăng nhập**
   - Expected: Navigate đến `/booking/info`
   - Action: Đăng nhập → Vào `/rooms/1` → Chọn ngày → Nhấn "Đặt phòng ngay"

5. **Test đăng nhập từ modal trong RoomDetailPage**
   - Expected: Modal đóng, có thể tiếp tục booking
   - Action: Mở modal đăng nhập → Nhập thông tin → Đăng nhập thành công

## Cấu Trúc File

```
FE-DATN/
├── src/
│   ├── components/
│   │   └── Auth/
│   │       ├── LoginModal.tsx          # Modal đăng nhập
│   │       ├── RegisterModal.tsx       # Modal đăng ký
│   │       ├── ProtectedRoute.tsx      # Component bảo vệ route ✨ MỚI
│   │       └── index.ts                # Export các component Auth
│   ├── pages/
│   │   └── Clients/
│   │       ├── Booking/
│   │       │   ├── BookingInfoPage.tsx        # Được bảo vệ
│   │       │   ├── PaymentPage.tsx            # Được bảo vệ
│   │       │   └── MyBookingsPage.tsx         # Được bảo vệ
│   │       ├── Profile/
│   │       │   └── Profile.tsx                # Được bảo vệ
│   │       ├── Settings/
│   │       │   └── Settings.tsx               # Được bảo vệ
│   │       └── Rooms/
│   │           └── RoomDetailPage.tsx         # Có kiểm tra đăng nhập ✨ CẬP NHẬT
│   ├── context/
│   │   └── AuthContext.tsx             # Context quản lý authentication
│   └── App.tsx                         # Route configuration ✨ CẬP NHẬT
```

## Ghi Chú Kỹ Thuật

### AuthContext
- Cung cấp `isLoggedIn`, `user`, `loading`
- `loading` = true khi đang kiểm tra localStorage
- Tự động kiểm tra token và user data từ localStorage khi app khởi động

### ProtectedRoute Props
- `children`: React node cần được bảo vệ
- `requireAuth`: Boolean (default = true) để bật/tắt bảo vệ

### Message vs Modal
- **RoomDetailPage**: Sử dụng modal để giữ user tại trang, tăng conversion rate
- **Direct URL access**: Sử dụng Result page để thông báo rõ ràng và redirect

## Cải Tiến Tương Lai

1. **Remember Booking Intent**
   - Lưu booking data khi user chưa đăng nhập
   - Sau khi đăng nhập, tự động điền thông tin và tiếp tục booking

2. **Social Login**
   - Đăng nhập bằng Google, Facebook
   - Giảm friction trong flow đăng ký

3. **Guest Checkout**
   - Cho phép booking không cần tài khoản
   - Tạo temporary account và gửi link activate qua email

4. **Role-Based Access**
   - Phân quyền admin, user, staff
   - Các trang admin được bảo vệ riêng

## Tóm Tắt

✅ **Đã hoàn thành**:
- Component `ProtectedRoute` để bảo vệ routes
- Áp dụng cho 5 trang: `/booking/info`, `/booking/payment`, `/my-bookings`, `/profile`, `/settings`
- Kiểm tra đăng nhập trong `RoomDetailPage`
- Modal đăng nhập/đăng ký trong `RoomDetailPage`
- Thông báo thân thiện cho user

🎯 **Mục tiêu đạt được**:
- Chỉ user đã đăng nhập mới được đặt phòng và thanh toán
- UX tốt với modal và thông báo rõ ràng
- Code dễ maintain và mở rộng
- Bảo mật dữ liệu booking
