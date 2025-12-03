import axios from 'axios';

// Lấy API URL từ env hoặc dùng default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Tạo axios instance
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true', // Bypass ngrok warning page
    },
    timeout: 15000, // 15 seconds
});

// Request interceptor - Thêm token vào header
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Xử lý lỗi chung
axiosInstance.interceptors.response.use(
    (response) => {
        // Kiểm tra nếu response là HTML (ngrok warning page)
        const contentType = response.headers['content-type'] || '';
        if (contentType.includes('text/html') && typeof response.data === 'string' && response.data.includes('ngrok')) {
            console.error('Ngrok warning page detected. Please add ngrok-skip-browser-warning header.');
            return Promise.reject(new Error('Ngrok warning page detected. API request blocked.'));
        }
        return response;
    },
    (error) => {
        // Kiểm tra nếu response là HTML (ngrok warning page)
        if (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('ngrok')) {
            console.error('Ngrok warning page detected in error response.');
            error.message = 'Ngrok đang chặn request. Vui lòng thêm header ngrok-skip-browser-warning.';
        }

        // Xử lý lỗi 401 - Unauthorized
        if (error.response?.status === 401) {
            // Xóa token và chuyển về trang login
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            window.location.href = '/';
        }

        // Xử lý lỗi 403 - Forbidden
        if (error.response?.status === 403) {
            console.error('Access denied');
        }

        // Xử lý lỗi 500 - Server Error
        if (error.response?.status === 500) {
            console.error('Server error occurred');
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
export { API_URL };
