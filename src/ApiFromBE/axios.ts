import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

// Add a request interceptor
api.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
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
      typeof window !== "undefined" && window.location.pathname.startsWith("/login");
    const hasToken = !!localStorage.getItem("accessToken");

    const originalRequest = error.config;

    // === Case 1: Token hết hạn => Refresh token ===
    if (status === 401 && hasToken && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshToken();
        if (newToken) {
          localStorage.setItem("accessToken", newToken);
          api.defaults.headers.common["Authorization"] =
            "Bearer " + newToken;
          return api(originalRequest);
        }
      } catch (e) {
        console.error("Refresh token failed:", e);
      }
    }

    // === Case 2: User bị block / không có quyền => Logout luôn ===
    if (status === 403 || status === 419 || (status === 401 && hasToken)) {
      try {
        localStorage.removeItem("accessToken");
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
        if (status === 403 || message.toLowerCase().includes("khóa")) {
          toast.error("Tài khoản của bạn đã bị khóa. Vui lòng đăng nhập lại.");
        } else {
          toast.error("Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại.");
        }
      } catch (e) {}

      if (typeof window !== "undefined" && !isOnLoginPage && !isAuthEndpoint) {
        const reason =
          status === 403 || message.toLowerCase().includes("khóa")
            ? "blocked"
            : "unauthorized";
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
