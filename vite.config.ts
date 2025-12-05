import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      '@/assets': path.resolve(__dirname, './src/assets'),
    },
  },
  server: {
    host: true, // Cho phép truy cập từ bên ngoài
    port: 5173,
    // Cho phép tất cả cloudflare domains
    allowedHosts: [
      'localhost',
      '.trycloudflare.com', // Cho phép tất cả subdomain của trycloudflare.com
    ],
    // Cấu hình HMR
    // LƯU Ý: Cloudflared không hỗ trợ WebSocket tốt, nên HMR sẽ không hoạt động qua tunnel
    // App vẫn chạy bình thường, chỉ mất tính năng hot reload
    // Để có HMR, truy cập trực tiếp http://localhost:5173 thay vì qua Cloudflared URL
    hmr: {
      // Tắt HMR warnings khi kết nối qua Cloudflared
      // HMR sẽ tự động fallback và không hiển thị lỗi
      overlay: true, // Vẫn hiển thị lỗi compile
    },
    // Tắt strict port để tránh lỗi khi port đã được sử dụng
    strictPort: false,
  },
})
