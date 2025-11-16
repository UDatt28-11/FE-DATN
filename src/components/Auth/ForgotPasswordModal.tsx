import React, { useState } from 'react';
import { Modal, Form, Input, Button, message, Typography, Space } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import authService from '../../service/authService';

const { Text, Title } = Typography;

interface ForgotPasswordModalProps {
    visible: boolean;
    onClose: () => void;
    onBackToLogin: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
    visible,
    onClose,
    onBackToLogin,
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

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

    const handleClose = () => {
        form.resetFields();
        setEmailSent(false);
        onClose();
    };

    const handleBackToLogin = () => {
        form.resetFields();
        setEmailSent(false);
        onBackToLogin();
    };

    return (
        <Modal
            open={visible}
            onCancel={handleClose}
            footer={null}
            width={500}
            centered
        >
            <div style={{ padding: '20px 0' }}>
                {!emailSent ? (
                    <>
                        <Title level={3} style={{ textAlign: 'center', marginBottom: 10 }}>
                            Quên Mật Khẩu
                        </Title>
                        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 30 }}>
                            Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu
                        </Text>

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
                                style={{ color: '#cb8670' }}
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

                        <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
                            Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn.
                            Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.
                        </Text>

                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Button
                                type="primary"
                                size="large"
                                onClick={handleBackToLogin}
                                block
                                style={{
                                    backgroundColor: '#cb8670',
                                    borderColor: '#cb8670',
                                    height: 48,
                                }}
                            >
                                Quay Lại Đăng Nhập
                            </Button>

                            <Button
                                type="link"
                                onClick={() => setEmailSent(false)}
                                block
                                style={{ color: '#666' }}
                            >
                                Gửi lại email
                            </Button>
                        </Space>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ForgotPasswordModal;
