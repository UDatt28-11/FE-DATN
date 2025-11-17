import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Form, Input, Button, Card, message, Typography, Space, Result } from 'antd';
import { LockOutlined, CheckCircleOutlined } from '@ant-design/icons';
import authService from '../../../service/authService';
import './ResetPassword.css';

const { Title, Text } = Typography;

const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const { token } = useParams<{ token: string }>();
    const [searchParams] = useSearchParams();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);

    const email = searchParams.get('email');

    useEffect(() => {
        if (!token || !email) {
            message.error('Link không hợp lệ!');
            navigate('/');
        }
    }, [token, email, navigate]);

    const handleSubmit = async (values: { password: string; password_confirmation: string }) => {
        if (!token || !email) return;

        setLoading(true);
        try {
            const response = await authService.resetPassword({
                token,
                email,
                password: values.password,
                password_confirmation: values.password_confirmation,
            });

            message.success(response.message || 'Đặt lại mật khẩu thành công!');
            setResetSuccess(true);
            form.resetFields();

            // Redirect về trang chủ sau 3 giây
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (error: any) {
            message.error(error.message || 'Có lỗi xảy ra, vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    if (resetSuccess) {
        return (
            <div className="reset-password-page">
                <div className="reset-password-container">
                    <Result
                        status="success"
                        title="Đặt Lại Mật Khẩu Thành Công!"
                        subTitle="Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập bằng mật khẩu mới."
                        extra={[
                            <Button
                                type="primary"
                                key="home"
                                size="large"
                                onClick={() => navigate('/')}
                                style={{
                                    backgroundColor: '#cb8670',
                                    borderColor: '#cb8670',
                                }}
                            >
                                Về Trang Chủ
                            </Button>,
                        ]}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="reset-password-page">
            <div className="reset-password-container">
                <Card className="reset-password-card" bordered={false}>
                    <div className="reset-password-header">
                        <div className="icon-wrapper">
                            <LockOutlined className="lock-icon" />
                        </div>
                        <Title level={2}>Đặt Lại Mật Khẩu</Title>
                        <Text type="secondary" style={{ fontSize: 15 }}>
                            Nhập mật khẩu mới cho tài khoản của bạn
                        </Text>
                    </div>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        autoComplete="off"
                        style={{ marginTop: 30 }}
                    >
                        <Form.Item
                            label="Email"
                            style={{ marginBottom: 20 }}
                        >
                            <Input
                                value={email || ''}
                                disabled
                                size="large"
                                style={{ backgroundColor: '#f5f5f5' }}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Mật khẩu mới"
                            name="password"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                            ]}
                            style={{ marginBottom: 20 }}
                        >
                            <Input.Password
                                prefix={<LockOutlined style={{ color: '#cb8670' }} />}
                                placeholder="Nhập mật khẩu mới"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Xác nhận mật khẩu"
                            name="password_confirmation"
                            dependencies={['password']}
                            rules={[
                                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                    },
                                }),
                            ]}
                            style={{ marginBottom: 30 }}
                        >
                            <Input.Password
                                prefix={<LockOutlined style={{ color: '#cb8670' }} />}
                                placeholder="Nhập lại mật khẩu mới"
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
                                    fontSize: 16,
                                    fontWeight: 'bold',
                                }}
                            >
                                Đặt Lại Mật Khẩu
                            </Button>
                        </Form.Item>

                        <Button
                            type="link"
                            block
                            onClick={() => navigate('/')}
                            style={{ color: '#666' }}
                        >
                            Quay lại trang chủ
                        </Button>
                    </Form>

                    <div className="security-note">
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Text type="secondary" style={{ fontSize: 13 }}>
                                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                                Mật khẩu nên có ít nhất 6 ký tự
                            </Text>
                            <Text type="secondary" style={{ fontSize: 13 }}>
                                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                                Nên bao gồm chữ hoa, chữ thường và số
                            </Text>
                        </Space>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
