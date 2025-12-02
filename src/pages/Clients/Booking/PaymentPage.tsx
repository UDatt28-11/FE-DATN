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
    App,
} from 'antd';
import {
    ArrowLeftOutlined,
    CreditCardOutlined,
    SafetyOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    createPayOSPaymentLink,
} from '../../../service/bookingService';
import './PaymentPage.css';

const { Content } = Layout;
const { Text } = Typography;

interface GuestInfo {
    fullName: string;
    phone: string;
    email: string;
    idCard: string;
}

interface BookingRoomItem {
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

interface BookingData {
    // Hỗ trợ cả format cũ (1 phòng) và format mới (nhiều phòng)
    roomId?: string;
    roomName?: string;
    price?: number;
    checkIn?: string;
    checkOut?: string;
    adults?: number;
    children?: number;
    nights?: number;
    totalPrice?: number;
    // Format mới: mảng phòng
    rooms?: BookingRoomItem[];
    guestInfo?: GuestInfo;
    bookingId?: number;
    booking?: any;
}

const PaymentPage: React.FC = () => {
    const { message } = App.useApp();
    const navigate = useNavigate();
    const location = useLocation();
    const [payOSLoading, setPayOSLoading] = useState(false);

    const locationState = location.state as BookingData | null;
    const bookingData: BookingData = locationState || {};
    
    // Lấy danh sách phòng (hỗ trợ cả format cũ và mới)
    const rooms: BookingRoomItem[] = bookingData.rooms || (bookingData.roomId ? [{
        roomId: bookingData.roomId,
        roomName: bookingData.roomName || 'Phòng',
        price: bookingData.price || 0,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        adults: bookingData.adults,
        children: bookingData.children,
        nights: bookingData.nights,
        totalPrice: bookingData.totalPrice || bookingData.price || 0,
    }] : []);
    
    // Tính toán tiền cọc (30% của total_amount)
    const totalAmount = bookingData.totalPrice || 
        (rooms.length > 0 ? rooms.reduce((sum, room) => 
            sum + (room.totalPrice || room.price * (room.nights || 1)), 0
        ) : 0);
    const depositAmount = Math.round(totalAmount * 0.3);
    const remainingAmount = totalAmount - depositAmount;

    // Nếu không có thông tin, redirect về trang trước
    React.useEffect(() => {
        if (!bookingData.guestInfo) {
            message.warning('Vui lòng nhập thông tin người đặt phòng!');
            navigate(-1);
        }
    }, [bookingData, navigate]);

    const handlePayWithPayOS = async () => {
        if (!bookingData.bookingId) {
            message.error('Không tìm thấy thông tin đặt phòng!');
            return;
        }

        setPayOSLoading(true);
        try {
            const result = await createPayOSPaymentLink(
                bookingData.bookingId,
                depositAmount,
                'Dat coc dat phong'
            );

            // Mở trang thanh toán PayOS
            if (result.payment_link) {
                window.location.href = result.payment_link;
            } else {
                message.error('Không nhận được link thanh toán PayOS');
            }
        } catch (error: any) {
            console.error('PayOS payment error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Không thể tạo link thanh toán PayOS';
            message.error(errorMessage);
        } finally {
            setPayOSLoading(false);
        }
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
                        {/* Cột trái: Phương thức thanh toán */}
                        <Col xs={24} lg={16}>
                            {/* Thanh toán PayOS */}
                            <Card
                                title={
                                    <Space>
                                        <CreditCardOutlined />
                                        <span>Thanh toán trực tuyến qua PayOS</span>
                                    </Space>
                                }
                                variant="borderless"
                            >
                                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                    <div style={{
                                        padding: 16,
                                        background: '#f0f7ff',
                                        borderRadius: 8,
                                        border: '1px solid #91caff'
                                    }}>
                                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                            <Space>
                                                <SafetyOutlined style={{ color: '#1677ff', fontSize: 20 }} />
                                                <Text strong style={{ fontSize: 15 }}>Thanh toán an toàn và bảo mật</Text>
                                            </Space>
                                            <Text type="secondary" style={{ fontSize: 13, marginLeft: 28 }}>
                                                Hệ thống sử dụng PayOS - đối tác thanh toán uy tín, được bảo mật bởi các ngân hàng hàng đầu Việt Nam
                                            </Text>
                                        </Space>
                                    </div>

                                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                        <Text strong style={{ fontSize: 14 }}>Các phương thức thanh toán qua PayOS:</Text>
                                        <Space wrap>
                                            <div style={{
                                                padding: '8px 16px',
                                                background: '#f5f5f5',
                                                borderRadius: 6,
                                                border: '1px solid #e8e8e8'
                                            }}>
                                                <Text style={{ fontSize: 13 }}>💳 Thẻ tín dụng (Visa, Mastercard, JCB)</Text>
                                            </div>
                                            <div style={{
                                                padding: '8px 16px',
                                                background: '#f5f5f5',
                                                borderRadius: 6,
                                                border: '1px solid #e8e8e8'
                                            }}>
                                                <Text style={{ fontSize: 13 }}>💳 Thẻ ghi nợ nội địa (ATM)</Text>
                                            </div>
                                            <div style={{
                                                padding: '8px 16px',
                                                background: '#f5f5f5',
                                                borderRadius: 6,
                                                border: '1px solid #e8e8e8'
                                            }}>
                                                <Text style={{ fontSize: 13 }}>📱 Ví điện tử (MoMo, ZaloPay, ShopeePay)</Text>
                                            </div>
                                        </Space>
                                    </Space>

                                    <Divider style={{ margin: '16px 0' }} />

                                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                        <Text type="secondary" style={{ fontSize: 13 }}>
                                            • Bạn sẽ được chuyển tới trang thanh toán bảo mật của PayOS
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: 13 }}>
                                            • Thanh toán được xử lý tự động, không cần xác nhận thủ công
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: 13 }}>
                                            • Hệ thống sẽ tự động ghi nhận đặt cọc sau khi thanh toán thành công
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: 13 }}>
                                            • Email xác nhận sẽ được gửi đến <Text strong>{bookingData.guestInfo?.email}</Text>
                                        </Text>
                                    </Space>
                                </Space>

                                <Divider />

                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    loading={payOSLoading}
                                    onClick={handlePayWithPayOS}
                                    icon={<CreditCardOutlined />}
                                    style={{
                                        backgroundColor: '#1677ff',
                                        borderColor: '#1677ff',
                                        height: 50,
                                        fontSize: 16,
                                        fontWeight: 'bold',
                                    }}
                                >
                                    Thanh toán online qua PayOS ({depositAmount.toLocaleString('vi-VN')} VNĐ)
                                </Button>
                            </Card>

                            {/* Thanh toán bằng thẻ tín dụng/ghi nợ */}
                            <Card
                                title={
                                    <Space>
                                        <CreditCardOutlined />
                                        <span>Thanh toán bằng thẻ tín dụng / thẻ ghi nợ</span>
                                    </Space>
                                }
                                variant="borderless"
                            >
                                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                    <div style={{
                                        padding: 16,
                                        background: '#fff7e6',
                                        borderRadius: 8,
                                        border: '1px solid #ffd591'
                                    }}>
                                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                            <Space>
                                                <SafetyOutlined style={{ color: '#fa8c16', fontSize: 20 }} />
                                                <Text strong style={{ fontSize: 15 }}>Tính năng đang phát triển</Text>
                                            </Space>
                                            <Text type="secondary" style={{ fontSize: 13, marginLeft: 28 }}>
                                                Phương thức thanh toán bằng thẻ tín dụng/ghi nợ trực tiếp đang được phát triển. 
                                                Vui lòng sử dụng PayOS để thanh toán.
                                            </Text>
                                        </Space>
                                    </div>

                                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                        <Text strong style={{ fontSize: 14 }}>Các loại thẻ sẽ được hỗ trợ:</Text>
                                        <Space wrap>
                                            <div style={{
                                                padding: '8px 16px',
                                                background: '#f5f5f5',
                                                borderRadius: 6,
                                                border: '1px solid #e8e8e8',
                                                opacity: 0.6
                                            }}>
                                                <Text type="secondary" style={{ fontSize: 13 }}>💳 Thẻ tín dụng (Visa, Mastercard, JCB)</Text>
                                            </div>
                                            <div style={{
                                                padding: '8px 16px',
                                                background: '#f5f5f5',
                                                borderRadius: 6,
                                                border: '1px solid #e8e8e8',
                                                opacity: 0.6
                                            }}>
                                                <Text type="secondary" style={{ fontSize: 13 }}>💳 Thẻ ghi nợ nội địa (ATM)</Text>
                                            </div>
                                        </Space>
                                    </Space>
                                </Space>

                                <Divider />

                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    disabled
                                    icon={<CreditCardOutlined />}
                                    style={{
                                        backgroundColor: '#d9d9d9',
                                        borderColor: '#d9d9d9',
                                        height: 50,
                                        fontSize: 16,
                                        fontWeight: 'bold',
                                        cursor: 'not-allowed',
                                    }}
                                >
                                    Tính năng đang phát triển
                                </Button>
                            </Card>
                        </Col>

                        {/* Cột phải: Tóm tắt đơn hàng và Thông tin người đặt */}
                        <Col xs={24} lg={8}>
                            <Card
                                title={`Tóm tắt đơn hàng (${rooms.length} phòng)`}
                                variant="borderless"
                                style={{ position: 'sticky', top: 20 }}
                            >
                                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                    {/* Danh sách phòng */}
                                    {rooms.map((room, index) => (
                                        <div key={index} style={{
                                            padding: 12,
                                            background: '#fafafa',
                                            borderRadius: 8,
                                            border: '1px solid #e8e8e8'
                                        }}>
                                            <Row justify="space-between" align="top" style={{ marginBottom: 8 }}>
                                                <Col flex="auto">
                                                    <Text strong style={{ fontSize: 14 }}>
                                                        {room.roomName}
                                                    </Text>
                                                </Col>
                                            </Row>
                                            {room.checkIn && room.checkOut && (
                                                <div style={{ marginTop: 4 }}>
                                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                                        {room.checkIn} → {room.checkOut}
                                                    </Text>
                                                    <br />
                                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                                        {room.nights} đêm
                                                    </Text>
                                                </div>
                                            )}
                                            {(room.adults || room.children) && (
                                                <div style={{ marginTop: 4 }}>
                                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                                        {room.adults || 0} người lớn
                                                        {room.children ? `, ${room.children} trẻ em` : ''}
                                                    </Text>
                                                </div>
                                            )}
                                            <div style={{ marginTop: 8 }}>
                                                <Text strong style={{ color: '#cb8670', fontSize: 14 }}>
                                                    {(room.totalPrice || room.price * (room.nights || 1)).toLocaleString('vi-VN')} VNĐ
                                                </Text>
                                            </div>
                                        </div>
                                    ))}

                                    {rooms.length > 0 && rooms[0].checkIn && (
                                        <>
                                            <Divider style={{ margin: '8px 0' }} />
                                            <Row>
                                                <Col span={12}>
                                                    <Text type="secondary">Nhận phòng</Text>
                                                    <br />
                                                    <Text strong>{rooms[0].checkIn}</Text>
                                                </Col>
                                                <Col span={12}>
                                                    <Text type="secondary">Trả phòng</Text>
                                                    <br />
                                                    <Text strong>{rooms[0].checkOut}</Text>
                                                </Col>
                                            </Row>
                                        </>
                                    )}

                                    <Divider style={{ margin: '12px 0' }} />

                                    {/* Chi tiết giá từng phòng */}
                                    <div>
                                        {rooms.map((room, index) => (
                                            <div key={index} style={{ marginBottom: index < rooms.length - 1 ? 8 : 0 }}>
                                                <Row justify="space-between">
                                                    <Col>
                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                            {room.roomName}
                                                        </Text>
                                                    </Col>
                                                    <Col>
                                                        <Text style={{ fontSize: 12 }}>
                                                            {(room.totalPrice || room.price * (room.nights || 1)).toLocaleString('vi-VN')} VNĐ
                                                        </Text>
                                                    </Col>
                                                </Row>
                                            </div>
                                        ))}
                                    </div>

                                    <Divider style={{ margin: '12px 0' }} />

                                    {/* Chi tiết thanh toán */}
                                    <div>
                                        <Row justify="space-between" style={{ marginBottom: 8 }}>
                                            <Col>
                                                <Text>Tổng tiền phòng</Text>
                                            </Col>
                                            <Col>
                                                <Text>{totalAmount.toLocaleString('vi-VN')} VNĐ</Text>
                                            </Col>
                                        </Row>
                                        <Row justify="space-between" style={{ marginBottom: 8 }}>
                                            <Col>
                                                <Text type="secondary">Tiền cọc (30%)</Text>
                                            </Col>
                                            <Col>
                                                <Text type="secondary">{depositAmount.toLocaleString('vi-VN')} VNĐ</Text>
                                            </Col>
                                        </Row>
                                        <Row justify="space-between">
                                            <Col>
                                                <Text type="secondary">Số tiền còn lại</Text>
                                            </Col>
                                            <Col>
                                                <Text type="secondary">{remainingAmount.toLocaleString('vi-VN')} VNĐ</Text>
                                            </Col>
                                        </Row>
                                    </div>

                                    <Divider style={{ margin: '12px 0' }} />

                                    <div style={{
                                        background: 'linear-gradient(135deg, #fff5f0 0%, #ffe8e0 100%)',
                                        padding: 16,
                                        borderRadius: 8,
                                        border: '2px solid #cb8670'
                                    }}>
                                        <Row justify="space-between" align="middle">
                                            <Col>
                                                <Text strong style={{ fontSize: 16 }}>Tiền cọc cần thanh toán</Text>
                                                <br />
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    Số tiền còn lại thanh toán khi nhận phòng
                                                </Text>
                                            </Col>
                                            <Col>
                                                <Text
                                                    strong
                                                    style={{
                                                        fontSize: 24,
                                                        color: '#cb8670'
                                                    }}
                                                >
                                                    {depositAmount.toLocaleString('vi-VN')} VNĐ
                                                </Text>
                                            </Col>
                                        </Row>
                                    </div>

                                    <Text type="secondary" style={{ fontSize: 12, display: 'block', textAlign: 'center', marginTop: 8 }}>
                                        * Thanh toán số tiền còn lại khi nhận phòng tại khách sạn
                                    </Text>
                                </Space>
                            </Card>

                            {/* Thông tin người đặt */}
                            <Card
                                title="Thông tin người đặt"
                                variant="borderless"
                                style={{ marginTop: 24, position: 'sticky', top: 20 }}
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
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </Content>

        </div>
    );
};

export default PaymentPage;
