import React, { useState } from 'react';
import {
    Layout,
    Card,
    Row,
    Col,
    Typography,
    Steps,
    Space,
    Divider,
    Button,
    Radio,
    message,
    Modal,
    Result,
} from 'antd';
import {
    ArrowLeftOutlined,
    CheckCircleOutlined,
    CreditCardOutlined,
    WalletOutlined,
    BankOutlined,
    QrcodeOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './PaymentPage.css';

const { Content } = Layout;
const { Text, Paragraph } = Typography;

interface GuestInfo {
    fullName: string;
    phone: string;
    email: string;
    idCard: string;
}

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
    guestInfo?: GuestInfo;
}

const PaymentPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [paymentMethod, setPaymentMethod] = useState<string>('cash');
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const bookingData: BookingData = location.state || {};

    // Nếu không có thông tin, redirect về trang trước
    React.useEffect(() => {
        if (!bookingData.guestInfo) {
            message.warning('Vui lòng nhập thông tin người đặt phòng!');
            navigate(-1);
        }
    }, [bookingData, navigate]);

    const handlePayment = async () => {
        setLoading(true);
        try {
            // Giả lập API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Hiển thị modal thành công
            setShowSuccess(true);
            message.success('Đặt phòng thành công!');
        } catch (error) {
            message.error('Có lỗi xảy ra, vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    const handleSuccessClose = () => {
        setShowSuccess(false);
        navigate('/');
    };

    if (!bookingData.guestInfo) {
        return null;
    }

    return (
        <div className="payment-page">
            {/* Header Steps */}
            <div style={{ background: '#f5f5f5', padding: '30px 0' }}>
                <div className="container">
                    <Steps
                        current={1}
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
                        {/* Phương thức thanh toán */}
                        <Col xs={24} lg={16}>
                            <Card
                                title={
                                    <Space>
                                        <CreditCardOutlined />
                                        <span>Phương thức thanh toán</span>
                                    </Space>
                                }
                                bordered={false}
                            >
                                <Radio.Group
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    value={paymentMethod}
                                    style={{ width: '100%' }}
                                >
                                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                        <Card
                                            hoverable
                                            className={paymentMethod === 'cash' ? 'payment-method-active' : ''}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => setPaymentMethod('cash')}
                                        >
                                            <Radio value="cash">
                                                <Space align="start" size="middle">
                                                    <WalletOutlined style={{ fontSize: 24, color: '#cb8670' }} />
                                                    <div>
                                                        <Text strong style={{ fontSize: 16 }}>Thanh toán tại khách sạn</Text>
                                                        <br />
                                                        <Text type="secondary">Thanh toán bằng tiền mặt hoặc thẻ khi nhận phòng</Text>
                                                    </div>
                                                </Space>
                                            </Radio>
                                        </Card>

                                        <Card
                                            hoverable
                                            className={paymentMethod === 'bank' ? 'payment-method-active' : ''}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => setPaymentMethod('bank')}
                                        >
                                            <Radio value="bank">
                                                <Space align="start" size="middle">
                                                    <BankOutlined style={{ fontSize: 24, color: '#cb8670' }} />
                                                    <div>
                                                        <Text strong style={{ fontSize: 16 }}>Chuyển khoản ngân hàng</Text>
                                                        <br />
                                                        <Text type="secondary">Chuyển khoản trước, xác nhận sau</Text>
                                                    </div>
                                                </Space>
                                            </Radio>
                                        </Card>

                                        <Card
                                            hoverable
                                            className={paymentMethod === 'momo' ? 'payment-method-active' : ''}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => setPaymentMethod('momo')}
                                        >
                                            <Radio value="momo">
                                                <Space align="start" size="middle">
                                                    <QrcodeOutlined style={{ fontSize: 24, color: '#cb8670' }} />
                                                    <div>
                                                        <Text strong style={{ fontSize: 16 }}>Ví điện tử MoMo</Text>
                                                        <br />
                                                        <Text type="secondary">Quét mã QR để thanh toán nhanh chóng</Text>
                                                    </div>
                                                </Space>
                                            </Radio>
                                        </Card>

                                        <Card
                                            hoverable
                                            className={paymentMethod === 'card' ? 'payment-method-active' : ''}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => setPaymentMethod('card')}
                                        >
                                            <Radio value="card">
                                                <Space align="start" size="middle">
                                                    <CreditCardOutlined style={{ fontSize: 24, color: '#cb8670' }} />
                                                    <div>
                                                        <Text strong style={{ fontSize: 16 }}>Thẻ tín dụng/ghi nợ</Text>
                                                        <br />
                                                        <Text type="secondary">Visa, Mastercard, JCB</Text>
                                                    </div>
                                                </Space>
                                            </Radio>
                                        </Card>
                                    </Space>
                                </Radio.Group>

                                <Divider />

                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    loading={loading}
                                    onClick={handlePayment}
                                    icon={<CheckCircleOutlined />}
                                    style={{
                                        backgroundColor: '#cb8670',
                                        borderColor: '#cb8670',
                                        height: 50,
                                        fontSize: 16,
                                        fontWeight: 'bold',
                                    }}
                                >
                                    Xác nhận đặt phòng
                                </Button>
                            </Card>

                            {/* Thông tin người đặt */}
                            <Card
                                title="Thông tin người đặt"
                                bordered={false}
                                style={{ marginTop: 24 }}
                            >
                                <Row gutter={[16, 16]}>
                                    <Col span={12}>
                                        <Text type="secondary">Họ tên</Text>
                                        <br />
                                        <Text strong>{bookingData.guestInfo.fullName}</Text>
                                    </Col>
                                    <Col span={12}>
                                        <Text type="secondary">Số điện thoại</Text>
                                        <br />
                                        <Text strong>{bookingData.guestInfo.phone}</Text>
                                    </Col>
                                    <Col span={12}>
                                        <Text type="secondary">Email</Text>
                                        <br />
                                        <Text strong>{bookingData.guestInfo.email}</Text>
                                    </Col>
                                    <Col span={12}>
                                        <Text type="secondary">CCCD</Text>
                                        <br />
                                        <Text strong>{bookingData.guestInfo.idCard}</Text>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>

                        {/* Tóm tắt đơn hàng */}
                        <Col xs={24} lg={8}>
                            <Card
                                title="Tóm tắt đơn hàng"
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

                                    <Divider style={{ margin: '12px 0' }} />

                                    {/* Chi tiết giá */}
                                    <div>
                                        <Row justify="space-between">
                                            <Col><Text>Giá phòng</Text></Col>
                                            <Col><Text>{bookingData.price.toLocaleString('vi-VN')} VNĐ</Text></Col>
                                        </Row>
                                        {bookingData.nights && bookingData.nights > 1 && (
                                            <Row justify="space-between" style={{ marginTop: 8 }}>
                                                <Col><Text type="secondary">× {bookingData.nights} đêm</Text></Col>
                                                <Col>
                                                    <Text>
                                                        {(bookingData.price * bookingData.nights).toLocaleString('vi-VN')} VNĐ
                                                    </Text>
                                                </Col>
                                            </Row>
                                        )}
                                    </div>

                                    <Divider style={{ margin: '12px 0' }} />

                                    <div style={{
                                        background: '#f5f5f5',
                                        padding: 16,
                                        borderRadius: 8,
                                        border: '2px solid #cb8670'
                                    }}>
                                        <Row justify="space-between" align="middle">
                                            <Col>
                                                <Text strong style={{ fontSize: 18 }}>Tổng thanh toán</Text>
                                            </Col>
                                            <Col>
                                                <Text
                                                    strong
                                                    style={{
                                                        fontSize: 26,
                                                        color: '#cb8670'
                                                    }}
                                                >
                                                    {(bookingData.totalPrice || bookingData.price).toLocaleString('vi-VN')} VNĐ
                                                </Text>
                                            </Col>
                                        </Row>
                                    </div>

                                    <Text type="secondary" style={{ fontSize: 12, display: 'block', textAlign: 'center' }}>
                                        * Giá đã bao gồm thuế VAT
                                    </Text>
                                </Space>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </Content>

            {/* Modal thành công */}
            <Modal
                open={showSuccess}
                footer={null}
                onCancel={handleSuccessClose}
                centered
                width={500}
            >
                <Result
                    status="success"
                    title="Đặt phòng thành công!"
                    subTitle={
                        <Space direction="vertical" size="small" style={{ marginTop: 16 }}>
                            <Paragraph>
                                Mã đặt phòng: <Text strong style={{ color: '#cb8670' }}>#{Math.random().toString(36).substr(2, 9).toUpperCase()}</Text>
                            </Paragraph>
                            <Paragraph>
                                Chúng tôi đã gửi email xác nhận đến <Text strong>{bookingData.guestInfo.email}</Text>
                            </Paragraph>
                            <Paragraph type="secondary">
                                Vui lòng kiểm tra email và mang theo CCCD khi nhận phòng.
                            </Paragraph>
                        </Space>
                    }
                    extra={[
                        <Button
                            type="primary"
                            key="home"
                            onClick={handleSuccessClose}
                            style={{
                                backgroundColor: '#cb8670',
                                borderColor: '#cb8670',
                            }}
                        >
                            Về trang chủ
                        </Button>,
                        <Button key="view" onClick={() => navigate('/my-bookings')}>
                            Xem đơn đặt phòng
                        </Button>,
                    ]}
                />
            </Modal>
        </div>
    );
};

export default PaymentPage;
