import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Select, Space, message, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined, TeamOutlined, LoginOutlined, GoogleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../service/authService';
import { getDefaultDashboard } from '../../utils/permissions';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * Admin/Staff Login Page
 * Trang đăng nhập riêng cho Admin và Staff
 */
const AdminLoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login, isLoggedIn, user } = useAuth();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<'admin' | 'staff'>('admin');

    // Redirect nếu đã đăng nhập
    useEffect(() => {
        if (isLoggedIn && user) {
            const dashboard = getDefaultDashboard(user);
            navigate(dashboard);
        }
    }, [isLoggedIn, user, navigate]);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            let response;
            
            // Gọi API đăng nhập theo role
            if (selectedRole === 'admin') {
                response = await authService.adminLogin({
                    email: values.email,
                    password: values.password,
                });
            } else {
                response = await authService.staffLogin({
                    email: values.email,
                    password: values.password,
                });
            }

            // Lưu thông tin user và token vào context
            if (response.user && response.token) {
                login(response.user, response.token);
                message.success(response.message || 'Đăng nhập thành công!');

                // Redirect đến dashboard phù hợp
                const dashboard = getDefaultDashboard(response.user);
                navigate(dashboard);
            }
        } catch (error: any) {
            message.error(error.message || 'Đăng nhập thất bại. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            const googleUrl = await authService.getGoogleLoginUrl(selectedRole);
            window.location.href = googleUrl;
        } catch (error: any) {
            message.error(error.message || 'Không thể kết nối đến Google');
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '20px',
            }}
        >
            <Card
                style={{
                    width: '100%',
                    maxWidth: 450,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    borderRadius: 16,
                }}
                bodyStyle={{ padding: '40px 40px 30px' }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div
                        style={{
                            width: 80,
                            height: 80,
                            margin: '0 auto 20px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <SafetyOutlined style={{ fontSize: 40, color: 'white' }} />
                    </div>
                    <Title level={2} style={{ marginBottom: 8, fontSize: 28 }}>
                        Đăng Nhập Quản Lý
                    </Title>
                    <Text type="secondary" style={{ fontSize: 15 }}>
                        Dành cho Admin và Nhân viên
                    </Text>
                </div>

                {/* Form */}
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    size="large"
                    initialValues={{ role: 'admin' }}
                >
                    {/* Role Selection */}
                    <Form.Item
                        label={<span style={{ fontWeight: 500, fontSize: 15 }}>Vai trò</span>}
                        style={{ marginBottom: 24 }}
                    >
                        <Select
                            value={selectedRole}
                            onChange={setSelectedRole}
                            style={{ width: '100%' }}
                            size="large"
                        >
                            <Option value="admin">
                                <Space>
                                    <SafetyOutlined style={{ color: '#ff4d4f' }} />
                                    <span>Quản trị viên</span>
                                </Space>
                            </Option>
                            <Option value="staff">
                                <Space>
                                    <TeamOutlined style={{ color: '#1890ff' }} />
                                    <span>Nhân viên</span>
                                </Space>
                            </Option>
                        </Select>
                    </Form.Item>

                    {/* Email */}
                    <Form.Item
                        label={<span style={{ fontWeight: 500, fontSize: 15 }}>Email</span>}
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email' },
                            { type: 'email', message: 'Email không hợp lệ' },
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined style={{ color: '#bbb' }} />}
                            placeholder="admin@example.com"
                            style={{ borderRadius: 8, height: 48 }}
                        />
                    </Form.Item>

                    {/* Password */}
                    <Form.Item
                        label={<span style={{ fontWeight: 500, fontSize: 15 }}>Mật khẩu</span>}
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                        style={{ marginBottom: 30 }}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: '#bbb' }} />}
                            placeholder="••••••••"
                            style={{ borderRadius: 8, height: 48 }}
                        />
                    </Form.Item>

                    {/* Submit Button */}
                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        loading={loading}
                        disabled={loading}
                        icon={<LoginOutlined />}
                        style={{
                            height: 48,
                            fontSize: 16,
                            fontWeight: 600,
                            borderRadius: 8,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                        }}
                    >
                        {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                    </Button>
                </Form>

                {/* Divider */}
                <Divider plain style={{ margin: '24px 0', color: '#999' }}>
                    Hoặc
                </Divider>

                {/* Google Login Button */}
                <Button
                    icon={<GoogleOutlined />}
                    block
                    size="large"
                    onClick={handleGoogleLogin}
                    loading={loading}
                    disabled={loading}
                    style={{
                        height: 48,
                        fontSize: 15,
                        fontWeight: 500,
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    Đăng nhập bằng Google
                </Button>

                {/* Footer */}
                <div style={{ marginTop: 30, textAlign: 'center' }}>
                    <Text type="secondary" style={{ fontSize: 14 }}>
                        Bạn là khách hàng?{' '}
                        <a
                            onClick={() => navigate('/')}
                            style={{
                                color: '#667eea',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            Về trang chủ
                        </a>
                    </Text>
                </div>

                {/* Security Notice */}
                <div
                    style={{
                        marginTop: 24,
                        padding: '12px 16px',
                        background: '#f6f8fa',
                        borderRadius: 8,
                        textAlign: 'center',
                    }}
                >
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        🔒 Trang này chỉ dành cho nhân viên có thẩm quyền
                    </Text>
                </div>
            </Card>
        </div>
    );
};

export default AdminLoginPage;

