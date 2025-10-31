import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy /api -> http://localhost/BE-DATN/public/api
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/BE-DATN/public/api'),
      },
    },
  },
})
