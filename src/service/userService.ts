import api from '@/api/axios';
import type { User } from '@/types/user/user';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface GetAllUsersParams {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    per_page?: number;
}

const userService = {
    // Get all users (admin)
    async getAll(params?: GetAllUsersParams) {
        const response = await api.get(`${API_URL}/admin/users`, { params });
        return response.data;
    },

    // Get all users (legacy - giữ lại để tương thích)
    async getUsers() {
        const response = await api.get(`${API_URL}/admin/users`);
        return response.data;
    },

    // Get user statistics (tính toán từ getAll nếu không có endpoint riêng)
    async getStatistics() {
        try {
            // Thử gọi endpoint statistics nếu có
            const response = await api.get(`${API_URL}/admin/users/statistics`);
            return response.data;
        } catch (error: any) {
            // Nếu không có endpoint, tính toán từ getAll
            if (error.response?.status === 404) {
                const allUsers = await this.getAll({ per_page: 1000 });
                const users = Array.isArray(allUsers.data) ? allUsers.data : (Array.isArray(allUsers) ? allUsers : []);
                
                // Tính toán statistics
                const stats = {
                    total: users.length,
                    active: users.filter((u: any) => u.status === 'active').length,
                    inactive: users.filter((u: any) => u.status === 'inactive').length,
                    locked: users.filter((u: any) => u.locked || u.status === 'locked').length,
                    byRole: users.reduce((acc: any, u: any) => {
                        const role = u.role || 'unknown';
                        acc[role] = (acc[role] || 0) + 1;
                        return acc;
                    }, {}),
                };
                
                return {
                    success: true,
                    data: stats,
                };
            }
            throw error;
        }
    },

    // Get user by ID
    async getUserById(id: string | number) {
        const response = await api.get(`${API_URL}/admin/users/${id}`);
        return response.data;
    },

    // Create new user
    async createUser(userData: Partial<User>) {
        const response = await api.post(`${API_URL}/admin/users`, userData);
        return response.data;
    },

    // Update user
    async updateUser(id: string | number, userData: Partial<User>) {
        const response = await api.put(`${API_URL}/admin/users/${id}`, userData);
        return response.data;
    },

    // Delete user
    async deleteUser(id: string | number) {
        const response = await api.delete(`${API_URL}/admin/users/${id}`);
        return response.data;
    },

    // Toggle user status
    async toggleUserStatus(id: string | number) {
        const response = await api.patch(`${API_URL}/admin/users/${id}/status`);
        return response.data;
    }
};

export default userService;
