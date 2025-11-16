import React from 'react';
import { Modal, Form, Input, Button, Divider, Typography } from 'antd';
import { GoogleOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Text } = Typography;

interface LoginModalProps {
    visible: boolean;
    onClose: () => void;
    onSwitchToRegister: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ visible, onClose, onSwitchToRegister }) => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form] = Form.useForm();

    const onFinish = (values: any) => {
        console.log('Login values:', values);

        // Gọi API đăng nhập ở đây
        login();

        // Đóng modal và chuyển hướng
        onClose();
        form.resetFields();
        navigate('/');
    };

    const handleCancel = () => {
        onClose();
        form.resetFields();
    };

    const handleRegisterClick = () => {
        onClose();
        onSwitchToRegister();
    };

    return (
        <Modal
            open={visible}
            onCancel={handleCancel}
            footer={null}
            width={450}
            centered
            destroyOnClose
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
                </div>

                <Button
                    type="primary"
                    htmlType="submit"
                    block
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
                    Đăng Nhập
                </Button>
            </Form>

            <Divider plain style={{ margin: '24px 0', color: '#999' }}>
                Hoặc
            </Divider>

            <Button
                icon={<GoogleOutlined />}
                block
                size="large"
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
