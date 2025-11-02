import { Layout, Typography, Row, Col, Card, Statistic, Avatar, Divider } from "antd";
import { SmileOutlined, TeamOutlined, HomeOutlined, TrophyOutlined } from "@ant-design/icons";

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

export default function AboutPage() {
    return (
        <Layout>
            {/* BANNER */}
            <div
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    padding: "140px 0",
                    textAlign: "center",
                    color: "#fff",
                }}
            >
                <Title style={{ color: "#fff", fontSize: "48px", fontWeight: "bold" }}>
                    Giới thiệu về HomestayBooking
                </Title>
                <Paragraph style={{ color: "#eee", fontSize: "18px" }}>
                    Nền tảng kết nối hàng ngàn homestay đẹp trên khắp Việt Nam 🇻🇳
                </Paragraph>
            </div>

            {/* GIỚI THIỆU */}
            <Content style={{ padding: "80px 100px" }}>
                <Row gutter={[48, 48]} align="middle">
                    <Col xs={24} md={12}>
                        <img
                            src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"
                            alt="Giới thiệu"
                            style={{ width: "100%", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                        />
                    </Col>
                    <Col xs={24} md={12}>
                        <Title level={2}>Chúng tôi là ai?</Title>
                        <Paragraph style={{ fontSize: 16, color: "#555" }}>
                            HomestayBooking ra đời với sứ mệnh giúp du khách dễ dàng tìm kiếm, so sánh
                            và đặt homestay yêu thích trên khắp Việt Nam.
                            Chúng tôi tin rằng mỗi chuyến đi là một hành trình cảm xúc,
                            và nơi bạn ở chính là phần không thể thiếu trong trải nghiệm đó.
                        </Paragraph>
                        <Paragraph style={{ fontSize: 16, color: "#555" }}>
                            Với hàng ngàn lựa chọn homestay, biệt thự và căn hộ nghỉ dưỡng,
                            HomestayBooking mang đến sự tiện lợi, nhanh chóng và minh bạch —
                            giúp bạn có kỳ nghỉ hoàn hảo nhất.
                        </Paragraph>
                    </Col>
                </Row>
            </Content>

            {/* TẦM NHÌN & SỨ MỆNH */}
            <Content style={{ background: "#fafafa", padding: "80px 100px" }}>
                <Row gutter={[32, 32]} justify="center">
                    <Col xs={24} md={10}>
                        <Card bordered={false} style={{ textAlign: "center", height: "100%" }}>
                            <Title level={3}>Tầm nhìn 🌏</Title>
                            <Paragraph>
                                Trở thành nền tảng đặt homestay hàng đầu Đông Nam Á,
                                mang đến trải nghiệm nghỉ dưỡng đáng nhớ cho mọi du khách.
                            </Paragraph>
                        </Card>
                    </Col>
                    <Col xs={24} md={10}>
                        <Card bordered={false} style={{ textAlign: "center", height: "100%" }}>
                            <Title level={3}>Sứ mệnh ❤️</Title>
                            <Paragraph>
                                Kết nối hàng triệu chủ nhà và khách du lịch thông qua công nghệ hiện đại,
                                giúp việc đặt homestay trở nên dễ dàng, an toàn và thú vị hơn bao giờ hết.
                            </Paragraph>
                        </Card>
                    </Col>
                </Row>
            </Content>

            {/* THÀNH TỰU */}
            <Content style={{ padding: "80px 100px" }}>
                <Title level={2} style={{ textAlign: "center", marginBottom: 60 }}>
                    Những con số biết nói
                </Title>
                <Row gutter={[24, 24]} justify="center">
                    <Col xs={12} sm={6}>
                        <Card>
                            <Statistic title="Homestay đối tác" value={5000} suffix="+" prefix={<HomeOutlined />} />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card>
                            <Statistic title="Khách hàng hài lòng" value={200000} suffix="+" prefix={<SmileOutlined />} />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card>
                            <Statistic title="Đội ngũ nhân viên" value={120} prefix={<TeamOutlined />} />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card>
                            <Statistic title="Giải thưởng uy tín" value={15} prefix={<TrophyOutlined />} />
                        </Card>
                    </Col>
                </Row>
            </Content>

            {/* ĐỘI NGŨ */}
            <Content style={{ background: "#fafafa", padding: "80px 100px" }}>
                <Title level={2} style={{ textAlign: "center", marginBottom: 40 }}>
                    Đội ngũ của chúng tôi
                </Title>
                <Row gutter={[24, 24]} justify="center">
                    {[
                        {
                            name: "Nguyễn Minh Anh",
                            role: "CEO & Founder",
                            img: "https://randomuser.me/api/portraits/women/68.jpg",
                        },
                        {
                            name: "Trần Tuấn Kiệt",
                            role: "Giám đốc Kỹ thuật",
                            img: "https://randomuser.me/api/portraits/men/32.jpg",
                        },
                        {
                            name: "Lê Lan Hương",
                            role: "Trưởng phòng Marketing",
                            img: "https://randomuser.me/api/portraits/women/44.jpg",
                        },
                    ].map((member, index) => (
                        <Col key={index} xs={24} sm={12} md={8} style={{ textAlign: "center" }}>
                            <Avatar size={120} src={member.img} />
                            <Title level={4} style={{ marginTop: 16 }}>
                                {member.name}
                            </Title>
                            <Text type="secondary">{member.role}</Text>
                        </Col>
                    ))}
                </Row>
            </Content>

            {/* CAM KẾT */}
            <Content style={{ padding: "80px 100px" }}>
                <Divider />
                <Title level={2} style={{ textAlign: "center" }}>
                    Cam kết của chúng tôi
                </Title>
                <Paragraph style={{ textAlign: "center", maxWidth: 800, margin: "20px auto", color: "#555" }}>
                    Chúng tôi cam kết mang đến cho bạn trải nghiệm đặt phòng nhanh chóng, an toàn và đáng tin cậy nhất.
                    Mỗi homestay trên nền tảng đều được kiểm duyệt kỹ lưỡng để đảm bảo chất lượng,
                    giúp bạn an tâm tận hưởng kỳ nghỉ tuyệt vời.
                </Paragraph>
            </Content>

            {/* FOOTER */}
            <Footer
                style={{
                    textAlign: "center",
                    color: "#777",
                    background: "#f0f2f5",
                    padding: "40px 0",
                    marginTop: 40,
                }}
            >
                <Paragraph>
                    <strong>HomestayBooking</strong> — Cùng bạn tận hưởng từng chuyến đi ✨
                </Paragraph>
                <Text>© {new Date().getFullYear()} HomestayBooking. All rights reserved.</Text>
            </Footer>
        </Layout>
    );
}
