import React, { useState } from "react";
import {
    Layout,
    Row,
    Col,
    Typography,
    Card,
    Button,
    Tag,
    Breadcrumb,
    Input,
    Space,
    Tabs,
    message,
    Modal,
} from "antd";
import {
    HomeOutlined,
    GiftOutlined,
    PercentageOutlined,
    CopyOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    TagOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

import AppHeader from "../../../components/Layout/AppHeader";
import AppFooter from "../../../components/Layout/AppFooter";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

// Dữ liệu mã giảm giá
const promotions = [
    {
        id: 1,
        code: "SUMMER2024",
        title: "Giảm 20% Mùa Hè",
        description: "Áp dụng cho đơn từ 2.000.000đ, giảm tối đa 500.000đ",
        discount: "20%",
        type: "percent",
        minOrder: 2000000,
        maxDiscount: 500000,
        validUntil: "31/12/2024",
        category: "seasonal",
        isHot: true,
    },
    {
        id: 2,
        code: "NEWYEAR500",
        title: "Giảm 500K Tết 2025",
        description: "Áp dụng cho đơn từ 3.000.000đ trở lên",
        discount: "500.000đ",
        type: "fixed",
        minOrder: 3000000,
        maxDiscount: 500000,
        validUntil: "15/01/2025",
        category: "special",
        isHot: true,
    },
    {
        id: 3,
        code: "FIRSTBOOK",
        title: "Giảm 15% Khách Hàng Mới",
        description: "Dành cho khách hàng đặt phòng lần đầu",
        discount: "15%",
        type: "percent",
        minOrder: 1000000,
        maxDiscount: 300000,
        validUntil: "31/12/2024",
        category: "new_user",
        isHot: false,
    },
    {
        id: 4,
        code: "WEEKEND200",
        title: "Giảm 200K Cuối Tuần",
        description: "Áp dụng cho các đơn đặt phòng cuối tuần (T7, CN)",
        discount: "200.000đ",
        type: "fixed",
        minOrder: 1500000,
        maxDiscount: 200000,
        validUntil: "30/11/2024",
        category: "weekend",
        isHot: false,
    },
    {
        id: 5,
        code: "SOCSON30",
        title: "Giảm 30% Homestay Sóc Sơn",
        description: "Áp dụng cho tất cả homestay tại khu vực Sóc Sơn",
        discount: "30%",
        type: "percent",
        minOrder: 800000,
        maxDiscount: 400000,
        validUntil: "31/12/2024",
        category: "location",
        isHot: true,
    },
    {
        id: 6,
        code: "LONGSTAY",
        title: "Giảm 25% Nghỉ Dài Ngày",
        description: "Áp dụng cho đơn từ 3 đêm trở lên",
        discount: "25%",
        type: "percent",
        minOrder: 2500000,
        maxDiscount: 600000,
        validUntil: "31/12/2024",
        category: "long_stay",
        isHot: false,
    },
];

// Flash Sale
const flashSales = [
    {
        id: 1,
        title: "Flash Sale 12h - Giảm 40%",
        homestay: "Villa View Hồ Đầm Vạc",
        originalPrice: 3000000,
        salePrice: 1800000,
        image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80",
        timeLeft: "Còn 2 giờ 30 phút",
        location: "Đức Hoà, Sóc Sơn",
    },
    {
        id: 2,
        title: "Flash Sale Cuối Tuần - Giảm 35%",
        homestay: "Biệt Thự Tiến Thắng Resort",
        originalPrice: 2800000,
        salePrice: 1820000,
        image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80",
        timeLeft: "Còn 5 giờ 15 phút",
        location: "Tiến Thắng, Sóc Sơn",
    },
];

const PromotionsPage: React.FC = () => {
    const [copiedCode, setCopiedCode] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState("");

    // Copy mã giảm giá
    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        message.success(`Đã sao chép mã: ${code}`);

        setTimeout(() => {
            setCopiedCode("");
        }, 2000);
    };

    // Hiển thị chi tiết mã
    const showPromoDetails = (promo: typeof promotions[0]) => {
        Modal.info({
            title: promo.title,
            width: 500,
            content: (
                <div style={{ marginTop: 20 }}>
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        <div>
                            <Text strong>Mã giảm giá:</Text>
                            <div style={{
                                background: '#f0f0f0',
                                padding: '12px',
                                borderRadius: 6,
                                marginTop: 8,
                                fontSize: 18,
                                fontWeight: 'bold',
                                textAlign: 'center',
                                border: '2px dashed #1890ff',
                            }}>
                                {promo.code}
                            </div>
                        </div>

                        <div>
                            <Text strong>Mô tả:</Text>
                            <Paragraph style={{ marginTop: 4, marginBottom: 0 }}>
                                {promo.description}
                            </Paragraph>
                        </div>

                        <div>
                            <Text strong>Điều kiện:</Text>
                            <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                                <li>Đơn hàng tối thiểu: {promo.minOrder.toLocaleString('vi-VN')}đ</li>
                                <li>Giảm tối đa: {promo.maxDiscount.toLocaleString('vi-VN')}đ</li>
                                <li>Hạn sử dụng: {promo.validUntil}</li>
                            </ul>
                        </div>
                    </Space>
                </div>
            ),
            okText: 'Đóng',
        });
    };

    // Lọc mã giảm giá
    const filteredPromotions = promotions.filter(promo =>
        promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promo.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            <AppHeader isLoggedIn={false}/>

            <Content style={{ marginTop: 64 }}>
                {/* Banner */}
                <div
                    style={{
                        backdropFilter: 'blur(8px)',
                        background: 'linear-gradient(135deg, rgba(13,146,244,0.85) 0%, rgba(7,112,228,0.85) 100%)',
                        padding: '40px 24px',
                        textAlign: 'center'
                    }}
                >
                    <GiftOutlined style={{ fontSize: 48, color: '#fff', marginBottom: 16 }} />

                    <Title level={1} style={{ color: '#fff', marginBottom: 8 }}>
                        Ưu Đãi & Mã Giảm Giá
                    </Title>

                    <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, marginBottom: 0 }}>
                        Tiết kiệm chi phí với các mã giảm giá hấp dẫn
                    </Paragraph>
                </div>

                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
                    {/* Breadcrumb */}
                    <Breadcrumb style={{ marginBottom: 24 }}>
                        <Breadcrumb.Item>
                            <Link to="/">
                                <HomeOutlined /> Trang chủ
                            </Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>Ưu đãi</Breadcrumb.Item>
                    </Breadcrumb>

                    {/* Flash Sale */}
                    <Card
                        title={
                            <Space>
                                <ClockCircleOutlined style={{ color: '#ff4d4f' }} />
                                <Text strong style={{ fontSize: 18 }}>Flash Sale Hôm Nay</Text>
                            </Space>
                        }
                        style={{ marginBottom: 24 }}
                    >
                        <Row gutter={[16, 16]}>
                            {flashSales.map((sale) => (
                                <Col key={sale.id} xs={24} md={12}>
                                    <Card
                                        hoverable
                                        bodyStyle={{ padding: 16 }}
                                    >
                                        <Row gutter={16}>
                                            <Col span={10}>
                                                <img
                                                    src={sale.image}
                                                    alt={sale.homestay}
                                                    style={{
                                                        width: '100%',
                                                        height: 120,
                                                        objectFit: 'cover',
                                                        borderRadius: 6,
                                                    }}
                                                />
                                            </Col>
                                            <Col span={14}>
                                                <Tag color="red" style={{ marginBottom: 8 }}>
                                                    {sale.title}
                                                </Tag>
                                                <Title level={5} ellipsis style={{ marginBottom: 8 }}>
                                                    {sale.homestay}
                                                </Title>
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    {sale.location}
                                                </Text>
                                                <div style={{ marginTop: 8 }}>
                                                    <Text delete type="secondary" style={{ fontSize: 13 }}>
                                                        {sale.originalPrice.toLocaleString('vi-VN')}đ
                                                    </Text>
                                                    <br />
                                                    <Text strong style={{ fontSize: 18, color: '#ff4d4f' }}>
                                                        {sale.salePrice.toLocaleString('vi-VN')}đ
                                                    </Text>
                                                </div>
                                                <Text type="danger" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                                                    ⏰ {sale.timeLeft}
                                                </Text>
                                            </Col>
                                        </Row>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Card>

                    {/* Tìm kiếm mã */}
                    <Card style={{ marginBottom: 24 }}>
                        <Search
                            placeholder="Tìm kiếm mã giảm giá..."
                            size="large"
                            allowClear
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ maxWidth: 500 }}
                        />
                    </Card>

                    {/* Danh sách mã giảm giá */}
                    <Row gutter={[16, 16]}>
                        {filteredPromotions.map((promo) => (
                            <Col key={promo.id} xs={24} md={12} lg={8}>
                                <Card
                                    hoverable
                                    style={{
                                        height: '100%',
                                        borderRadius: 8,
                                        border: promo.isHot ? '2px solid #ff4d4f' : '1px solid #f0f0f0',
                                    }}
                                    bodyStyle={{ padding: 20 }}
                                >
                                    {/* Badge Hot */}
                                    {promo.isHot && (
                                        <Tag
                                            color="red"
                                            style={{
                                                position: 'absolute',
                                                top: 12,
                                                right: 12,
                                                fontSize: 12,
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            HOT
                                        </Tag>
                                    )}

                                    {/* Icon */}
                                    <div style={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: '50%',
                                        background: promo.isHot ? '#fff1f0' : '#e6f7ff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 16,
                                    }}>
                                        <PercentageOutlined
                                            style={{
                                                fontSize: 28,
                                                color: promo.isHot ? '#ff4d4f' : '#1890ff',
                                            }}
                                        />
                                    </div>

                                    {/* Tiêu đề */}
                                    <Title level={5} style={{ marginBottom: 8 }}>
                                        {promo.title}
                                    </Title>

                                    {/* Mã code */}
                                    <div style={{
                                        background: '#f5f5f5',
                                        padding: '10px 12px',
                                        borderRadius: 6,
                                        marginBottom: 12,
                                        border: '1px dashed #d9d9d9',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}>
                                        <Text strong style={{ fontSize: 16 }}>
                                            {promo.code}
                                        </Text>
                                        <Button
                                            type="link"
                                            size="small"
                                            icon={copiedCode === promo.code ? <CheckCircleOutlined /> : <CopyOutlined />}
                                            onClick={() => handleCopyCode(promo.code)}
                                            style={{ padding: 0 }}
                                        >
                                            {copiedCode === promo.code ? 'Đã copy' : 'Copy'}
                                        </Button>
                                    </div>

                                    {/* Giảm giá */}
                                    <div style={{
                                        background: promo.isHot ? '#fff1f0' : '#e6f7ff',
                                        padding: '8px 12px',
                                        borderRadius: 6,
                                        marginBottom: 12,
                                        textAlign: 'center',
                                    }}>
                                        <Text
                                            strong
                                            style={{
                                                fontSize: 20,
                                                color: promo.isHot ? '#ff4d4f' : '#1890ff',
                                            }}
                                        >
                                            Giảm {promo.discount}
                                        </Text>
                                    </div>

                                    {/* Mô tả */}
                                    <Paragraph
                                        type="secondary"
                                        style={{ fontSize: 13, marginBottom: 12 }}
                                        ellipsis={{ rows: 2 }}
                                    >
                                        {promo.description}
                                    </Paragraph>

                                    {/* Hạn sử dụng */}
                                    <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 12 }}>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            <ClockCircleOutlined /> HSD: {promo.validUntil}
                                        </Text>
                                    </Space>

                                    {/* Buttons */}
                                    <Space style={{ width: '100%' }} size="small">
                                        <Button
                                            type="primary"
                                            block
                                            onClick={() => handleCopyCode(promo.code)}
                                        >
                                            Sao chép mã
                                        </Button>
                                        <Button
                                            block
                                            onClick={() => showPromoDetails(promo)}
                                        >
                                            Chi tiết
                                        </Button>
                                    </Space>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {/* Không tìm thấy */}
                    {filteredPromotions.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 24px',
                            background: '#fff',
                            borderRadius: 8,
                        }}>
                            <TagOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                            <Title level={4}>Không tìm thấy mã giảm giá</Title>
                            <Text type="secondary">
                                Vui lòng thử từ khóa khác
                            </Text>
                        </div>
                    )}

                    {/* Hướng dẫn sử dụng */}
                    <Card
                        title="📖 Hướng dẫn sử dụng mã giảm giá"
                        style={{ marginTop: 24 }}
                    >
                        <Row gutter={[16, 16]}>
                            <Col xs={24} md={8}>
                                <div style={{ textAlign: 'center', padding: 20 }}>
                                    <div style={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: '50%',
                                        background: '#e6f7ff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 12px',
                                    }}>
                                        <Text strong style={{ fontSize: 24, color: '#1890ff' }}>1</Text>
                                    </div>
                                    <Title level={5}>Chọn mã ưu đãi</Title>
                                    <Text type="secondary">
                                        Chọn mã giảm giá phù hợp và nhấn "Sao chép mã"
                                    </Text>
                                </div>
                            </Col>
                            <Col xs={24} md={8}>
                                <div style={{ textAlign: 'center', padding: 20 }}>
                                    <div style={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: '50%',
                                        background: '#e6f7ff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 12px',
                                    }}>
                                        <Text strong style={{ fontSize: 24, color: '#1890ff' }}>2</Text>
                                    </div>
                                    <Title level={5}>Đặt phòng</Title>
                                    <Text type="secondary">
                                        Chọn homestay và tiến hành đặt phòng như bình thường
                                    </Text>
                                </div>
                            </Col>
                            <Col xs={24} md={8}>
                                <div style={{ textAlign: 'center', padding: 20 }}>
                                    <div style={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: '50%',
                                        background: '#e6f7ff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 12px',
                                    }}>
                                        <Text strong style={{ fontSize: 24, color: '#1890ff' }}>3</Text>
                                    </div>
                                    <Title level={5}>Nhập mã</Title>
                                    <Text type="secondary">
                                        Dán mã vào ô "Mã giảm giá" khi thanh toán
                                    </Text>
                                </div>
                            </Col>
                        </Row>
                    </Card>
                </div>
            </Content>

            <AppFooter />
        </Layout>
    );
};

export default PromotionsPage;