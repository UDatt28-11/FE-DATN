import React, { useState } from 'react';
import {
    Layout,
    Card,
    Row,
    Col,
    Typography,
    Tag,
    Button,
    Space,
    Empty,
    Image,
    Divider,
    Modal,
    Descriptions,
    Tabs,
} from 'antd';
import {
    CalendarOutlined,
    UserOutlined,
    HomeOutlined,
    PhoneOutlined,
    MailOutlined,
    IdcardOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './MyBookings.css';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface Booking {
    id: string;
    bookingCode: string;
    roomName: string;
    roomImage: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    adults: number;
    children: number;
    totalPrice: number;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    paymentMethod: string;
    guestInfo: {
        fullName: string;
        phone: string;
        email: string;
        idCard: string;
    };
    createdAt: string;
}

// Dữ liệu giả lập đơn đặt phòng
const mockBookings: Booking[] = [
    {
        id: '1',
        bookingCode: 'BK001XYZ',
        roomName: 'Deluxe Room',
        roomImage: '/img/bg-img/1.jpg',
        checkIn: '15/11/2025',
        checkOut: '17/11/2025',
        nights: 2,
        adults: 2,
        children: 0,
        totalPrice: 3000000,
        status: 'confirmed',
        paymentMethod: 'Thanh toán tại khách sạn',
        guestInfo: {
            fullName: 'Nguyễn Văn A',
            phone: '0912345678',
            email: 'nguyenvana@email.com',
            idCard: '001234567890',
        },
        createdAt: '13/11/2025 10:30',
    },
    {
        id: '2',
        bookingCode: 'BK002ABC',
        roomName: 'Double Suite',
        roomImage: '/img/bg-img/8.jpg',
        checkIn: '20/11/2025',
        checkOut: '22/11/2025',
        nights: 2,
        adults: 3,
        children: 1,
        totalPrice: 4000000,
        status: 'pending',
        paymentMethod: 'Chuyển khoản ngân hàng',
        guestInfo: {
            fullName: 'Trần Thị B',
            phone: '0987654321',
            email: 'tranthib@email.com',
            idCard: '001234567891',
        },
        createdAt: '13/11/2025 14:15',
    },
    {
        id: '3',
        bookingCode: 'BK003DEF',
        roomName: 'Single Room',
        roomImage: '/img/bg-img/15.jpg',
        checkIn: '10/11/2025',
        checkOut: '11/11/2025',
        nights: 1,
        adults: 1,
        children: 0,
        totalPrice: 800000,
        status: 'completed',
        paymentMethod: 'Tiền mặt',
        guestInfo: {
            fullName: 'Lê Văn C',
            phone: '0909123456',
            email: 'levanc@email.com',
            idCard: '001234567892',
        },
        createdAt: '08/11/2025 09:00',
    },
    {
        id: '4',
        bookingCode: 'BK004GHI',
        roomName: 'Family Suite',
        roomImage: '/img/bg-img/5.jpg',
        checkIn: '05/11/2025',
        checkOut: '07/11/2025',
        nights: 2,
        adults: 4,
        children: 2,
        totalPrice: 5000000,
        status: 'cancelled',
        paymentMethod: 'Ví MoMo',
        guestInfo: {
            fullName: 'Phạm Thị D',
            phone: '0911222333',
            email: 'phamthid@email.com',
            idCard: '001234567893',
        },
        createdAt: '03/11/2025 16:45',
    },
];

const MyBookingsPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('all');

    const getStatusConfig = (status: Booking['status']) => {
        const configs = {
            pending: {
                color: 'gold',
                icon: <ClockCircleOutlined />,
                text: 'Chờ xác nhận',
            },
            confirmed: {
                color: 'green',
                icon: <CheckCircleOutlined />,
                text: 'Đã xác nhận',
            },
            cancelled: {
                color: 'red',
                icon: <CloseCircleOutlined />,
                text: 'Đã hủy',
            },
            completed: {
                color: 'blue',
                icon: <CheckCircleOutlined />,
                text: 'Hoàn thành',
            },
        };
        return configs[status];
    };

    const handleViewDetail = (booking: Booking) => {
        setSelectedBooking(booking);
        setDetailModalVisible(true);
    };

    const filterBookings = (status?: string) => {
        if (!status || status === 'all') return mockBookings;
        return mockBookings.filter(booking => booking.status === status);
    };

    const filteredBookings = filterBookings(activeTab);

    const renderBookingCard = (booking: Booking) => {
        const statusConfig = getStatusConfig(booking.status);

        return (
            <Card
                key={booking.id}
                className="booking-card"
                hoverable
                style={{ marginBottom: 24 }}
            >
                <Row gutter={[24, 24]}>
                    {/* Hình ảnh phòng */}
                    <Col xs={24} sm={8} md={6}>
                        <Image
                            src={booking.roomImage}
                            alt={booking.roomName}
                            style={{
                                width: '100%',
                                height: 180,
                                objectFit: 'cover',
                                borderRadius: 8,
                            }}
                            preview={false}
                        />
                    </Col>

                    {/* Thông tin đặt phòng */}
                    <Col xs={24} sm={16} md={18}>
                        <Row justify="space-between" align="top">
                            <Col>
                                <Space direction="vertical" size="small">
                                    <Title level={4} style={{ margin: 0 }}>
                                        {booking.roomName}
                                    </Title>
                                    <Text type="secondary">
                                        Mã đặt phòng: <Text strong style={{ color: '#cb8670' }}>#{booking.bookingCode}</Text>
                                    </Text>
                                    <Tag icon={statusConfig.icon} color={statusConfig.color}>
                                        {statusConfig.text}
                                    </Tag>
                                </Space>
                            </Col>
                            <Col>
                                <Text strong style={{ fontSize: 20, color: '#cb8670' }}>
                                    {booking.totalPrice.toLocaleString('vi-VN')} VNĐ
                                </Text>
                            </Col>
                        </Row>

                        <Divider style={{ margin: '16px 0' }} />

                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} md={8}>
                                <Space>
                                    <CalendarOutlined style={{ color: '#cb8670' }} />
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 12 }}>Nhận phòng</Text>
                                        <br />
                                        <Text strong>{booking.checkIn}</Text>
                                    </div>
                                </Space>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Space>
                                    <CalendarOutlined style={{ color: '#cb8670' }} />
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 12 }}>Trả phòng</Text>
                                        <br />
                                        <Text strong>{booking.checkOut}</Text>
                                    </div>
                                </Space>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Space>
                                    <UserOutlined style={{ color: '#cb8670' }} />
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 12 }}>Số khách</Text>
                                        <br />
                                        <Text strong>
                                            {booking.adults} người lớn
                                            {booking.children > 0 && `, ${booking.children} trẻ em`}
                                        </Text>
                                    </div>
                                </Space>
                            </Col>
                        </Row>

                        <Divider style={{ margin: '16px 0' }} />

                        <Row justify="space-between" align="middle">
                            <Col>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    Đặt lúc: {booking.createdAt}
                                </Text>
                            </Col>
                            <Col>
                                <Space>
                                    <Button
                                        type="primary"
                                        icon={<EyeOutlined />}
                                        onClick={() => handleViewDetail(booking)}
                                        style={{
                                            backgroundColor: '#cb8670',
                                            borderColor: '#cb8670',
                                        }}
                                    >
                                        Xem chi tiết
                                    </Button>
                                    {booking.status === 'pending' && (
                                        <Button danger>Hủy đặt phòng</Button>
                                    )}
                                </Space>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Card>
        );
    };

    return (
        <div className="my-bookings-page">
            {/* Breadcrumb */}
            <div className="breadcrumb-wrapper" style={{ padding: '20px 0', background: '#f5f5f5' }}>
                <div className="container">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(-1)}
                        size="large"
                    >
                        Trở về
                    </Button>
                </div>
            </div>

            <Content style={{ padding: '40px 0', minHeight: '70vh', background: '#fff' }}>
                <div className="container">
                    <Title level={2} style={{ marginBottom: 24 }}>
                        <HomeOutlined /> Đơn đặt phòng của tôi
                    </Title>

                    {/* Tabs lọc theo trạng thái */}
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        style={{ marginBottom: 24 }}
                    >
                        <TabPane tab="Tất cả" key="all" />
                        <TabPane tab="Chờ xác nhận" key="pending" />
                        <TabPane tab="Đã xác nhận" key="confirmed" />
                        <TabPane tab="Hoàn thành" key="completed" />
                        <TabPane tab="Đã hủy" key="cancelled" />
                    </Tabs>

                    {/* Danh sách đơn đặt phòng */}
                    {filteredBookings.length > 0 ? (
                        filteredBookings.map(renderBookingCard)
                    ) : (
                        <Empty
                            description="Chưa có đơn đặt phòng nào"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        >
                            <Button
                                type="primary"
                                onClick={() => navigate('/rooms')}
                                style={{
                                    backgroundColor: '#cb8670',
                                    borderColor: '#cb8670',
                                }}
                            >
                                Đặt phòng ngay
                            </Button>
                        </Empty>
                    )}
                </div>
            </Content>

            {/* Modal chi tiết đơn đặt phòng */}
            <Modal
                title={
                    <Space>
                        <HomeOutlined />
                        <span>Chi tiết đơn đặt phòng</span>
                    </Space>
                }
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailModalVisible(false)}>
                        Đóng
                    </Button>,
                    selectedBooking?.status === 'pending' && (
                        <Button key="cancel" danger>
                            Hủy đặt phòng
                        </Button>
                    ),
                    <Button
                        key="print"
                        type="primary"
                        style={{
                            backgroundColor: '#cb8670',
                            borderColor: '#cb8670',
                        }}
                    >
                        In phiếu đặt phòng
                    </Button>,
                ]}
                width={700}
            >
                {selectedBooking && (
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        {/* Mã đặt phòng và trạng thái */}
                        <div style={{ textAlign: 'center', padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
                            <Text type="secondary">Mã đặt phòng</Text>
                            <br />
                            <Title level={3} style={{ margin: '8px 0', color: '#cb8670' }}>
                                #{selectedBooking.bookingCode}
                            </Title>
                            <Tag
                                icon={getStatusConfig(selectedBooking.status).icon}
                                color={getStatusConfig(selectedBooking.status).color}
                                style={{ fontSize: 14, padding: '4px 12px' }}
                            >
                                {getStatusConfig(selectedBooking.status).text}
                            </Tag>
                        </div>

                        {/* Thông tin phòng */}
                        <Descriptions title="Thông tin phòng" bordered column={1}>
                            <Descriptions.Item label="Tên phòng">
                                <Text strong>{selectedBooking.roomName}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày nhận phòng">
                                {selectedBooking.checkIn}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày trả phòng">
                                {selectedBooking.checkOut}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số đêm">
                                {selectedBooking.nights} đêm
                            </Descriptions.Item>
                            <Descriptions.Item label="Số khách">
                                {selectedBooking.adults} người lớn
                                {selectedBooking.children > 0 && `, ${selectedBooking.children} trẻ em`}
                            </Descriptions.Item>
                        </Descriptions>

                        {/* Thông tin người đặt */}
                        <Descriptions title="Thông tin người đặt" bordered column={1}>
                            <Descriptions.Item label={<><UserOutlined /> Họ tên</>}>
                                {selectedBooking.guestInfo.fullName}
                            </Descriptions.Item>
                            <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>}>
                                {selectedBooking.guestInfo.phone}
                            </Descriptions.Item>
                            <Descriptions.Item label={<><MailOutlined /> Email</>}>
                                {selectedBooking.guestInfo.email}
                            </Descriptions.Item>
                            <Descriptions.Item label={<><IdcardOutlined /> CCCD</>}>
                                {selectedBooking.guestInfo.idCard}
                            </Descriptions.Item>
                        </Descriptions>

                        {/* Thông tin thanh toán */}
                        <Descriptions title="Thông tin thanh toán" bordered column={1}>
                            <Descriptions.Item label="Phương thức thanh toán">
                                {selectedBooking.paymentMethod}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng tiền">
                                <Text strong style={{ fontSize: 18, color: '#cb8670' }}>
                                    {selectedBooking.totalPrice.toLocaleString('vi-VN')} VNĐ
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Thời gian đặt">
                                {selectedBooking.createdAt}
                            </Descriptions.Item>
                        </Descriptions>
                    </Space>
                )}
            </Modal>
        </div>
    );
};

export default MyBookingsPage;
