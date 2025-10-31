import { Form, Input, Button, Divider, Typography } from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import React from "react";
// Đường dẫn giả định: pages/ và context/ là hai thư mục cùng cấp dưới src/
import { useAuth } from "../../../context/AuthContext";

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    // Lấy hàm login từ AuthContext
    const { login } = useAuth();

    const onFinish = (values: any) => {
        console.log("Login values:", values);

        // 1. Thực hiện logic đăng nhập (Mô phỏng thành công)
        // Đây là bước quan trọng giúp ẩn nút Đăng nhập/Đăng ký
        login();

        // 2. Chuyển hướng người dùng sang trang chủ ('/')
        navigate("/");
    };

    // --- Inline Styles để căn giữa và giới hạn kích thước ---
    const overlayStyle: React.CSSProperties = {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.3)", // Nền mờ
    };

    const formContainerStyle: React.CSSProperties = {
        backgroundColor: "white",
        width: "100%",
        maxWidth: "360px", // GIỚI HẠN CHIỀU RỘNG TỐI ĐA
        borderRadius: "16px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        padding: "24px",
        zIndex: 10,
    };
    // --------------------------------------------------------

    return (
        // Nền mờ + căn giữa
        <div style={overlayStyle}>
            {/* Khung form */}
            <div style={formContainerStyle}>
                <Title level={4} style={{ textAlign: "center", color: "#1890ff", marginBottom: "8px" }}>
                    Đăng nhập
                </Title>
                <p style={{ color: "#8c8c8c", textAlign: "center", fontSize: "14px", marginBottom: "24px" }}>
                    Chào mừng bạn trở lại!
                </p>

                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: "Vui lòng nhập email" },
                            { type: "email", message: "Email không hợp lệ" },
                        ]}
                    >
                        <Input size="large" placeholder="Email" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
                    >
                        <Input.Password size="large" placeholder="Mật khẩu" />
                    </Form.Item>

                    {/* Link Quên mật khẩu */}
                    <div style={{ textAlign: "right", marginBottom: "24px" }}>
                        <Link to="/forgot-password" style={{ color: "#1890ff", fontSize: "14px" }}>
                            Quên mật khẩu?
                        </Link>
                    </div>

                    <Button type="primary" htmlType="submit" block size="large">
                        Đăng nhập
                    </Button>
                </Form>

                <Divider plain>Hoặc</Divider>

                <Button icon={<GoogleOutlined />} block size="large">
                    Đăng nhập bằng Google
                </Button>

                <div style={{ textAlign: "center", marginTop: "16px", fontSize: "14px" }}>
                    <Text>Bạn chưa có tài khoản? </Text>
                    <Link to="/register" style={{ color: "#1890ff" }}>
                        Đăng ký ngay
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
