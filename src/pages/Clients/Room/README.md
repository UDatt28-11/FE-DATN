# Room Pages

Trang xem danh sách và chi tiết phòng khách sạn.

## Trang đã tạo

### 1. RoomListPage (`/rooms`)
- Hiển thị danh sách tất cả các phòng
- Lọc theo loại phòng (Standard, Superior, Deluxe, Suite, Family, Executive)
- Sắp xếp theo giá hoặc đánh giá
- Hiển thị thông tin: tên phòng, giá, đánh giá, số khách, vị trí
- Link đến trang chi tiết

### 2. RoomDetailPage (`/room/:id`)
- Hiển thị thông tin chi tiết phòng
- Thư viện ảnh với Image Preview
- Thông tin cơ bản: loại giường, diện tích, số khách tối đa
- Danh sách tiện nghi đầy đủ
- Đánh giá từ khách hàng
- Form đặt phòng (sử dụng BookingFilter component)
- Chính sách phòng

## Cấu trúc file

```
src/pages/Clients/Room/
├── RoomListPage.tsx     # Trang danh sách phòng
├── RoomDetailPage.tsx   # Trang chi tiết phòng
└── README.md            # File này
```

## Routes đã thêm

```tsx
// Trong App.tsx
<Route path="/rooms" element={<RoomListPage />} />
<Route path="/room/:id" element={<RoomDetailPage />} />
```

## Tính năng

### RoomListPage
- ✅ Hiển thị grid responsive (3 cột desktop, 2 cột tablet, 1 cột mobile)
- ✅ Filter theo loại phòng
- ✅ Sắp xếp theo giá (thấp->cao, cao->thấp)
- ✅ Sắp xếp theo đánh giá
- ✅ Hiển thị số lượng phòng tìm thấy
- ✅ Link đến trang chi tiết

### RoomDetailPage
- ✅ Breadcrumb navigation
- ✅ Tiêu đề phòng + rating
- ✅ Tag loại phòng
- ✅ Thông tin cơ bản (giường, diện tích, số khách)
- ✅ Gallery ảnh với preview
- ✅ Mô tả chi tiết
- ✅ Danh sách tiện nghi với icons
- ✅ Đánh giá từ khách hàng
- ✅ Form đặt phòng (sticky sidebar)
- ✅ Chính sách check-in/check-out
- ✅ Xử lý 404 (phòng không tồn tại)

## Components sử dụng

- `AppHeader` - Header chung
- `AppFooter` - Footer chung
- `BookingFilter` - Form đặt phòng reusable
- Ant Design components: Layout, Card, Rate, Breadcrumb, Image, List, Affix, Select, etc.

## Dữ liệu mẫu

Hiện tại sử dụng dữ liệu mock với 6 loại phòng:
1. **Deluxe Room** - 1,500,000đ/đêm
2. **Suite Room** - 2,500,000đ/đêm
3. **Standard Room** - 800,000đ/đêm
4. **Family Room** - 2,000,000đ/đêm
5. **Superior Twin** - 1,200,000đ/đêm
6. **Executive Suite** - 3,500,000đ/đêm

Mỗi phòng có:
- ID unique
- Tên, loại, giá
- Rating và số lượng reviews
- Vị trí trong khách sạn
- Mô tả chi tiết
- Loại giường, diện tích, số khách tối đa
- Danh sách tiện nghi
- Gallery 2-3 ảnh
- Reviews từ khách hàng

## Tích hợp API (TODO)

Để kết nối với backend thực:

1. Tạo service file `src/service/roomService.ts`:
```tsx
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const roomService = {
  getAllRooms: () => axios.get(`${API_URL}/rooms`),
  getRoomById: (id: string) => axios.get(`${API_URL}/rooms/${id}`),
  bookRoom: (data: any) => axios.post(`${API_URL}/bookings`, data),
};
```

2. Thay thế mock data bằng API calls:
```tsx
// Trong RoomListPage
useEffect(() => {
  roomService.getAllRooms()
    .then(res => setRooms(res.data))
    .catch(err => console.error(err));
}, []);
```

## Responsive Design

- **Desktop (>= 992px)**: 3 cột, sidebar form dính
- **Tablet (768px - 991px)**: 2 cột
- **Mobile (< 768px)**: 1 cột, full width

## Dependencies

- React 19+
- React Router DOM
- Ant Design 5+
- TypeScript

## Usage

```tsx
// Link đến trang danh sách
<Link to="/rooms">Xem tất cả phòng</Link>

// Link đến chi tiết phòng
<Link to="/room/1">Xem phòng Deluxe</Link>
```

## Screenshots

### Danh sách phòng
- Filter và sort options ở header
- Grid layout với cards
- Giá, rating, thông tin cơ bản
- Button "Xem chi tiết"

### Chi tiết phòng
- Hero images với preview
- Thông tin đầy đủ bên trái
- Sidebar booking form (sticky)
- Reviews từ khách hàng
- Chính sách phòng ở cuối

## Next Steps

1. ⬜ Kết nối API backend
2. ⬜ Thêm pagination cho danh sách
3. ⬜ Thêm search bar
4. ⬜ Thêm filter theo giá
5. ⬜ Thêm filter theo tiện nghi
6. ⬜ Tích hợp payment gateway
7. ⬜ Thêm wishlist/favorite
8. ⬜ Thêm comparison tool
9. ⬜ SEO optimization
10. ⬜ Loading states & error handling
