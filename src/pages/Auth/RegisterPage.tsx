import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, Divider, Row, Col } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import authService, { RegisterData } from "../../service/authService";

const { Title, Text } = Typography;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleRegister = async (values: RegisterData) => {
    setLoading(true);
    try {
      const result = await authService.register(values);

      toast.success(`Đăng ký thành công! Chào mừng ${result.user.name}`);

      // Redirect to home or dashboard
      navigate("/");
    } catch (error: any) {
      console.error("Register error:", error);
      const errorMessage =
        error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại!";
      toast.error(errorMessage);

      // Show field-specific errors
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((field) => {
          form.setFields([
            {
              name: field,
              errors: errors[field],
            },
          ]);
        });
      }
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
          maxWidth: 600,
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          borderRadius: 16,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            Đăng ký tài khoản
          </Title>
          <Text type="secondary">Tạo tài khoản để bắt đầu sử dụng dịch vụ</Text>
        </div>

        <Form form={form} onFinish={handleRegister} layout="vertical" size="large">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="Họ và tên"
                rules={[
                  { required: true, message: "Vui lòng nhập họ tên!" },
                  { min: 3, message: "Họ tên phải có ít nhất 3 ký tự!" },
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="email@example.com" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ!" },
                ]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="0123456789" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu!" },
                  { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                ]}
                hasFeedback
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="password_confirmation"
                label="Xác nhận mật khẩu"
                dependencies={["password"]}
                hasFeedback
                rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Mật khẩu không khớp!"));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Đăng ký
            </Button>
          </Form.Item>

          <Divider plain>hoặc</Divider>

          <div style={{ textAlign: "center" }}>
            <Text>
              Đã có tài khoản?{" "}
              <Link to="/login" style={{ color: "#667eea", fontWeight: 500 }}>
                Đăng nhập ngay
              </Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;



