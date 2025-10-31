/**
 FILE GUARD – ADMIN BOOKING PAGES ONLY
 - Không lib mới; không code ngoài /admin/bookings.
 - Types snake_case khớp Resource; ẩn nút update status nếu không phải admin.
 - 401/403 → hiển thị “Không có quyền truy cập”.
*/

import axios from 'axios';

const baseURL: string = import.meta.env?.VITE_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL,
  // Avoid CORS credential restrictions when calling http://localhost:8000 from :5173
  withCredentials: false,
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      error.userMessage = 'Không có quyền truy cập';
    } else {
      error.userMessage = error?.response?.data?.error?.message || 'Có lỗi xảy ra';
    }
    return Promise.reject(error);
  },
);


