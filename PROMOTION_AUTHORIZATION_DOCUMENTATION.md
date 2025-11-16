# Tài Liệu Phân Quyền Mã Giảm Giá - Promotions Authorization

## Tổng Quan

Hệ thống phân quyền cho trang mã giảm giá đảm bảo chỉ người dùng đã đăng nhập mới có thể:
- Sao chép mã giảm giá
- Xem chi tiết điều khoản và điều kiện
- Sử dụng mã giảm giá khi đặt phòng

## Mục Đích

### 1. Bảo Vệ Mã Giảm Giá
- Ngăn chặn việc lạm dụng mã giảm giá
- Đảm bảo mỗi mã chỉ được sử dụng bởi user có tài khoản
- Tracking việc sử dụng mã theo từng user

### 2. Khuyến Khích Đăng Ký
- Tăng số lượng user đăng ký tài khoản
- Xây dựng database khách hàng
- Tạo động lực để user tạo tài khoản

### 3. Cải Thiện Trải Nghiệm
- Personalize các ưu đãi theo từng user
- Lưu lịch sử sử dụng mã giảm giá
- Gợi ý các mã phù hợp với user

## Triển Khai Chi Tiết

### 1. Thay Đổi trong `Promotions.tsx`

**Import thêm:**
```tsx
import { useAuth } from '../../../context/AuthContext';
import { LoginModal, RegisterModal } from '../../../components/Auth';
```

**State mới:**
```tsx
const { isLoggedIn } = useAuth();
const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
```

### 2. Hàm `handleCopyCode()` - Sao Chép Mã

**Chức năng:**
- Kiểm tra authentication trước khi sao chép
- Hiển thị modal đăng nhập nếu chưa đăng nhập
- Sao chép mã vào clipboard nếu đã đăng nhập

**Code:**
```tsx
const handleCopyCode = (code: string) => {
    // Kiểm tra đăng nhập
    if (!isLoggedIn) {
        message.warning('Vui lòng đăng nhập để sử dụng mã giảm giá!');
        setIsLoginModalVisible(true);
        return;
    }

    // Sao chép mã
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    message.success('Đã sao chép mã giảm giá!');
    setTimeout(() => setCopiedCode(null), 2000);
};
```

**Thông báo:**
- Warning: "Vui lòng đăng nhập để sử dụng mã giảm giá!"
- Success: "Đã sao chép mã giảm giá!" (sau khi copy thành công)

### 3. Hàm `showPromotionDetails()` - Xem Chi Tiết

**Chức năng:**
- Kiểm tra authentication trước khi hiển thị modal
- Chỉ user đã đăng nhập mới xem được điều khoản chi tiết
- Mở modal đăng nhập nếu chưa đăng nhập

**Code:**
```tsx
const showPromotionDetails = (promotion: Promotion) => {
    // Kiểm tra đăng nhập
    if (!isLoggedIn) {
        message.warning('Vui lòng đăng nhập để xem chi tiết mã giảm giá!');
        setIsLoginModalVisible(true);
        return;
    }

    // Hiển thị modal chi tiết
    setSelectedPromotion(promotion);
    setIsModalVisible(true);
};
```

**Thông báo:**
- Warning: "Vui lòng đăng nhập để xem chi tiết mã giảm giá!"

### 4. UI/UX Cải Tiến

#### A. Nút "Sao chép" Động
**Hiển thị theo trạng thái:**
- Chưa đăng nhập: "Đăng nhập"
- Đã đăng nhập: "Sao chép"
- Đã sao chép: "Đã sao chép" (màu xanh)

**Code:**
```tsx
<Button
    icon={copiedCode === promo.code ? <CheckCircleOutlined /> : <CopyOutlined />}
    onClick={() => handleCopyCode(promo.code)}
    type={copiedCode === promo.code ? 'primary' : 'default'}
>
    {copiedCode === promo.code ? 'Đã sao chép' : (isLoggedIn ? 'Sao chép' : 'Đăng nhập')}
</Button>
```

