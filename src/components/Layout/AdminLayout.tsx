import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Layout,
  Menu,
  Typography,
  Avatar,
  Dropdown,
  Space,
  Badge,
  Button,
  Divider,
} from "antd";
import type { MenuProps } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  AppstoreOutlined,
  HomeOutlined,
  RestOutlined,
  CalendarOutlined,
  BarChartOutlined,
  MessageOutlined,
  SettingOutlined,
  BellOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  StarOutlined,
  DollarOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  IdcardOutlined,
  CustomerServiceOutlined,
  LoginOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path: string;
}

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const navigate = useNavigate();

  const menuItems: MenuItem[] = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Tổng quan",
      path: "/admin/dashboard",
    },
    {
      key: "category",
      icon: <AppstoreOutlined />,
      label: "Quản lý loại phòng",
      path: "/admin/category",
    },
    {
      key: "user",
      icon: <UserOutlined />,
      label: "Quản lý người dùng",
      path: "/admin/user",
    },
    {
      key: "listing",
      icon: <HomeOutlined />,
      label: "Quản lý Homestay",
      path: "/admin/listing",
    },
    {
      key: "amenities",
      icon: <CalendarOutlined />,
      label: "Quản lí tiện ích",
      path: "/admin/amenities",
    },
    {
      key: "accommodations",
      icon: <RestOutlined />,
      label: "Quản lí lưu trú",
      path: "/admin/accommodations",
    },
    {
      key: "supplies",
      icon: <ShoppingOutlined />,
      label: "Quản lý vật tư",
      path: "/admin/supplies",
    },
    {
      key: "services",
      icon: <CustomerServiceOutlined />,
      label: "Quản lý dịch vụ",
      path: "/admin/services",
    },
    {
      key: "booking",
      icon: <CalendarOutlined />,
      label: "Quản lí đặt phòng",
      path: "/admin/booking",
    },
    {
      key: "check-in-requests",
      icon: <IdcardOutlined />,
      label: "Yêu cầu check-in",
      path: "/admin/check-in-requests",
    },
    {
      key: "checkout-requests",
      icon: <LogoutOutlined />,
      label: "Yêu cầu checkout",
      path: "/admin/checkout-requests",
    },
    {
      key: "service-requests",
      icon: <ShoppingOutlined />,
      label: "Yêu cầu dịch vụ",
      path: "/admin/service-requests",
    },
    {
      key: "promotionManagement",
      icon: <DollarOutlined />,
      label: "Quản lí mã giảm giá",
      path: "/admin/promotion",
    },
    {
      key: "reviewManagement",
      icon: <StarOutlined />,
      label: "Quản lý đánh giá",
      path: "/admin/review",
    },
    {
      key: "messageManagement",
      icon: <MessageOutlined />,
      label: "Quản lý bình luận",
      path: "/admin/message",
    },

    {
      key: "analytics",
      icon: <BarChartOutlined />,
      label: "Thống kê",
      path: "/admin/analytics",
    },
    {
      key: "messages",
      icon: <MessageOutlined />,
      label: "Tin nhắn",
      path: "/admin/messages",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
      path: "/admin/settings",
    },
  ];

  const antdMenuItems: MenuProps["items"] = menuItems.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: <NavLink to={item.path}>{item.label}</NavLink>,
  }));

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Hồ sơ của tôi",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt tài khoản",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
    },
  ];

  const handleUserMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "logout") {
      console.log("Logging out...");
    } else if (key === "profile") {
      navigate("/admin/profile");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      {/* Sidebar - Modern Design */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={280}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          background: "linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)",
          boxShadow: "4px 0 24px rgba(0, 0, 0, 0.12)",
        }}
      >
        {/* Logo Section */}
        <div
          style={{
            height: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "0" : "0 24px",
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
            }}
          >
            <HomeOutlined style={{ fontSize: 20, color: "#fff" }} />
          </div>
          {!collapsed && (
            <div style={{ marginLeft: 12 }}>
              <Title
                level={4}
                style={{
                  color: "#fff",
                  margin: 0,
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                HomestayHub
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
                Admin Dashboard
              </Text>
            </div>
          )}
        </div>

        {/* Menu */}
        <div style={{ padding: "16px 12px" }}>
          <Menu
            mode="inline"
            defaultSelectedKeys={["dashboard"]}
            items={antdMenuItems}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
            }}
            theme="dark"
          />
        </div>
      </Sider>

      {/* Main Layout */}
      <Layout
        style={{
          marginLeft: collapsed ? 80 : 280,
          transition: "all 0.2s",
          background: "#f5f7fa",
        }}
      >
        {/* Header - Modern Glass Effect */}
        <Header
          style={{
            padding: "0 32px",
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(20px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
            position: "sticky",
            top: 0,
            zIndex: 1,
            borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
          }}
        >
          <Space size="large">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: 18,
                width: 48,
                height: 48,
                borderRadius: 12,
                color: "#1e3a8a",
              }}
            />
            <div>
              <Title level={4} style={{ margin: 0, color: "#1e3a8a" }}>
                Chào mừng trở lại! 👋
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {new Date().toLocaleDateString("vi-VN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </div>
          </Space>

          <Space size="middle">
            {/* Search Button */}
            <Button
              type="text"
              style={{
                borderRadius: 12,
                height: 40,
                color: "#64748b",
              }}
            >
              🔍 Tìm kiếm...
            </Button>

            {/* Notifications */}
            <Badge count={12} offset={[-8, 8]}>
              <Button
                type="text"
                icon={<BellOutlined />}
                style={{
                  fontSize: 18,
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  color: "#64748b",
                }}
              />
            </Badge>

            <Divider type="vertical" style={{ height: 32, margin: "0 8px" }} />

            {/* User Profile */}
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick,
              }}
              placement="bottomRight"
              arrow
            >
              <Space style={{ cursor: "pointer", padding: "4px 12px" }}>
                <Avatar
                  size={40}
                  src="https://randomuser.me/api/portraits/men/1.jpg"
                  style={{
                    border: "2px solid #e0e7ff",
                  }}
                />
                <div style={{ lineHeight: 1.3, textAlign: "left" }}>
                  <Text strong style={{ color: "#1e293b", fontSize: 14 }}>
                    Nguyễn Văn A
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Super Admin
                  </Text>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* Content Area */}
        <Content
          style={{
            margin: "24px",
            padding: 32,
            minHeight: 280,
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
          }}
        >
          <Outlet />
        </Content>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            padding: "16px 0",
            color: "#94a3b8",
            fontSize: 13,
          }}
        >
          © 2024 HomestayHub. Made with ❤️ in Vietnam
        </div>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
