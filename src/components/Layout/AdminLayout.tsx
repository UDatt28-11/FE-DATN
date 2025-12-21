import React, { useState, useMemo } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
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
  message,
  Input,
} from "antd";
import type { MenuProps } from "antd";
import { useAuth } from "../../context/AuthContext";
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
  GiftOutlined,
  SearchOutlined,
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
  const location = useLocation();
  const { user, logout } = useAuth();

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
      label: "Quản lí check-in",
      path: "/admin/check-in-requests",
    },
    {
      key: "checkout-requests",
      icon: <LogoutOutlined />,
      label: "Quản lí checkout",
      path: "/admin/checkout-requests",
    },
    {
      key: "service-requests",
      icon: <ShoppingOutlined />,
      label: "Yêu cầu dịch vụ",
      path: "/admin/service-requests",
    },
    {
      key: "amenity-requests",
      icon: <AppstoreOutlined />,
      label: "Yêu cầu tiện ích",
      path: "/admin/amenity-requests",
    },
    {
      key: "promotionManagement",
      icon: <DollarOutlined />,
      label: "Quản lí Khuyến mãi",
      path: "/admin/promotion",
    },
    {
      key: "voucherManagement",
      icon: <GiftOutlined />,
      label: "Quản lý Voucher",
      path: "/admin/vouchers",
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

  // Xác định selected key dựa trên pathname hiện tại
  const selectedKeys = useMemo(() => {
    const currentPath = location.pathname;

    // Tìm menu item có path khớp với pathname hiện tại
    const matchedItem = menuItems.find((item) => {
      // Kiểm tra exact match
      if (currentPath === item.path) {
        return true;
      }
      // Kiểm tra nếu pathname bắt đầu bằng item.path (cho các sub-routes)
      // Ví dụ: /admin/category/123 sẽ match với /admin/category
      if (
        currentPath.startsWith(item.path + "/") ||
        currentPath.startsWith(item.path + "?")
      ) {
        return true;
      }
      return false;
    });

    return matchedItem ? [matchedItem.key] : [];
  }, [location.pathname]);

  const userMenuItems: MenuProps["items"] = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
    },
  ];

  const handleUserMenuClick: MenuProps["onClick"] = async ({ key }) => {
    if (key === "logout") {
      try {
        await logout();
        message.success("Đăng xuất thành công");
        // Redirect về trang chủ người dùng
        window.location.href = "/";
      } catch (error: any) {
        console.error("Logout error:", error);
        message.error("Có lỗi xảy ra khi đăng xuất");
        // Vẫn redirect về trang chủ dù có lỗi
        window.location.href = "/";
      }
    }
  };
  const handleSearch = (value: string) => {
    if (!value.trim()) return;

    navigate(`/admin/search?keyword=${encodeURIComponent(value)}`);
  };


  return (
    <Layout style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {/* Sidebar - BookStay Tone */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={260}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          background: "#3b2f2f", // Nâu đất
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
            padding: collapsed ? "0" : "0 20px",
            background: "rgba(255, 255, 255, 0.05)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: "linear-gradient(135deg, #eab308 0%, #f59e0b 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(234, 179, 8, 0.4)",
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
                BookStay Admin
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
                Quản trị hệ thống
              </Text>
            </div>
          )}
        </div>

        {/* Menu */}
        <div style={{ padding: "16px 12px" }}>
          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
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
          marginLeft: collapsed ? 80 : 260,
          transition: "all 0.2s",
          background: "#f9fafb",
        }}
      >
        {/* Header */}
        <Header
          style={{
            padding: "0 28px",
            background: "#fff8f0", // Trắng kem
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
          <Space size="large" align="center">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: 18,
                width: 44,
                height: 44,
                borderRadius: 12,
                color: "#eab308", // Cam vàng
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: 4 }}>
              <Title level={4} style={{ margin: 0, color: "#1f2937" }}>
                Chào mừng bạn đến với BookStay
              </Title>
              <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
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
            <Input
              placeholder="Tìm kiếm..."
              prefix={<SearchOutlined style={{ color: "#eab308" }} />}
              style={{
                borderRadius: 12,
                height: 40,
                width: 200,
                color: "#1f2937",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
              }}
              allowClear
              onPressEnter={(e) =>
                handleSearch((e.target as HTMLInputElement).value)
              }
            />


            <Badge count={12} offset={[-8, 8]}>
              <Button
                type="text"
                icon={<BellOutlined />}
                style={{
                  fontSize: 18,
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  color: "#eab308",
                }}
              />
            </Badge>

            <Divider type="vertical" style={{ height: 32, margin: "0 8px" }} />

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
                    border: "2px solid #eab308",
                  }}
                />
                <div style={{ lineHeight: 1.3, textAlign: "left" }}>
                  <Text strong style={{ color: "#1f2937", fontSize: 14 }}>
                    Nguyễn Văn A
                  </Text>
                  <br />
                  <Text style={{ fontSize: 12, color: "#6b7280" }}>
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
            background: "#ffffff",
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
            color: "#6b7280",
            fontSize: 13,
          }}
        >
          © 2024 BookStay. Made with ❤️ in Vietnam
        </div>
      </Layout>
    </Layout>

  );
};

export default AdminLayout;
