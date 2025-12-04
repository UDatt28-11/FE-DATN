# Fix CORS Error với Ngrok

## 🚨 Vấn đề

Frontend đang gọi API đến ngrok URL nhưng chạy trên localhost, gây lỗi CORS:

```
Access to XMLHttpRequest at 'https://xxxxx.ngrok-free.dev/api/...' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

## ✅ Giải pháp

### **Cách 1: Dùng localhost cho API (Khuyến nghị cho Development)**

**Xóa hoặc sửa file `.env` trong FE1:**

```bash
# Xóa file .env (nếu có)
rm FE1/.env

# Hoặc sửa .env thành:
VITE_API_URL=http://localhost:8000/api
```

**Sau đó restart frontend:**
```bash
# Stop frontend (Ctrl+C)
npm run dev
```

**✅ Kết quả:** Frontend sẽ dùng `http://localhost:8000/api` mặc định, không cần ngrok.

---

### **Cách 2: Giữ ngrok nhưng fix CORS**

**Backend đã được cập nhật để cho phép ngrok domains.**

**Restart backend:**
```bash
# Stop backend (Ctrl+C)
php artisan serve
```

**✅ Kết quả:** CORS sẽ cho phép localhost origin khi request đến ngrok URL.

---

## 🎯 Khi nào dùng gì?

### **Development bình thường:**
- ✅ **KHÔNG CẦN** ngrok
- ✅ **KHÔNG CẦN** file `.env`
- ✅ Dùng `http://localhost:8000/api` (mặc định)

### **Test PayOS:**
- ✅ Cần ngrok cho backend
- ✅ Có thể dùng ngrok URL cho frontend API (đã fix CORS)
- ✅ Hoặc vẫn dùng localhost cho API, chỉ cần ngrok cho PayOS webhook

---

## 📋 Checklist

1. ✅ Backend CORS đã được cập nhật (cho phép ngrok domains)
2. ✅ Frontend có thể dùng localhost hoặc ngrok URL
3. ✅ Xóa `.env` nếu không cần ngrok
4. ✅ Restart cả frontend và backend sau khi thay đổi

---

## 🔧 Troubleshooting

### **Vẫn bị lỗi CORS sau khi fix:**

1. **Clear browser cache:**
   - Chrome: Ctrl+Shift+Delete
   - Hoặc dùng Incognito mode

2. **Kiểm tra backend CORS:**
   ```bash
   # Xem CORS config
   cat BE1/config/cors.php
   ```

3. **Restart backend:**
   ```bash
   php artisan config:clear
   php artisan serve
   ```

4. **Kiểm tra .env trong FE1:**
   ```bash
   # Nếu có .env, xem nội dung
   cat FE1/.env
   ```

---

## ✅ Kết luận

**Development:**
- ✅ Xóa `.env` trong FE1
- ✅ Dùng `http://localhost:8000/api` (mặc định)
- ✅ Không cần ngrok

**Test PayOS:**
- ✅ Có thể dùng ngrok URL cho API (đã fix CORS)
- ✅ Hoặc vẫn dùng localhost cho API

