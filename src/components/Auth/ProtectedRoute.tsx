import React from "react";
import { Result, Button } from "antd";
import { LockOutlined, StopOutlined } from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import type { UserRole } from "../../utils/permissions";
import { canAccessRoute, getRoleLabel } from "../../utils/permissions";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
}

/**
 * Component bảo vệ route dựa trên authentication và role
 * 
 * @example
 * ```tsx
 * // Chỉ yêu cầu đăng nhập
 * <ProtectedRoute>
 *   <BookingPage />
 * </ProtectedRoute>
 * 
 * // Yêu cầu role admin
 * <ProtectedRoute allowedRoles={['admin']}>
 *   <AdminDashboard />
 * </ProtectedRoute>
 * 
 * // Yêu cầu role admin hoặc staff
 * <ProtectedRoute allowedRoles={['admin', 'staff']}>
 *   <ManagementPage />
 * </ProtectedRoute>
 * ```
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  allowedRoles,
}) => {
  const { user, isLoggedIn, loading } = useAuth();

  // Đợi kiểm tra trạng thái đăng nhập
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <div className="loading-spinner">Đang kiểm tra...</div>
      </div>
    );
  }

  // Nếu yêu cầu đăng nhập nhưng chưa đăng nhập
  if (requireAuth && !isLoggedIn) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          background: "#f5f5f5",
        }}
      >
        <Result
          status="warning"
          icon={<LockOutlined style={{ color: "#cb8670" }} />}
          title="Yêu cầu đăng nhập"
          subTitle="Bạn cần đăng nhập để truy cập trang này."
          extra={[
            <Button
              type="primary"
              key="login"
              onClick={() => (window.location.href = "/")}
              style={{
                backgroundColor: "#cb8670",
                borderColor: "#cb8670",
              }}
            >
              Về trang chủ để đăng nhập
            </Button>,
          ]}
        />
      </div>
    );
  }

  // Kiểm tra role nếu được chỉ định
  if (allowedRoles && allowedRoles.length > 0 && user) {
    const hasPermission = canAccessRoute(user, allowedRoles);
    
    if (!hasPermission) {
      const allowedRoleLabels = allowedRoles.map(getRoleLabel).join(', ');
      const currentRoleLabel = getRoleLabel(user.role as UserRole);
      
      return (
        <div
          style={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px",
            background: "#f5f5f5",
          }}
        >
          <Result
            status="403"
            icon={<StopOutlined style={{ color: "#ff4d4f" }} />}
            title="Không có quyền truy cập"
            subTitle={
              <>
                Trang này yêu cầu quyền: <strong>{allowedRoleLabels}</strong>
                <br />
                Vai trò hiện tại của bạn: <strong>{currentRoleLabel}</strong>
              </>
            }
            extra={[
              <Button
                type="primary"
                key="home"
                onClick={() => (window.location.href = "/")}
                style={{
                  backgroundColor: "#cb8670",
                  borderColor: "#cb8670",
                }}
              >
                Về trang chủ
              </Button>,
            ]}
          />
        </div>
      );
    }
  }

  // Nếu đã đăng nhập và có quyền (hoặc không yêu cầu role)
  return <>{children}</>;
};

export default ProtectedRoute;
