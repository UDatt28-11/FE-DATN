import React, { useState, useMemo, useEffect } from "react";
import {
    Layout,
    Row,
    Col,
    Typography,
    Card,
    Rate,
    Breadcrumb,
    Button,
    Select,
    Slider,
    Space,
    Image,
    Checkbox,
    Divider,
    Empty,
} from "antd";
import {
    HomeOutlined,
    EnvironmentOutlined,
    FilterOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "./RoomList.css";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// --- Dữ liệu giả lập phòng ---
const allRooms = [
    {
        id: 1,
        name: "Deluxe Room - Ocean View",
        price: 1500000,
        rating: 4.8,
        category: "deluxe",
        location: "Tầng 2, Khu A",
        description: "Phòng Deluxe rộng rãi với thiết kế hiện đại, đầy đủ tiện nghi cao cấp. Phù hợp cho cặp đôi hoặc gia đình nhỏ muốn có không gian riêng tư và thoải mái.",
        maxGuests: 2,
        bedType: "1 giường King",
        roomSize: "35 m²",
        image: "/img/bg-img/1.jpg",
    },
    {
        id: 2,
        name: "Double Suite - Family",
        price: 2000000,
        rating: 4.9,
        category: "suite",
        location: "Tầng 3, Khu B",
        description: "Suite sang trọng với phòng khách riêng, phòng ngủ rộng và ban công hướng biển. Lý tưởng cho những ai muốn trải nghiệm đẳng cấp cao nhất.",
        maxGuests: 4,
        bedType: "1 giường King + 1 giường Queen",
        roomSize: "65 m²",
        image: "/img/bg-img/8.jpg",
    },
    {
        id: 3,
        name: "Single Room - Budget",
        price: 800000,
        rating: 4.5,
        category: "single",
        location: "Tầng 1, Khu C",
        description: "Phòng đơn tiện nghi, gọn gàng, phù hợp cho khách đi công tác hoặc du lịch một mình.",
        maxGuests: 1,
        bedType: "1 giường đơn",
        roomSize: "20 m²",
        image: "/img/bg-img/15.jpg",
    },
    {
        id: 4,
        name: "Family Suite - Premium",
        price: 2500000,
        rating: 4.9,
        category: "suite",
        location: "Tầng 4, Khu A",
        description: "Phòng suite dành cho gia đình với 2 phòng ngủ riêng biệt, phòng khách rộng rãi. Hoàn hảo cho gia đình có trẻ nhỏ.",
        maxGuests: 6,
        bedType: "2 giường King",
        roomSize: "85 m²",
        image: "/img/bg-img/5.jpg",
    },
    {
        id: 5,
        name: "Deluxe Room - Executive",
        price: 1800000,
        rating: 4.7,
        category: "deluxe",
        location: "Tầng 5, Khu B",
        description: "Phòng Executive cao cấp với bàn làm việc rộng, ghế massage và view toàn cảnh thành phố. Lý tưởng cho khách doanh nhân.",
        maxGuests: 2,
        bedType: "1 giường King",
        roomSize: "40 m²",
        image: "/img/bg-img/12.jpg",
    },
    {
        id: 6,
        name: "Deluxe Room - Premium",
        price: 1700000,
        rating: 4.8,
        category: "deluxe",
        location: "Tầng 3, Khu A",
        description: "Phòng Deluxe cao cấp với thiết kế sang trọng, ban công riêng và đầy đủ tiện nghi hiện đại.",
        maxGuests: 2,
        bedType: "1 giường King",
        roomSize: "38 m²",
        image: "/img/bg-img/18.jpg",
    },
    {
        id: 7,
        name: "Single Room - Cozy",
        price: 750000,
        rating: 4.3,
        category: "single",
        location: "Tầng 1, Khu D",
        description: "Phòng đơn ấm cúng, thoải mái với không gian tiện nghi cho một người.",
        maxGuests: 1,
        bedType: "1 giường đơn",
        roomSize: "18 m²",
        image: "/img/bg-img/16.jpg",
    },
    {
        id: 8,
        name: "Honeymoon Suite",
        price: 2800000,
        rating: 5.0,
        category: "suite",
        location: "Tầng 6, Khu A",
        description: "Suite lãng mạn dành cho các cặp đôi tuần trăng mật với bồn tắm jacuzzi và ban công riêng tư.",
        maxGuests: 2,
        bedType: "1 giường King size",
        roomSize: "70 m²",
        image: "/img/bg-img/9.jpg",
    },
    {
        id: 9,
        name: "Deluxe Room - Garden View",
        price: 1400000,
        rating: 4.6,
        category: "deluxe",
        location: "Tầng 1, Khu B",
        description: "Phòng Deluxe với view vườn xanh mát, không gian yên tĩnh và thư giãn.",
        maxGuests: 2,
        bedType: "1 giường King",
        roomSize: "33 m²",
        image: "/img/bg-img/2.jpg",
    },
];

const RoomList: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // State cho các bộ lọc
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000000]);
    const [minRating, setMinRating] = useState<number>(0);
    const [minGuests, setMinGuests] = useState<number>(1);
    const [sortBy, setSortBy] = useState<string>("default");

    // Lấy category từ URL và tự động lọc
    useEffect(() => {
        const categoryFromUrl = searchParams.get('category');
        if (categoryFromUrl) {
            setSelectedCategories([categoryFromUrl]);
        } else {
            setSelectedCategories([]);
        }
    }, [searchParams]);

    // Lấy tên loại phòng từ category
    const getCategoryName = (category: string | null) => {
        if (!category) return "Danh sách phòng";
        switch (category) {
            case 'deluxe': return "Phòng Deluxe";
            case 'suite': return "Phòng Suite";
            case 'single': return "Phòng Đơn";
            default: return "Danh sách phòng";
        }
    };

    const currentCategory = searchParams.get('category');

    // Lọc phòng theo các tiêu chí
    const filteredRooms = useMemo(() => {
        let filtered = allRooms.filter((room) => {
            // Lọc theo danh mục
            if (selectedCategories.length > 0 && !selectedCategories.includes(room.category)) {
                return false;
            }

            // Lọc theo khoảng giá
            if (room.price < priceRange[0] || room.price > priceRange[1]) {
                return false;
            }

            // Lọc theo đánh giá
            if (room.rating < minRating) {
                return false;
            }

            // Lọc theo số khách
            if (room.maxGuests < minGuests) {
                return false;
            }

            return true;
        });

        // Sắp xếp
        if (sortBy === "price-asc") {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortBy === "price-desc") {
            filtered.sort((a, b) => b.price - a.price);
        } else if (sortBy === "rating") {
            filtered.sort((a, b) => b.rating - a.rating);
        } else if (sortBy === "name") {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        }

        return filtered;
    }, [selectedCategories, priceRange, minRating, minGuests, sortBy]);

    // Xử lý thay đổi danh mục
    const handleCategoryChange = (checkedValues: string[]) => {
        setSelectedCategories(checkedValues);
    };

    // Reset tất cả bộ lọc
    const handleResetFilters = () => {
        setSelectedCategories([]);
        setPriceRange([0, 3000000]);
        setMinRating(0);
        setMinGuests(1);
        setSortBy("default");
    };

    return (
        <div className="room-list-page">
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
                            ...(currentCategory ? [{
                                title: getCategoryName(currentCategory),
                            }] : []),
                        ]}
                    />
                </div>
            </div>

            <Content style={{ padding: '40px 0', minHeight: '80vh', background: '#fff' }}>
                <div className="container">
                    {/* Tiêu đề & Thống kê */}
                    <div style={{ marginBottom: 32 }}>
                        <Title level={2} style={{ marginBottom: 8 }}>
                            {getCategoryName(currentCategory)}
                        </Title>
                        <Space split={<Divider type="vertical" />}>
                            <Text type="secondary">
                                Tìm thấy <Text strong style={{ color: '#cb8670' }}>{filteredRooms.length}</Text> phòng
                            </Text>
                            <Text type="secondary">Tổng {allRooms.length} phòng</Text>
                        </Space>
                    </div>

                    <Row gutter={[24, 24]}>
                        {/* Cột trái: Bộ lọc */}
                        <Col xs={24} lg={6}>
                            <Card
                                title={
                                    <Space>
                                        <FilterOutlined />
                                        <span>Bộ lọc</span>
                                    </Space>
                                }
                                bordered={false}
                                style={{ position: 'sticky', top: 20 }}
                                extra={
                                    <Button type="link" onClick={handleResetFilters} size="small">
                                        Đặt lại
                                    </Button>
                                }
                            >
                                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                    {/* Danh mục phòng */}
                                    <div>
                                        <Text strong style={{ display: 'block', marginBottom: 12 }}>
                                            Loại phòng
                                        </Text>
                                        <Checkbox.Group
                                            style={{ width: '100%' }}
                                            onChange={handleCategoryChange}
                                            value={selectedCategories}
                                        >
                                            <Space direction="vertical" style={{ width: '100%' }}>
                                                <Checkbox value="deluxe">
                                                    Phòng Deluxe ({allRooms.filter(r => r.category === 'deluxe').length})
                                                </Checkbox>
                                                <Checkbox value="suite">
                                                    Phòng Suite ({allRooms.filter(r => r.category === 'suite').length})
                                                </Checkbox>
                                                <Checkbox value="single">
                                                    Phòng Đơn ({allRooms.filter(r => r.category === 'single').length})
                                                </Checkbox>
                                            </Space>
                                        </Checkbox.Group>
                                    </div>

                                    <Divider style={{ margin: 0 }} />

                                    {/* Khoảng giá */}
                                    <div>
                                        <Text strong style={{ display: 'block', marginBottom: 12 }}>
                                            Khoảng giá
                                        </Text>
                                        <Slider
                                            range
                                            min={0}
                                            max={3000000}
                                            step={100000}
                                            value={priceRange}
                                            onChange={(value) => setPriceRange(value as [number, number])}
                                            tooltip={{
                                                formatter: (value) => `${(value || 0).toLocaleString('vi-VN')} VNĐ`
                                            }}
                                        />
                                        <Space style={{ width: '100%', justifyContent: 'space-between', marginTop: 8 }}>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                {priceRange[0].toLocaleString('vi-VN')} VNĐ
                                            </Text>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                {priceRange[1].toLocaleString('vi-VN')} VNĐ
                                            </Text>
                                        </Space>
                                    </div>

                                    <Divider style={{ margin: 0 }} />

                                    {/* Đánh giá tối thiểu */}
                                    <div>
                                        <Text strong style={{ display: 'block', marginBottom: 12 }}>
                                            Đánh giá tối thiểu
                                        </Text>
                                        <Select
                                            style={{ width: '100%' }}
                                            value={minRating}
                                            onChange={setMinRating}
                                        >
                                            <Option value={0}>Tất cả</Option>
                                            <Option value={4}>
                                                <Space>
                                                    <Rate disabled defaultValue={4} style={{ fontSize: 12 }} />
                                                    <span>trở lên</span>
                                                </Space>
                                            </Option>
                                            <Option value={4.5}>
                                                <Space>
                                                    <Rate disabled defaultValue={4.5} allowHalf style={{ fontSize: 12 }} />
                                                    <span>trở lên</span>
                                                </Space>
                                            </Option>
                                            <Option value={4.8}>
                                                <Space>
                                                    <Rate disabled defaultValue={4.8} allowHalf style={{ fontSize: 12 }} />
                                                    <span>trở lên</span>
                                                </Space>
                                            </Option>
                                        </Select>
                                    </div>

                                    <Divider style={{ margin: 0 }} />

                                    {/* Số khách */}
                                    <div>
                                        <Text strong style={{ display: 'block', marginBottom: 12 }}>
                                            Số khách tối thiểu
                                        </Text>
                                        <Select
                                            style={{ width: '100%' }}
                                            value={minGuests}
                                            onChange={setMinGuests}
                                        >
                                            <Option value={1}>
                                                <Space>
                                                    <UserOutlined />
                                                    <span>1 người</span>
                                                </Space>
                                            </Option>
                                            <Option value={2}>
                                                <Space>
                                                    <UserOutlined />
                                                    <span>2 người</span>
                                                </Space>
                                            </Option>
                                            <Option value={4}>
                                                <Space>
                                                    <UserOutlined />
                                                    <span>4 người</span>
                                                </Space>
                                            </Option>
                                            <Option value={6}>
                                                <Space>
                                                    <UserOutlined />
                                                    <span>6 người</span>
                                                </Space>
                                            </Option>
                                        </Select>
                                    </div>
                                </Space>
                            </Card>
                        </Col>

                        {/* Cột phải: Danh sách phòng */}
                        <Col xs={24} lg={18}>
                            {/* Thanh sắp xếp */}
                            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'flex-end' }}>
                                <Space>
                                    <Text>Sắp xếp theo:</Text>
                                    <Select
                                        style={{ width: 200 }}
                                        value={sortBy}
                                        onChange={setSortBy}
                                    >
                                        <Option value="default">Mặc định</Option>
                                        <Option value="price-asc">Giá: Thấp đến cao</Option>
                                        <Option value="price-desc">Giá: Cao đến thấp</Option>
                                        <Option value="rating">Đánh giá cao nhất</Option>
                                        <Option value="name">Tên A-Z</Option>
                                    </Select>
                                </Space>
                            </div>

                            {/* Danh sách phòng */}
                            {filteredRooms.length === 0 ? (
                                <Empty
                                    description="Không tìm thấy phòng phù hợp"
                                    style={{ padding: '60px 0' }}
                                >
                                    <Button type="primary" onClick={handleResetFilters}>
                                        Đặt lại bộ lọc
                                    </Button>
                                </Empty>
                            ) : (
                                <Row gutter={[24, 24]}>
                                    {filteredRooms.map((room) => (
                                        <Col xs={24} sm={12} lg={12} key={room.id}>
                                            <Card
                                                hoverable
                                                className="room-card"
                                                bodyStyle={{ padding: 0 }}
                                                style={{ borderRadius: 12, overflow: 'hidden', height: '100%' }}
                                            >
                                                <Row gutter={0}>
                                                    {/* Ảnh phòng */}
                                                    <Col xs={24} sm={10}>
                                                        <div
                                                            style={{
                                                                height: 220,
                                                                overflow: 'hidden',
                                                                position: 'relative',
                                                                cursor: 'pointer'
                                                            }}
                                                            onClick={() => navigate(`/rooms/${room.id}`)}
                                                        >
                                                            <Image
                                                                alt={room.name}
                                                                src={room.image}
                                                                preview={false}
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'cover',
                                                                    transition: 'transform 0.3s ease'
                                                                }}
                                                                className="room-image-hover"
                                                            />
                                                            {/* Tag loại phòng */}
                                                            <div
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: 12,
                                                                    left: 12,
                                                                    background: '#cb8670',
                                                                    color: 'white',
                                                                    padding: '4px 12px',
                                                                    borderRadius: 4,
                                                                    fontSize: 12,
                                                                    fontWeight: 'bold'
                                                                }}
                                                            >
                                                                {room.category === 'deluxe' && 'Deluxe'}
                                                                {room.category === 'suite' && 'Suite'}
                                                                {room.category === 'single' && 'Đơn'}
                                                            </div>
                                                        </div>
                                                    </Col>

                                                    {/* Thông tin phòng */}
                                                    <Col xs={24} sm={14}>
                                                        <div style={{ padding: 16, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                                            <Space direction="vertical" size="small" style={{ width: '100%', flex: 1 }}>
                                                                <Title
                                                                    level={5}
                                                                    style={{
                                                                        marginBottom: 0,
                                                                        cursor: 'pointer',
                                                                        transition: 'color 0.3s ease'
                                                                    }}
                                                                    onClick={() => navigate(`/rooms/${room.id}`)}
                                                                    className="room-title-hover"
                                                                >
                                                                    {room.name}
                                                                </Title>

                                                                <Space>
                                                                    <Rate disabled defaultValue={room.rating} allowHalf style={{ fontSize: 14 }} />
                                                                    <Text strong style={{ color: '#cb8670' }}>{room.rating}</Text>
                                                                </Space>

                                                                <Space>
                                                                    <EnvironmentOutlined style={{ color: '#8c8c8c' }} />
                                                                    <Text type="secondary" style={{ fontSize: 13 }}>
                                                                        {room.location}
                                                                    </Text>
                                                                </Space>

                                                                <Paragraph
                                                                    ellipsis={{ rows: 2 }}
                                                                    style={{ marginBottom: 8, fontSize: 13 }}
                                                                >
                                                                    {room.description}
                                                                </Paragraph>

                                                                <Space split={<Divider type="vertical" />} style={{ fontSize: 12 }}>
                                                                    <Text type="secondary">{room.roomSize}</Text>
                                                                    <Text type="secondary">{room.bedType}</Text>
                                                                    <Text type="secondary">
                                                                        <UserOutlined /> {room.maxGuests} khách
                                                                    </Text>
                                                                </Space>
                                                            </Space>

                                                            <Divider style={{ margin: '12px 0' }} />

                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <div>
                                                                    <Text style={{ fontSize: 20, color: '#cb8670', fontWeight: 'bold' }}>
                                                                        {room.price.toLocaleString('vi-VN')}
                                                                    </Text>
                                                                    <Text type="secondary" style={{ fontSize: 12 }}> VNĐ/đêm</Text>
                                                                </div>
                                                                <Button
                                                                    type="primary"
                                                                    style={{
                                                                        backgroundColor: '#cb8670',
                                                                        borderColor: '#cb8670'
                                                                    }}
                                                                    onClick={() => navigate(`/rooms/${room.id}`)}
                                                                >
                                                                    Chi tiết
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            )}
                        </Col>
                    </Row>
                </div>
            </Content>
        </div>
    );
};

export default RoomList;
