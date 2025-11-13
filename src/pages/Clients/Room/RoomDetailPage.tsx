import React, { useMemo } from "react";
import {
    Layout,
    Row,
    Col,
    Typography,
    Card,
    Rate,
    Breadcrumb,
    Button,
    Divider,
    Space,
    Tag,
    Image,
    Avatar,
    List,
    Affix,
} from "antd";
import {
    HomeOutlined,
    WifiOutlined,
    CarOutlined,
    UserOutlined,
    EnvironmentOutlined,
    CheckCircleFilled,
    CoffeeOutlined,
    SafetyOutlined,
} from "@ant-design/icons";
import { Link, useParams } from "react-router-dom";
import BookingFilter from "../../../components/Booking/BookingFilter";

// Import các layout chung
import AppHeader from "../../../components/Layout/AppHeader";
import AppFooter from "../../../components/Layout/AppFooter";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

// --- Dữ liệu giả lập phòng ---
const allRooms = [
    {
        id: 1,
        name: "Phòng Deluxe Giường Đôi",
        type: "Deluxe Room",
        price: 1500000,
        rating: 4.8,
        category: "deluxe",
        location: "Tầng 3, Toà A",
        description: "Phòng Deluxe rộng rãi với thiết kế hiện đại, giường king-size êm ái, phù hợp cho cặp đôi hoặc gia đình nhỏ. Phòng được trang bị đầy đủ tiện nghi cao cấp với view nhìn ra hồ bơi.",
        bedType: "1 Giường King",
        maxGuests: 2,
        size: "35m²",
        amenities: [
            { icon: <WifiOutlined />, text: "Wifi miễn phí tốc độ cao" },
            { icon: <CheckCircleFilled style={{ color: '#52c41a' }} />, text: "Điều hòa nhiệt độ" },
            { icon: <CarOutlined />, text: "Bãi đỗ xe miễn phí" },
            { icon: <CoffeeOutlined />, text: "Minibar & máy pha cà phê" },
            { icon: <SafetyOutlined />, text: "Két sắt an toàn" },
            { icon: <CheckCircleFilled style={{ color: '#52c41a' }} />, text: "TV màn hình phẳng 50 inch" },
        ],
        galleryImages: [
            "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80",
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
        ],
        reviews: [
            { user: "Nguyễn Văn A", rating: 5, comment: "Phòng rất đẹp và sạch sẽ, view tuyệt vời!" },
            { user: "Trần Thị B", rating: 4.5, comment: "Nhân viên thân thiện, phục vụ tốt." },
            { user: "Lê Văn C", rating: 5, comment: "Đáng giá tiền, sẽ quay lại!" },
        ]
    },
    {
        id: 2,
        name: "Phòng Suite Cao Cấp",
        type: "Suite Room",
        price: 2500000,
        rating: 4.9,
        category: "suite",
        location: "Tầng 5, Toà B",
        description: "Suite cao cấp với không gian rộng rãi, phòng khách riêng biệt và phòng tắm sang trọng với bồn tắm jacuzzi. Phù hợp cho khách VIP hoặc dịp đặc biệt.",
        bedType: "1 Giường King + Sofa Bed",
        maxGuests: 4,
        size: "60m²",
        amenities: [
            { icon: <WifiOutlined />, text: "Wifi miễn phí tốc độ cao" },
            { icon: <CheckCircleFilled style={{ color: '#52c41a' }} />, text: "Điều hòa trung tâm" },
            { icon: <CarOutlined />, text: "Bãi đỗ xe miễn phí" },
            { icon: <CoffeeOutlined />, text: "Minibar cao cấp & máy pha cà phê Nespresso" },
            { icon: <SafetyOutlined />, text: "Két sắt điện tử" },
            { icon: <CheckCircleFilled style={{ color: '#52c41a' }} />, text: "Smart TV 65 inch" },
            { icon: <CheckCircleFilled style={{ color: '#52c41a' }} />, text: "Bồn tắm Jacuzzi" },
            { icon: <CheckCircleFilled style={{ color: '#52c41a' }} />, text: "Ban công riêng" },
        ],
        galleryImages: [
            "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
            "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80",
            "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80",
        ],
        reviews: [
            { user: "Phạm Minh D", rating: 5, comment: "Suite tuyệt vời, không gian sang trọng!" },
            { user: "Hoàng Thu E", rating: 5, comment: "Bồn tắm jacuzzi rất thư giãn, phục vụ chu đáo." },
        ]
    },
    {
        id: 3,
        name: "Phòng Standard Giường Đơn",
        type: "Standard Room",
        price: 800000,
        rating: 4.5,
        category: "standard",
        location: "Tầng 2, Toà A",
        description: "Phòng Standard tiện nghi cơ bản, phù hợp cho khách du lịch một mình hoặc công tác ngắn ngày. Thiết kế đơn giản nhưng đầy đủ tiện nghi cần thiết.",
        bedType: "1 Giường Đơn",
        maxGuests: 1,
        size: "20m²",
        amenities: [
            { icon: <WifiOutlined />, text: "Wifi miễn phí" },
            { icon: <CheckCircleFilled style={{ color: '#52c41a' }} />, text: "Điều hòa" },
            { icon: <CarOutlined />, text: "Bãi đỗ xe" },
            { icon: <CoffeeOutlined />, text: "Ấm đun nước" },
            { icon: <CheckCircleFilled style={{ color: '#52c41a' }} />, text: "TV 32 inch" },
        ],
        galleryImages: [
            "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
            "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80",
        ],
        reviews: [
            { user: "Võ Văn F", rating: 4.5, comment: "Phòng sạch, giá hợp lý." },
            { user: "Đỗ Thị G", rating: 4, comment: "Ổn cho công tác ngắn hạn." },
        ]
    },
];

const RoomDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    // Tìm phòng dựa trên ID
    const room = useMemo(() => {
        return allRooms.find(r => r.id.toString() === id);
    }, [id]);

    // Xử lý khi không tìm thấy phòng
    if (!room) {
        return (
            <Layout style={{ background: "#fff", minHeight: "100vh" }}>
                <AppHeader isLoggedIn={false} />
                <Content style={{ padding: "100px 50px", textAlign: "center", marginTop: 70 }}>
                    <Title level={2}>Không tìm thấy phòng</Title>
                    <Paragraph>Phòng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</Paragraph>
                    <Button type="primary">
                        <Link to="/rooms">Quay lại danh sách phòng</Link>
                    </Button>
                </Content>
                <AppFooter />
            </Layout>
        );
    }

    // Hàm xử lý đặt phòng
    const handleBooking = (values: any) => {
        console.log("Booking Details:", {
            roomId: room.id,
            ...values,
        });
        alert(`Đặt phòng thành công! ${room.name}`);
    };

    return (
        <Layout style={{ background: "#fff" }}>
            <AppHeader isLoggedIn={false} />

            <Content style={{ padding: "0 50px", marginTop: 70 }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    {/* Breadcrumb */}
                    <Breadcrumb style={{ margin: "24px 0" }}>
                        <Breadcrumb.Item>
                            <Link to="/">
                                <HomeOutlined /> Trang chủ
                            </Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <Link to="/rooms">Danh sách phòng</Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>{room.name}</Breadcrumb.Item>
                    </Breadcrumb>

                    {/* Tiêu đề và Đánh giá */}
                    <Row justify="space-between" align="middle">
                        <Col>
                            <Title level={2} style={{ marginBottom: 8 }}>
                                {room.name}
                            </Title>
                            <Space size="middle">
                                <Rate allowHalf disabled defaultValue={room.rating} />
                                <Text strong>{room.rating} ({room.reviews.length} đánh giá)</Text>
                                <Text type="secondary">
                                    <EnvironmentOutlined style={{ marginRight: 4 }} />
                                    {room.location}
                                </Text>
                            </Space>
                        </Col>
                        <Col>
                            <Tag color="blue" style={{ fontSize: 16, padding: "8px 16px" }}>
                                {room.type}
                            </Tag>
                        </Col>
                    </Row>

                    {/* Thông tin cơ bản */}
                    <Card style={{ marginTop: 16, backgroundColor: "#f5f5f5" }} bordered={false}>
                        <Row gutter={[24, 16]}>
                            <Col xs={24} sm={8}>
                                <Text type="secondary">Loại giường</Text>
                                <br />
                                <Text strong style={{ fontSize: 16 }}>{room.bedType}</Text>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Text type="secondary">Diện tích</Text>
                                <br />
                                <Text strong style={{ fontSize: 16 }}>{room.size}</Text>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Text type="secondary">Số khách tối đa</Text>
                                <br />
                                <Text strong style={{ fontSize: 16 }}>{room.maxGuests} người</Text>
                            </Col>
                        </Row>
                    </Card>

                    {/* Thư viện ảnh */}
                    <Image.PreviewGroup>
                        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                            <Col span={16}>
                                <Image
                                    width="100%"
                                    height={500}
                                    src={room.galleryImages[0]}
                                    style={{ objectFit: "cover", borderRadius: 12 }}
                                />
                            </Col>
                            <Col span={8}>
                                <Row gutter={[16, 16]}>
                                    {room.galleryImages.slice(1).map((img, idx) => (
                                        <Col span={24} key={idx}>
                                            <Image
                                                width="100%"
                                                height={242}
                                                src={img}
                                                style={{ objectFit: "cover", borderRadius: 12 }}
                                            />
                                        </Col>
                                    ))}
                                </Row>
                            </Col>
                        </Row>
                    </Image.PreviewGroup>

                    {/* Nội dung chính và Form Đặt phòng */}
                    <Row gutter={[32, 32]} style={{ marginTop: 32 }}>
                        {/* Cột trái: Thông tin chi tiết */}
                        <Col xs={24} lg={16}>
                            <Title level={4}>Mô tả phòng</Title>
                            <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
                                {room.description}
                            </Paragraph>

                            <Divider />

                            {/* Tiện nghi */}
                            <Title level={4}>Tiện nghi phòng</Title>
                            <Row gutter={[16, 16]}>
                                {room.amenities.map((item, index) => (
                                    <Col key={index} xs={24} sm={12}>
                                        <Space size="middle">
                                            <span style={{ fontSize: 20, color: '#555' }}>{item.icon}</span>
                                            <Text style={{ fontSize: 16 }}>{item.text}</Text>
                                        </Space>
                                    </Col>
                                ))}
                            </Row>

                            <Divider />

                            {/* Đánh giá */}
                            <Title level={4}>Đánh giá từ khách hàng ({room.reviews.length})</Title>
                            <List
                                itemLayout="horizontal"
                                dataSource={room.reviews}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={<Avatar icon={<UserOutlined />} />}
                                            title={
                                                <Space>
                                                    <Text strong>{item.user}</Text>
                                                    <Rate disabled defaultValue={item.rating} style={{ fontSize: 14 }} />
                                                </Space>
                                            }
                                            description={<Paragraph style={{ marginTop: 4 }}>{item.comment}</Paragraph>}
                                        />
                                    </List.Item>
                                )}
                            />
                        </Col>

                        {/* Cột phải: Form Đặt phòng */}
                        <Col xs={24} lg={8}>
                            <Affix offsetTop={90}>
                                <Card
                                    bordered={false}
                                    style={{
                                        borderRadius: 12,
                                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                                    }}
                                >
                                    <Title level={4}>
                                        <Text strong style={{ color: "#cb8670", fontSize: 28 }}>
                                            {room.price.toLocaleString("vi-VN")}đ
                                        </Text>
                                        <Text style={{ fontSize: 16, color: "#555" }}> / đêm</Text>
                                    </Title>

                                    <Divider style={{ margin: "16px 0" }} />

                                    {/* Form đặt phòng */}
                                    <BookingFilter onSubmit={handleBooking} showButton={true} />

                                    <Paragraph style={{ textAlign: 'center', marginTop: 16 }} type="secondary">
                                        Miễn phí hủy phòng trong vòng 24h
                                    </Paragraph>
                                </Card>
                            </Affix>
                        </Col>
                    </Row>

                    {/* Chính sách phòng */}
                    <Card style={{ marginTop: 32, marginBottom: 32 }}>
                        <Title level={4}>Chính sách phòng</Title>
                        <Row gutter={[24, 16]}>
                            <Col xs={24} md={8}>
                                <Text strong>Giờ nhận phòng:</Text>
                                <br />
                                <Text>Từ 14:00</Text>
                            </Col>
                            <Col xs={24} md={8}>
                                <Text strong>Giờ trả phòng:</Text>
                                <br />
                                <Text>Trước 12:00</Text>
                            </Col>
                            <Col xs={24} md={8}>
                                <Text strong>Hủy phòng:</Text>
                                <br />
                                <Text>Miễn phí hủy trước 24h</Text>
                            </Col>
                        </Row>
                    </Card>
                </div>
            </Content>

            <AppFooter />
        </Layout>
    );
};

export default RoomDetailPage;
