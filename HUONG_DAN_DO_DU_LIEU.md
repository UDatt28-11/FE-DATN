# HƯỚNG DẪN ĐỔ DỮ LIỆU VÀO DATABASE

## Vấn đề: Chưa có dữ liệu từ Database đổ ra

Có 3 bước cần làm để có dữ liệu:

---

## BƯỚC 1: Cấu hình Database trong file .env

1. Mở file: `BE-DATN\.env`
2. Kiểm tra và cấu hình các dòng sau:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ten_database_cua_ban
DB_USERNAME=root
DB_PASSWORD=
```

**Lưu ý:**
- `DB_DATABASE`: Tên database bạn đã tạo trong MySQL (Laragon)
- `DB_USERNAME`: Thường là `root`
- `DB_PASSWORD`: Thường để trống nếu dùng Laragon

---

## BƯỚC 2: Chạy Migrations (Tạo các bảng)

Mở PowerShell và chạy:

```powershell
cd C:\laragon\www\datn\BE-DATN
php artisan migrate
```

Lệnh này sẽ tạo tất cả các bảng cần thiết trong database.

---

## BƯỚC 3: Chạy Seeders (Đổ dữ liệu mẫu)

Sau khi migrations xong, chạy:

```powershell
php artisan db:seed
```

Lệnh này sẽ đổ dữ liệu mẫu vào database:
- Users (admin, staff, customer)
- Properties (Homestays)
- Room Types
- Rooms
- Amenities
- Services
- Bookings
- Reviews
- Và nhiều dữ liệu khác...

---

## BƯỚC 4: Kiểm tra dữ liệu

Chạy lệnh này để kiểm tra:

```powershell
php artisan tinker
```

Trong tinker, gõ:

```php
App\Models\User::count()
App\Models\Property::count()
App\Models\Room::count()
```

Nếu các số > 0 nghĩa là đã có dữ liệu!

---

## NẾU GẶP LỖI

### Lỗi: "Could not find driver"
- Kiểm tra MySQL đã được cài đặt chưa
- Kiểm tra extension `pdo_mysql` trong PHP

### Lỗi: "Access denied"
- Kiểm tra lại username/password trong .env
- Đảm bảo database đã được tạo trong MySQL

### Lỗi: "Unknown database"
- Tạo database trong MySQL trước:
  ```sql
  CREATE DATABASE ten_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```

---

## CHẠY TẤT CẢ MỘT LẦN

Nếu muốn chạy tất cả trong một lần:

```powershell
cd C:\laragon\www\datn\BE-DATN

# 1. Migrate (tạo bảng)
php artisan migrate --force

# 2. Seed (đổ dữ liệu)
php artisan db:seed --force
```

---

## SAU KHI HOÀN THÀNH

Sau khi chạy xong, bạn sẽ có:
- ✅ Các bảng đã được tạo trong database
- ✅ Dữ liệu mẫu đã được đổ vào
- ✅ Website có thể hiển thị dữ liệu

Restart backend server nếu đang chạy:

```powershell
php artisan serve
```


