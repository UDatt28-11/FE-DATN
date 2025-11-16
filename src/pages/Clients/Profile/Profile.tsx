import React, { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Avatar,
    Typography,
    Tabs,
    Form,
    Input,
    Button,
    message,
    Upload,
    Spin
} from 'antd';
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    LockOutlined,
    CameraOutlined,
    SaveOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useAuth } from '../../../context/AuthContext';
import authService from '../../../service/authService';
import './Profile.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface UpdateProfileData {
    full_name: string;
    phone_number?: string;
}

interface ChangePasswordData {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
}

const Profile: React.FC = () => {
    const { user, login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [profileForm] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [avatarUrl, setAvatarUrl] = useState<string>('');

    useEffect(() => {
        if (user) {
            profileForm.setFieldsValue({
                full_name: user.full_name,
                email: user.email,
                phone_number: user.phone_number
            });
            setAvatarUrl(user.avatar || '');
        }
    }, [user, profileForm]);

    const handleUpdateProfile = async (values: UpdateProfileData) => {
        setLoading(true);
        try {
            const response = await authService.updateProfile(values);

            // Update context với user mới
            const token = authService.getToken();
            if (token && response.user) {
                login(response.user, token);
            }

            message.success('Cập nhật thông tin thành công!');
        } catch (error: any) {
            message.error(error.message || 'Cập nhật thông tin thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (values: ChangePasswordData) => {
        setLoading(true);
        try {
            await authService.changePassword(values);

            message.success('Đổi mật khẩu thành công!');
            passwordForm.resetFields();
        } catch (error: any) {
            message.error(error.message || 'Đổi mật khẩu thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const uploadProps: UploadProps = {
        name: 'avatar',
        listType: 'picture-card',
        className: 'avatar-uploader',
        showUploadList: false,
        beforeUpload: (file) => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('Bạn chỉ có thể upload file hình ảnh!');
                return false;
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('Hình ảnh phải nhỏ hơn 2MB!');
                return false;
            }

            // Preview image
            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatarUrl(e.target?.result as string);
            };
            reader.readAsDataURL(file);

            // Upload to server
            uploadAvatar(file);

            return false; // Prevent auto upload
        }
    };

    const uploadAvatar = async (file: File) => {
        setLoading(true);
        try {
            const response = await authService.uploadAvatar(file);

            // Update user context
            const token = authService.getToken();
            const currentUser = authService.getCurrentUser();
            if (token && currentUser) {
                login({ ...currentUser, avatar: response.avatar_url }, token);
            }

            message.success('Cập nhật avatar thành công!');
        } catch (error: any) {
            message.error(error.message || 'Upload avatar thất bại!');
            // Revert preview
            setAvatarUrl(user?.avatar || '');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="profile-container">
                <div className="loading-container">
                    <Spin size="large" />
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <Title level={2}>Thông Tin Cá Nhân</Title>
                <Text type="secondary">Quản lý thông tin và bảo mật tài khoản của bạn</Text>
            </div>

            <Row gutter={24} className="profile-content">
                {/* Left Column - User Info Card */}
                <Col xs={24} lg={8}>
                    <Card className="user-info-card">
                        <div className="avatar-section">
                            <div className="avatar-wrapper">
                                <Avatar
                                    size={120}
                                    icon={<UserOutlined />}
                                    src={avatarUrl}
                                    className="user-avatar"
                                />
                                <Upload {...uploadProps}>
                                    <Button
                                        className="avatar-upload-btn"
                                        shape="circle"
                                        icon={<CameraOutlined />}
                                    />
                                </Upload>
                            </div>
                            <Title level={4} className="user-name">{user.full_name}</Title>
                            <Text type="secondary">{user.email}</Text>
                        </div>

                        <div className="user-details">
                            <div className="detail-item">
                                <MailOutlined className="detail-icon" />
                                <div className="detail-content">
                                    <Text type="secondary" className="detail-label">Email</Text>
                                    <Text strong>{user.email}</Text>
                                </div>
                            </div>

                            {user.phone_number && (
                                <div className="detail-item">
                                    <PhoneOutlined className="detail-icon" />
                                    <div className="detail-content">
                                        <Text type="secondary" className="detail-label">Số điện thoại</Text>
                                        <Text strong>{user.phone_number}</Text>
                                    </div>
                                </div>
                            )}

                            {user.created_at && (
                                <div className="detail-item">
                                    <UserOutlined className="detail-icon" />
                                    <div className="detail-content">
                                        <Text type="secondary" className="detail-label">Ngày tham gia</Text>
                                        <Text strong>{new Date(user.created_at).toLocaleDateString('vi-VN')}</Text>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </Col>

                {/* Right Column - Forms */}
                <Col xs={24} lg={16}>
                    <Card className="profile-forms-card">
                        <Tabs defaultActiveKey="1" className="profile-tabs">
                            <TabPane tab="Thông tin cơ bản" key="1">
                                <Form
                                    form={profileForm}
                                    layout="vertical"
                                    onFinish={handleUpdateProfile}
                                    className="profile-form"
                                >
                                    <Form.Item
                                        label="Họ và tên"
                                        name="full_name"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập họ tên!' },
                                            { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự!' }
                                        ]}
                                    >
                                        <Input
                                            prefix={<UserOutlined />}
                                            placeholder="Nhập họ và tên"
                                            size="large"
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        label="Email"
                                        name="email"
                                    >
                                        <Input
                                            prefix={<MailOutlined />}
                                            placeholder="Email"
                                            size="large"
                                            disabled
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        label="Số điện thoại"
                                        name="phone_number"
                                        rules={[
                                            { pattern: /^[0-9]{9,11}$/, message: 'Số điện thoại không hợp lệ!' }
                                        ]}
                                    >
                                        <Input
                                            prefix={<PhoneOutlined />}
                                            placeholder="Nhập số điện thoại"
                                            size="large"
                                        />
                                    </Form.Item>

                                    <Form.Item>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            size="large"
                                            icon={<SaveOutlined />}
                                            loading={loading}
                                            block
                                        >
                                            Lưu thay đổi
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </TabPane>

                            <TabPane tab="Đổi mật khẩu" key="2">
                                <Form
                                    form={passwordForm}
                                    layout="vertical"
                                    onFinish={handleChangePassword}
                                    className="password-form"
                                >
                                    <Form.Item
                                        label="Mật khẩu hiện tại"
                                        name="current_password"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }
                                        ]}
                                    >
                                        <Input.Password
                                            prefix={<LockOutlined />}
                                            placeholder="Nhập mật khẩu hiện tại"
                                            size="large"
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        label="Mật khẩu mới"
                                        name="new_password"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                                        ]}
                                    >
                                        <Input.Password
                                            prefix={<LockOutlined />}
                                            placeholder="Nhập mật khẩu mới"
                                            size="large"
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        label="Xác nhận mật khẩu mới"
                                        name="new_password_confirmation"
                                        dependencies={['new_password']}
                                        rules={[
                                            { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (!value || getFieldValue('new_password') === value) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input.Password
                                            prefix={<LockOutlined />}
                                            placeholder="Nhập lại mật khẩu mới"
                                            size="large"
                                        />
                                    </Form.Item>

                                    <Form.Item>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            size="large"
                                            icon={<SaveOutlined />}
                                            loading={loading}
                                            block
                                        >
                                            Đổi mật khẩu
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </TabPane>
                        </Tabs>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Profile;
