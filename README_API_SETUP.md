# Hướng dẫn Setup API URL - Không cần Ngrok

## 🎯 Mục tiêu

Frontend **KHÔNG CẦN** ngrok để gọi API. Chỉ cần dùng `http://localhost:8000/api` cho development.

---

## ✅ Setup mặc định (Khuyến nghị)

### **Không cần tạo file `.env`**

Frontend sẽ tự động dùng:
```
VITE_API_URL = http://localhost:8000/api
```

**Chỉ cần:**
1. ✅ Backend chạy: `php artisan serve` (port 8000)
2. ✅ Frontend chạy: `npm run dev` (port 5173)
3. ✅ Xong! API hoạt động ngay

---

## ⚠️ Khi nào cần ngrok?

**CHỈ KHI:**
- 🎯 Test PayOS payment (PayOS cần public URL)
- 🎯 Test webhook callbacks
- 🎯 Test từ thiết bị khác (mobile, etc.)

**KHÔNG CẦN khi:**
- ❌ Development bình thường
- ❌ Test các API khác (room, booking, etc.)
- ❌ Chỉ code frontend

---

## 🔧 Setup ngrok (Chỉ khi cần test PayOS)

### **Bước 1: Start ngrok cho backend**

```powershell
# Terminal 1: Backend
cd BE1
php artisan serve

# Terminal 2: Ngrok
cd BE1
.\ngrok.exe http 8000
```

**Copy URL** (ví dụ: `https://xxxxx.ngrok-free.app`)

### **Bước 2: Tạo file `.env` trong FE1**

```env
VITE_API_URL=https://xxxxx.ngrok-free.app/api
```

### **Bước 3: Restart frontend**

```bash
# Stop frontend (Ctrl+C)
# Start lại
npm run dev
```

---

## 🚨 Lỗi CORS khi dùng ngrok

Nếu gặp lỗi CORS khi dùng ngrok:

### **Nguyên nhân:**
- Frontend chạy trên `http://localhost:5173`
- API URL là `https://xxxxx.ngrok-free.app`
- Backend CORS chưa cho phép localhost origin khi request đến ngrok

### **Giải pháp:**

**Option 1: Dùng localhost cho API (Khuyến nghị)**
```env
# Xóa hoặc comment VITE_API_URL
# VITE_API_URL=http://localhost:8000/api
```

**Option 2: Sửa CORS (Đã được fix)**
- Backend đã được cập nhật để cho phép ngrok domains
- Restart backend: `php artisan serve`

---

## 📋 Checklist

### **Development bình thường:**
- ✅ Không có file `.env` trong FE1
- ✅ Backend: `php artisan serve`
- ✅ Frontend: `npm run dev`
- ✅ API URL: `http://localhost:8000/api` (tự động)

### **Test PayOS:**
- ✅ Backend: `php artisan serve`
- ✅ Ngrok: `.\ngrok.exe http 8000`
- ✅ Tạo `.env` với `VITE_API_URL=https://xxxxx.ngrok-free.app/api`
- ✅ Restart frontend

---

## 🎯 Kết luận

**Development:**
- ✅ **KHÔNG CẦN** ngrok
- ✅ **KHÔNG CẦN** file `.env`
- ✅ Chỉ cần `php artisan serve` và `npm run dev`

**Test PayOS:**
- ✅ Cần ngrok cho backend
- ✅ Cần `.env` với ngrok URL
- ✅ Restart frontend

**Lưu ý:** Sau khi test PayOS xong, xóa file `.env` để quay về localhost.

