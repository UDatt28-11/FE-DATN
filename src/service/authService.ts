import axiosInstance from './axiosConfig';

// Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone_number?: string;
}

export interface AuthResponse {
  message: string;
  user?: {
    id: number;
    full_name: string;
    email: string;
    phone_number?: string;
    role: string;
    email_verified_at?: string;
    created_at: string;
    updated_at: string;
  };
  token?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface UpdateProfileRequest {
  full_name: string;
  phone_number?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface UploadAvatarResponse {
  message: string;
  avatar_url: string;
}

// Auth Service
const authService = {
  /**
   * Đăng ký tài khoản mới
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>('/user/register', data);
      return response.data;
    } catch (error: any) {
      // Xử lý lỗi validation từ Laravel
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(', ');
        throw new Error(errorMessages);
      }
      throw new Error(error.response?.data?.message || 'Đăng ký thất bại');
    }
  },

  /**
   * Đăng nhập
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>('/user/login', data);
      
      // Lưu token và user data vào localStorage
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
      if (response.data.user) {
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      // Xử lý lỗi validation từ Laravel
      if (error.response?.status === 422 || error.response?.status === 401) {
        const errors = error.response.data.errors;
        if (errors) {
          const errorMessages = Object.values(errors).flat().join(', ');
          throw new Error(errorMessages);
        }
      }
      throw new Error(error.response?.data?.message || 'Đăng nhập thất bại');
    }
  },

  /**
   * Đăng xuất
   */
  async logout(): Promise<void> {
    try {
      await axiosInstance.post('/user/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Xóa token và user data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  },

  /**
   * Quên mật khẩu - Gửi email reset
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.post('/user/forgot-password', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(', ');
        throw new Error(errorMessages);
      }
      throw new Error(error.response?.data?.message || 'Gửi email thất bại');
    }
  },

  /**
   * Đặt lại mật khẩu
   */
  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.post('/user/reset-password', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 422 || error.response?.status === 400) {
        const errors = error.response.data.errors;
        if (errors) {
          const errorMessages = Object.values(errors).flat().join(', ');
          throw new Error(errorMessages);
        }
      }
      throw new Error(error.response?.data?.message || 'Đặt lại mật khẩu thất bại');
    }
  },

  /**
   * Lấy thông tin user hiện tại từ localStorage
   */
  getCurrentUser() {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Kiểm tra user đã đăng nhập chưa
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },

  /**
   * Lấy token
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  /**
   * Đăng nhập bằng Google
   */
  getGoogleLoginUrl(): string {
    return `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/user/google/redirect`;
  },

  /**
   * Cập nhật thông tin cá nhân
   */
  async updateProfile(data: UpdateProfileRequest): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.put<AuthResponse>('/user/profile', data);
      
      // Cập nhật user data trong localStorage
      if (response.data.user) {
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(', ');
        throw new Error(errorMessages);
      }
      throw new Error(error.response?.data?.message || 'Cập nhật thông tin thất bại');
    }
  },

  /**
   * Đổi mật khẩu
   */
  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.post('/user/change-password', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 422 || error.response?.status === 400) {
        const errors = error.response.data.errors;
        if (errors) {
          const errorMessages = Object.values(errors).flat().join(', ');
          throw new Error(errorMessages);
        }
      }
      throw new Error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
    }
  },

  /**
   * Upload avatar
   */
  async uploadAvatar(file: File): Promise<UploadAvatarResponse> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await axiosInstance.post<UploadAvatarResponse>('/user/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Cập nhật user data với avatar mới
      const currentUser = this.getCurrentUser();
      if (currentUser && response.data.avatar_url) {
        const updatedUser = { ...currentUser, avatar: response.data.avatar_url };
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
      }

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(', ');
        throw new Error(errorMessages);
      }
      throw new Error(error.response?.data?.message || 'Upload avatar thất bại');
    }
  },
};

export default authService;
