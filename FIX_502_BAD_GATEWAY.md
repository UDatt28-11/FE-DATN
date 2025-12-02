# 🔧 Fix Lỗi 502 Bad Gateway - Cloudflared

## ⚠️ Lỗi

```
GET https://gale-assumptions-executives-velocity.trycloudflare.com/ 502 (Bad Gateway)
GET https://gale-assumptions-executives-velocity.trycloudflare.com/favicon.ico 502 (Bad Gateway)
```

## 🔍 Nguyên Nhân

Lỗi **502 Bad Gateway** xảy ra khi:
1. ❌ **Frontend server không chạy** (npm run dev)
2. ❌ **Cloudflared tunnel không chạy**
3. ❌ **Cloudflared tunnel đã bị đóng/ngắt kết nối**
4. ❌ **Port 5173 không có service nào chạy**

---

## ✅ Giải Pháp

### Bước 1: Kiểm Tra Frontend Server

**Frontend server PHẢI chạy trước khi chạy cloudflared!**

**Mở Terminal 1 - Chạy Frontend:**

```powershell
cd FE1
npm run dev
```

**Kết quả mong đợi:**
```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

**✅ Đảm bảo:** Frontend đang chạy trên `http://localhost:5173`

---

### Bước 2: Chạy Cloudflared Tunnel

**Mở Terminal 2 - Chạy Cloudflared:**

```powershell
cd FE1
.\start_cloudflared.ps1
```

**Hoặc chạy trực tiếp:**

```powershell
cd FE1
.\cloudflared.exe tunnel --url http://localhost:5173
```

**Kết quả mong đợi:**
```
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable): |
|  https://gale-assumptions-executives-velocity.trycloudflare.com                          |
+--------------------------------------------------------------------------------------------+
```

**✅ Đảm bảo:** 
- Cloudflared đang chạy
- URL hiển thị đúng: `https://gale-assumptions-executives-velocity.trycloudflare.com`
- **Giữ terminal này mở** (không đóng!)

---

### Bước 3: Kiểm Tra Cả 2 Đang Chạy

**Terminal 1 (Frontend):**
```
✅ npm run dev đang chạy
✅ Port 5173 đang lắng nghe
```

**Terminal 2 (Cloudflared):**
```
✅ cloudflared tunnel đang chạy
✅ URL: https://gale-assumptions-executives-velocity.trycloudflare.com
```

---

### Bước 4: Test URL

**Mở browser và truy cập:**
```
https://gale-assumptions-executives-velocity.trycloudflare.com
```

**Kết quả mong đợi:**
- ✅ Frontend load thành công
- ❌ Nếu vẫn 502 → Xem troubleshooting bên dưới

---

## 🔧 Troubleshooting

### Lỗi: Vẫn 502 sau khi chạy cả 2

**Kiểm tra:**

1. **Frontend có đang chạy không?**
   ```powershell
   # Kiểm tra port 5173
   netstat -ano | findstr :5173
   ```
   
   **Nếu không có kết quả:** Frontend chưa chạy → Chạy `npm run dev`

2. **Cloudflared có đang chạy không?**
   - Kiểm tra terminal cloudflared còn mở không
   - Nếu đã đóng → Chạy lại `.\start_cloudflared.ps1`

3. **URL có đúng không?**
   - URL có thể thay đổi mỗi lần restart cloudflared
   - Copy URL mới từ terminal cloudflared

4. **Port có bị conflict không?**
   ```powershell
   # Kiểm tra port 5173
   netstat -ano | findstr :5173
   ```
   
   **Nếu có process khác:** Dừng process đó hoặc đổi port

---

### Lỗi: Cloudflared không tìm thấy cloudflared.exe

**Giải pháp:**

1. **Kiểm tra file có tồn tại không:**
   ```powershell
   cd FE1
   Test-Path cloudflared.exe
   ```

2. **Nếu không có, tải lại:**
   - Truy cập: https://github.com/cloudflare/cloudflared/releases/latest
   - Tải: `cloudflared-windows-amd64.exe`
   - Đổi tên thành: `cloudflared.exe`
   - Lưu vào thư mục `FE1`

---

### Lỗi: Frontend không chạy được

**Kiểm tra:**

1. **Node modules đã cài chưa?**
   ```powershell
   cd FE1
   npm install
   ```

2. **Port 5173 có bị chiếm không?**
   ```powershell
   netstat -ano | findstr :5173
   ```
   
   **Nếu có process khác:** Dừng process đó

3. **Kiểm tra lỗi trong terminal:**
   - Xem terminal `npm run dev` có lỗi gì không
   - Fix lỗi trước khi chạy cloudflared

---

## 📋 Checklist

- [ ] Frontend server đang chạy (`npm run dev`)
- [ ] Frontend chạy trên port 5173
- [ ] Cloudflared tunnel đang chạy
- [ ] Cloudflared URL đúng: `https://gale-assumptions-executives-velocity.trycloudflare.com`
- [ ] Cả 2 terminal đều đang mở (không đóng)
- [ ] Đã test URL trong browser
- [ ] Không còn lỗi 502

---

## 🚀 Quick Fix

**Nếu vẫn 502, thử lại từ đầu:**

```powershell
# Terminal 1: Frontend
cd FE1
npm run dev

# Terminal 2: Cloudflared (sau khi frontend đã chạy)
cd FE1
.\start_cloudflared.ps1
```

**Lưu ý:** 
- ⚠️ **Phải chạy frontend TRƯỚC** cloudflared
- ⚠️ **Giữ cả 2 terminal mở** (không đóng)
- ⚠️ **URL có thể thay đổi** mỗi lần restart cloudflared

---

## ✅ Kết Luận

**Lỗi 502 Bad Gateway** thường do:
1. Frontend server không chạy
2. Cloudflared tunnel không chạy
3. Cloudflared tunnel đã bị đóng

**Giải pháp:**
1. Chạy `npm run dev` (Terminal 1)
2. Chạy `.\start_cloudflared.ps1` (Terminal 2)
3. Giữ cả 2 terminal mở
4. Test URL trong browser

---

## 📝 Lưu Ý Quan Trọng

### Thứ Tự Chạy:

1. **Bước 1:** Chạy Frontend (`npm run dev`)
2. **Bước 2:** Chạy Cloudflared (`.\start_cloudflared.ps1`)
3. **Bước 3:** Copy URL từ cloudflared
4. **Bước 4:** Test URL trong browser

### Không Được:

- ❌ Chạy cloudflared trước khi frontend chạy
- ❌ Đóng terminal cloudflared (tunnel sẽ ngắt)
- ❌ Đóng terminal frontend (server sẽ dừng)

### Phải:

- ✅ Chạy frontend trước
- ✅ Giữ cả 2 terminal mở
- ✅ Kiểm tra cả 2 đang chạy trước khi test


