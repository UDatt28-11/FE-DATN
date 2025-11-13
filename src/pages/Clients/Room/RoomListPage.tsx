import React, { useState } from "react";
import {
    Layout,
    Row,
    Col,
    Card,
    Typography,
    Rate,
    Button,
    Tag,
    Space,
    Select,
} from "antd";
import {
    EnvironmentOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

// Import các layout chung
import AppHeader from "../../../components/Layout/AppHeader";
import AppFooter from "../../../components/Layout/AppFooter";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;
const { Option } = Select;

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
        description: "Phòng Deluxe rộng rãi với thiết kế hiện đại, giường king-size êm ái.",
        bedType: "1 Giường King",
        maxGuests: 2,
        size: "35m²",
        image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80",
        reviews: 125,
    },
    {
        id: 2,
        name: "Phòng Suite Cao Cấp",
        type: "Suite Room",
        price: 2500000,
        rating: 4.9,
        category: "suite",
        location: "Tầng 5, Toà B",
        description: "Suite cao cấp với không gian rộng rãi, phòng khách riêng biệt.",
        bedType: "1 Giường King + Sofa Bed",
        maxGuests: 4,
        size: "60m²",
        image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
        reviews: 89,
    },
    {
        id: 3,
        name: "Phòng Standard Giường Đơn",
        type: "Standard Room",
        price: 800000,
        rating: 4.5,
        category: "standard",
        location: "Tầng 2, Toà A",
        description: "Phòng Standard tiện nghi cơ bản, phù hợp cho khách công tác.",
        bedType: "1 Giường Đơn",
        maxGuests: 1,
        size: "20m²",
        image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
        reviews: 56,
    },
    {
        id: 4,
        name: "Phòng Family Room",
        type: "Family Room",
        price: 2000000,
        rating: 4.7,
        category: "family",
        location: "Tầng 4, Toà B",
        description: "Phòng gia đình rộng rãi với 2 giường lớn, phù hợp cho gia đình có trẻ em.",
        bedType: "2 Giường Queen",
        maxGuests: 4,
        size: "45m²",
        image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80",
        reviews: 78,
    },
    {
        id: 5,
        name: "Phòng Superior Twin",
        type: "Superior Room",
        price: 1200000,
        rating: 4.6,
        category: "superior",
        location: "Tầng 3, Toà A",
        description: "Phòng Superior với 2 giường đơn, view thành phố tuyệt đẹp.",
        bedType: "2 Giường Đơn",
        maxGuests: 2,
        size: "30m²",
        image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80",
        reviews: 92,
    },
    {
        id: 6,
        name: "Phòng Executive Suite",
        type: "Executive Suite",
        price: 3500000,
        rating: 5.0,
        category: "executive",
        location: "Tầng 10, Toà B",
        description: "Suite Executive cao cấp nhất với view toàn cảnh thành phố.",
        bedType: "1 Giường King + Phòng khách",
        maxGuests: 3,
        size: "80m²",
        image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
        reviews: 45,
    },
];

const RoomListPage: React.FC = () => {
    const [sortBy, setSortBy] = useState<string>("default");
    const [filterCategory, setFilterCategory] = useState<string>("all");

    // Lọc và sắp xếp phòng
    const filteredRooms = allRooms
        .filter(room => filterCategory === "all" || room.category === filterCategory)
        .sort((a, b) => {
            if (sortBy === "price-asc") return a.price - b.price;
            if (sortBy === "price-desc") return b.price - a.price;
            if (sortBy === "rating") return b.rating - a.rating;
            return 0;
        });

    return (
        <Layout style={{ background: "#fff" }}>
            <AppHeader isLoggedIn={false} />

            <Content style={{ padding: "0 50px", marginTop: 70 }}>
                <div style={{ maxWidth: 1200, margin: "0 auto", paddingTop: 40 }}>
                    {/* Header */}
                    <Row justify="space-between" align="middle" style={{ marginBottom: 32 }}>
                        <Col>
                            <Title level={2}>Danh sách phòng</Title>
                            <Text type="secondary">Tìm thấy {filteredRooms.length} phòng</Text>
                        </Col>
                        <Col>
                            <Space size="middle">
                                <Select
                                    defaultValue="all"
                                    style={{ width: 200 }}
                                    onChange={setFilterCategory}
                                >
                                    <Option value="all">Tất cả loại phòng</Option>
                                    <Option value="standard">Standard</Option>
                                    <Option value="superior">Superior</Option>
                                    <Option value="deluxe">Deluxe</Option>
                                    <Option value="suite">Suite</Option>
                                    <Option value="family">Family</Option>
                                    <Option value="executive">Executive</Option>
                                </Select>

                                <Select
                                    defaultValue="default"
                                    style={{ width: 200 }}
                                    onChange={setSortBy}
                                >
                                    <Option value="default">Sắp xếp mặc định</Option>
                                    <Option value="price-asc">Giá: Thấp đến cao</Option>
                                    <Option value="price-desc">Giá: Cao đến thấp</Option>
                                    <Option value="rating">Đánh giá cao nhất</Option>
                                </Select>
                            </Space>
                        </Col>
                    </Row>

                    {/* Danh sách phòng */}
                    <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
                        {filteredRooms.map((room) => (
                            <Col xs={24} sm={12} lg={8} key={room.id}>
                                <Card
                                    hoverable
                                    cover={
                                        <img
                                            alt={room.name}
                                            src={room.image}
                                            style={{ height: 240, objectFit: "cover" }}
                                        />
                                    }
                                    style={{ height: "100%" }}
                                >
                                    <Tag color="blue" style={{ marginBottom: 8 }}>
                                        {room.type}
                                    </Tag>

                                    <Meta
                                        title={
                                            <Link to={`/room/${room.id}`} style={{ color: "inherit" }}>
                                                {room.name}
                                            </Link>
                                        }
                                        description={
                                            <Space direction="vertical" size={8} style={{ width: "100%" }}>
                                                <Text type="secondary">
                                                    <EnvironmentOutlined /> {room.location}
                                                </Text>
                                                <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 8 }}>
                                                    {room.description}
                                                </Paragraph>
                                                <Space>
                                                    <Rate disabled defaultValue={room.rating} style={{ fontSize: 14 }} />
                                                    <Text strong>{room.rating}</Text>
                                                    <Text type="secondary">({room.reviews} đánh giá)</Text>
                                                </Space>
                                                <Row justify="space-between" align="middle">
                                                    <Col>
                                                        <Text type="secondary">
                                                            <UserOutlined /> Tối đa {room.maxGuests} người
                                                        </Text>
                                                    </Col>
                                                    <Col>
                                                        <Text strong style={{ fontSize: 18, color: "#cb8670" }}>
                                                            {room.price.toLocaleString("vi-VN")}đ
                                                        </Text>
                                                        <Text type="secondary"> /đêm</Text>
                                                    </Col>
                                                </Row>
                                                <Link to={`/room/${room.id}`}>
                                                    <Button type="primary" block style={{ marginTop: 8 }}>
                                                        Xem chi tiết
                                                    </Button>
                                                </Link>
                                            </Space>
                                        }
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </Content>

            <AppFooter />
        </Layout>
    );
};

export default RoomListPage;
