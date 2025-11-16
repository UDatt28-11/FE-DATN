# User Menu Feature - Header Authentication UI

## Tổng quan
Tính năng hiển thị menu người dùng trên Header sau khi đăng nhập thành công.

## Cập nhật

### 1. Header Component (`src/components/Layout/Header.tsx`)

#### Import mới:
```tsx
import { Button, Dropdown, Avatar, message } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, DashboardOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
```

#### State & Hooks:
```tsx
const { isLoggedIn, user, logout } = useAuth();
const navigate = useNavigate();
```

#### Chức năng chính:

**1. User Menu Items:**
- **Thông tin cá nhân** (Profile): Điều hướng đến `/profile`
- **Đơn đặt phòng** (My Bookings): Điều hướng đến `/my-bookings`
- **Cài đặt** (Settings): Điều hướng đến `/settings`
- **Đăng xuất** (Logout): Gọi API logout và xóa session

**2. Hiển thị động:**
```tsx
{isLoggedIn ? (
  <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
    <div className="user-menu-avatar">
      <Avatar size={40} icon={<UserOutlined />} />
      <span className="user-menu-name">{user?.full_name || 'User'}</span>
    </div>
  </Dropdown>
) : (
  <Button onClick={handleLoginClick}>Đăng Nhập</Button>
)}
```

**3. Handle Logout:**
```tsx
const handleLogout = async () => {
  try {
    await logout();
    message.success('Đăng xuất thành công!');
    navigate('/');
    closeMenu();
  } catch (error) {
    message.error('Đăng xuất thất bại!');
  }
};
```

### 2. CSS Styles (`src/components/Layout/Header.css`)

#### User Avatar Container:
```css
.user-menu-avatar {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 25px;
  transition: all 0.3s ease;
}

.user-menu-avatar:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
```

#### User Name Text:
```css
.user-menu-name {
  color: #ffffff;
  font-weight: 500;
  font-size: 15px;
}
```

#### Dropdown Menu Styling:
```css
.ant-dropdown .ant-dropdown-menu {
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  min-width: 200px;
}

.ant-dropdown .ant-dropdown-menu-item {
  padding: 10px 16px;
  font-size: 14px;
  transition: all 0.3s ease;
}
```

#### Responsive Design:
```css
@media only screen and (max-width: 767px) {
  .user-menu-avatar {
    padding: 5px;
  }

  .user-menu-name {
    display: none; /* Ẩn tên trên mobile, chỉ hiện avatar */
  }
}
```

## Luồng hoạt động

### Trước khi đăng nhập:
1. Header hiển thị button "Đăng Nhập"
2. Click vào button → Mở LoginModal
3. Đăng nhập thành công → Context update → Header re-render

### Sau khi đăng nhập:
1. Button "Đăng Nhập" biến mất
2. Hiển thị Avatar + Tên người dùng
3. Click vào Avatar → Dropdown menu xuất hiện
4. Menu items:
   - Thông tin cá nhân → `/profile`
   - Đơn đặt phòng → `/my-bookings`
   - Cài đặt → `/settings`
   - Đăng xuất → Logout + Redirect về home

### Khi đăng xuất:
1. Click "Đăng xuất"
2. Gọi `logout()` từ AuthContext
3. API call: `POST /api/user/logout`
4. Xóa token & user data từ localStorage
5. Update context: `isLoggedIn = false`, `user = null`
6. Header re-render → Hiển thị lại button "Đăng Nhập"
7. Redirect về trang chủ `/`

## Dependencies

### Ant Design Components:
- `Dropdown`: Container cho user menu
- `Avatar`: Hiển thị icon người dùng
- `message`: Thông báo success/error

### Ant Design Icons:
- `UserOutlined`: Icon user chính
- `LogoutOutlined`: Icon đăng xuất
- `SettingOutlined`: Icon cài đặt
- `DashboardOutlined`: Icon đơn đặt phòng

### React Router:
- `useNavigate`: Điều hướng trang
- `useLocation`: Kiểm tra route hiện tại

### Custom Hooks:
- `useAuth`: Lấy auth state (isLoggedIn, user, logout)

## Testing

### Test Case 1: Hiển thị button đăng nhập
- **Điều kiện**: Chưa đăng nhập
- **Kết quả**: Button "Đăng Nhập" hiển thị

### Test Case 2: Hiển thị user menu sau đăng nhập
- **Điều kiện**: Đã đăng nhập
- **Kết quả**: Avatar + tên người dùng hiển thị

### Test Case 3: Menu dropdown
- **Thao tác**: Click vào avatar
- **Kết quả**: Dropdown menu hiển thị với 4 items

### Test Case 4: Điều hướng từ menu
- **Thao tác**: Click "Thông tin cá nhân"
- **Kết quả**: Điều hướng đến `/profile`

### Test Case 5: Đăng xuất
- **Thao tác**: Click "Đăng xuất"
- **Kết quả**: 
  - Hiển thị message success
  - Redirect về home
  - Button "Đăng Nhập" xuất hiện lại

### Test Case 6: Responsive
- **Điều kiện**: Mobile view (< 768px)
- **Kết quả**: Chỉ hiển thị avatar, ẩn tên người dùng

## Lưu ý

1. **Avatar màu sắc**: Sử dụng màu `#d89070` (màu chủ đạo của Palatin Hotel)
2. **Mobile friendly**: Tên người dùng ẩn trên mobile để tiết kiệm không gian
3. **Error handling**: Xử lý lỗi khi logout thất bại
4. **Navigation**: Tự động close menu mobile sau khi navigate
5. **Accessibility**: Dropdown trigger bằng click, dễ sử dụng trên touch device

## Các route cần tạo

Hiện tại các route sau chưa tồn tại, cần tạo trong tương lai:
- `/profile` - Trang thông tin cá nhân
- `/my-bookings` - Trang danh sách đơn đặt phòng
- `/settings` - Trang cài đặt tài khoản

## Next Steps

1. ✅ Tạo user menu dropdown trên header
2. ✅ Tích hợp với AuthContext
3. ✅ Xử lý logout
4. ⏳ Tạo trang Profile
5. ⏳ Tạo trang My Bookings
6. ⏳ Tạo trang Settings
7. ⏳ Thêm upload avatar cho user
8. ⏳ Thêm notification badge (số lượng booking chưa đọc)
