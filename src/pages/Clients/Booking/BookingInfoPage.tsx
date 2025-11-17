import React, { useState } from 'react';
import {
    Layout,
    Form,
    Input,
    Button,
    Card,
    Row,
    Col,
    Typography,
    Steps,
    Space,
    Divider,
    message,
} from 'antd';
import {
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    IdcardOutlined,
    ArrowLeftOutlined,
    ArrowRightOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './BookingInfo.css';

const { Content } = Layout;
const { Text } = Typography;

interface BookingData {
    roomId: string;
    roomName: string;
    price: number;
    checkIn?: string;
    checkOut?: string;
    adults?: number;
    children?: number;
    nights?: number;
    totalPrice?: number;
}

interface GuestInfo {
    fullName: string;
    phone: string;
    email: string;
    idCard: string;
}

const BookingInfoPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Lấy thông tin booking từ location state
    const bookingData: BookingData = location.state || {
        roomId: '1',
        roomName: 'Deluxe Room',
        price: 1500000,
        nights: 1,
        totalPrice: 1500000,
    };

    const handleSubmit = async (values: GuestInfo) => {
        setLoading(true);
        try {
            // Giả lập API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Chuyển sang trang thanh toán với thông tin đầy đủ
            navigate('/booking/payment', {
                state: {
                    ...bookingData,
                    guestInfo: values,
                }
            });

            message.success('Thông tin đã được lưu!');
        } catch (error) {
            message.error('Có lỗi xảy ra, vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="booking-info-page">
            {/* Header Steps */}
            <div style={{ background: '#f5f5f5', padding: '30px 0' }}>
                <div className="container">
                    <Steps
                        current={0}
                        items={[
                            {
                                title: 'Thông tin',
                                description: 'Nhập thông tin người đặt',
                            },
                            {
                                title: 'Thanh toán',
                                description: 'Xác nhận và thanh toán',
                            },
                            {
                                title: 'Hoàn tất',
                                description: 'Xác nhận đặt phòng',
                            },
                        ]}
                    />
                </div>
            </div>

            <Content style={{ padding: '40px 0', minHeight: '70vh', background: '#fff' }}>
                <div className="container">
                    {/* Nút Trở về */}
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(-1)}
                        style={{ marginBottom: 24 }}
                        size="large"
                    >
                        Trở về
                    </Button>

                    <Row gutter={[32, 32]}>
                        {/* Form nhập thông tin */}
                        <Col xs={24} lg={16}>
                            <Card
                                title={
                                    <Space>
                                        <UserOutlined />
                                        <span>Thông tin người đặt phòng</span>
                                    </Space>
                                }
                                bordered={false}
                            >
                                <Form
                                    form={form}
                                    layout="vertical"
                                    onFinish={handleSubmit}
                                    autoComplete="off"
                                    requiredMark="optional"
                                >
                                    <Row gutter={16}>
                                        <Col xs={24} sm={24}>
                                            <Form.Item
                                                label="Họ và tên"
                                                name="fullName"
                                                rules={[
                                                    { required: true, message: 'Vui lòng nhập họ tên!' },
                                                    { min: 3, message: 'Họ tên phải có ít nhất 3 ký tự!' },
                                                    {
                                                        pattern: /^[a-zA-ZÀ-ỹ\s]+$/,
                                                        message: 'Họ tên chỉ được chứa chữ cái!'
                                                    }
                                                ]}
                                            >
                                                <Input
                                                    prefix={<UserOutlined style={{ color: '#cb8670' }} />}
                                                    placeholder="Nguyễn Văn A"
                                                    size="large"
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                label="Số điện thoại"
                                                name="phone"
                                                rules={[
                                                    { required: true, message: 'Vui lòng nhập số điện thoại!' },
                                                    {
                                                        pattern: /(84|0[3|5|7|8|9])+([0-9]{8})\b/,
                                                        message: 'Số điện thoại không hợp lệ!'
                                                    }
                                                ]}
                                            >
                                                <Input
                                                    prefix={<PhoneOutlined style={{ color: '#cb8670' }} />}
                                                    placeholder="0912345678"
                                                    size="large"
                                                    maxLength={10}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                label="Email"
                                                name="email"
                                                rules={[
                                                    { required: true, message: 'Vui lòng nhập email!' },
                                                    { type: 'email', message: 'Email không hợp lệ!' }
                                                ]}
                                            >
                                                <Input
                                                    prefix={<MailOutlined style={{ color: '#cb8670' }} />}
                                                    placeholder="example@email.com"
                                                    size="large"
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24}>
                                            <Form.Item
                                                label="Số căn cước công dân"
                                                name="idCard"
                                                rules={[
                                                    { required: true, message: 'Vui lòng nhập số CCCD!' },
                                                    {
                                                        pattern: /^[0-9]{12}$/,
                                                        message: 'CCCD phải có 12 số!'
                                                    }
                                                ]}
                                            >
                                                <Input
                                                    prefix={<IdcardOutlined style={{ color: '#cb8670' }} />}
                                                    placeholder="001234567890"
                                                    size="large"
                                                    maxLength={12}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Divider />

                                    <Form.Item style={{ marginBottom: 0 }}>
                                        <Space size="middle">
                                            <Button
                                                type="default"
                                                size="large"
                                                icon={<ArrowLeftOutlined />}
                                                onClick={() => navigate(-1)}
                                            >
                                                Quay lại
                                            </Button>
                                            <Button
                                                type="primary"
                                                size="large"
                                                htmlType="submit"
                                                loading={loading}
                                                icon={<ArrowRightOutlined />}
                                                style={{
                                                    backgroundColor: '#cb8670',
                                                    borderColor: '#cb8670',
                                                }}
                                            >
                                                Tiếp tục thanh toán
                                            </Button>
                                        </Space>
                                    </Form.Item>
                                </Form>
                            </Card>

                            {/* Thông tin quan trọng */}
                            <Card
                                title="Lưu ý quan trọng"
                                bordered={false}
                                style={{ marginTop: 24 }}
                            >
                                <Space direction="vertical" size="small">
                                    <Text>• Vui lòng kiểm tra kỹ thông tin trước khi tiếp tục</Text>
                                    <Text>• Số CCCD sẽ được sử dụng để check-in tại khách sạn</Text>
                                    <Text>• Email sẽ nhận được xác nhận đặt phòng</Text>
                                    <Text>• Số điện thoại để liên hệ khi cần thiết</Text>
                                </Space>
                            </Card>
                        </Col>

                        {/* Thông tin đặt phòng */}
                        <Col xs={24} lg={8}>
                            <Card
                                title="Chi tiết đặt phòng"
                                bordered={false}
                                style={{ position: 'sticky', top: 20 }}
                            >
                                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                    <div>
                                        <Text type="secondary">Phòng</Text>
                                        <br />
                                        <Text strong style={{ fontSize: 16 }}>{bookingData.roomName}</Text>
                                    </div>

                                    {bookingData.checkIn && (
                                        <>
                                            <Divider style={{ margin: '8px 0' }} />
                                            <Row>
                                                <Col span={12}>
                                                    <Text type="secondary">Nhận phòng</Text>
                                                    <br />
                                                    <Text strong>{bookingData.checkIn}</Text>
                                                </Col>
                                                <Col span={12}>
                                                    <Text type="secondary">Trả phòng</Text>
                                                    <br />
                                                    <Text strong>{bookingData.checkOut}</Text>
                                                </Col>
                                            </Row>
                                        </>
                                    )}

                                    {(bookingData.adults || bookingData.children) && (
                                        <>
                                            <Divider style={{ margin: '8px 0' }} />
                                            <div>
                                                <Text type="secondary">Số khách</Text>
                                                <br />
                                                <Text strong>
                                                    {bookingData.adults} người lớn
                                                    {bookingData.children ? `, ${bookingData.children} trẻ em` : ''}
                                                </Text>
                                            </div>
                                        </>
                                    )}

                                    <Divider style={{ margin: '8px 0' }} />

                                    <div style={{
                                        background: '#f5f5f5',
                                        padding: 16,
                                        borderRadius: 8,
                                        border: '2px solid #cb8670'
                                    }}>
                                        <Row justify="space-between" align="middle">
                                            <Col>
                                                <Text strong style={{ fontSize: 16 }}>Tổng cộng</Text>
                                                {bookingData.nights && (
                                                    <>
                                                        <br />
                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                            {bookingData.nights} đêm × {bookingData.price.toLocaleString('vi-VN')} VNĐ
                                                        </Text>
                                                    </>
                                                )}
                                            </Col>
                                            <Col>
                                                <Text
                                                    strong
                                                    style={{
                                                        fontSize: 24,
                                                        color: '#cb8670'
                                                    }}
                                                >
                                                    {(bookingData.totalPrice || bookingData.price).toLocaleString('vi-VN')} VNĐ
                                                </Text>
                                            </Col>
                                        </Row>
                                    </div>

                                    <Text type="secondary" style={{ fontSize: 12, display: 'block', textAlign: 'center' }}>
                                        Bạn sẽ thanh toán ở bước tiếp theo
                                    </Text>
                                </Space>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </Content>
        </div>
    );
};

export default BookingInfoPage;
