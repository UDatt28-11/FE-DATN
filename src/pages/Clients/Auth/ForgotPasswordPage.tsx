import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, Space } from 'antd';
import { MailOutlined, ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../../service/authService';

const { Title, Text } = Typography;

const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const overlayStyle: React.CSSProperties = {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
    };

    const formContainerStyle: React.CSSProperties = {
        backgroundColor: "white",
        width: "100%",
        maxWidth: "450px",
        borderRadius: "16px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        padding: "40px 30px",
        zIndex: 10,
    };

    const handleSubmit = async (values: { email: string }) => {
        setLoading(true);
        try {
            const response = await authService.forgotPassword({ email: values.email });
            message.success(response.message || 'Email khôi phục mật khẩu đã được gửi!');
            setEmailSent(true);
            form.resetFields();
        } catch (error: any) {
            message.error(error.message || 'Có lỗi xảy ra, vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigate('/');
    };

    const handleResendEmail = () => {
        setEmailSent(false);
        form.resetFields();
    };

    return (
        <div style={overlayStyle}>
            <div style={formContainerStyle}>
                {!emailSent ? (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: 30 }}>
                            <div
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    backgroundColor: '#f0f9ff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 20px',
                                }}
                            >
                                <MailOutlined style={{ fontSize: 40, color: '#cb8670' }} />
                            </div>
                            <Title level={3} style={{ marginBottom: 10, color: '#363636' }}>
                                Quên Mật Khẩu
                            </Title>
                            <Text type="secondary" style={{ display: 'block', fontSize: 15 }}>
                                Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu
                            </Text>
                        </div>

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                            autoComplete="off"
                        >
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email!' },
                                    { type: 'email', message: 'Email không hợp lệ!' },
                                ]}
                            >
                                <Input
                                    prefix={<MailOutlined style={{ color: '#cb8670' }} />}
                                    placeholder="example@email.com"
                                    size="large"
                                    style={{
                                        borderRadius: 6,
                                        height: 48
                                    }}
                                />
                            </Form.Item>

                            <Form.Item style={{ marginBottom: 15 }}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    size="large"
                                    loading={loading}
                                    block
                                    style={{
                                        backgroundColor: '#cb8670',
                                        borderColor: '#cb8670',
                                        height: 48,
                                        fontSize: 16,
                                        fontWeight: 600,
                                        borderRadius: 6,
                                    }}
                                >
                                    Gửi Email Khôi Phục
                                </Button>
                            </Form.Item>

                            <Button
                                type="link"
                                icon={<ArrowLeftOutlined />}
                                onClick={handleBackToLogin}
                                block
                                style={{ color: '#cb8670', padding: 0, height: 'auto' }}
                            >
                                Quay lại đăng nhập
                            </Button>
                        </Form>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                backgroundColor: '#f0f9ff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px',
                            }}
                        >
                            <MailOutlined style={{ fontSize: 40, color: '#cb8670' }} />
                        </div>

                        <Title level={3} style={{ marginBottom: 10 }}>
                            Kiểm Tra Email Của Bạn
                        </Title>

                        <Text type="secondary" style={{ display: 'block', marginBottom: 20, fontSize: 15 }}>
                            Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn.
                            Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.
                        </Text>

                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                            <Button
                                type="primary"
                                size="large"
                                onClick={handleBackToLogin}
                                block
                                style={{
                                    backgroundColor: '#cb8670',
                                    borderColor: '#cb8670',
                                    height: 48,
                                    fontSize: 16,
                                    fontWeight: 600,
                                    borderRadius: 6,
                                }}
                            >
                                Quay Lại Đăng Nhập
                            </Button>

                            <Button
                                type="link"
                                onClick={handleResendEmail}
                                block
                                style={{ color: '#666', padding: 0, height: 'auto' }}
                            >
                                Gửi lại email
                            </Button>
                        </Space>

                        <div style={{ marginTop: 30, padding: 20, background: '#f5f7fa', borderRadius: 12, borderLeft: '4px solid #cb8670' }}>
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                <Text type="secondary" style={{ fontSize: 13, display: 'block' }}>
                                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                                    Kiểm tra cả hộp thư spam nếu không thấy email
                                </Text>
                                <Text type="secondary" style={{ fontSize: 13, display: 'block' }}>
                                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                                    Link đặt lại mật khẩu có hiệu lực trong 15 phút
                                </Text>
                            </Space>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
