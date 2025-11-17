import api from "../ApiFromBE/axios";
import type { User } from "./authService";

/**
 * 👥 User Service - Quản lý Người dùng
 * Gọi API tới Laravel backend
 */

export interface UserListParams {
  page?: number;
  per_page?: number;
  search?: string;
  role?: string;
  status?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
  password?: string;
  password_confirmation?: string;
}

export interface UserStatistics {
  total_users: number;
  active_users: number;
  blocked_users: number;
  new_users_this_month: number;
  by_role: {
    [key: string]: number;
  };
}

const userService = {
  /**
   * GET /users
   * Lấy danh sách người dùng (admin only)
   */
  async getAll(params?: UserListParams): Promise<{ data: User[]; total: number }> {
    const res = await api.get("/users", { params });
    return {
      data: res.data.data || res.data,
      total: res.data.meta?.total || res.data.total || 0,
    };
  },

  /**
   * GET /users/{id}
   * Lấy chi tiết người dùng
   */
  async getById(id: number | string): Promise<User> {
    const res = await api.get(`/users/${id}`);
    return res.data.data || res.data;
  },

  /**
   * POST /users
   * Tạo người dùng mới (admin only)
   */
  async create(data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
    role?: string;
  }): Promise<User> {
    const res = await api.post("/users", data);
    return res.data.data || res.data;
  },

  /**
   * PUT /users/{id}
   * Cập nhật thông tin người dùng
   */
  async update(id: number | string, data: UpdateUserData): Promise<User> {
    const res = await api.put(`/users/${id}`, data);
    return res.data.data || res.data;
  },

  /**
   * DELETE /users/{id}
   * Xóa người dùng (admin only)
   */
  async remove(id: number | string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  /**
   * POST /users/{id}/block
   * Khóa tài khoản người dùng
   */
  async block(id: number | string, reason?: string): Promise<User> {
    const res = await api.post(`/users/${id}/block`, { reason });
    return res.data.data || res.data;
  },

  /**
   * POST /users/{id}/unblock
   * Mở khóa tài khoản người dùng
   */
  async unblock(id: number | string): Promise<User> {
    const res = await api.post(`/users/${id}/unblock`);
    return res.data.data || res.data;
  },

  /**
   * PUT /users/{id}/change-password
   * Đổi mật khẩu người dùng
   */
  async changePassword(
    id: number | string,
    data: {
      current_password?: string;
      new_password: string;
      new_password_confirmation: string;
    }
  ): Promise<void> {
    await api.put(`/users/${id}/change-password`, data);
  },

  /**
   * PUT /users/{id}/update-role
   * Cập nhật vai trò người dùng (admin only)
   */
  async updateRole(id: number | string, role: string): Promise<User> {
    const res = await api.put(`/users/${id}/update-role`, { role });
    return res.data.data || res.data;
  },

  /**
   * GET /users/statistics
   * Lấy thống kê người dùng (admin only)
   */
  async getStatistics(): Promise<UserStatistics> {
    const res = await api.get("/users/statistics");
    return res.data.data || res.data;
  },

  /**
   * GET /users/blocked
   * Lấy danh sách người dùng bị khóa
   */
  async getBlocked(params?: UserListParams): Promise<{ data: User[]; total: number }> {
    const res = await api.get("/users/blocked", { params });
    return {
      data: res.data.data || res.data,
      total: res.data.meta?.total || res.data.total || 0,
    };
  },

  /**
   * GET /users/search
   * Tìm kiếm người dùng
   */
  async search(keyword: string, params?: UserListParams): Promise<User[]> {
    const res = await api.get("/users/search", {
      params: { ...params, keyword },
    });
    return res.data.data || res.data;
  },

  /**
   * POST /users/bulk-delete
   * Xóa nhiều người dùng cùng lúc
   */
  async bulkDelete(userIds: number[]): Promise<void> {
    await api.post("/users/bulk-delete", { user_ids: userIds });
  },

  /**
   * POST /users/bulk-update-status
   * Cập nhật trạng thái nhiều người dùng
   */
  async bulkUpdateStatus(userIds: number[], status: string): Promise<void> {
    await api.post("/users/bulk-update-status", {
      user_ids: userIds,
      status,
    });
  },

  /**
   * GET /users/by-role/{role}
   * Lấy người dùng theo vai trò
   */
  async getByRole(role: string, params?: UserListParams): Promise<User[]> {
    const res = await api.get(`/users/by-role/${role}`, { params });
    return res.data.data || res.data;
  },
};

export default userService;



