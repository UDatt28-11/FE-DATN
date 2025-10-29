import {
    Layout,
    Menu,
    Row,
    Col,
    Typography,
    Button,
    Card,
    Form,
    DatePicker,
    Select,
    Space,
    Rate,
    Divider,
} from "antd";
import {
    SearchOutlined,
    UserOutlined,
    CheckCircleOutlined,
    StarFilled,
    HomeOutlined,
    SafetyOutlined,
    ThunderboltOutlined,
} from "@ant-design/icons";

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export default function HomePage() {
    const onFinish = (values) => {
        console.log("Booking form values:", values);
    };

    return (
        <Layout style={{ background: "#fff" }}>
            {/* HEADER */}
            <Header
                style={{
                    position: "fixed",
                    top: 0,
                    width: "100%",
                    zIndex: 1000,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "#fff",
                    padding: "0 50px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    height: 70,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <HomeOutlined style={{ fontSize: 28, color: "#1677ff" }} />
                    <Title level={3} style={{ margin: 0, color: "#1677ff", fontWeight: 700 }}>
                        HomestayBooking
                    </Title>
                </div>

                <Menu
                    mode="horizontal"
                    defaultSelectedKeys={["1"]}
                    items={[
                        { key: "1", label: "Trang chủ" },
                        { key: "2", label: "Giới thiệu" },
                        { key: "3", label: "Homestay" },
                        { key: "4", label: "Tin tức" },
                        { key: "5", label: "Liên hệ" },
                    ]}
                    style={{
                        borderBottom: "none",
                        flex: 1,
                        justifyContent: "center",
                        fontSize: 15,
                        fontWeight: 500,
                    }}
                />

                <Space size="middle">
                    <Button type="text" icon={<UserOutlined />} size="large">
                        Đăng nhập
                    </Button>
                    <Button type="primary" size="large" style={{ fontWeight: 500 }}>
                        Đăng ký
                    </Button>
                </Space>
            </Header>

            {/* HERO BANNER */}
            <div
                style={{
                    position: "relative",
                    backgroundImage:
                        "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1506744038136-46273834b3fb')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    padding: "200px 50px 180px",
                    textAlign: "center",
                    color: "#fff",
                    marginTop: 70,
                }}
            >
                <Title
                    level={1}
                    style={{
                        color: "#fff",
                        fontSize: "52px",
                        fontWeight: 700,
                        marginBottom: 20,
                        textShadow: "0 2px 20px rgba(0,0,0,0.3)",
                    }}
                >
                    Trải nghiệm kỳ nghỉ đáng nhớ
                </Title>
                <Paragraph
                    style={{
                        color: "#fff",
                        fontSize: "20px",
                        marginBottom: 30,
                        textShadow: "0 1px 10px rgba(0,0,0,0.3)",
                    }}
                >
                    Nơi kết nối những ngôi nhà xinh đẹp với du khách yêu thích khám phá
                </Paragraph>
                <Button
                    type="primary"
                    size="large"
                    style={{
                        height: 50,
                        fontSize: 16,
                        fontWeight: 600,
                        paddingLeft: 40,
                        paddingRight: 40,
                        borderRadius: 8,
                    }}
                >
                    Khám phá ngay
                </Button>
            </div>

            {/* BOOKING FORM */}
            <Content style={{ marginTop: "-80px", padding: "0 50px", position: "relative", zIndex: 10 }}>
                <Card
                    style={{
                        maxWidth: 1100,
                        margin: "0 auto",
                        borderRadius: 12,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                        border: "none",
                    }}
                >
                    <Form layout="inline" onFinish={onFinish} style={{ justifyContent: "space-around", flexWrap: "wrap", gap: 16 }}>
                        <Form.Item name="dateRange" rules={[{ required: true, message: "Chọn ngày" }]}>
                            <RangePicker
                                placeholder={["Nhận phòng", "Trả phòng"]}
                                size="large"
                                style={{ width: 280 }}
                            />
                        </Form.Item>
                        <Form.Item name="adults" rules={[{ required: true, message: "Chọn số người" }]}>
                            <Select placeholder="Người lớn" size="large" style={{ width: 140 }}>
                                {[1, 2, 3, 4, 5, 6].map((num) => (
                                    <Option key={num} value={num}>
                                        {num} người lớn
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item name="children">
                            <Select placeholder="Trẻ em" size="large" style={{ width: 140 }}>
                                {[0, 1, 2, 3, 4, 5].map((num) => (
                                    <Option key={num} value={num}>
                                        {num} trẻ em
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<SearchOutlined />}
                                size="large"
                                style={{ fontWeight: 600, height: 48, paddingLeft: 30, paddingRight: 30 }}
                            >
                                Tìm homestay
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </Content>

            {/* ƯU ĐIỂM */}
            <Content style={{ padding: "100px 50px", background: "#fafafa" }}>
                <Title level={2} style={{ textAlign: "center", marginBottom: 20, fontSize: 38, fontWeight: 700 }}>
                    Vì sao chọn HomestayBooking?
                </Title>
                <Paragraph style={{ textAlign: "center", fontSize: 16, color: "#666", marginBottom: 60 }}>
                    Chúng tôi mang đến trải nghiệm đặt phòng tốt nhất cho bạn
                </Paragraph>
                <Row gutter={[48, 48]} justify="center" style={{ maxWidth: 1200, margin: "0 auto" }}>
                    {[
                        {
                            title: "Hàng ngàn homestay độc đáo",
                            desc: "Khám phá hơn 5.000 homestay tại 63 tỉnh thành với nhiều phong cách khác nhau.",
                            icon: <CheckCircleOutlined style={{ fontSize: 50, color: "#1677ff" }} />,
                        },
                        {
                            title: "Giá cả hợp lý",
                            desc: "So sánh giá và chọn nơi ở tốt nhất với mức giá minh bạch, không phụ phí ẩn.",
                            icon: <SafetyOutlined style={{ fontSize: 50, color: "#52c41a" }} />,
                        },
                        {
                            title: "Đặt phòng nhanh chóng",
                            desc: "Chỉ vài cú nhấp chuột là bạn đã có thể đặt phòng an toàn và tiện lợi.",
                            icon: <ThunderboltOutlined style={{ fontSize: 50, color: "#faad14" }} />,
                        },
                    ].map((item, index) => (
                        <Col key={index} xs={24} sm={12} md={8}>
                            <Card
                                bordered={false}
                                style={{
                                    textAlign: "center",
                                    height: "100%",
                                    borderRadius: 12,
                                    transition: "all 0.3s",
                                    cursor: "pointer",
                                }}
                                hoverable
                                bodyStyle={{ padding: 40 }}
                            >
                                <div style={{ marginBottom: 20 }}>{item.icon}</div>
                                <Title level={4} style={{ marginBottom: 16, fontWeight: 600 }}>
                                    {item.title}
                                </Title>
                                <Paragraph style={{ color: "#666", fontSize: 15, lineHeight: 1.8 }}>
                                    {item.desc}
                                </Paragraph>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Content>

            {/* HOMESTAY NỔI BẬT */}
            <Content style={{ padding: "100px 50px", background: "#fff" }}>
                <Title level={2} style={{ textAlign: "center", marginBottom: 20, fontSize: 38, fontWeight: 700 }}>
                    Homestay nổi bật
                </Title>
                <Paragraph style={{ textAlign: "center", fontSize: 16, color: "#666", marginBottom: 60 }}>
                    Những lựa chọn được yêu thích nhất
                </Paragraph>
                <Row gutter={[24, 24]} justify="center" style={{ maxWidth: 1200, margin: "0 auto" }}>
                    {[
                        {
                            name: "Mây Homestay Đà Lạt",
                            img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
                            price: "900.000đ",
                            rating: 4.8,
                        },
                        {
                            name: "The Chill House Sapa",
                            img: "https://images.unsplash.com/photo-1554995207-c18c203602cb",
                            price: "1.200.000đ",
                            rating: 4.9,
                        },
                        {
                            name: "Santorini Villa Phú Quốc",
                            img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
                            price: "2.000.000đ",
                            rating: 5.0,
                        },
                        {
                            name: "Làng Gió Biển Nha Trang",
                            img: "https://images.unsplash.com/photo-1600585154154-66c2c6b8b46c",
                            price: "1.400.000đ",
                            rating: 4.7,
                        },
                    ].map((item, index) => (
                        <Col key={index} xs={24} sm={12} md={6}>
                            <Card
                                hoverable
                                bordered={false}
                                cover={
                                    <div style={{ overflow: "hidden", borderRadius: "12px 12px 0 0" }}>
                                        <img
                                            alt={item.name}
                                            src={item.img}
                                            style={{
                                                height: 220,
                                                width: "100%",
                                                objectFit: "cover",
                                                transition: "transform 0.3s",
                                            }}
                                            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                                            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                                        />
                                    </div>
                                }
                                style={{ borderRadius: 12, overflow: "hidden" }}
                            >
                                <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                                    <StarFilled style={{ color: "#faad14", marginRight: 5 }} />
                                    <Text strong>{item.rating}</Text>
                                </div>
                                <Title level={5} style={{ marginBottom: 8, fontWeight: 600 }}>
                                    {item.name}
                                </Title>
                                <Text strong style={{ fontSize: 16, color: "#1677ff" }}>
                                    {item.price}/đêm
                                </Text>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Content>

            {/* ĐÁNH GIÁ KHÁCH HÀNG */}
            <Content style={{ padding: "100px 50px", background: "#fafafa" }}>
                <Title level={2} style={{ textAlign: "center", marginBottom: 20, fontSize: 38, fontWeight: 700 }}>
                    Khách hàng nói gì về chúng tôi
                </Title>
                <Paragraph style={{ textAlign: "center", fontSize: 16, color: "#666", marginBottom: 60 }}>
                    Hơn 10.000 đánh giá 5 sao từ khách hàng
                </Paragraph>
                <Row gutter={[24, 24]} justify="center" style={{ maxWidth: 1200, margin: "0 auto" }}>
                    {[
                        {
                            name: "Minh Anh",
                            review:
                                "Homestay sạch sẽ, view siêu đẹp, nhân viên hỗ trợ rất nhiệt tình. Rất đáng tiền!",
                            rating: 5,
                            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Minh",
                        },
                        {
                            name: "Tuấn Kiệt",
                            review:
                                "Trải nghiệm tuyệt vời! Dễ dàng tìm được homestay hợp gu, đặt phòng nhanh chóng.",
                            rating: 5,
                            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tuan",
                        },
                        {
                            name: "Lan Hương",
                            review:
                                "Mình rất thích giao diện website, dễ dùng và nhiều lựa chọn. Sẽ quay lại!",
                            rating: 5,
                            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lan",
                        },
                    ].map((item, index) => (
                        <Col key={index} xs={24} sm={12} md={8}>
                            <Card
                                bordered={false}
                                style={{
                                    height: "100%",
                                    borderRadius: 12,
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                }}
                                bodyStyle={{ padding: 30 }}
                            >
                                <Rate disabled defaultValue={item.rating} style={{ fontSize: 18, marginBottom: 16 }} />
                                <Paragraph style={{ fontStyle: "italic", fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
                                    "{item.review}"
                                </Paragraph>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <img
                                        src={item.avatar}
                                        alt={item.name}
                                        style={{ width: 40, height: 40, borderRadius: "50%" }}
                                    />
                                    <Text strong style={{ fontSize: 15 }}>{item.name}</Text>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Content>

            {/* BLOG / TIN TỨC */}
            <Content style={{ padding: "100px 50px", background: "#fff" }}>
                <Title level={2} style={{ textAlign: "center", marginBottom: 20, fontSize: 38, fontWeight: 700 }}>
                    Góc du lịch & cảm hứng
                </Title>
                <Paragraph style={{ textAlign: "center", fontSize: 16, color: "#666", marginBottom: 60 }}>
                    Khám phá những điểm đến tuyệt vời
                </Paragraph>
                <Row gutter={[24, 24]} justify="center" style={{ maxWidth: 1200, margin: "0 auto" }}>
                    {[
                        {
                            title: "Top 5 homestay có view đẹp nhất Đà Lạt",
                            img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
                            date: "25 Thg 10, 2025",
                        },
                        {
                            title: "Bí kíp săn homestay giá rẻ mùa du lịch",
                            img: "https://images.unsplash.com/photo-1499696010181-88c7b58e3e4a",
                            date: "20 Thg 10, 2025",
                        },
                        {
                            title: "10 địa điểm sống ảo không thể bỏ lỡ ở Sapa",
                            img: "https://images.unsplash.com/photo-1518684079-3c830dcef090",
                            date: "15 Thg 10, 2025",
                        },
                    ].map((item, index) => (
                        <Col key={index} xs={24} sm={12} md={8}>
                            <Card
                                hoverable
                                bordered={false}
                                cover={
                                    <div style={{ overflow: "hidden", borderRadius: "12px 12px 0 0" }}>
                                        <img
                                            src={item.img}
                                            alt={item.title}
                                            style={{
                                                height: 220,
                                                width: "100%",
                                                objectFit: "cover",
                                                transition: "transform 0.3s",
                                            }}
                                            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                                            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                                        />
                                    </div>
                                }
                                style={{ borderRadius: 12, overflow: "hidden" }}
                            >
                                <Text type="secondary" style={{ fontSize: 13 }}>{item.date}</Text>
                                <Title level={5} style={{ marginTop: 8, marginBottom: 12, fontWeight: 600 }}>
                                    {item.title}
                                </Title>
                                <Button type="link" style={{ padding: 0, height: "auto", fontWeight: 500 }}>
                                    Đọc thêm →
                                </Button>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Content>

            {/* FOOTER */}
            <Footer
                style={{
                    textAlign: "center",
                    color: "#666",
                    background: "#001529",
                    padding: "50px 50px 30px",
                    marginTop: 0,
                }}
            >
                <Row gutter={[32, 32]} justify="center" style={{ maxWidth: 1200, margin: "0 auto 40px" }}>
                    <Col xs={24} sm={12} md={6}>
                        <Title level={5} style={{ color: "#fff", marginBottom: 20 }}>Về chúng tôi</Title>
                        <div style={{ color: "#999", lineHeight: 2 }}>
                            <div>Giới thiệu</div>
                            <div>Tuyển dụng</div>
                            <div>Liên hệ</div>
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Title level={5} style={{ color: "#fff", marginBottom: 20 }}>Hỗ trợ</Title>
                        <div style={{ color: "#999", lineHeight: 2 }}>
                            <div>Trung tâm trợ giúp</div>
                            <div>Chính sách</div>
                            <div>Điều khoản</div>
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Title level={5} style={{ color: "#fff", marginBottom: 20 }}>Khám phá</Title>
                        <div style={{ color: "#999", lineHeight: 2 }}>
                            <div>Đà Lạt</div>
                            <div>Sa Pa</div>
                            <div>Phú Quốc</div>
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Title level={5} style={{ color: "#fff", marginBottom: 20 }}>Kết nối</Title>
                        <div style={{ color: "#999", lineHeight: 2 }}>
                            <div>Facebook</div>
                            <div>Instagram</div>
                            <div>Zalo</div>
                        </div>
                    </Col>
                </Row>
                <Divider style={{ borderColor: "#333" }} />
                <Paragraph style={{ color: "#999", margin: 0 }}>
                    © {new Date().getFullYear()} HomestayBooking. All rights reserved.
                </Paragraph>
            </Footer>
        </Layout>
    );
}