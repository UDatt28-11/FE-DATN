import api from '@/api/axios';

interface GetAllUsersParams {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

interface CreateUserData {
    full_name: string;
    email: string;
    password: string;
    phone_number?: string;
    date_of_birth?: string;
    gender?: 'male' | 'female' | 'other';
    address?: string;
    status?: 'active' | 'locked';
    role?: 'admin' | 'staff' | 'user';
}

interface UpdateUserData {
    full_name?: string;
    email?: string;
    password?: string;
    phone_number?: string;
    date_of_birth?: string;
    gender?: 'male' | 'female' | 'other';
    address?: string;
    status?: 'active' | 'locked';
    avatar_url?: string;
    role?: 'admin' | 'staff' | 'user';
}

interface UpdateStatusData {
    status: 'active' | 'locked';
}

const userService = {
    // Get all users (admin) - với pagination
    async getAll(params?: GetAllUsersParams) {
        const response = await api.get('/admin/users', { params });
        return response.data;
    },

    // Get all users (legacy - giữ lại để tương thích)
    async getUsers() {
        const response = await api.get('/admin/users');
        return response.data;
    },

    // Get user statistics (tính toán từ getAll với pagination)
    async getStatistics() {
        try {
            // Lấy total users từ API không filter (chỉ cần meta, không cần data)
            const allUsersResponse = await this.getAll({ per_page: 1 });
            const totalUsers = allUsersResponse.meta?.pagination?.total || 0;
            
            if (totalUsers === 0) {
                return {
                    success: true,
                    data: {
                        total_users: 0,
                        active_users: 0,
                        locked_users: 0,
                        new_users_this_month: 0,
                    },
                };
            }

            // Lấy active users count (chỉ cần meta)
            const activeResponse = await this.getAll({ status: 'active', per_page: 1 });
            const activeUsers = activeResponse.meta?.pagination?.total || 0;

            // Lấy locked users count (chỉ cần meta)
            const lockedResponse = await this.getAll({ status: 'locked', per_page: 1 });
            const lockedUsers = lockedResponse.meta?.pagination?.total || 0;

            // Tính new users this month
            // Lấy users với per_page tối đa 100 (theo validation rule)
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            
            let newUsersThisMonth = 0;
            // Lấy users với per_page = 100 (max allowed)
            const usersForNewCount = await this.getAll({ per_page: 100 });
            if (usersForNewCount.success && usersForNewCount.data) {
                const users = usersForNewCount.data as any[];
                newUsersThisMonth = users.filter((u: any) => {
                    if (!u.created_at) return false;
                    const createdDate = new Date(u.created_at);
                    return createdDate >= startOfMonth;
                }).length;
                
                // Nếu có nhiều hơn 100 users, cần ước tính dựa trên tỷ lệ
                if (totalUsers > 100 && users.length === 100) {
                    const newUsersRatio = newUsersThisMonth / users.length;
                    newUsersThisMonth = Math.round(totalUsers * newUsersRatio);
                } else if (totalUsers <= 100) {
                    // Nếu total <= 100, đã có đủ dữ liệu
                    newUsersThisMonth = users.filter((u: any) => {
                        if (!u.created_at) return false;
                        const createdDate = new Date(u.created_at);
                        return createdDate >= startOfMonth;
                    }).length;
                }
            }
            
            const stats = {
                total_users: totalUsers,
                active_users: activeUsers,
                locked_users: lockedUsers,
                new_users_this_month: newUsersThisMonth,
            };
            
            return {
                success: true,
                data: stats,
            };
        } catch (error: any) {
            console.error('Error calculating statistics:', error);
            // Trả về stats mặc định nếu có lỗi
            return {
                success: true,
                data: {
                    total_users: 0,
                    active_users: 0,
                    locked_users: 0,
                    new_users_this_month: 0,
                },
            };
        }
    },

    // Get user by ID
    async getUserById(id: string | number) {
        const response = await api.get(`/admin/users/${id}`);
        return response.data;
    },

    // Create new user
    async createUser(userData: CreateUserData) {
        const response = await api.post('/admin/users', userData);
        return response.data;
    },

    // Update user
    async updateUser(id: string | number, userData: UpdateUserData) {
        const response = await api.put(`/admin/users/${id}`, userData);
        return response.data;
    },

    // Delete user
    async deleteUser(id: string | number) {
        const response = await api.delete(`/admin/users/${id}`);
        return response.data;
    },

    // Update user status
    async updateStatus(id: string | number, status: 'active' | 'locked') {
        const response = await api.patch(`/admin/users/${id}/status`, { status });
        return response.data;
    },

    // Bulk lock users
    async bulkLock(userIds: number[]) {
        const response = await api.post('/admin/users/bulk-lock', { user_ids: userIds });
        return response.data;
    },

    // Bulk unlock users
    async bulkUnlock(userIds: number[]) {
        const response = await api.post('/admin/users/bulk-unlock', { user_ids: userIds });
        return response.data;
    },

    // Verify user identity
    async verifyIdentity(id: string | number) {
        const response = await api.post(`/admin/users/${id}/verify-identity`);
        return response.data;
    },

    // Reject user identity verification
    async rejectIdentity(id: string | number, notes?: string) {
        const response = await api.post(`/admin/users/${id}/reject-identity`, { notes });
        return response.data;
    },

    // Get locked users
    async getLockedUsers(params?: GetAllUsersParams) {
        const response = await api.get('/admin/users/locked', { params });
        return response.data;
    },

    // Legacy methods for compatibility
    async block(id: string | number, reason?: string) {
        return this.updateStatus(id, 'locked');
    },

    async unblock(id: string | number) {
        return this.updateStatus(id, 'active');
    },

    async remove(id: string | number) {
        return this.deleteUser(id);
    },
};

export default userService;
