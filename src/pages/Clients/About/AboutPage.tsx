import { Layout, Typography, Row, Col, Card, Button, Image, Rate, Avatar, Spin } from "antd";
import { CheckCircleOutlined, UserOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import dayjs from "../../../utils/dayjs";
import reviewService from "../../../service/reviewService";

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
import AppHeader from "../../../components/Layout/AppHeader";
import AppFooter from "../../../components/Layout/AppFooter";

export default function AboutPage() {
    const banners = [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945",
        "https://images.unsplash.com/photo-1582719508461-905c673771fd",
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"
    ];

    const [index, setIndex] = useState(0);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % banners.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // Fetch reviews từ API
    useEffect(() => {
        const fetchReviews = async () => {
            setLoadingReviews(true);
            try {
                // Lấy 4 reviews đã được duyệt (approved), có user info
                const response = await reviewService.getAll({
                    status: 'approved',
                    per_page: 4,
                    page: 1,
                });
                
                // Xử lý response - format: { success: true, data: [...], meta: {...} }
                const rawList = Array.isArray(response?.data) 
                    ? response.data 
                    : (response?.data?.data || response?.items || []);
                
                // Lọc chỉ lấy reviews có comment hoặc title
                const filteredReviews = rawList
                    .filter((review: any) => review.comment || review.title)
                    .slice(0, 4)
                    .map((review: any) => ({
                        ...review,
                        // Đảm bảo có user object
                        user: review.user || {
                            full_name: review.user_id || "Khách hàng",
                            avatar_url: null,
                        },
                    }));
                
                setReviews(filteredReviews);
            } catch (error: any) {
                console.error("Error fetching reviews:", error);
                // Fallback: giữ mảng rỗng nếu lỗi
                setReviews([]);
            } finally {
                setLoadingReviews(false);
            }
        };

        fetchReviews();
    }, []);

    return (
        <Layout>
            <Helmet>
                <title>Về chúng tôi - The Palatin</title>
                <meta name="description" content="Khám phá The Palatin - Nơi kết hợp hoàn hảo giữa sự sang trọng và tiện nghi hiện đại" />
            </Helmet>

            <AppHeader />

            {/* BANNER */}
            <div
                style={{
                    marginTop: 70,
                    position: 'relative',
                    transition: 'background-image 1.5s ease-in-out',
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${banners[index]}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: '60vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Title
                    level={1}
                    style={{
                        color: '#fff',
                        fontSize: 56,
                        fontWeight: 700,
                        textShadow: '0 4px 20px rgba(0,0,0,0.6)',
                        margin: 0,
                    }}
                >
                    Về chúng tôi
                </Title>
            </div>

            {/* NỘI DUNG CHÍNH */}
            <Content style={{ background: '#fff' }}>
                {/* Giới thiệu */}
                <div style={{ padding: '80px 50px', maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 60 }}>
                        <div style={{
                            width: 60,
                            height: 4,
                            background: '#d4af37',
                            margin: '0 auto 20px'
                        }} />
                        <Title level={2} style={{ fontSize: 36, fontWeight: 700, marginBottom: 24 }}>
                            Một nơi đáng nhớ
                        </Title>
                        <Paragraph style={{
                            fontSize: 16,
                            color: '#666',
                            maxWidth: 800,
                            margin: '0 auto',
                            lineHeight: 1.8
                        }}>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin gravida lorem eu consectetur
                            imperdiet. Donec vel magna nunc. Ut ligula justo, consequat a egestas at, pretium ac urna.
                            Mauris ut risus ut leo rhoncus iaculis. Sed at erat sit amet felis varius ultrices eget vel
                            elit. Cras ultricies pharetra pulvinar.
                        </Paragraph>
                        <Button
                            size="large"
                            style={{
                                marginTop: 32,
                                background: '#d4af37',
                                borderColor: '#d4af37',
                                color: '#fff',
                                height: 48,
                                fontSize: 16,
                                paddingLeft: 40,
                                paddingRight: 40,
                                fontWeight: 600
                            }}
                        >
                            ĐỌC THÊM
                        </Button>
                    </div>

                    <Row gutter={[40, 40]}>
                        <Col xs={24} md={12}>
                            <Image
                                src="https://images.unsplash.com/photo-1571896349842-33c89424de2d"
                                alt="Beach resort"
                                style={{ width: '100%', borderRadius: 8 }}
                                preview={false}
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            <Image
                                src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461"
                                alt="Pool"
                                style={{ width: '100%', borderRadius: 8 }}
                                preview={false}
                            />
                        </Col>
                    </Row>
                </div>

                {/* Thành tựu */}
                <div style={{ background: '#2d2d2d', padding: '80px 50px', color: '#fff' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: 60 }}>
                            <div style={{
                                width: 60,
                                height: 4,
                                background: '#d4af37',
                                margin: '0 auto 20px'
                            }} />
                            <Title level={2} style={{ color: '#fff', fontSize: 36, fontWeight: 700 }}>
                                Các cột mốc của chúng tôi
                            </Title>
                        </div>

                        <Row gutter={[40, 40]} justify="center">
                            <Col xs={12} sm={12} md={6}>
                                <Card
                                    style={{
                                        background: '#1a1a1a',
                                        border: '1px solid #444',
                                        textAlign: 'center',
                                        borderRadius: 8
                                    }}
                                    styles={{ body: { padding: '40px 20px' } }}
                                >
                                    <div style={{ fontSize: 48, color: '#d4af37', marginBottom: 12 }}>
                                        🏆
                                    </div>
                                    <Title level={3} style={{ color: '#fff', margin: 0, fontSize: 32 }}>
                                        231
                                    </Title>
                                    <Text style={{ color: '#999' }}>Giải thưởng</Text>
                                </Card>
                            </Col>
                            <Col xs={12} sm={12} md={6}>
                                <Card
                                    style={{
                                        background: '#1a1a1a',
                                        border: '1px solid #444',
                                        textAlign: 'center',
                                        borderRadius: 8
                                    }}
                                    styles={{ body: { padding: '40px 20px' } }}
                                >
                                    <div style={{ fontSize: 48, color: '#d4af37', marginBottom: 12 }}>
                                        🍽️
                                    </div>
                                    <Title level={3} style={{ color: '#fff', margin: 0, fontSize: 32 }}>
                                        3
                                    </Title>
                                    <Text style={{ color: '#999' }}>Nhà hàng</Text>
                                </Card>
                            </Col>
                            <Col xs={12} sm={12} md={6}>
                                <Card
                                    style={{
                                        background: '#1a1a1a',
                                        border: '1px solid #444',
                                        textAlign: 'center',
                                        borderRadius: 8
                                    }}
                                    styles={{ body: { padding: '40px 20px' } }}
                                >
                                    <div style={{ fontSize: 48, color: '#d4af37', marginBottom: 12 }}>
                                        🛏️
                                    </div>
                                    <Title level={3} style={{ color: '#fff', margin: 0, fontSize: 32 }}>
                                        79
                                    </Title>
                                    <Text style={{ color: '#999' }}>Phòng</Text>
                                </Card>
                            </Col>
                            <Col xs={12} sm={12} md={6}>
                                <Card
                                    style={{
                                        background: '#1a1a1a',
                                        border: '1px solid #444',
                                        textAlign: 'center',
                                        borderRadius: 8
                                    }}
                                    styles={{ body: { padding: '40px 20px' } }}
                                >
                                    <div style={{ fontSize: 48, color: '#d4af37', marginBottom: 12 }}>
                                        👥
                                    </div>
                                    <Title level={3} style={{ color: '#fff', margin: 0, fontSize: 32 }}>
                                        26
                                    </Title>
                                    <Text style={{ color: '#999' }}>Nhân viên</Text>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                </div>

                {/* Khách sạn */}
                <div style={{ padding: '80px 50px', maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 60 }}>
                        <div style={{
                            width: 60,
                            height: 4,
                            background: '#d4af37',
                            margin: '0 auto 20px'
                        }} />
                        <Title level={2} style={{ fontSize: 36, fontWeight: 700 }}>
                            Khách sạn của chúng tôi
                        </Title>
                    </div>

                    <Row gutter={[40, 40]}>
                        <Col xs={24} md={12}>
                            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                                <CheckCircleOutlined style={{ fontSize: 24, color: '#d4af37', flexShrink: 0, marginTop: 4 }} />
                                <div>
                                    <Title level={4} style={{ marginBottom: 8 }}>
                                        Phòng được trang bị hiện đại, wifi tốc độ cao, 48 kênh
                                    </Title>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                                <CheckCircleOutlined style={{ fontSize: 24, color: '#d4af37', flexShrink: 0, marginTop: 4 }} />
                                <div>
                                    <Title level={4} style={{ marginBottom: 8 }}>
                                        Phòng sạch, thoải mái, wifi tốc độ cao
                                    </Title>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                                <CheckCircleOutlined style={{ fontSize: 24, color: '#d4af37', flexShrink: 0, marginTop: 4 }} />
                                <div>
                                    <Title level={4} style={{ marginBottom: 8 }}>
                                        Dịch vụ giặt là miễn phí
                                    </Title>
                                </div>
                            </div>
                            <Image
                                src="https://images.unsplash.com/photo-1590490360182-c33d57733427"
                                alt="Hotel lobby"
                                style={{ width: '100%', borderRadius: 8, marginTop: 20 }}
                                preview={false}
                            />
                        </Col>

                        <Col xs={24} md={12}>
                            <Image
                                src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"
                                alt="Pool area"
                                style={{ width: '100%', borderRadius: 8, marginBottom: 20 }}
                                preview={false}
                            />
                            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                                <CheckCircleOutlined style={{ fontSize: 24, color: '#d4af37', flexShrink: 0, marginTop: 4 }} />
                                <div>
                                    <Title level={4} style={{ marginBottom: 8 }}>
                                        Phòng sạch, thoải mái, wifi tốc độ cao, 48 kênh
                                    </Title>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                                <CheckCircleOutlined style={{ fontSize: 24, color: '#d4af37', flexShrink: 0, marginTop: 4 }} />
                                <div>
                                    <Title level={4} style={{ marginBottom: 8 }}>
                                        Dịch vụ giặt là miễn phí trong 5 ngày
                                    </Title>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <Row gutter={[40, 40]} style={{ marginTop: 40 }}>
                        <Col xs={24} md={8}>
                            <div style={{ display: 'flex', gap: 16 }}>
                                <CheckCircleOutlined style={{ fontSize: 24, color: '#d4af37', flexShrink: 0, marginTop: 4 }} />
                                <div>
                                    <Title level={4} style={{ marginBottom: 8 }}>
                                        Phòng sạch, thoải mái, wifi tốc độ cao
                                    </Title>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} md={8}>
                            <div style={{ display: 'flex', gap: 16 }}>
                                <CheckCircleOutlined style={{ fontSize: 24, color: '#d4af37', flexShrink: 0, marginTop: 4 }} />
                                <div>
                                    <Title level={4} style={{ marginBottom: 8 }}>
                                        Dịch vụ giặt là miễn phí, 48 kênh
                                    </Title>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} md={8}>
                            <div style={{ display: 'flex', gap: 16 }}>
                                <CheckCircleOutlined style={{ fontSize: 24, color: '#d4af37', flexShrink: 0, marginTop: 4 }} />
                                <div>
                                    <Title level={4} style={{ marginBottom: 8 }}>
                                        Dịch vụ giặt là miễn phí trong 5 ngày
                                    </Title>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <div style={{ textAlign: 'center', marginTop: 60 }}>
                        <Image
                            src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"
                            alt="Beach view"
                            style={{ width: '100%', maxWidth: 600, borderRadius: 8 }}
                            preview={false}
                        />
                    </div>
                </div>

                {/* Đánh giá khách hàng */}
                <div style={{ background: '#f8f8f8', padding: '80px 50px' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: 60 }}>
                            <div style={{
                                width: 60,
                                height: 4,
                                background: '#d4af37',
                                margin: '0 auto 20px'
                            }} />
                            <Title level={2} style={{ fontSize: 36, fontWeight: 700, marginBottom: 40 }}>
                                Đánh giá của khách hàng
                            </Title>
                        </div>

                        {loadingReviews ? (
                            <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                <Spin size="large" />
                            </div>
                        ) : reviews.length > 0 ? (
                            <Row gutter={[24, 24]}>
                                {reviews.map((review: any) => {
                                    const reviewDate = review.reviewed_at || review.created_at || review.createdAt;
                                    const timeAgo = reviewDate ? (() => {
                                        const now = dayjs();
                                        const reviewTime = dayjs(reviewDate);
                                        const diffDays = now.diff(reviewTime, 'day');
                                        const diffHours = now.diff(reviewTime, 'hour');
                                        const diffMinutes = now.diff(reviewTime, 'minute');
                                        
                                        if (diffDays > 0) {
                                            return `cách đây ${diffDays} ${diffDays === 1 ? 'ngày' : 'ngày'}`;
                                        } else if (diffHours > 0) {
                                            return `cách đây ${diffHours} ${diffHours === 1 ? 'giờ' : 'giờ'}`;
                                        } else if (diffMinutes > 0) {
                                            return `cách đây ${diffMinutes} ${diffMinutes === 1 ? 'phút' : 'phút'}`;
                                        } else {
                                            return "vừa xong";
                                        }
                                    })() : "gần đây";
                                    
                                    return (
                                        <Col xs={24} sm={12} lg={6} key={review.id || review.userId}>
                                            <Card
                                                style={{
                                                    border: 'none',
                                                    borderRadius: 12,
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column'
                                                }}
                                                styles={{ body: { padding: '30px 24px', flex: 1, display: 'flex', flexDirection: 'column' } }}
                                            >
                                                <div style={{ marginBottom: 16 }}>
                                                    <Rate 
                                                        disabled 
                                                        defaultValue={review.rating || 5} 
                                                        style={{ fontSize: 16 }}
                                                    />
                                                </div>
                                                
                                                {review.title && (
                                                    <Text strong style={{ 
                                                        fontSize: 16, 
                                                        display: 'block', 
                                                        marginBottom: 12,
                                                        color: '#333'
                                                    }}>
                                                        {review.title}
                                                    </Text>
                                                )}
                                                
                                                <Paragraph 
                                                    style={{
                                                        fontSize: 14,
                                                        color: '#666',
                                                        lineHeight: 1.7,
                                                        marginBottom: 20,
                                                        flex: 1,
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 5,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}
                                                >
                                                    {review.comment || review.title || "Đánh giá tuyệt vời!"}
                                                </Paragraph>
                                                
                                                <div style={{ 
                                                    marginTop: 'auto', 
                                                    paddingTop: 16, 
                                                    borderTop: '1px solid #f0f0f0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 12
                                                }}>
                                                    <Avatar 
                                                        size={40}
                                                        src={review.user?.avatar_url || review.user?.avatar}
                                                        icon={<UserOutlined />}
                                                        style={{ background: '#d4af37' }}
                                                    />
                                                    <div style={{ flex: 1 }}>
                                                        <Text strong style={{ display: 'block', fontSize: 14 }}>
                                                            {review.user?.full_name || review.userId || "Khách hàng"}
                                                        </Text>
                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                            {timeAgo}
                                                        </Text>
                                                    </div>
                                                </div>
                                            </Card>
                                        </Col>
                                    );
                                })}
                            </Row>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                <Text type="secondary" style={{ fontSize: 16 }}>
                                    Chưa có đánh giá nào
                                </Text>
                            </div>
                        )}
                    </div>
                </div>

                {/* Đăng ký nhận tin */}
                <div style={{ background: '#2d2d2d', padding: '80px 50px', color: '#fff' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                        <Row gutter={[60, 40]} align="middle">
                            <Col xs={24} md={12}>
                                <Title level={2} style={{ color: '#fff', fontSize: 32, fontWeight: 700, marginBottom: 20 }}>
                                    Tìm chúng tôi trên bản đồ
                                </Title>
                                <Paragraph style={{ color: '#ccc', fontSize: 16, lineHeight: 1.8 }}>
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin gravida lorem eu
                                    consectetur imperdiet. Donec vel magna nunc. Ut ligula justo, consequat a egestas at.
                                </Paragraph>
                                <div style={{
                                    width: '100%',
                                    height: 300,
                                    background: '#1a1a1a',
                                    borderRadius: 8,
                                    marginTop: 30,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Text style={{ color: '#666' }}>🗺️ Bản đồ</Text>
                                </div>
                            </Col>
                            <Col xs={24} md={12}>
                                <Title level={2} style={{ color: '#fff', fontSize: 32, fontWeight: 700, marginBottom: 20 }}>
                                    Đăng ký nhận tin tức
                                </Title>
                                <div style={{
                                    background: '#1a1a1a',
                                    padding: 40,
                                    borderRadius: 8,
                                    border: '1px solid #444'
                                }}>
                                    <input
                                        type="email"
                                        placeholder="Nhập email của bạn"
                                        style={{
                                            width: '100%',
                                            padding: '14px 20px',
                                            border: '1px solid #555',
                                            borderRadius: 4,
                                            background: '#2d2d2d',
                                            color: '#fff',
                                            fontSize: 16,
                                            marginBottom: 20
                                        }}
                                    />
                                    <Button
                                        block
                                        size="large"
                                        style={{
                                            background: '#d4af37',
                                            borderColor: '#d4af37',
                                            color: '#fff',
                                            height: 50,
                                            fontSize: 16,
                                            fontWeight: 600
                                        }}
                                    >
                                        ĐĂNG KÝ
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </div>
            </Content>

            <AppFooter />
        </Layout>
    );
}
