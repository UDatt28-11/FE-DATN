import React, { useState, useMemo } from "react";
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
    DatePicker,
    Select,
    Avatar,
    List,
    Affix, // Dùng để "dính" form đặt phòng
} from "antd";
import {
    HomeOutlined,
    StarFilled,
    WifiOutlined,
    CarOutlined, // Biểu tượng Bếp (thay thế)
    UserOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    CheckCircleFilled,
} from "@ant-design/icons";
import { Link, useParams } from "react-router-dom"; // Import useParams
import type { RangePickerProps } from "antd/es/date-picker";
import type { Dayjs } from "dayjs";

// Import các layout chung
import AppHeader from "../../../components/Layout/AppHeader";
import AppFooter from "../../../components/Layout/AppFooter";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// --- Dữ liệu giả lập (Mock Data) Mở rộng ---
// (Sao chép từ file list và thêm chi tiết)

const allHomestays = [
    {
        id: 1,
        name: "Biệt thự Biển An Viên",
        price: 3500000,
        rating: 4.8,
        category: "villa",
        location: "Nha Trang, Khánh Hòa",
        description: "Tọa lạc tại vị trí đắc địa trong khu đô thị An Viên, biệt thự này cung cấp một không gian nghỉ dưỡng sang trọng bậc nhất. Với 4 phòng ngủ, hồ bơi riêng và view biển trực diện, đây là lựa chọn hoàn hảo cho gia đình hoặc nhóm bạn lớn.",
        amenities: [
            { icon: <WifiOutlined />, text: "Wifi miễn phí" },
            { icon: <CheckCircleFilled style={{ color: "#52c41a" }} />, text: "Hồ bơi riêng" },
            { icon: <CarOutlined />, text: "Bếp đầy đủ" },
            { icon: <CheckCircleFilled style={{ color: "#52c41a" }} />, text: "Chỗ đỗ xe" },
        ],
        galleryImages: [
            "https://images.unsplash.com/photo-1613977257363-27618c7c3886?w=800&q=80",
            "https://images.unsplash.com/photo-1576647334338-1f1f34088b39?w=600&q=80",
            "https://images.unsplash.com/photo-1594498656108-e4d05b5b321a?w=600&q=80",
            "https://images.unsplash.com/photo-1594498656003-6d63b33e3f42?w=600&q=80",
        ],
        reviews: [
            { user: "Minh Anh", rating: 5, comment: "Tuyệt vời! Sạch sẽ, sang trọng, view biển cực đẹp. Sẽ quay lại!" },
            { user: "Gia Hân", rating: 4.5, comment: "Hồ bơi sạch, biệt thự rộng rãi. Rất đáng tiền." },
        ]
    },
    {
        id: 2,
        name: "Căn hộ The Sóng Vũng Tàu",
        price: 1200000,
        rating: 4.5,
        category: "apartment",
        location: "Vũng Tàu, Bà Rịa - Vũng Tàu",
        description: "Căn hộ 2 phòng ngủ tại The Sóng với view biển trực diện. Tòa nhà có hồ bơi vô cực, phòng gym, và khu vui chơi trẻ em. Nội thất hiện đại, đầy đủ tiện nghi, phù hợp cho gia đình nhỏ.",
        amenities: [
            { icon: <WifiOutlined />, text: "Wifi miễn phí" },
            { icon: <CheckCircleFilled style={{ color: "#52c41a" }} />, text: "Hồ bơi chung" },
            { icon: <CarOutlined />, text: "Bếp" },
        ],
        galleryImages: [
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
            "https://images.unsplash.com/photo-1501183638710-841dd1904471?w=600&q=80",
        ],
        reviews: [
            { user: "Hoàng Long", rating: 4.5, comment: "Hồ bơi vô cực trên tầng thượng rất đẹp. Căn hộ sạch sẽ." },
        ]
    },
    // Thêm các homestay khác nếu cần
];
// ------------------------------

// Kiểu trả về cho RangePicker
type RangeValue = RangePickerProps["value"];

const HomestayDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Lấy ID từ URL

    // --- State cho form đặt phòng ---
    const [dates, setDates] = useState<RangeValue>(null);
    const [guests, setGuests] = useState<number>(1);

    // Tìm homestay dựa trên ID
    const homestay = useMemo(() => {
        return allHomestays.find(h => h.id.toString() === id);
    }, [id]);

    // Tính số đêm
    const numNights = useMemo(() => {
        if (!dates || !dates[0] || !dates[1]) {
            return 0;
        }
        return dates[1].diff(dates[0], 'day');
    }, [dates]);

    // Tính tổng tiền
    const totalPrice = useMemo(() => {
        if (!homestay || numNights <= 0) {
            return 0;
        }
        return homestay.price * numNights;
    }, [homestay, numNights]);

    // Xử lý khi không tìm thấy homestay
    if (!homestay) {
        return (
            <Layout style={{ background: "#fff", minHeight: "100vh" }}>
                <AppHeader />
                <Content style={{ padding: "100px 50px", textAlign: "center", marginTop: 70 }}>
                    <Title level={2}>Không tìm thấy homestay</Title>
                    <Paragraph>Homestay bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</Paragraph>
                    <Button type="primary">
                        <Link to="/homestay">Quay lại danh sách</Link>
                    </Button>
                </Content>
                <AppFooter />
            </Layout>
        );
    }

    // Hàm xử lý đặt phòng
    const handleBooking = () => {
        if (numNights <= 0) {
            // Thay thế alert() bằng Modal của Ant Design trong ứng dụng thực tế
            alert("Vui lòng chọn ngày nhận và trả phòng hợp lệ.");
            return;
        }
        console.log("Booking Details:", {
            homestayId: homestay.id,
            dates: dates?.map(date => date?.format("YYYY-MM-DD")),
            guests,
            totalPrice,
        });
        // Thay thế alert() bằng Modal hoặc thông báo thành công
        alert(`Đặt phòng thành công! Tổng cộng: ${totalPrice.toLocaleString("vi-VN")}đ cho ${numNights} đêm.`);
    };

    return (
        <Layout style={{ background: "#fff" }}>
            <AppHeader />

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
                            <Link to="/homestay">Danh sách Homestay</Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>{homestay.name}</Breadcrumb.Item>
                    </Breadcrumb>

                    {/* Tiêu đề và Đánh giá */}
                    <Title level={2} style={{ marginBottom: 8 }}>
                        {homestay.name}
                    </Title>
                    <Space size="middle">
                        <Rate allowHalf disabled defaultValue={homestay.rating} />
                        <Text strong>{homestay.rating} ({homestay.reviews.length} đánh giá)</Text>
                        <Text type="secondary">
                            <EnvironmentOutlined style={{ marginRight: 4 }} />
                            {homestay.location}
                        </Text>
                    </Space>

                    {/* Thư viện ảnh */}
                    <Image.PreviewGroup>
                        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                            <Col span={16}>
                                <Image
                                    width="100%"
                                    height={500}
                                    src={homestay.galleryImages[0]}
                                    style={{ objectFit: "cover", borderRadius: 12 }}
                                />
                            </Col>
                            <Col span={8}>
                                <Row gutter={[16, 16]}>
                                    <Col span={24}>
                                        <Image
                                            width="100%"
                                            height={242} // 500 / 2 - (16/2)
                                            src={homestay.galleryImages[1]}
                                            style={{ objectFit: "cover", borderRadius: 12 }}
                                        />
                                    </Col>
                                    <Col span={24}>
                                        <Image
                                            width="100%"
                                            height={242}
                                            src={homestay.galleryImages[2]}
                                            style={{ objectFit: "cover", borderRadius: 12 }}
                                        />
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Image.PreviewGroup>

                    {/* Nội dung chính và Form Đặt phòng */}
                    <Row gutter={[32, 32]} style={{ marginTop: 32 }}>
                        {/* Cột trái: Thông tin chi tiết */}
                        <Col span={16}>
                            <Title level={4}>Mô tả</Title>
                            <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
                                {homestay.description}
                            </Paragraph>

                            <Divider />

                            {/* Tiện nghi */}
                            <Title level={4}>Tiện nghi</Title>
                            <Row gutter={[16, 16]}>
                                {homestay.amenities.map((item, index) => (
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
                            <Title level={4}>Đánh giá ({homestay.reviews.length})</Title>
                            <List
                                itemLayout="horizontal"
                                dataSource={homestay.reviews}
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
                        <Col span={8}>
                            {/* Affix giúp form "dính" lại khi cuộn */}
                            <Affix offsetTop={90}>
                                <Card
                                    bordered={false}
                                    style={{
                                        borderRadius: 12,
                                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                                    }}
                                >
                                    <Title level={4}>
                                        <Text strong style={{ color: "#1677ff", fontSize: 28 }}>
                                            {homestay.price.toLocaleString("vi-VN")}đ
                                        </Text>
                                        <Text style={{ fontSize: 16, color: "#555" }}> / đêm</Text>
                                    </Title>

                                    <Divider style={{ margin: "16px 0" }} />

                                    {/* Chọn ngày */}
                                    <Paragraph strong style={{ marginBottom: 8 }}>
                                        <CalendarOutlined style={{ marginRight: 8 }} />
                                        Ngày nhận - trả phòng
                                    </Paragraph>
                                    <RangePicker
                                        style={{ width: "100%" }}
                                        size="large"
                                        onChange={(dates) => setDates(dates)}
                                        format="DD/MM/YYYY"
                                    />

                                    {/* Chọn khách */}
                                    <Paragraph strong style={{ marginTop: 16, marginBottom: 8 }}>
                                        <UserOutlined style={{ marginRight: 8 }} />
                                        Số lượng khách
                                    </Paragraph>
                                    <Select
                                        defaultValue={1}
                                        size="large"
                                        style={{ width: "100%" }}
                                        onChange={(value) => setGuests(value)}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                                            <Option key={num} value={num}>{num} khách</Option>
                                        ))}
                                    </Select>

                                    {/* Tính tiền (nếu có chọn ngày) */}
                                    {numNights > 0 && (
                                        <>
                                            <Divider style={{ margin: "16px 0" }} />
                                            <Row justify="space-between">
                                                <Text style={{ fontSize: 16 }}>
                                                    {homestay.price.toLocaleString("vi-VN")}đ x {numNights} đêm
                                                </Text>
                                                <Text style={{ fontSize: 16 }}>
                                                    {totalPrice.toLocaleString("vi-VN")}đ
                                                </Text>
                                            </Row>
                                        </>
                                    )}

                                    <Button
                                        type="primary"
                                        size="large"
                                        block
                                        style={{ marginTop: 24, fontWeight: 600 }}
                                        onClick={handleBooking}
                                    >
                                        Đặt ngay
                                    </Button>

                                    <Paragraph style={{ textAlign: 'center', marginTop: 16 }} type="secondary">
                                        Bạn chưa bị trừ tiền
                                    </Paragraph>

                                </Card>
                            </Affix>
                        </Col>
                    </Row>
                </div>
            </Content>

            <AppFooter />
        </Layout>
    );
};

export default HomestayDetailPage;