#### B. Badge Cảnh Báo
**Hiển thị khi chưa đăng nhập:**
- Màu cam (#fff3e0 background, #e65100 text)
- Icon khóa 🔒
- Text: "Đăng nhập để sử dụng mã này"
- Vị trí: Dưới thông tin hạn sử dụng và đơn tối thiểu

**Code:**
```tsx
{!isLoggedIn && (
    <div style={{ 
        marginTop: '10px', 
        padding: '8px 12px', 
        background: '#fff3e0', 
        borderRadius: '6px',
        border: '1px solid #ffa726',
        fontSize: '13px',
        color: '#e65100',
        textAlign: 'center'
    }}>
        🔒 Đăng nhập để sử dụng mã này
    </div>
)}
```

#### C. Modal Đăng Nhập/Đăng Ký
**Tích hợp modal tại trang Promotions:**
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

**Lợi ích:**
- User không cần rời khỏi trang Promotions
- Đăng nhập xong có thể tiếp tục ngay
- Chuyển đổi giữa Login/Register dễ dàng

## User Flow

### Flow 1: User Chưa Đăng Nhập Click "Sao Chép"

1. **Bước 1**: User vào trang `/promotions`
2. **Bước 2**: User thấy các mã giảm giá với badge "🔒 Đăng nhập để sử dụng mã này"
3. **Bước 3**: User nhấn nút "Đăng nhập" (hoặc "Sao chép" nếu nút text không đổi)
4. **Bước 4**: Message warning xuất hiện: "Vui lòng đăng nhập để sử dụng mã giảm giá!"
5. **Bước 5**: Modal đăng nhập tự động mở
6. **Bước 6**: User đăng nhập/đăng ký
7. **Bước 7**: Modal đóng, badge cảnh báo biến mất
8. **Bước 8**: User nhấn lại "Sao chép"
9. **Bước 9**: Mã được copy vào clipboard
10. **Bước 10**: Message success: "Đã sao chép mã giảm giá!"
11. **Bước 11**: Nút chuyển thành "Đã sao chép" (màu xanh) trong 2 giây

### Flow 2: User Chưa Đăng Nhập Click "Xem Chi Tiết"

1. **Bước 1**: User vào trang `/promotions`
2. **Bước 2**: User nhấn nút "Xem Chi Tiết" trên card mã giảm giá
3. **Bước 3**: Message warning: "Vui lòng đăng nhập để xem chi tiết mã giảm giá!"
4. **Bước 4**: Modal đăng nhập tự động mở
5. **Bước 5**: User đăng nhập/đăng ký
6. **Bước 6**: Modal đăng nhập đóng
7. **Bước 7**: User nhấn lại "Xem Chi Tiết"
8. **Bước 8**: Modal chi tiết mã giảm giá mở ra
9. **Bước 9**: User xem điều khoản và có thể sao chép mã từ modal

### Flow 3: User Đã Đăng Nhập

1. **Bước 1**: User đã đăng nhập vào trang `/promotions`
2. **Bước 2**: KHÔNG có badge cảnh báo "Đăng nhập để sử dụng"
3. **Bước 3**: Nút hiển thị "Sao chép" thay vì "Đăng nhập"
4. **Bước 4**: Nhấn "Sao chép" → Mã copy ngay lập tức
5. **Bước 5**: Nhấn "Xem Chi Tiết" → Modal mở ngay lập tức
6. **Bước 6**: Không có bất kỳ chặn nào

## Lợi Ích

### 1. Cho Khách Sạn

**Kiểm Soát Mã Giảm Giá:**
- Mỗi user chỉ có thể sử dụng mã khi có tài khoản
- Tracking chính xác ai đã sử dụng mã nào
- Ngăn chặn việc share mã vô tội vạ

**Tăng Số Lượng User Đăng Ký:**
- User muốn dùng mã → Phải đăng ký
- Xây dựng database khách hàng
- Tăng loyalty program potential

**Analytics & Marketing:**
- Biết được user nào quan tâm mã nào
- Personalize marketing campaigns
- A/B testing các loại mã giảm giá

### 2. Cho User

**Bảo Mật:**
- Mã giảm giá riêng tư, không bị lạm dụng
- Lưu lịch sử mã đã sử dụng

**Tiện Lợi:**
- Đăng nhập một lần, dùng mọi lúc
- Không cần nhớ hoặc ghi lại mã
- Auto-apply mã khi booking (future feature)

**Ưu Đãi Cá Nhân:**
- Nhận mã độc quyền cho member
- Birthday discount
- Loyalty points

### 3. Về Mặt Kỹ Thuật

**Clean Code:**
- Tách biệt logic authentication
- Reuse LoginModal và RegisterModal
- Component Promotions không phụ thuộc vào implementation của Auth

**Maintainable:**
- Dễ dàng thêm rule phức tạp hơn
- Có thể track usage per user
- Tích hợp với backend API dễ dàng

**Scalable:**
- Có thể mở rộng thành loyalty program
- Tích hợp với payment system
- Multi-tier discount system

## Testing

### Test Cases

#### 1. Test Sao Chép Mã Khi Chưa Đăng Nhập
**Input:** User chưa đăng nhập, nhấn nút "Sao chép" hoặc "Đăng nhập"
**Expected Output:**
- Message warning: "Vui lòng đăng nhập để sử dụng mã giảm giá!"
- Modal đăng nhập mở
- Mã KHÔNG được copy vào clipboard

#### 2. Test Sao Chép Mã Khi Đã Đăng Nhập
**Input:** User đã đăng nhập, nhấn nút "Sao chép"
**Expected Output:**
- Mã được copy vào clipboard
- Message success: "Đã sao chép mã giảm giá!"
- Nút chuyển thành "Đã sao chép" (xanh) trong 2 giây

#### 3. Test Xem Chi Tiết Khi Chưa Đăng Nhập
**Input:** User chưa đăng nhập, nhấn nút "Xem Chi Tiết"
**Expected Output:**
- Message warning: "Vui lòng đăng nhập để xem chi tiết mã giảm giá!"
- Modal đăng nhập mở
- Modal chi tiết KHÔNG mở

#### 4. Test Xem Chi Tiết Khi Đã Đăng Nhập
**Input:** User đã đăng nhập, nhấn nút "Xem Chi Tiết"
**Expected Output:**
- Modal chi tiết mã giảm giá mở ngay
- Hiển thị đầy đủ terms & conditions
- Có nút "Sao Chép Mã" trong modal

#### 5. Test Badge Cảnh Báo
**Input:** User chưa đăng nhập, vào trang `/promotions`
**Expected Output:**
- Mỗi card mã giảm giá có badge "🔒 Đăng nhập để sử dụng mã này"
- Badge màu cam (#fff3e0), text màu đỏ (#e65100)

**Input:** User đã đăng nhập, vào trang `/promotions`
**Expected Output:**
- KHÔNG có badge cảnh báo
- Nút hiển thị "Sao chép" thay vì "Đăng nhập"

#### 6. Test Đăng Nhập Từ Modal Tại Promotions
**Input:** User mở modal đăng nhập từ Promotions, nhập thông tin hợp lệ, submit
**Expected Output:**
- User đăng nhập thành công
- Modal đóng
- Badge cảnh báo biến mất
- Nút chuyển từ "Đăng nhập" thành "Sao chép"
- User có thể sao chép mã ngay

#### 7. Test Chuyển Đổi Login/Register Modal
**Input:** User nhấn "Đăng ký ngay" trong LoginModal
**Expected Output:**
- LoginModal đóng
- RegisterModal mở

**Input:** User nhấn "Đăng nhập" trong RegisterModal
**Expected Output:**
- RegisterModal đóng
- LoginModal mở

## So Sánh Trước và Sau

### Trước Khi Có Phân Quyền

| Tính năng | Hành vi |
|-----------|---------|
| Sao chép mã | Ai cũng copy được, kể cả anonymous |
| Xem chi tiết | Ai cũng xem được |
| Tracking | Không biết ai sử dụng mã |
| Bảo mật | Mã bị share lung tung |
| User engagement | Thấp, không có lý do để đăng ký |

### Sau Khi Có Phân Quyền

| Tính năng | Hành vi |
|-----------|---------|
| Sao chép mã | Chỉ user đã đăng nhập mới copy được |
| Xem chi tiết | Yêu cầu đăng nhập |
| Tracking | Biết chính xác user nào dùng mã nào |
| Bảo mật | Mã được bảo vệ, mỗi user có account riêng |
| User engagement | Cao, khuyến khích đăng ký để dùng mã |

## Cải Tiến Tương Lai

### 1. Backend Integration

**API Endpoints:**
```
GET  /api/promotions          - Lấy danh sách mã (public)
GET  /api/promotions/:id      - Chi tiết mã (require auth)
POST /api/promotions/:id/claim - Claim mã cho user (require auth)
GET  /api/user/promotions     - Mã đã claim (require auth)
POST /api/user/promotions/use - Sử dụng mã khi booking (require auth)
```

**Database Schema:**
```sql
-- Bảng promotions
CREATE TABLE promotions (
    id INT PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    title VARCHAR(255),
    description TEXT,
    discount_type ENUM('percent', 'fixed', 'gift'),
    discount_value DECIMAL(10,2),
    min_order DECIMAL(10,2),
    max_discount DECIMAL(10,2),
    valid_from DATETIME,
    valid_until DATETIME,
    status ENUM('active', 'expired', 'upcoming'),
    terms_and_conditions JSON,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Bảng user_promotions (tracking)
CREATE TABLE user_promotions (
    id INT PRIMARY KEY,
    user_id INT,
    promotion_id INT,
    claimed_at TIMESTAMP,
    used_at TIMESTAMP NULL,
    booking_id INT NULL,
    status ENUM('claimed', 'used', 'expired'),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (promotion_id) REFERENCES promotions(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);
```

### 2. User-Specific Promotions

**Tính năng:**
- Mã giảm giá riêng cho từng user
- Birthday discount tự động
- Loyalty tier discounts (Silver, Gold, Platinum)
- First booking discount
- Referral codes

**UI Changes:**
- Tab "Mã của tôi" vs "Mã công khai"
- Badge "Dành riêng cho bạn"
- Countdown timer cho mã sắp hết hạn

### 3. Auto-Apply Promotion

**Flow:**
- User vào trang booking
- Hệ thống tự động check mã khả dụng
- Suggest mã tốt nhất cho đơn hàng
- Apply tự động khi user confirm

**Benefits:**
- Tăng conversion rate
- UX tốt hơn
- User không bỏ lỡ discount

### 4. Gamification

**Ý tưởng:**
- "Collect all 6 promotions" challenge
- Share mã với bạn bè → Bonus discount
- Daily check-in → Unlock special codes
- Spin wheel để nhận random discount

### 5. Analytics Dashboard

**Metrics:**
- Số lượng user claim mỗi mã
- Conversion rate (claimed → used)
- Revenue impact của từng mã
- Popular promotions
- User segments using each promotion

## Ghi Chú Kỹ Thuật

### Performance

**Optimization:**
- Promotions data có thể cache (ít thay đổi)
- User-specific data fetch on-demand
- Lazy load modal components

**Considerations:**
- Initial load: Chỉ fetch danh sách promotions
- Detail load: Fetch khi user click "Xem Chi Tiết"
- Claim action: POST request khi user copy code

### Security

**Biện pháp:**
- Rate limiting cho copy code action
- CSRF token cho claim API
- Server-side validation khi apply mã
- Prevent duplicate claim của cùng mã

**Validation:**
- Check expiry date
- Check min order amount
- Check user eligibility
- Check usage limit per user

## Tóm Tắt

✅ **Đã hoàn thành:**
- Kiểm tra authentication trước khi copy mã
- Kiểm tra authentication trước khi xem chi tiết
- Modal đăng nhập/đăng ký tích hợp tại Promotions page
- Badge cảnh báo "Đăng nhập để sử dụng mã này"
- Nút "Sao chép" động (đổi text theo trạng thái)
- Thông báo user-friendly

🎯 **Mục tiêu đạt được:**
- Chỉ user đã đăng nhập mới sử dụng được mã giảm giá
- UX mượt mà với modal tại chỗ
- Khuyến khích user đăng ký tài khoản
- Chuẩn bị sẵn cho backend integration
- Code dễ maintain và mở rộng

🚀 **Next Steps:**
- Tích hợp với backend API
- Implement claim promotion feature
- Auto-apply mã khi booking
- User-specific promotions
- Analytics tracking
