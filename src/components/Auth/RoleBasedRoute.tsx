import React from "react";
import { Navigate } from "react-router-dom";
import { Result, Button, Spin } from "antd";
import { LockOutlined, StopOutlined } from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import type { UserRole } from "../../utils/permissions";
import { canAccessRoute, getRoleLabel, getDefaultDashboard } from "../../utils/permissions";

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
  showAccessDenied?: boolean;
}

/**
 * Component bảo vệ route dựa trên role với nhiều tùy chọn
 * 
 * @example
 * ```tsx
 * // Redirect về trang chủ nếu không có quyền
 * <RoleBasedRoute allowedRoles={['admin']} redirectTo="/">
 *   <AdminPage />
 * </RoleBasedRoute>
 * 
 * // Hiển thị trang Access Denied
 * <RoleBasedRoute allowedRoles={['admin', 'staff']} showAccessDenied>
 *   <ManagementPage />
 * </RoleBasedRoute>
 * ```
 */
const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo,
  showAccessDenied = true,
}) => {
  const { user, isLoggedIn, loading } = useAuth();

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Spin size="large" tip="Đang kiểm tra quyền truy cập...">
          <div style={{ padding: "50px" }} />
        </Spin>
      </div>
    );
  }

  // Chưa đăng nhập
  if (!isLoggedIn || !user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          background: "#f5f5f5",
        }}
      >
        <Result
          status="warning"
          icon={<LockOutlined style={{ color: "#faad14" }} />}
          title="Yêu cầu đăng nhập"
          subTitle="Bạn cần đăng nhập với tài khoản có quyền phù hợp để truy cập trang này."
          extra={[
            <Button
              type="primary"
              key="login"
              onClick={() => (window.location.href = "/")}
            >
              Đăng nhập
            </Button>,
          ]}
        />
      </div>
    );
  }

  // Kiểm tra quyền
  const hasPermission = canAccessRoute(user, allowedRoles);

  if (!hasPermission) {
    // Redirect nếu được chỉ định
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    // Hiển thị Access Denied page
    if (showAccessDenied) {
      const allowedRoleLabels = allowedRoles.map(getRoleLabel).join(', ');
      const currentRoleLabel = getRoleLabel(user.role as UserRole);
      const defaultDashboard = getDefaultDashboard(user);

      return (
        <div
          style={{
            minHeight: "100vh",
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
              <div style={{ maxWidth: "500px", margin: "0 auto" }}>
                <p>
                  Trang này yêu cầu quyền: <strong>{allowedRoleLabels}</strong>
                </p>
                <p>
                  Vai trò hiện tại của bạn: <strong>{currentRoleLabel}</strong>
                </p>
                <p style={{ marginTop: "16px", color: "#666" }}>
                  Nếu bạn cho rằng đây là lỗi, vui lòng liên hệ quản trị viên.
                </p>
              </div>
            }
            extra={[
              <Button
                key="dashboard"
                type="primary"
                onClick={() => (window.location.href = defaultDashboard)}
              >
                Về Dashboard của bạn
              </Button>,
              <Button
                key="home"
                onClick={() => (window.location.href = "/")}
              >
                Về trang chủ
              </Button>,
            ]}
          />
        </div>
      );
    }

    // Fallback: redirect về trang chủ
    return <Navigate to="/" replace />;
  }

  // Có quyền truy cập
  return <>{children}</>;
};

export default RoleBasedRoute;

