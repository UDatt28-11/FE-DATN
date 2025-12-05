/**
 * Utility functions để kiểm tra quyền truy cập dựa trên role
 * Hỗ trợ 3 role: user, staff, admin
 */

export type UserRole = 'user' | 'staff' | 'admin';

export interface User {
    id: number;
    full_name: string;
    email: string;
    role: UserRole;
    [key: string]: any;
}

/**
 * Kiểm tra user có role cụ thể không
 */
export const hasRole = (user: User | null, role: UserRole): boolean => {
    if (!user) return false;
    return user.role === role;
};

/**
 * Kiểm tra user có một trong các role được chỉ định không
 */
export const hasAnyRole = (user: User | null, roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
};

/**
 * Kiểm tra user có phải admin không
 */
export const isAdmin = (user: User | null): boolean => {
    return hasRole(user, 'admin');
};

/**
 * Kiểm tra user có phải staff không
 */
export const isStaff = (user: User | null): boolean => {
    return hasRole(user, 'staff');
};

/**
 * Kiểm tra user có phải user thường không
 */
export const isUser = (user: User | null): boolean => {
    return hasRole(user, 'user');
};

/**
 * Kiểm tra user có phải staff hoặc admin không (cấp quản lý)
 */
export const isStaffOrAdmin = (user: User | null): boolean => {
    return hasAnyRole(user, ['staff', 'admin']);
};

/**
 * Lấy đường dẫn dashboard mặc định theo role
 */
export const getDefaultDashboard = (user: User | null): string => {
    if (!user) return '/';
    
    switch (user.role) {
        case 'admin':
            return '/admin/dashboard';
        case 'staff':
            return '/staff/dashboard';
        case 'user':
        default:
            return '/';
    }
};

/**
 * Kiểm tra permission để access một route cụ thể
 * @param user - User object
 * @param allowedRoles - Danh sách roles được phép
 * @returns true nếu user có quyền access
 */
export const canAccessRoute = (user: User | null, allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
};

/**
 * Lấy label hiển thị cho role
 */
export const getRoleLabel = (role: UserRole): string => {
    const labels: Record<UserRole, string> = {
        admin: 'Quản trị viên',
        staff: 'Nhân viên',
        user: 'Người dùng',
    };
    return labels[role];
};

/**
 * Lấy màu sắc cho role badge
 */
export const getRoleColor = (role: UserRole): string => {
    const colors: Record<UserRole, string> = {
        admin: '#ff4d4f', // red
        staff: '#1890ff', // blue
        user: '#52c41a',  // green
    };
    return colors[role];
};

/**
 * Kiểm tra user có quyền chỉnh sửa tài nguyên không
 * Admin có thể edit tất cả, Staff có thể edit của mình, User chỉ edit của mình
 */
export const canEdit = (currentUser: User | null, resourceOwnerId: number): boolean => {
    if (!currentUser) return false;
    
    // Admin có thể edit tất cả
    if (isAdmin(currentUser)) return true;
    
    // Staff và User chỉ có thể edit tài nguyên của mình
    return currentUser.id === resourceOwnerId;
};

/**
 * Kiểm tra user có quyền xóa tài nguyên không
 * Chỉ admin mới có quyền xóa
 */
export const canDelete = (currentUser: User | null): boolean => {
    return isAdmin(currentUser);
};

/**
 * API endpoint mapping theo role
 */
export const getApiEndpoint = (role: UserRole, endpoint: string): string => {
    const prefixes: Record<UserRole, string> = {
        admin: '/admin',
        staff: '/staff',
        user: '/user',
    };
    
    return `${prefixes[role]}${endpoint}`;
};

