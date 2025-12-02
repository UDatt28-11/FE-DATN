import React, { useState } from 'react';
import { Modal, Form, Input, Button, Divider, Typography, message } from 'antd';
import { GoogleOutlined, UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import authService from '../../service/authService';

const { Text } = Typography;

interface RegisterModalProps {
    open?: boolean;
    visible?: boolean; // Deprecated, use open instead
    onClose: () => void;
    onSwitchToLogin: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ 
    open, 
    visible, // Deprecated, use open instead
    onClose, 
    onSwitchToLogin 
}) => {
    const isOpen = open !== undefined ? open : visible; // Support both for backward compatibility
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            // Gọi API đăng ký
            const response = await authService.register({
                full_name: values.full_name,
                email: values.email,
                password: values.password,
                password_confirmation: values.confirmPassword,
                phone_number: values.phone_number,
            });

            message.success(response.message || 'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.');

            // Đóng modal register và chuyển sang login
            onClose();
            form.resetFields();

            // Chuyển sang modal login sau 1.5s
            setTimeout(() => {
                onSwitchToLogin();
            }, 1500);

        } catch (error: any) {
            message.error(error.message || 'Đăng ký thất bại. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        onClose();
        form.resetFields();
    };

    const handleLoginClick = () => {
        onClose();
        onSwitchToLogin();
    };

    const handleGoogleRegister = () => {
        // Chuyển hướng đến Google OAuth
        const googleUrl = authService.getGoogleLoginUrl();
        window.location.href = googleUrl;
    };

    return (
        <Modal
            open={isOpen}
            onCancel={handleCancel}
            footer={null}
            width={500}
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
                    Đăng Ký Tài Khoản
                </h2>
                <p style={{
                    color: '#7d7d7d',
                    fontSize: 15,
                    marginBottom: 0
                }}>
                    Tạo tài khoản để trải nghiệm dịch vụ tuyệt vời!
                </p>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                size="large"
            >
                <Form.Item
                    name="full_name"
                    rules={[
                        { required: true, message: 'Vui lòng nhập họ tên' },
                        { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự' }
                    ]}
                >
                    <Input
                        prefix={<UserOutlined style={{ color: '#cb8670' }} />}
                        placeholder="Họ và tên"
                        style={{
                            borderRadius: 6,
                            height: 48
                        }}
                    />
                </Form.Item>

                <Form.Item
                    name="email"
                    rules={[
                        { required: true, message: 'Vui lòng nhập email' },
                        { type: 'email', message: 'Email không hợp lệ' },
                    ]}
                >
                    <Input
                        prefix={<MailOutlined style={{ color: '#cb8670' }} />}
                        placeholder="Email của bạn"
                        style={{
                            borderRadius: 6,
                            height: 48
                        }}
                    />
                </Form.Item>

                <Form.Item
                    name="phone_number"
                    rules={[
                        { pattern: /^[0-9]{9,11}$/, message: 'Số điện thoại phải có 9-11 chữ số' }
                    ]}
                >
                    <Input
                        prefix={<PhoneOutlined style={{ color: '#cb8670' }} />}
                        placeholder="Số điện thoại (không bắt buộc)"
                        style={{
                            borderRadius: 6,
                            height: 48
                        }}
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu' },
                        { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                    ]}
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

                <Form.Item
                    name="confirmPassword"
                    dependencies={['password']}
                    rules={[
                        { required: true, message: 'Vui lòng nhập lại mật khẩu' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Mật khẩu nhập lại không khớp!'));
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined style={{ color: '#cb8670' }} />}
                        placeholder="Nhập lại mật khẩu"
                        style={{
                            borderRadius: 6,
                            height: 48
                        }}
                    />
                </Form.Item>

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
                        letterSpacing: '0.5px',
                        marginTop: 10
                    }}
                >
                    {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
                </Button>
            </Form>

            <Divider plain style={{ margin: '24px 0', color: '#999' }}>
                Hoặc
            </Divider>

            <Button
                icon={<GoogleOutlined />}
                block
                size="large"
                onClick={handleGoogleRegister}
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
                Đăng ký bằng Google
            </Button>

            <div style={{
                textAlign: 'center',
                marginTop: 24,
                fontSize: 15
            }}>
                <Text style={{ color: '#666' }}>Bạn đã có tài khoản? </Text>
                <a
                    onClick={handleLoginClick}
                    style={{
                        color: '#cb8670',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    Đăng nhập ngay
                </a>
            </div>
        </Modal>
    );
};

export default RegisterModal;
