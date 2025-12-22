import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  timeout: 30000, // 30 seconds default timeout
});

// Add a request interceptor
api.interceptors.request.use(
  function (config) {
    // Đọc token từ auth_token (được lưu bởi authService)
    const token = localStorage.getItem("auth_token") || localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    
    // Bypass ngrok warning page (ERR_NGROK_6024)
    // Ngrok sẽ hiển thị warning page nếu không có header này
    if (config.headers && config.baseURL?.includes("ngrok")) {
      config.headers["ngrok-skip-browser-warning"] = "true";
    }
    
    // Log để debug (chỉ trong development và chỉ khi không có token để debug)
    if (import.meta.env.DEV && config.url?.includes("user/bookings") && !token) {
      console.warn("Axios Request Interceptor: No token found for authenticated request", {
        method: config.method,
        url: config.url,
        fullURL: config.baseURL + config.url,
      });
    }
    
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  function (response) {
    return response;
  },
  async function (error) {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || "";
    const requestUrl = error?.config?.url || "";
    const isAuthEndpoint = requestUrl.includes("/auth/");
    const isOnLoginPage =
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/login");
    // Kiểm tra cả auth_token và accessToken
    const hasToken = !!(localStorage.getItem("auth_token") || localStorage.getItem("accessToken"));

    const originalRequest = error.config;

    // === Case 1: Token hết hạn => Refresh token ===
    if (status === 401 && hasToken && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshToken();
        if (newToken) {
          // Lưu token vào cả 2 key để tương thích
          localStorage.setItem("auth_token", newToken);
          localStorage.setItem("accessToken", newToken);
          api.defaults.headers.common["Authorization"] = "Bearer " + newToken;
          return api(originalRequest);
        }
      } catch (e) {
        console.error("Refresh token failed:", e);
      }
    }

    // === Case 2: User bị block / không có quyền => Logout luôn ===
    // CHỈ logout khi:
    // - 401: Token hết hạn hoặc không hợp lệ (đã xử lý ở trên)
    // - 403 với message về "khóa" hoặc "block": User bị block
    // - 419: CSRF token mismatch
    // KHÔNG logout khi 403 chỉ là lỗi phân quyền (role không đúng) - để user biết lỗi
    
    const isBlocked = message.toLowerCase().includes("khóa") || 
                      message.toLowerCase().includes("block") ||
                      error?.response?.data?.ly_do_block;
    
    const shouldLogout = status === 419 || 
                         (status === 401 && hasToken && !originalRequest._retry) ||
                         (status === 403 && isBlocked);
    
    if (shouldLogout) {
      try {
        // Xóa cả 2 loại token để đảm bảo
        localStorage.removeItem("auth_token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user_data");
        localStorage.removeItem("user");

        // Lưu thông tin block (nếu có) để hiển thị bên login
        const data = error?.response?.data || {};
        const blockInfo = {
          message: data?.message || "",
          ly_do_block: data?.ly_do_block || "",
          block_den_ngay: data?.block_den_ngay || "",
        };
        sessionStorage.setItem("blockedInfo", JSON.stringify(blockInfo));

        // Hiển thị thông báo block
        if (isBlocked) {
          toast.error("Tài khoản của bạn đã bị khóa. Vui lòng đăng nhập lại.");
        } else {
          toast.error("Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại.");
        }
      } catch (e) {}

      if (typeof window !== "undefined" && !isOnLoginPage && !isAuthEndpoint) {
        const reason = isBlocked ? "blocked" : "unauthorized";
        window.location.href = `/login?reason=${reason}`;
      }
    }

    return Promise.reject(error);
  }
);

// === Hàm refresh token ===
const refreshToken = async () => {
  const user = localStorage.getItem("user");
  if (user) {
    const { _id } = JSON.parse(user);
    try {
      const response = await api.post("/token/refresh", { _id });
      return response.data.accessToken;
    } catch (error) {
      console.error("Lỗi khi làm mới token:", error);
      throw error;
    }
  }
  return null;
};

export default api;
