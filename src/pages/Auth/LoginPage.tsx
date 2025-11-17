import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, Divider, Checkbox } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import authService from "../../service/authService";

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleLogin = async (values: { email: string; password: string; remember?: boolean }) => {
    setLoading(true);
    try {
      const result = await authService.login({
        email: values.email,
        password: values.password,
      });

      toast.success(`Chào mừng ${result.user.name}!`);

      // Redirect based on role
      if (result.user.role === "admin" || result.user.role === "staff") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 450,
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          borderRadius: 16,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            Đăng nhập
          </Title>
          <Text type="secondary">Chào mừng bạn quay trở lại!</Text>
        </div>

        <Form form={form} onFinish={handleLogin} layout="vertical" size="large">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Ghi nhớ đăng nhập</Checkbox>
              </Form.Item>
              <Link to="/forgot-password" style={{ color: "#667eea" }}>
                Quên mật khẩu?
              </Link>
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Đăng nhập
            </Button>
          </Form.Item>

          <Divider plain>hoặc</Divider>

          <div style={{ textAlign: "center" }}>
            <Text>
              Chưa có tài khoản?{" "}
              <Link to="/register" style={{ color: "#667eea", fontWeight: 500 }}>
                Đăng ký ngay
              </Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;



