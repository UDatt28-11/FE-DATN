import React, { useState, useMemo } from "react";
import {
    Layout,
    Row,
    Col,
    Typography,
    Card,
    Rate,
    Pagination,
    Breadcrumb,
    Checkbox,
    Slider,
    Input,
    Divider,
    Space,
} from "antd";
import {
    HomeOutlined,
    SearchOutlined,
    DollarCircleOutlined,
    AppstoreOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom"; // Đảm bảo đã import Link
import type { CheckboxValueType } from "antd/es/checkbox/Group";
import type { SliderSingleProps } from "antd/es/slider";

// Import các layout chung
// (Đảm bảo đường dẫn này đúng với cấu trúc thư mục của bạn)
import AppHeader from "../../../components/Layout/AppHeader";
import AppFooter from "../../../components/Layout/AppFooter";

const { Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;

// --- Dữ liệu giả lập (Mock Data) ---

// Danh mục để lọc
const categories = [
    { label: "Biệt thự (Villa)", value: "villa" },
    { label: "Căn hộ (Apartment)", value: "apartment" },
    { label: "Bungalow", value: "bungalow" },
    { label: "View biển", value: "sea_view" },
    { label: "View núi", value: "mountain_view" },
    { label: "Có hồ bơi", value: "pool" },
];

// Danh sách tất cả homestay
const allHomestays = [
    {
        id: 1,
        name: "Biệt thự Biển An Viên",
        price: 3500000,
        rating: 4.8,
        category: "villa",
        image: "https://images.unsplash.com/photo-1613977257363-27618c7c3886?w=600&q=80",
    },
    {
        id: 2,
        name: "Căn hộ The Sóng Vũng Tàu",
        price: 1200000,
        rating: 4.5,
        category: "apartment",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
    },
    {
        id: 3,
        name: "Bungalow Làng Cù Lần",
        price: 800000,
        rating: 4.2,
        category: "bungalow",
        image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=600&q=80",
    },
    {
        id: 4,
        name: "Homestay Topas Ecolodge Sapa",
        price: 4500000,
        rating: 4.9,
        category: "mountain_view",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
    },
    {
        id: 5,
        name: "Villa View Biển Phú Quốc",
        price: 5000000,
        rating: 5.0,
        category: "sea_view",
        image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80",
    },
    {
        id: 6,
        name: "Căn hộ view núi Đà Lạt",
        price: 900000,
        rating: 4.3,
        category: "mountain_view",
        image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80",
    },
    {
        id: 7,
        name: "Biệt thự Hồ Bơi Đà Nẵng",
        price: 4000000,
        rating: 4.7,
        category: "pool",
        image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80",
    },
    {
        id: 8,
        name: "Căn hộ studio Sài Gòn",
        price: 750000,
        rating: 4.0,
        category: "apartment",
        image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80",
    },
];
// ------------------------------

const PAGE_SIZE = 8; // Số lượng homestay mỗi trang

const HomestayListPage: React.FC = () => {
    // --- State cho bộ lọc ---
    const [selectedCategories, setSelectedCategories] = useState<CheckboxValueType[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
    const [currentPage, setCurrentPage] = useState(1);

    // --- Định dạng tiền tệ ---
    const formatter: SliderSingleProps["formatter"] = (value) => {
        return `${Number(value).toLocaleString("vi-VN")}đ`;
    };

    // --- Logic lọc ---
    const filteredHomestays = useMemo(() => {
        let items = allHomestays;

        // Lọc theo tìm kiếm (Tên)
        if (searchTerm) {
            items = items.filter((item) =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Lọc theo danh mục
        if (selectedCategories.length > 0) {
            items = items.filter((item) =>
                selectedCategories.includes(item.category)
            );
        }

        // Lọc theo giá
        items = items.filter(
            (item) => item.price >= priceRange[0] && item.price <= priceRange[1]
        );

        return items;
    }, [selectedCategories, searchTerm, priceRange]);

    // --- Logic phân trang ---
    const paginatedHomestays = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        return filteredHomestays.slice(startIndex, startIndex + PAGE_SIZE);
    }, [filteredHomestays, currentPage]);

    return (
        <Layout style={{ background: "#fff" }}>
            {/* Sử dụng AppHeader.
         Vì AppHeader đã được kết nối với AuthContext, 
         nó sẽ tự động hiển thị đúng (Đăng nhập/Avatar) 
      */}
            <AppHeader />

            <Layout style={{ background: "#fff", marginTop: 70 }}>
                {/* --- Thanh Bên (Sider) cho Bộ Lọc --- */}
                <Sider
                    width={300}
                    theme="light"
                    style={{
                        padding: "24px",
                        borderRight: "1px solid #f0f0f0",
                        position: "fixed",
                        left: 0,
                        top: 70, // Dưới Header
                        bottom: 0,
                        overflow: "auto",
                    }}
                >
                    <Title level={4}>Bộ lọc</Title>

                    {/* Lọc theo tên */}
                    <Paragraph strong>Tìm kiếm</Paragraph>
                    <Input
                        placeholder="Tên homestay..."
                        prefix={<SearchOutlined />}
                        allowClear
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1); // Reset trang khi tìm kiếm
                        }}
                        style={{ marginBottom: 24 }}
                    />

                    {/* Lọc theo danh mục */}
                    <Divider />
                    <Paragraph strong>
                        <AppstoreOutlined style={{ marginRight: 8 }} />
                        Loại hình
                    </Paragraph>
                    <Checkbox.Group
                        style={{ display: "flex", flexDirection: "column" }}
                        options={categories}
                        value={selectedCategories}
                        onChange={(values) => {
                            setSelectedCategories(values);
                            setCurrentPage(1); // Reset trang khi lọc
                        }}
                    />

                    {/* Lọc theo giá */}
                    <Divider />
                    <Paragraph strong>
                        <DollarCircleOutlined style={{ marginRight: 8 }} />
                        Khoảng giá (/đêm)
                    </Paragraph>
                    <Slider
                        range
                        min={0}
                        max={5000000}
                        step={100000}
                        defaultValue={priceRange}
                        tipFormatter={formatter}
                        onChange={(value) => {
                            setPriceRange(value);
                            setCurrentPage(1); // Reset trang khi lọc
                        }}
                        style={{ marginTop: 10, marginBottom: 10, marginLeft: 10, marginRight: 10 }}
                    />
                    <Row justify="space-between">
                        <Col><Text type="secondary">{formatter(priceRange[0])}</Text></Col>
                        <Col><Text type="secondary">{formatter(priceRange[1])}</Text></Col>
                    </Row>

                </Sider>

                {/* --- Khu vực Nội dung chính (Content) --- */}
                <Layout style={{ padding: "0 24px 24px", marginLeft: 300, background: "#fff" }}>
                    <Content>
                        {/* Breadcrumb (Điều hướng) */}
                        <Breadcrumb style={{ margin: "24px 0" }}>
                            <Breadcrumb.Item>
                                <Link to="/">
                                    <HomeOutlined /> Trang chủ
                                </Link>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>Danh sách Homestay</Breadcrumb.Item>
                        </Breadcrumb>

                        <Title level={2}>
                            Tìm thấy {filteredHomestays.length} homestay
                        </Title>
                        <Paragraph type="secondary">
                            Hiển thị kết quả cho tìm kiếm của bạn.
                        </Paragraph>

                        {/* Danh sách Homestay */}
                        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                            {paginatedHomestays.map((item) => (
                                <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
                                    <Card
                                        hoverable
                                        bordered={false}
                                        style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                        cover={
                                            <img
                                                alt={item.name}
                                                src={item.image}
                                                style={{ height: 200, objectFit: "cover" }}
                                            />
                                        }
                                    >
                                        <Meta
                                            // SỬA ĐỔI: Bọc Title trong <Link>
                                            title={
                                                <Link to={`/homestay/${item.id}`} style={{ color: 'inherit' }}>
                                                    <Title level={5} ellipsis style={{ marginBottom: 0 }}>
                                                        {item.name}
                                                    </Title>
                                                </Link>
                                            }
                                            description={
                                                <Space direction="vertical" style={{ width: '100%' }}>
                                                    <Text strong style={{ fontSize: 16, color: "#1677ff" }}>
                                                        {item.price.toLocaleString("vi-VN")}đ / đêm
                                                    </Text>
                                                    <Rate allowHalf disabled defaultValue={item.rating} style={{ fontSize: 14 }} />
                                                </Space>
                                            }
                                        />
                                    </Card>
                                </Col>
                            ))}

                            {/* Nếu không tìm thấy kết quả */}
                            {filteredHomestays.length === 0 && (
                                <Col span={24} style={{ textAlign: 'center', marginTop: 48 }}>
                                    <Paragraph>Không tìm thấy homestay nào phù hợp với bộ lọc của bạn.</Paragraph>
                                </Col>
                            )}
                        </Row>

                        {/* Phân trang */}
                        {filteredHomestays.length > PAGE_SIZE && (
                            <Row justify="center" style={{ marginTop: 32 }}>
                                <Pagination
                                    current={currentPage}
                                    total={filteredHomestays.length}
                                    pageSize={PAGE_SIZE}
                                    onChange={(page) => setCurrentPage(page)}
                                    showSizeChanger={false}
                                />
                            </Row>
                        )}
                    </Content>
                </Layout>
            </Layout>

            <AppFooter />
        </Layout>
    );
};

export default HomestayListPage;

