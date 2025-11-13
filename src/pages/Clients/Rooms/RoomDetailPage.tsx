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
    Image,
    DatePicker,
    Select,
    Avatar,
    List,
    Affix,
} from "antd";
import {
    HomeOutlined,
    WifiOutlined,
    UserOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    CheckCircleFilled,
    CoffeeOutlined,
    SafetyOutlined,
    ThunderboltOutlined,
    ArrowLeftOutlined,
} from "@ant-design/icons";
import { Link, useParams, useNavigate } from "react-router-dom";
import type { RangePickerProps } from "antd/es/date-picker";
import type { Dayjs } from "dayjs";
import "./RoomDetail.css";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// --- Dữ liệu giả lập phòng ---
const allRooms = [
    {
        id: 1,
        name: "Deluxe Room",
        price: 1500000,
        rating: 4.8,
        category: "deluxe",
        location: "Tầng 2, Khu A",
        description: "Phòng Deluxe rộng rãi với thiết kế hiện đại, đầy đủ tiện nghi cao cấp. Phù hợp cho cặp đôi hoặc gia đình nhỏ muốn có không gian riêng tư và thoải mái.",
        amenities: [
            { icon: <WifiOutlined />, text: "Wifi miễn phí tốc độ cao" },
            { icon: <CheckCircleFilled style={{ color: '#52c41a' }} />, text: "Điều hòa 2 chiều" },
            { icon: <CoffeeOutlined />, text: "Minibar & máy pha cà phê" },
            { icon: <SafetyOutlined />, text: "Két sắt an toàn" },
            { icon: <ThunderboltOutlined />, text: "TV màn hình phẳng 50 inch" },
        ],
        maxGuests: 2,
        bedType: "1 giường King",
        roomSize: "35 m²",
        galleryImages: [
            "/img/bg-img/1.jpg",
            "/img/bg-img/2.jpg",
            "/img/bg-img/3.jpg",
            "/img/bg-img/4.png",
        ],
        reviews: [
            { user: "Nguyễn Minh Anh", avatar: "/img/blog-img/1.jpg", rating: 5, comment: "Phòng rất đẹp và sạch sẽ, view tuyệt vời. Nhân viên phục vụ nhiệt tình!" },
            { user: "Trần Văn Hùng", avatar: "/img/blog-img/2.jpg", rating: 4.5, comment: "Giá hơi cao nhưng đáng đồng tiền. Sẽ quay lại lần sau." },
            { user: "Lê Thị Mai", avatar: "/img/blog-img/3.jpg", rating: 5, comment: "Không gian yên tĩnh, phòng rộng rãi. Perfect cho kỳ nghỉ!" },
        ]
    },
    {
        id: 2,
        name: "Double Suite",
        price: 2000000,
        rating: 4.9,
        category: "suite",
        location: "Tầng 3, Khu B",
        description: "Suite sang trọng với phòng khách riêng, phòng ngủ rộng và ban công hướng biển. Lý tưởng cho những ai muốn trải nghiệm đẳng cấp cao nhất.",
        amenities: [
            { icon: <WifiOutlined />, text: "Wifi miễn phí" },
            { icon: <CheckCircleFilled style={{ color: '#52c41a' }} />, text: "Phòng khách riêng" },
            { icon: <CoffeeOutlined />, text: "Bar mini cao cấp" },
            { icon: <SafetyOutlined />, text: "Két sắt" },
            { icon: <ThunderboltOutlined />, text: "2 TV 55 inch" },
        ],
        maxGuests: 4,
        bedType: "1 giường King + 1 giường Queen",
        roomSize: "65 m²",
        galleryImages: [
            "/img/bg-img/8.jpg",
            "/img/bg-img/9.jpg",
            "/img/bg-img/10.jpg",
            "/img/bg-img/11.jpg",
        ],
        reviews: [
            { user: "Phạm Quốc Tuấn", avatar: "/img/blog-img/1.jpg", rating: 5, comment: "Suite tuyệt vời! Ban công view siêu đẹp, phòng khách rộng." },
            { user: "Đỗ Thị Hương", avatar: "/img/blog-img/2.jpg", rating: 4.8, comment: "Đi gia đình rất hợp, không gian rộng rãi thoải mái." },
        ]
    },
    {
        id: 3,
        name: "Single Room",
        price: 800000,
        rating: 4.5,
        category: "single",
        location: "Tầng 1, Khu C",
        description: "Phòng đơn tiện nghi, gọn gàng, phù hợp cho khách đi công tác hoặc du lịch một mình.",
        amenities: [
            { icon: <WifiOutlined />, text: "Wifi miễn phí" },
            { icon: <CheckCircleFilled style={{ color: '#52c41a' }} />, text: "Điều hòa" },
            { icon: <CoffeeOutlined />, text: "Bàn làm việc" },
            { icon: <ThunderboltOutlined />, text: "TV 32 inch" },
        ],
        maxGuests: 1,
        bedType: "1 giường đơn",
        roomSize: "20 m²",
        galleryImages: [
            "/img/bg-img/15.jpg",
            "/img/bg-img/16.jpg",
            "/img/bg-img/17.jpg",
        ],
        reviews: [
            { user: "Hoàng Văn Nam", avatar: "/img/blog-img/1.jpg", rating: 4.5, comment: "Phòng nhỏ nhưng đầy đủ tiện nghi. Giá cả hợp lý." },
            { user: "Ngô Thị Lan", avatar: "/img/blog-img/3.jpg", rating: 4, comment: "Sạch sẽ, view ổn. Phù hợp đi công tác ngắn ngày." },
        ]
    },
    {
        id: 4,
        name: "Family Suite",
        price: 2500000,
        rating: 4.9,
        category: "suite",
        location: "Tầng 4, Khu A",
        description: "Phòng suite dành cho gia đình với 2 phòng ngủ riêng biệt, phòng khách rộng rãi. Hoàn hảo cho gia đình có trẻ nhỏ.",
        amenities: [
            { icon: <WifiOutlined />, text: "Wifi miễn phí tốc độ cao" },
            { icon: <CheckCircleFilled style={{ color: '#52c41a' }} />, text: "2 phòng ngủ riêng" },
            { icon: <CoffeeOutlined />, text: "Bếp nhỏ đầy đủ tiện nghi" },
            { icon: <SafetyOutlined />, text: "Két sắt" },
            { icon: <ThunderboltOutlined />, text: "3 TV màn hình phẳng" },
        ],
        maxGuests: 6,
        bedType: "2 giường King",
        roomSize: "85 m²",
        galleryImages: [
            "/img/bg-img/5.jpg",
            "/img/bg-img/6.jpg",
            "/img/bg-img/7.jpg",
            "/img/bg-img/8.jpg",
        ],
        reviews: [
            { user: "Vũ Thị Hà", avatar: "/img/blog-img/1.jpg", rating: 5, comment: "Phòng rộng rãi, phù hợp gia đình có trẻ nhỏ. Bếp tiện lợi!" },
            { user: "Bùi Minh Đức", avatar: "/img/blog-img/2.jpg", rating: 4.8, comment: "Không gian tuyệt vời cho kỳ nghỉ gia đình." },
        ]
    },
    {
        id: 5,
        name: "Executive Room",
        price: 1800000,
        rating: 4.7,
        category: "deluxe",
        location: "Tầng 5, Khu B",
        description: "Phòng Executive cao cấp với bàn làm việc rộng, ghế massage và view toàn cảnh thành phố. Lý tưởng cho khách doanh nhân.",
        amenities: [
            { icon: <WifiOutlined />, text: "Wifi tốc độ cao" },
            { icon: <CheckCircleFilled style={{ color: '#52c41a' }} />, text: "Bàn làm việc cao cấp" },
            { icon: <CoffeeOutlined />, text: "Máy pha cà phê Nespresso" },
            { icon: <SafetyOutlined />, text: "Két sắt điện tử" },
            { icon: <ThunderboltOutlined />, text: "Smart TV 55 inch" },
        ],
        maxGuests: 2,
        bedType: "1 giường King",
        roomSize: "40 m²",
        galleryImages: [
            "/img/bg-img/12.jpg",
            "/img/bg-img/13.jpg",
            "/img/bg-img/14.jpg",
            "/img/bg-img/15.jpg",
        ],
        reviews: [
            { user: "Trịnh Quang Huy", avatar: "/img/blog-img/1.jpg", rating: 4.7, comment: "Phòng rất phù hợp cho công tác. View đẹp, làm việc thoải mái." },
            { user: "Mai Lan Anh", avatar: "/img/blog-img/3.jpg", rating: 4.5, comment: "Tiện nghi đầy đủ, giá hợp lý." },
        ]
    },
    {
        id: 6,
        name: "Premium Deluxe",
        price: 1700000,
        rating: 4.8,
        category: "deluxe",
        location: "Tầng 3, Khu A",
        description: "Phòng Deluxe cao cấp với thiết kế sang trọng, ban công riêng và đầy đủ tiện nghi hiện đại.",
        amenities: [
            { icon: <WifiOutlined />, text: "Wifi miễn phí" },
            { icon: <CheckCircleFilled style={{ color: '#52c41a' }} />, text: "Ban công riêng" },
            { icon: <CoffeeOutlined />, text: "Minibar cao cấp" },
            { icon: <SafetyOutlined />, text: "Két sắt" },
            { icon: <ThunderboltOutlined />, text: "Smart TV 50 inch" },
        ],
        maxGuests: 2,
        bedType: "1 giường King",
        roomSize: "38 m²",
        galleryImages: [
            "/img/bg-img/18.jpg",
            "/img/bg-img/19.jpg",
            "/img/bg-img/20.jpg",
            "/img/bg-img/1.jpg",
        ],
        reviews: [
            { user: "Đặng Thu Hương", avatar: "/img/blog-img/2.jpg", rating: 5, comment: "Phòng đẹp, ban công view tuyệt vời. Rất đáng tiền!" },
            { user: "Lê Văn Tùng", avatar: "/img/blog-img/1.jpg", rating: 4.5, comment: "Thiết kế sang trọng, dịch vụ tốt." },
        ]
    },
];

const RoomDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
    const [adults, setAdults] = useState<number>(2);
    const [children, setChildren] = useState<number>(0);

    // Tìm phòng theo ID
    const currentRoom = useMemo(() => {
        return allRooms.find((room) => room.id === Number(id)) || allRooms[0];
    }, [id]);

    // Lấy danh sách phòng tương tự (cùng category hoặc giá gần giá hiện tại)
    const similarRooms = useMemo(() => {
        return allRooms
            .filter(room => room.id !== currentRoom.id)
            .slice(0, 3); // Lấy 3 phòng
    }, [currentRoom.id]);

    // Tính tổng tiền (giả lập)
    const totalPrice = useMemo(() => {
        if (!dateRange || !dateRange[0] || !dateRange[1]) return currentRoom.price;
        const nights = dateRange[1].diff(dateRange[0], 'day');
        return currentRoom.price * nights;
    }, [dateRange, currentRoom.price]);

    const handleDateChange: RangePickerProps['onChange'] = (dates) => {
        setDateRange(dates as [Dayjs | null, Dayjs | null] | null);
    };

    const handleBooking = () => {
        if (!dateRange || !dateRange[0] || !dateRange[1]) {
            alert('Vui lòng chọn ngày nhận và trả phòng!');
            return;
        }

        // Chuyển đến trang nhập thông tin người đặt phòng
        navigate('/booking/info', {
            state: {
                roomId: currentRoom.id.toString(),
                roomName: currentRoom.name,
                price: currentRoom.price,
                checkIn: dateRange[0].format('DD/MM/YYYY'),
                checkOut: dateRange[1].format('DD/MM/YYYY'),
                nights: dateRange[1].diff(dateRange[0], 'day'),
                adults,
                children,
                totalPrice,
            }
        });
    };

    return (
        <div className="room-detail-page">
            {/* Breadcrumb */}
            <div className="breadcrumb-wrapper" style={{ padding: '20px 0', background: '#f5f5f5' }}>
                <div className="container">
                    <Breadcrumb
                        items={[
                            {
                                title: (
                                    <Link to="/">
                                        <HomeOutlined /> Trang chủ
                                    </Link>
                                ),
                            },
                            {
                                title: <Link to="/rooms">Phòng</Link>,
                            },
                            {
                                title: currentRoom.name,
                            },
                        ]}
                    />
                </div>
            </div>

            <Content style={{ padding: '40px 0', minHeight: '80vh' }}>
                <div className="container">
                    {/* Nút Trở về */}
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(-1)}
                        style={{ marginBottom: 24 }}
                        size="large"
                    >
                        Trở về
                    </Button>

                    <Row gutter={[32, 32]}>
                        {/* Cột trái: Thông tin phòng */}
                        <Col xs={24} lg={16}>
                            {/* Tiêu đề & Rating */}
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                <div>
                                    <Title level={2} style={{ marginBottom: 8 }}>
                                        {currentRoom.name}
                                    </Title>
                                    <Space size="large">
                                        <Space>
                                            <Rate disabled defaultValue={currentRoom.rating} allowHalf />
                                            <Text strong>{currentRoom.rating}</Text>
                                            <Text type="secondary">({currentRoom.reviews.length} đánh giá)</Text>
                                        </Space>
                                        <Space>
                                            <EnvironmentOutlined />
                                            <Text>{currentRoom.location}</Text>
                                        </Space>
                                    </Space>
                                </div>

                                {/* Gallery ảnh */}
                                <Card bordered={false} bodyStyle={{ padding: 0 }}>
                                    <Image.PreviewGroup>
                                        <Row gutter={[8, 8]}>
                                            <Col span={24}>
                                                <Image
                                                    width="100%"
                                                    height={400}
                                                    src={currentRoom.galleryImages[0]}
                                                    alt={currentRoom.name}
                                                    style={{ objectFit: 'cover', borderRadius: 8 }}
                                                />
                                            </Col>
                                            {currentRoom.galleryImages.slice(1, 4).map((img, idx) => (
                                                <Col span={8} key={idx}>
                                                    <Image
                                                        width="100%"
                                                        height={150}
                                                        src={img}
                                                        alt={`${currentRoom.name} ${idx + 2}`}
                                                        style={{ objectFit: 'cover', borderRadius: 8 }}
                                                    />
                                                </Col>
                                            ))}
                                        </Row>
                                    </Image.PreviewGroup>
                                </Card>

                                {/* Thông tin phòng */}
                                <Card title="Thông tin phòng" bordered={false}>
                                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                        <Row gutter={[16, 16]}>
                                            <Col span={8}>
                                                <Text type="secondary">Diện tích</Text>
                                                <br />
                                                <Text strong>{currentRoom.roomSize}</Text>
                                            </Col>
                                            <Col span={8}>
                                                <Text type="secondary">Loại giường</Text>
                                                <br />
                                                <Text strong>{currentRoom.bedType}</Text>
                                            </Col>
                                            <Col span={8}>
                                                <Text type="secondary">Số khách tối đa</Text>
                                                <br />
                                                <Text strong>{currentRoom.maxGuests} người</Text>
                                            </Col>
                                        </Row>
                                        <Divider />
                                        <Paragraph>{currentRoom.description}</Paragraph>
                                    </Space>
                                </Card>

                                {/* Tiện nghi */}
                                <Card title="Tiện nghi phòng" bordered={false}>
                                    <Row gutter={[16, 16]}>
                                        {currentRoom.amenities.map((amenity, index) => (
                                            <Col span={12} key={index}>
                                                <Space>
                                                    {amenity.icon}
                                                    <Text>{amenity.text}</Text>
                                                </Space>
                                            </Col>
                                        ))}
                                    </Row>
                                </Card>

                                {/* Đánh giá */}
                                <Card title={`Đánh giá (${currentRoom.reviews.length})`} bordered={false}>
                                    <List
                                        itemLayout="horizontal"
                                        dataSource={currentRoom.reviews}
                                        renderItem={(review) => (
                                            <List.Item>
                                                <List.Item.Meta
                                                    avatar={<Avatar src={review.avatar} icon={<UserOutlined />} />}
                                                    title={
                                                        <Space>
                                                            <Text strong>{review.user}</Text>
                                                            <Rate disabled defaultValue={review.rating} allowHalf style={{ fontSize: 14 }} />
                                                        </Space>
                                                    }
                                                    description={review.comment}
                                                />
                                            </List.Item>
                                        )}
                                    />
                                </Card>
                            </Space>
                        </Col>

                        {/* Cột phải: Form đặt phòng */}
                        <Col xs={24} lg={8}>
                            <Affix offsetTop={20}>
                                <Card
                                    title="Đặt phòng"
                                    bordered={false}
                                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                                >
                                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                        {/* Giá */}
                                        <div>
                                            <Text style={{ fontSize: 28, color: '#cb8670', fontWeight: 'bold' }}>
                                                {currentRoom.price.toLocaleString('vi-VN')} VNĐ
                                            </Text>
                                            <Text type="secondary"> / đêm</Text>
                                        </div>

                                        <Divider style={{ margin: '8px 0' }} />

                                        {/* Chọn ngày */}
                                        <div>
                                            <Text strong style={{ display: 'block', marginBottom: 8 }}>
                                                <CalendarOutlined /> Chọn ngày
                                            </Text>
                                            <RangePicker
                                                style={{ width: '100%' }}
                                                format="DD/MM/YYYY"
                                                onChange={handleDateChange}
                                                placeholder={['Nhận phòng', 'Trả phòng']}
                                            />
                                        </div>

                                        {/* Số khách */}
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                                                    Người lớn
                                                </Text>
                                                <Select
                                                    style={{ width: '100%' }}
                                                    value={adults}
                                                    onChange={setAdults}
                                                >
                                                    {[1, 2, 3, 4].map(num => (
                                                        <Option key={num} value={num}>{num}</Option>
                                                    ))}
                                                </Select>
                                            </Col>
                                            <Col span={12}>
                                                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                                                    Trẻ em
                                                </Text>
                                                <Select
                                                    style={{ width: '100%' }}
                                                    value={children}
                                                    onChange={setChildren}
                                                >
                                                    {[0, 1, 2, 3].map(num => (
                                                        <Option key={num} value={num}>{num}</Option>
                                                    ))}
                                                </Select>
                                            </Col>
                                        </Row>

                                        <Divider style={{ margin: '8px 0' }} />

                                        {/* Tổng tiền */}
                                        <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: 8 }}>
                                            <Row justify="space-between" align="middle">
                                                <Col>
                                                    <Text strong>Tổng cộng:</Text>
                                                </Col>
                                                <Col>
                                                    <Text style={{ fontSize: 24, color: '#cb8670', fontWeight: 'bold' }}>
                                                        {totalPrice.toLocaleString('vi-VN')} VNĐ
                                                    </Text>
                                                </Col>
                                            </Row>
                                            {dateRange && dateRange[0] && dateRange[1] && (
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    {dateRange[1].diff(dateRange[0], 'day')} đêm × {currentRoom.price.toLocaleString('vi-VN')} VNĐ
                                                </Text>
                                            )}
                                        </div>

                                        {/* Nút đặt phòng */}
                                        <Button
                                            type="primary"
                                            size="large"
                                            block
                                            onClick={handleBooking}
                                            style={{
                                                backgroundColor: '#cb8670',
                                                borderColor: '#cb8670',
                                                height: 50,
                                                fontSize: 16,
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            Đặt phòng ngay
                                        </Button>

                                        <Text type="secondary" style={{ fontSize: 12, textAlign: 'center', display: 'block' }}>
                                            Bạn sẽ không bị trừ tiền ngay bây giờ
                                        </Text>
                                    </Space>
                                </Card>
                            </Affix>
                        </Col>
                    </Row>

                    {/* Phòng tương tự */}
                    <Divider style={{ margin: '60px 0 40px' }} />
                    <div>
                        <Title level={3} style={{ marginBottom: 24, textAlign: 'center' }}>
                            Phòng tương tự
                        </Title>
                        <Row gutter={[24, 24]}>
                            {similarRooms.map((room) => (
                                <Col xs={24} sm={12} lg={8} key={room.id}>
                                    <Card
                                        hoverable
                                        cover={
                                            <div style={{ height: 220, overflow: 'hidden' }}>
                                                <Image
                                                    alt={room.name}
                                                    src={room.galleryImages[0]}
                                                    preview={false}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        transition: 'transform 0.3s ease'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        (e.target as HTMLImageElement).style.transform = 'scale(1.1)';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        (e.target as HTMLImageElement).style.transform = 'scale(1)';
                                                    }}
                                                />
                                            </div>
                                        }
                                        style={{ borderRadius: 12, overflow: 'hidden' }}
                                    >
                                        <Card.Meta
                                            title={
                                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                    <Text strong style={{ fontSize: 18 }}>{room.name}</Text>
                                                    <Space>
                                                        <Rate disabled defaultValue={room.rating} allowHalf style={{ fontSize: 14 }} />
                                                        <Text type="secondary" style={{ fontSize: 12 }}>({room.rating})</Text>
                                                    </Space>
                                                </Space>
                                            }
                                            description={
                                                <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: 12 }}>
                                                    <div>
                                                        <Space>
                                                            <EnvironmentOutlined style={{ color: '#cb8670' }} />
                                                            <Text type="secondary" style={{ fontSize: 13 }}>{room.location}</Text>
                                                        </Space>
                                                    </div>
                                                    <Paragraph
                                                        ellipsis={{ rows: 2 }}
                                                        style={{ marginBottom: 12, fontSize: 13 }}
                                                    >
                                                        {room.description}
                                                    </Paragraph>
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        borderTop: '1px solid #f0f0f0',
                                                        paddingTop: 12
                                                    }}>
                                                        <div>
                                                            <Text style={{ fontSize: 20, color: '#cb8670', fontWeight: 'bold' }}>
                                                                {room.price.toLocaleString('vi-VN')}
                                                            </Text>
                                                            <Text type="secondary" style={{ fontSize: 12 }}> VNĐ/đêm</Text>
                                                        </div>
                                                        <Link to={`/rooms/${room.id}`}>
                                                            <Button
                                                                type="primary"
                                                                style={{
                                                                    backgroundColor: '#cb8670',
                                                                    borderColor: '#cb8670'
                                                                }}
                                                            >
                                                                Xem chi tiết
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </Space>
                                            }
                                        />
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                </div>
            </Content>
        </div>
    );
};

export default RoomDetailPage;
