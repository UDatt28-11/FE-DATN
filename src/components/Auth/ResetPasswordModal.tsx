import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Typography, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authService from '../../service/authService';

const { Text } = Typography;

interface ResetPasswordModalProps {
    open?: boolean;
    visible?: boolean; // Deprecated, use open instead
    onClose: () => void;
    token?: string;
    email?: string;
    onSuccess?: () => void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
    open,
    visible, // Deprecated, use open instead
    onClose,
    token,
    email,
    onSuccess,
}) => {
    const isOpen = open !== undefined ? open : visible; // Support both for backward compatibility
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Set email vào form khi component mount hoặc email thay đổi
    useEffect(() => {
        if (email && isOpen) {
            form.setFieldsValue({ email });
        }
    }, [email, isOpen, form]);

    const onFinish = async (values: any) => {
        if (!token || !email) {
            message.error('Thiếu thông tin token hoặc email. Vui lòng kiểm tra lại link.');
            return;
        }

        setLoading(true);
        try {
            const response = await authService.resetPassword({
                token,
                email,
                password: values.password,
                password_confirmation: values.password_confirmation,
            });

            message.success(response.message || 'Đặt lại mật khẩu thành công!');
            
            // Đóng modal và reset form
            onClose();
            form.resetFields();

            // Gọi callback onSuccess nếu có
            if (onSuccess) {
                onSuccess();
            } else {
                // Redirect về trang chủ và tự động mở login modal
                setTimeout(() => {
                    navigate('/?showLogin=true&resetPasswordSuccess=true', { replace: true });
                }, 500);
            }
        } catch (error: any) {
            message.error(error.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        onClose();
        form.resetFields();
    };

    return (
        <Modal
            open={isOpen}
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
                    Đặt Lại Mật Khẩu
                </h2>
                <p style={{
                    color: '#7d7d7d',
                    fontSize: 15,
                    marginBottom: 0
                }}>
                    Nhập mật khẩu mới cho tài khoản của bạn
                </p>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                size="large"
            >
                <Form.Item
                    label="Email"
                    style={{ marginBottom: 20 }}
                >
                    <Input
                        value={email || ''}
                        disabled
                        style={{
                            borderRadius: 6,
                            height: 48,
                            backgroundColor: '#f5f5f5'
                        }}
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
                        style={{
                            borderRadius: 6,
                            height: 48
                        }}
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
                    style={{ marginBottom: 24 }}
                >
                    <Input.Password
                        prefix={<LockOutlined style={{ color: '#cb8670' }} />}
                        placeholder="Nhập lại mật khẩu mới"
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
                        letterSpacing: '0.5px'
                    }}
                >
                    {loading ? 'Đang xử lý...' : 'Đặt Lại Mật Khẩu'}
                </Button>
            </Form>

            <div style={{
                textAlign: 'center',
                marginTop: 24,
                fontSize: 14
            }}>
                <Text style={{ color: '#999' }}>
                    Mật khẩu nên có ít nhất 6 ký tự và bao gồm chữ hoa, chữ thường và số
                </Text>
            </div>
        </Modal>
    );
};

export default ResetPasswordModal;

