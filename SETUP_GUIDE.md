# 🚀 Hướng dẫn Setup và Sử dụng Frontend

## 📦 Các Service đã được tạo

### 1. **AuthService** - Xác thực người dùng
```typescript
import authService from '@/service/authService';

// Đăng ký
await authService.register({
  name: "John Doe",
  email: "john@example.com",
  password: "password123",
  password_confirmation: "password123"
});

// Đăng nhập
await authService.login({
  email: "john@example.com",
  password: "password123"
});

// Lấy thông tin user hiện tại
const user = await authService.me();

// Đăng xuất
await authService.logout();

// Kiểm tra đã đăng nhập
if (authService.isAuthenticated()) {
  // ...
}
```

### 2. **InvoiceService** - Quản lý Hóa đơn
```typescript
import invoiceService from '@/service/invoiceService';

// Lấy danh sách hóa đơn
const invoices = await invoiceService.getAll();

// Tạo hóa đơn từ booking
const invoice = await invoiceService.createFromBooking(bookingId);

// Đánh dấu đã thanh toán
await invoiceService.markAsPaid(invoiceId, {
  payment_method: "bank_transfer",
  payment_date: "2025-11-12"
});

// Áp dụng giảm giá
await invoiceService.applyDiscount(invoiceId, {
  discount_type: "percentage",
  discount_value: 10
});

// Lấy thống kê
const stats = await invoiceService.getStatistics();
```

### 3. **InvoiceItemService** - Quản lý mục hóa đơn
```typescript
import invoiceItemService from '@/service/invoiceItemService';

// Lấy items theo invoice
const items = await invoiceItemService.getByInvoice(invoiceId);

// Thêm mục phạt
await invoiceItemService.addPenaltyItem(invoiceId, {
  description: "Phạt hỏng đồ",
  quantity: 1,
  unit_price: 500000
});

// Tạo nhiều items cùng lúc
await invoiceItemService.bulkCreate([
  { description: "Item 1", quantity: 1, unit_price: 100000 },
  { description: "Item 2", quantity: 2, unit_price: 200000 }
]);
```

### 4. **SupplyService** - Quản lý Vật tư
```typescript
import supplyService from '@/service/supplyService';

// Lấy vật tư sắp hết
const lowStock = await supplyService.getLowStock();

// Điều chỉnh tồn kho
await supplyService.adjustStock(supplyId, 10); // +10
await supplyService.adjustStock(supplyId, -5); // -5

// Lấy thống kê
const stats = await supplyService.getStatistics();
```

### 5. **SupplyLogService** - Lịch sử Vật tư
```typescript
import supplyLogService from '@/service/supplyLogService';

// Lấy lịch sử của một vật tư
const logs = await supplyLogService.getSupplyLogs(supplyId);

// Lấy hoạt động gần đây
const activities = await supplyLogService.getRecentActivities(20);

// Tóm tắt di chuyển
const summary = await supplyLogService.getMovementSummary({
  supply_id: 1,
  date_from: "2025-11-01",
  date_to: "2025-11-12"
});
```

### 6. **UserService** - Quản lý Người dùng
```typescript
import userService from '@/service/userService';

// Lấy danh sách người dùng
const { data, total } = await userService.getAll({
  page: 1,
  per_page: 15,
  search: "John",
  role: "admin"
});

// Khóa/Mở khóa user
await userService.block(userId, "Vi phạm quy định");
await userService.unblock(userId);

// Cập nhật vai trò
await userService.updateRole(userId, "admin");

// Lấy thống kê
const stats = await userService.getStatistics();
```

### 7. **PromotionService** - Quản lý Khuyến mãi
```typescript
import promotionService from '@/service/promotionService';

// Lấy khuyến mãi đang hoạt động
const activePromotions = await promotionService.getActivePromotions();

// Kiểm tra mã khuyến mãi
const validation = await promotionService.validateCode("SUMMER2025", 1000000);
if (validation.valid) {
  // Áp dụng mã
}

// CRUD
await promotionService.create(promotionData);
await promotionService.update(id, promotionData);
await promotionService.remove(id);
```

### 8. **ReviewService** - Quản lý Đánh giá
```typescript
import reviewService from '@/service/reviewService';

// Lấy đánh giá theo property
const reviews = await reviewService.getByProperty(propertyId);

// Phê duyệt/Từ chối
await reviewService.approve(reviewId);
await reviewService.reject(reviewId, "Nội dung không phù hợp");

// Đánh dấu hữu ích
await reviewService.markHelpful(reviewId);
```

### 9. **BookingService** - Quản lý Đặt phòng
```typescript
import { listBookings, createBooking, updateBookingStatus } from '@/service/bookingService';

// Lấy danh sách booking
const { data, pagination } = await listBookings({
  page: 1,
  per_page: 15,
  status: ['confirmed', 'pending']
});

// Tạo booking mới
await createBooking({
  customer_name: "John Doe",
  customer_phone: "0123456789",
  total_amount: 1500000,
  details: [
    {
      room_id: 1,
      check_in_date: "2025-11-15",
      check_out_date: "2025-11-18",
      num_adults: 2,
      num_children: 0,
      sub_total: 1500000
    }
  ]
});

// Cập nhật trạng thái
await updateBookingStatus(bookingId, 'confirmed');
```

