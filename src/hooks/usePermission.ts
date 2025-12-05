/**
 * Custom Hook để kiểm tra quyền truy cập
 * Sử dụng trong components để check role và permissions
 */

import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserRole, User } from '../utils/permissions';
import {
    hasRole,
    hasAnyRole,
    isAdmin,
    isStaff,
    isUser,
    isStaffOrAdmin,
    canAccessRoute,
    canEdit,
    canDelete,
    getDefaultDashboard,
} from '../utils/permissions';

interface UsePermissionReturn {
    user: User | null;
    isLoggedIn: boolean;
    loading: boolean;
    
    // Role checks
    hasRole: (role: UserRole) => boolean;
    hasAnyRole: (roles: UserRole[]) => boolean;
    isAdmin: boolean;
    isStaff: boolean;
    isUser: boolean;
    isStaffOrAdmin: boolean;
    
    // Route access
    canAccessRoute: (allowedRoles: UserRole[]) => boolean;
    defaultDashboard: string;
    
    // Resource permissions
    canEdit: (resourceOwnerId: number) => boolean;
    canDelete: boolean;
}

/**
 * Hook để kiểm tra permissions trong component
 * 
 * @example
 * ```tsx
 * const { isAdmin, canEdit, canDelete } = usePermission();
 * 
 * if (isAdmin) {
 *   // Hiển thị admin menu
 * }
 * 
 * if (canEdit(userId)) {
 *   // Hiển thị nút edit
 * }
 * ```
 */
export const usePermission = (): UsePermissionReturn => {
    const { user, isLoggedIn, loading } = useAuth();
    
    const permissions = useMemo(() => ({
        user,
        isLoggedIn,
        loading,
        
        // Role checks
        hasRole: (role: UserRole) => hasRole(user, role),
        hasAnyRole: (roles: UserRole[]) => hasAnyRole(user, roles),
        isAdmin: isAdmin(user),
        isStaff: isStaff(user),
        isUser: isUser(user),
        isStaffOrAdmin: isStaffOrAdmin(user),
        
        // Route access
        canAccessRoute: (allowedRoles: UserRole[]) => canAccessRoute(user, allowedRoles),
        defaultDashboard: getDefaultDashboard(user),
        
        // Resource permissions
        canEdit: (resourceOwnerId: number) => canEdit(user, resourceOwnerId),
        canDelete: canDelete(user),
    }), [user, isLoggedIn, loading]);
    
    return permissions;
};

/**
 * Hook để kiểm tra có quyền truy cập route không
 * Thường dùng trong route guards
 * 
 * @example
 * ```tsx
 * const hasAccess = useRoutePermission(['admin', 'staff']);
 * 
 * if (!hasAccess) {
 *   return <AccessDenied />;
 * }
 * ```
 */
export const useRoutePermission = (allowedRoles: UserRole[]): boolean => {
    const { user } = useAuth();
    return canAccessRoute(user, allowedRoles);
};

/**
 * Hook để kiểm tra có quyền với resource cụ thể không
 * 
 * @example
 * ```tsx
 * const { canEdit, canDelete } = useResourcePermission(booking.user_id);
 * ```
 */
export const useResourcePermission = (resourceOwnerId: number) => {
    const { user } = useAuth();
    
    return useMemo(() => ({
        canEdit: canEdit(user, resourceOwnerId),
        canDelete: canDelete(user),
        canView: true, // Mặc định ai cũng có thể view
    }), [user, resourceOwnerId]);
};

