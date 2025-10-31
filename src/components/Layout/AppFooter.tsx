import { Layout, Row, Col, Typography, Divider } from "antd";
import React from "react";

const { Footer } = Layout;
const { Title, Paragraph } = Typography;

// Sử dụng React.FC cho TypeScript
const AppFooter: React.FC = () => {
    return (
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
    );
};

export default AppFooter;
