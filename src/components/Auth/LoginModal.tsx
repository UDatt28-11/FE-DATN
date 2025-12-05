import React, { useState } from 'react';
import { Modal, Form, Input, Button, Divider, Typography, message, Select, Space } from 'antd';
import { GoogleOutlined, UserOutlined, LockOutlined, SafetyOutlined, TeamOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../service/authService';
import type { UserRole } from '../../utils/permissions';
import { getDefaultDashboard } from '../../utils/permissions';

const { Text } = Typography;
const { Option } = Select;

interface LoginModalProps {
    open?: boolean;
    visible?: boolean; // Deprecated, use open instead
    onClose: () => void;
    onSwitchToRegister: () => void;
    onSwitchToForgotPassword?: () => void;
    defaultRole?: 'user' | 'admin' | 'staff';
}

const LoginModal: React.FC<LoginModalProps> = ({
    open,
    visible, // Deprecated, use open instead
    onClose,
    onSwitchToRegister,
    onSwitchToForgotPassword,
    defaultRole = 'user'
}) => {
    const isOpen = open !== undefined ? open : visible; // Support both for backward compatibility
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<'user' | 'admin' | 'staff'>(defaultRole);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            let response;
            
            // Gọi API đăng nhập theo role
            switch (selectedRole) {
                case 'admin':
                    response = await authService.adminLogin({
                        email: values.email,
                        password: values.password,
                    });
                    break;
                case 'staff':
                    response = await authService.staffLogin({
                        email: values.email,
                        password: values.password,
                    });
                    break;
                default:
                    response = await authService.login({
                        email: values.email,
                        password: values.password,
                    });
            }

            // Lưu thông tin user và token vào context
            if (response.user && response.token) {
                login(response.user, response.token);
                message.success(response.message || 'Đăng nhập thành công!');

                // Đóng modal và reset form
                onClose();
                form.resetFields();

                // Redirect đến dashboard phù hợp với role
                const dashboard = getDefaultDashboard(response.user);
                navigate(dashboard);
            }
        } catch (error: any) {
            message.error(error.message || 'Đăng nhập thất bại. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        onClose();
        form.resetFields();
    };

    const handleRegisterClick = () => {
        onClose();
        onSwitchToRegister();
    };

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            // Lấy Google OAuth URL từ backend
            const googleUrl = await authService.getGoogleLoginUrl(selectedRole);
            // Redirect đến Google
            window.location.href = googleUrl;
        } catch (error: any) {
            message.error(error.message || 'Không thể kết nối đến Google');
            setLoading(false);
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return <SafetyOutlined />;
            case 'staff': return <TeamOutlined />;
            default: return <UserSwitchOutlined />;
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin': return 'Quản trị viên';
            case 'staff': return 'Nhân viên';
            default: return 'Người dùng';
        }
    };

    return (
        <Modal
            open={isOpen}
            onCancel={handleCancel}
            footer={null}
            width={450}
            centered
            destroyOnHidden
            styles={{
                body: { padding: '40px 30px' }
            }}
        >
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
                <h2 style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: '#363636',
                    marginBottom: 8,
                    letterSpacing: '-0.5px'
                }}>
                    Đăng Nhập
                </h2>
                <p style={{
                    color: '#7d7d7d',
                    fontSize: 15,
                    marginBottom: 0
                }}>
                    Chào mừng bạn trở lại với Palatin Hotel!
                </p>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                size="large"
            >
                <Form.Item
                    label={<span style={{ fontWeight: 500 }}>Đăng nhập với vai trò</span>}
                    style={{ marginBottom: 20 }}
                >
                    <Select
                        value={selectedRole}
                        onChange={setSelectedRole}
                        style={{ width: '100%' }}
                        size="large"
                    >
                        <Option value="user">
                            <Space>
                                <UserSwitchOutlined />
                                <span>Người dùng</span>
                            </Space>
                        </Option>
                        <Option value="staff">
                            <Space>
                                <TeamOutlined />
                                <span>Nhân viên</span>
                            </Space>
                        </Option>
                        <Option value="admin">
                            <Space>
                                <SafetyOutlined />
                                <span>Quản trị viên</span>
                            </Space>
                        </Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="email"
                    rules={[
                        { required: true, message: 'Vui lòng nhập email' },
                        { type: 'email', message: 'Email không hợp lệ' },
                    ]}
                >
                    <Input
                        prefix={<UserOutlined style={{ color: '#cb8670' }} />}
                        placeholder="Email của bạn"
                        style={{
                            borderRadius: 6,
                            height: 48
                        }}
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                >
                    <Input.Password
                        prefix={<LockOutlined style={{ color: '#cb8670' }} />}
                        placeholder="Mật khẩu"
                        style={{
                            borderRadius: 6,
                            height: 48
                        }}
                    />
                </Form.Item>

                <div style={{
                    textAlign: 'right',
                    marginBottom: 24,
                    marginTop: -10
                }}>
                    {onSwitchToForgotPassword ? (
                        <Button
                            type="link"
                            onClick={() => {
                                onClose();
                                onSwitchToForgotPassword();
                            }}
                            style={{
                                color: '#cb8670',
                                fontSize: 14,
                                fontWeight: 500,
                                padding: 0,
                                height: 'auto'
                            }}
                        >
                            Quên mật khẩu?
                        </Button>
                    ) : (
                        <Link
                            to="/forgot-password"
                            onClick={handleCancel}
                            style={{
                                color: '#cb8670',
                                fontSize: 14,
                                fontWeight: 500
                            }}
                        >
                            Quên mật khẩu?
                        </Link>
                    )}
                </div>

                <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={loading}
                    disabled={loading}
                    style={{
                        height: 48,
                        fontSize: 16,
                        fontWeight: 600,
                        backgroundColor: '#cb8670',
                        borderColor: '#cb8670',
                        borderRadius: 6,
                        letterSpacing: '0.5px'
                    }}
                >
                    {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                </Button>
            </Form>

            <Divider plain style={{ margin: '24px 0', color: '#999' }}>
                Hoặc
            </Divider>

            <Button
                icon={<GoogleOutlined />}
                block
                size="large"
                onClick={handleGoogleLogin}
                style={{
                    height: 48,
                    fontSize: 15,
                    fontWeight: 500,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                Đăng nhập bằng Google
            </Button>

            <div style={{
                textAlign: 'center',
                marginTop: 24,
                fontSize: 15
            }}>
                <Text style={{ color: '#666' }}>Bạn chưa có tài khoản? </Text>
                <a
                    onClick={handleRegisterClick}
                    style={{
                        color: '#cb8670',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    Đăng ký ngay
                </a>
            </div>
        </Modal>
    );
};

export default LoginModal;
