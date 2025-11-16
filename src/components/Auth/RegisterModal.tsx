import React from 'react';
import { Modal, Form, Input, Button, Divider, Typography } from 'antd';
import { GoogleOutlined, UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Text } = Typography;

interface RegisterModalProps {
    visible: boolean;
    onClose: () => void;
    onSwitchToLogin: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ visible, onClose, onSwitchToLogin }) => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form] = Form.useForm();

    const onFinish = (values: any) => {
        console.log('Register values:', values);

        // Gọi API đăng ký ở đây
        // Sau khi đăng ký thành công, tự động đăng nhập
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

    const handleLoginClick = () => {
        onClose();
        onSwitchToLogin();
    };

    return (
        <Modal
            open={visible}
            onCancel={handleCancel}
            footer={null}
            width={500}
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
                    name="name"
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
                    Đăng Ký
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
