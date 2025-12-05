# Fix WebSocket/HMR Warnings với Cloudflared

## Vấn đề

Khi sử dụng Cloudflared tunnel để expose frontend, bạn sẽ thấy các cảnh báo WebSocket connection failed:

```
WebSocket connection to 'wss://...trycloudflare.com/...' failed
[vite] failed to connect to websocket
```

## Giải thích

- **Cloudflared không hỗ trợ WebSocket tốt**, nên Vite HMR (Hot Module Replacement) không thể kết nối qua tunnel
- **App vẫn hoạt động bình thường**, chỉ mất tính năng hot reload
- Đây là **hạn chế của Cloudflared**, không phải lỗi của code

## Giải pháp

### Cách 1: Bỏ qua warnings (Khuyến nghị)

Các warnings này **không ảnh hưởng** đến chức năng của app. Bạn có thể:
- Bỏ qua các warnings này
- App vẫn chạy bình thường
- Chỉ cần refresh trang thủ công khi có thay đổi code

### Cách 2: Sử dụng localhost cho development

Nếu bạn cần HMR (hot reload):
1. Truy cập trực tiếp: `http://localhost:5173`
2. Chỉ dùng Cloudflared URL khi cần test từ bên ngoài (PayOS webhook, etc.)

### Cách 3: Sử dụng ngrok (nếu không bị ban)

Ngrok hỗ trợ WebSocket tốt hơn Cloudflared:
```bash
ngrok http 5173
```

## Lưu ý

- ✅ App hoạt động bình thường qua Cloudflared
- ✅ PayOS webhook vẫn hoạt động
- ❌ Hot reload không hoạt động (cần refresh thủ công)
- ⚠️ Warnings là bình thường, không phải lỗi

## Khi nào cần quan tâm?

Chỉ cần fix nếu:
- App không load được (không phải chỉ là warnings)
- PayOS/webhook không hoạt động
- Có lỗi thực sự (không phải WebSocket warnings)

Nếu chỉ thấy WebSocket warnings → **Bỏ qua, không cần fix!**