## 🎨 Các Trang giao diện đã tạo

### 1. **Dashboard** (`/admin/dashboard`)
- Thống kê tổng quan doanh thu, hóa đơn, đơn đặt phòng
- Biểu đồ và cards thống kê
- Bảng hóa đơn gần đây và vật tư sắp hết

### 2. **Quản lý Hóa đơn** (`/admin/invoice`)
- Danh sách hóa đơn với filters
- Cards thống kê: Tổng doanh thu, Tổng hóa đơn, Chờ thanh toán, Quá hạn
- Chức năng: Xem, Sửa, Xóa, Đánh dấu đã thanh toán
- Tìm kiếm và lọc theo trạng thái

### 3. **Lịch sử Vật tư** (`/admin/supply-logs`)
- Danh sách logs với timeline
- Cards thống kê: Tổng nhập, Tổng xuất, Tổng giá trị
- Timeline hoạt động gần đây
- Filter theo loại hành động và khoảng thời gian

### 4. **Quản lý Người dùng** (`/admin/users`)
- Danh sách người dùng với API integration
- Cards thống kê: Tổng users, Đang hoạt động, Bị khóa, Mới tháng này
- Chức năng: Thêm, Sửa, Xóa, Khóa/Mở khóa
- Filter theo vai trò và trạng thái
- Search users

### 5. **Đăng nhập** (`/login`)
- Form đăng nhập với validation
- Lưu token tự động
- Redirect based on role
- Giao diện đẹp với gradient background

### 6. **Đăng ký** (`/register`)
- Form đăng ký với validation đầy đủ
- Password confirmation
- Field-level error messages
- Tự động đăng nhập sau khi đăng ký thành công

## 🛠️ Cấu trúc Project

```
FE-DATN/src/
├── service/              # API Services
│   ├── authService.ts
│   ├── invoiceService.ts
│   ├── invoiceItemService.ts
│   ├── supplyService.ts
│   ├── supplyLogService.ts
│   ├── userService.ts
│   ├── promotionService.ts
│   ├── reviewService.ts
│   └── bookingService.ts
├── types/                # TypeScript Types
│   ├── invoice/
│   │   └── invoice.ts
│   ├── supply/
│   │   └── supplyLog.ts
│   ├── promotion/
│   ├── review/
│   └── user/
└── pages/
    ├── Admin/
    │   ├── Dashboard.tsx
    │   ├── quanlihoadon/
    │   │   └── listInvoice.tsx
    │   ├── quanlivattu/
    │   │   └── supplyLogs.tsx
    │   └── quanlinguoidung/
    │       └── ListUser.tsx (updated)
    └── Auth/
        ├── LoginPage.tsx
        └── RegisterPage.tsx
```

## 🔑 Token Management

Token được tự động lưu vào `localStorage` khi đăng nhập:
- `accessToken`: Bearer token
- `user`: Thông tin user (JSON)

Axios interceptor tự động thêm token vào headers:
```typescript
Authorization: Bearer {token}
```

## 🎯 Next Steps

### Routes cần thêm vào Router:
```typescript
// Dashboard
<Route path="/admin/dashboard" element={<Dashboard />} />

// Invoice
<Route path="/admin/invoice" element={<ListInvoice />} />

// Supply Logs
<Route path="/admin/supply-logs" element={<SupplyLogs />} />

// Auth
<Route path="/login" element={<LoginPage />} />
<Route path="/register" element={<RegisterPage />} />
```

### Protected Routes:
```typescript
import authService from '@/service/authService';

const ProtectedRoute = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  return children;
};

// Sử dụng
<Route 
  path="/admin/*" 
  element={
    <ProtectedRoute>
      <AdminLayout />
    </ProtectedRoute>
  } 
/>
```

## 📊 Toast Notifications

Đã đồng bộ tất cả thông báo sang `react-toastify`:
```typescript
import { toast } from "react-toastify";

toast.success("Thành công!");
toast.error("Lỗi xảy ra!");
toast.warning("Cảnh báo!");
toast.info("Thông tin!");
```

## ✅ Completed Features

- ✅ 9 Services tích hợp API Backend
- ✅ 6 Trang giao diện mới
- ✅ Toast notifications đồng bộ
- ✅ TypeScript types đầy đủ
- ✅ API error handling
- ✅ Loading states
- ✅ Statistics cards
- ✅ Search & Filter functions
- ✅ CRUD operations
- ✅ Authentication flow
- ✅ Token management

## 🚀 Ready to Use!

Tất cả các service và trang giao diện đã sẵn sàng sử dụng. Chỉ cần:
1. Thêm routes vào router
2. Kết nối với Backend API
3. Customize theo nhu cầu của bạn

Happy coding! 🎉



