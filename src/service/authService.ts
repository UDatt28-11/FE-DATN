import api from "../ApiFromBE/axios";

/**
 * 🔐 Auth Service - Xác thực người dùng
 * Gọi API tới Laravel backend: /api/...
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  role?: 'guest' | 'host' | 'admin';
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

const authService = {
  /**
   * POST /register
   * Đăng ký tài khoản mới
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const res = await api.post("/register", data);
    
    // Lưu token vào localStorage
    if (res.data.access_token) {
      localStorage.setItem("accessToken", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    }
    
    return res.data;
  },

  /**
   * POST /login
   * Đăng nhập
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res = await api.post("/login", credentials);
    
    // Lưu token vào localStorage
    if (res.data.access_token) {
      localStorage.setItem("accessToken", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    }
    
    return res.data;
  },

  /**
   * POST /logout
   * Đăng xuất
   */
  async logout(): Promise<void> {
    try {
      await api.post("/logout");
    } finally {
      // Xóa token khỏi localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    }
  },

  /**
   * GET /me
   * Lấy thông tin user hiện tại
   */
  async me(): Promise<User> {
    const res = await api.get("/me");
    return res.data.user || res.data;
  },

  /**
   * Kiểm tra user đã đăng nhập chưa
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem("accessToken");
  },

  /**
   * Lấy user từ localStorage
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Lấy token từ localStorage
   */
  getToken(): string | null {
    return localStorage.getItem("accessToken");
  },
};

export default authService;



