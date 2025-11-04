import { Dropdown, Button, Avatar, Space, Typography } from "antd";
import { UserOutlined, SettingOutlined, LogoutOutlined } from "@ant-design/icons";
import React from "react";
import { Link } from "react-router-dom";

const { Text } = Typography;

// Định nghĩa props để nhận hàm đăng xuất từ component cha (AppHeader)
interface UserMenuProps {
    onLogout?: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ onLogout }) => { // 👈 SỬA: Nhận props onLogout

    // Khi người dùng click vào "Đăng xuất"
    const handleLogout = () => {
        console.log("Đăng xuất...");
        if (onLogout) {
            onLogout(); // 👈 GỌI HÀM CẬP NHẬT TRẠNG THÁI (setIsLoggedIn(false))
        }
    };

    const items = [
        {
            key: 'profile',
            label: <Link to="/profile">Thông tin cá nhân</Link>,
            icon: <UserOutlined />,
        },
        {
            key: 'settings',
            label: <Link to="/settings">Cài đặt</Link>,
            icon: <SettingOutlined />,
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            // SỬA: Thay thế label bằng một component có thể gọi hàm handleLogout
            label: (
                <Button
                    type="text"
                    icon={<LogoutOutlined />}
                    danger
                    onClick={handleLogout} // 👈 KÍCH HOẠT ĐĂNG XUẤT
                    style={{ width: '100%', textAlign: 'left', padding: 0 }}
                >
                    Đăng xuất
                </Button>
            ),
            // Lưu ý: Đã loại bỏ onClick khỏi object item vì đã gán onClick vào Button bên trong label
        },
    ];

    return (
        <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
            <Button type="text" style={{ padding: 0, height: 'auto' }}>
                <Space align="center" style={{ cursor: 'pointer' }}>
                    <Avatar size="default" icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                    <Text strong style={{ color: '#000' }}>Xin chào, User</Text>
                </Space>
            </Button>
        </Dropdown>
    );
};

export default UserMenu;