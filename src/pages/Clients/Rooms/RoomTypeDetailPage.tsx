import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
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
    Avatar,
    List,
    message,
    Spin,
    Empty,
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
    ShoppingCartOutlined,
} from "@ant-design/icons";
import { Link, useParams, useNavigate } from "react-router-dom";
import type { RangePickerProps } from "antd/es/date-picker";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useAuth } from "../../../context/AuthContext";
import { useBookingCart } from "../../../context/BookingCartContext";
import { getRoomTypeByIdWithDetails, getRoomTypeReviews, type RoomTypeWithDetails } from "../../../service/roomType";
import { formatVND, formatVNDWithUnit } from "../../../utils/currency";
import "./RoomDetail.css";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

// Helper function để map amenities thành format UI
const mapAmenitiesToUI = (amenities?: { id: number; name: string }[]) => {
    if (!amenities || amenities.length === 0) return [];

    return amenities.map(amenity => {
        const name = amenity.name.toLowerCase();
        let icon = <CheckCircleFilled style={{ color: '#52c41a' }} />;

        if (name.includes('wifi') || name.includes('internet')) {
            icon = <WifiOutlined />;
        } else if (name.includes('coffee') || name.includes('cà phê') || name.includes('minibar')) {
            icon = <CoffeeOutlined />;
        } else if (name.includes('safe') || name.includes('két')) {
            icon = <SafetyOutlined />;
        } else if (name.includes('tv') || name.includes('tivi')) {
            icon = <ThunderboltOutlined />;
        }

        return {
            icon,
            text: amenity.name
        };
    });
};

// Helper function để format bed type
const getBedType = (roomType: RoomTypeWithDetails): string => {
    if (!roomType.max_adults) return "N/A";
    if (roomType.max_adults <= 1) return "1 giường đơn";
    if (roomType.max_adults <= 2) return "1 giường King";
    if (roomType.max_adults <= 4) return "1 giường King + 1 giường Queen";
    return "2 giường King";
};

// Helper function để format room size
const getRoomSize = (roomType: RoomTypeWithDetails): string => {
    if (!roomType.max_adults) return "N/A";
    if (roomType.max_adults <= 1) return "20 m²";
    if (roomType.max_adults <= 2) return "35 m²";
    if (roomType.max_adults <= 4) return "65 m²";
    return "85 m²";
};

// Helper function để phân loại amenities theo filter_category
const categorizeAmenities = (amenities?: { id: number; name: string; filter_category?: string | null }[]) => {
    if (!amenities || amenities.length === 0) {
        return {
            keyAmenities: [],
            views: [],
            floors: [],
            others: []
        };
    }

    return {
        keyAmenities: amenities.filter(a => a.filter_category === 'key_amenity'),
        views: amenities.filter(a => a.filter_category === 'view'),
        floors: amenities.filter(a => a.filter_category === 'floor'),
        others: amenities.filter(a => !a.filter_category || (a.filter_category !== 'key_amenity' && a.filter_category !== 'view' && a.filter_category !== 'floor'))
    };
};

const RoomTypeDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();
    const {
        dateRange: cartDateRange,
        setDateRange: setCartDateRange,
        addRoomTypeToCart,
        isRoomTypeInCart,
    } = useBookingCart();

    // State cho dữ liệu
    const [roomType, setRoomType] = useState<RoomTypeWithDetails | null>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewsPage, setReviewsPage] = useState<number>(1);
    const [reviewsTotal, setReviewsTotal] = useState<number>(0);
    const [averageRating, setAverageRating] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingReviews, setLoadingReviews] = useState<boolean>(false);

    // Fetch room type detail với date range
    const fetchRoomTypeWithDates = async (showLoading: boolean = true) => {
        if (!id) return;

        if (showLoading) setLoading(true);
        try {
            // Tạo options với date range nếu có và hợp lệ (checkout > checkin)
            const options: { check_in?: string; check_out?: string } = {};
            if (cartDateRange && cartDateRange[0] && cartDateRange[1]) {
                // Chỉ gửi dates nếu checkout sau checkin
                if (cartDateRange[1].isAfter(cartDateRange[0], 'day')) {
                    options.check_in = cartDateRange[0].format('YYYY-MM-DD');
                    options.check_out = cartDateRange[1].format('YYYY-MM-DD');
                }
            }

            const roomTypeResponse = await getRoomTypeByIdWithDetails(id, options);

            if (roomTypeResponse.success && roomTypeResponse.data) {
                setRoomType(roomTypeResponse.data);
            } else if (showLoading) {
                message.error(roomTypeResponse.message || 'Không tìm thấy loại phòng');
                navigate('/rooms');
            }
        } catch (error: any) {
            console.error('Error fetching room type detail:', error);
            if (showLoading) {
                message.error('Không thể tải thông tin loại phòng');
                navigate('/rooms');
            }
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    // Fetch room type detail và reviews song song để tối ưu thời gian load
    useEffect(() => {
        const fetchRoomTypeDetail = async () => {
            if (!id) return;

            setLoading(true);
            try {
                // Tạo options với date range nếu có và hợp lệ (checkout > checkin)
                const options: { check_in?: string; check_out?: string } = {};
                if (cartDateRange && cartDateRange[0] && cartDateRange[1]) {
                    // Chỉ gửi dates nếu checkout sau checkin
                    if (cartDateRange[1].isAfter(cartDateRange[0], 'day')) {
                        options.check_in = cartDateRange[0].format('YYYY-MM-DD');
                        options.check_out = cartDateRange[1].format('YYYY-MM-DD');
                    }
                }

                // Load room type detail và reviews song song
                const [roomTypeResponse, reviewsResponse] = await Promise.all([
                    getRoomTypeByIdWithDetails(id, options),
                    getRoomTypeReviews(Number(id), { page: 1, per_page: 10 })
                ]);

                if (roomTypeResponse.success && roomTypeResponse.data) {
                    setRoomType(roomTypeResponse.data);
                } else {
                    message.error(roomTypeResponse.message || 'Không tìm thấy loại phòng');
                    navigate('/rooms');
                    return;
                }

                // Set reviews data
                if (reviewsResponse.success && reviewsResponse.data) {
                    setReviews(reviewsResponse.data);
                    if (reviewsResponse.meta) {
                        setReviewsTotal(reviewsResponse.meta.pagination?.total || 0);
                        setAverageRating(reviewsResponse.meta.average_rating || 0);
                    }
                }
            } catch (error: any) {
                console.error('Error fetching room type detail:', error);
                message.error('Không thể tải thông tin loại phòng');
                navigate('/rooms');
            } finally {
                setLoading(false);
            }
        };

        fetchRoomTypeDetail();
    }, [id, navigate]);

    // Re-fetch room type khi date range thay đổi để cập nhật available_count
    useEffect(() => {
        if (id && roomType && cartDateRange && cartDateRange[0] && cartDateRange[1]) {
            fetchRoomTypeWithDates(false);
        }
    }, [cartDateRange?.[0]?.valueOf(), cartDateRange?.[1]?.valueOf()]);

    // Fetch reviews
    const fetchReviews = async (roomTypeId: number, page: number = 1) => {
        setLoadingReviews(true);
        try {
            const response = await getRoomTypeReviews(roomTypeId, {
                page,
                per_page: 10,
            });
            if (response.success && response.data) {
                setReviews(response.data);
                setReviewsPage(page);
                if (response.meta) {
                    setReviewsTotal(response.meta.pagination?.total || 0);
                    setAverageRating(response.meta.average_rating || 0);
                }
            }
        } catch (error: any) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoadingReviews(false);
        }
    };

    // Tính số đêm
    const numNights = cartDateRange && cartDateRange[0] && cartDateRange[1]
        ? cartDateRange[1].diff(cartDateRange[0], 'day')
        : 0;

    // Tính tổng tiền
    const totalPrice = roomType?.price_per_night && numNights > 0
        ? roomType.price_per_night * numNights
        : 0;

    // Xử lý thêm vào cart
    const handleAddToCart = () => {
        if (!isLoggedIn) {
            message.warning('Vui lòng đăng nhập để đặt phòng!');
            return;
        }

        if (!cartDateRange || !cartDateRange[0] || !cartDateRange[1]) {
            message.warning('Vui lòng chọn ngày nhận và trả phòng!');
            return;
        }

        if (!roomType) return;

        // Kiểm tra phòng còn trống không
        if ((roomType.available_count || 0) === 0) {
            message.error(`Loại phòng "${roomType.name}" đã hết phòng trong khoảng thời gian này. Vui lòng chọn ngày khác!`);
            return;
        }

        const checkIn = cartDateRange[0].format('DD/MM/YYYY');
        const checkOut = cartDateRange[1].format('DD/MM/YYYY');

        addRoomTypeToCart(
            roomType,
            1,
            checkIn,
            checkOut,
            numNights,
            roomType.price_per_night || 0,
            roomType.max_adults || 2,
            roomType.max_children || 0
        );

        message.success('Đã thêm vào booking cart!');
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!roomType) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Empty description="Không tìm thấy loại phòng" />
                <Button type="primary" onClick={() => navigate('/rooms')}>
                    Quay lại danh sách phòng
                </Button>
            </div>
        );
    }

    const galleryImages = roomType.images && roomType.images.length > 0
        ? roomType.images.map(img => img.image_url)
        : roomType.image_url
            ? [roomType.image_url]
            : ["/img/bg-img/1.jpg"];

    const pageTitle = `${roomType.name} - BookStay`;
    const pageDescription = roomType.description || `Đặt phòng ${roomType.name} tại BookStay`;
    const pageImage = galleryImages[0];

    return (
        <div className="room-detail-page">
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content={pageImage} />
            </Helmet>

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
                                title: roomType.name,
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
                        {/* Left Column - Images & Details */}
                        <Col xs={24} lg={16}>
                            {/* Gallery Images */}
                            <Image.PreviewGroup>
                                <Row gutter={[8, 8]} style={{ marginBottom: 32 }}>
                                    {galleryImages.slice(0, 4).map((img, idx) => (
                                        <Col span={idx === 0 ? 24 : 8} key={idx}>
                                            <Image
                                                src={img}
                                                alt={`${roomType.name} ${idx + 1}`}
                                                style={{
                                                    width: '100%',
                                                    height: idx === 0 ? 400 : 200,
                                                    objectFit: 'cover',
                                                    borderRadius: 8
                                                }}
                                            />
                                        </Col>
                                    ))}
                                </Row>
                            </Image.PreviewGroup>

                            {/* Room Info */}
                            <Card style={{ marginBottom: 32 }}>
                                <Title level={2} style={{ marginBottom: 16 }}>
                                    {roomType.name}
                                </Title>

                                {roomType.property && (
                                    <Space style={{ marginBottom: 16 }}>
                                        <EnvironmentOutlined />
                                        <Text>{roomType.property.name}</Text>
                                    </Space>
                                )}

                                {averageRating > 0 && (
                                    <Space style={{ marginBottom: 16 }}>
                                        <Rate disabled defaultValue={averageRating} allowHalf />
                                        <Text strong>{averageRating.toFixed(1)}</Text>
                                        <Text type="secondary">({reviewsTotal} đánh giá)</Text>
                                    </Space>
                                )}

                                <Paragraph>{roomType.description || 'Phòng đẹp, tiện nghi đầy đủ'}</Paragraph>

                                <Divider />

                                {/* Room Details */}
                                <Row gutter={[16, 16]}>
                                    <Col xs={12} sm={6}>
                                        <Space direction="vertical" size="small">
                                            <Text type="secondary">Diện tích</Text>
                                            <Text strong style={{ fontSize: 16 }}>
                                                {getRoomSize(roomType)}
                                            </Text>
                                        </Space>
                                    </Col>
                                    <Col xs={12} sm={6}>
                                        <Space direction="vertical" size="small">
                                            <Text type="secondary">Loại giường</Text>
                                            <Text strong style={{ fontSize: 16 }}>
                                                {getBedType(roomType)}
                                            </Text>
                                        </Space>
                                    </Col>
                                    <Col xs={12} sm={6}>
                                        <Space direction="vertical" size="small">
                                            <Text type="secondary">Số khách tối đa</Text>
                                            <Space direction="vertical" size={2}>
                                                <Text strong style={{ fontSize: 16 }}>
                                                    {roomType.max_adults ? `${roomType.max_adults} người lớn` : 'N/A'}
                                                </Text>
                                                {roomType.max_children !== undefined && roomType.max_children > 0 && (
                                                    <Text style={{ fontSize: 14, color: '#8c8c8c' }}>
                                                        + {roomType.max_children} trẻ em
                                                    </Text>
                                                )}
                                            </Space>
                                        </Space>
                                    </Col>
                                    <Col xs={12} sm={6}>
                                        <Space direction="vertical" size="small">
                                            <Text type="secondary">Số lượng còn trống</Text>
                                            <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                                                {roomType.available_count || 0} phòng
                                            </Text>
                                        </Space>
                                    </Col>
                                </Row>
                                {roomType.price_per_night && (
                                    <>
                                        <Divider />
                                        <Row>
                                            <Col span={24}>
                                                <Space direction="vertical" size="small">
                                                    <Text type="secondary">Giá mỗi đêm</Text>
                                                    <Text strong style={{ fontSize: 24, color: '#cb8670' }}>
                                                        {formatVNDWithUnit(roomType.price_per_night, '/đêm')}
                                                    </Text>
                                                </Space>
                                            </Col>
                                        </Row>
                                    </>
                                )}
                            </Card>

                            {/* Phần tiện ích chi tiết theo loại phòng đã được ẩn. 
                                Tiện ích/dịch vụ hiện sẽ là thông tin chung cấp homestay. */}

                            {/* Reviews */}
                            <Card title={`Đánh giá từ khách hàng (${reviewsTotal})`}>
                                {loadingReviews ? (
                                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                        <Spin />
                                    </div>
                                ) : reviews.length > 0 ? (
                                    <List
                                        dataSource={reviews}
                                        renderItem={(review: any) => (
                                            <List.Item>
                                                <List.Item.Meta
                                                    avatar={
                                                        <Avatar
                                                            src={review.user?.avatar}
                                                            icon={<UserOutlined />}
                                                        />
                                                    }
                                                    title={
                                                        <Space>
                                                            <Text strong>{review.user?.full_name || 'Khách hàng'}</Text>
                                                            <Rate disabled defaultValue={review.rating} style={{ fontSize: 12 }} />
                                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                                {review.reviewed_at ? new Date(review.reviewed_at).toLocaleDateString('vi-VN') : ''}
                                                            </Text>
                                                        </Space>
                                                    }
                                                    description={
                                                        <div>
                                                            {review.title && (
                                                                <Text strong style={{ display: 'block', marginBottom: 4 }}>
                                                                    {review.title}
                                                                </Text>
                                                            )}
                                                            {review.comment && (
                                                                <Paragraph style={{ marginBottom: 0 }}>
                                                                    {review.comment}
                                                                </Paragraph>
                                                            )}
                                                        </div>
                                                    }
                                                />
                                            </List.Item>
                                        )}
                                    />
                                ) : (
                                    <Text type="secondary">Chưa có đánh giá nào</Text>
                                )}
                                {reviewsTotal > 10 && (
                                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                                        <Button
                                            type="link"
                                            onClick={() => fetchReviews(Number(id!), reviewsPage + 1)}
                                            disabled={loadingReviews || reviews.length >= reviewsTotal}
                                        >
                                            Xem thêm đánh giá
                                        </Button>
                                    </div>
                                )}
                            </Card>
                        </Col>

                        {/* Right Column - Booking Card */}
                        <Col xs={24} lg={8}>
                            <Card
                                style={{
                                    position: 'sticky',
                                    top: 20,
                                }}
                            >
                                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                    <div>
                                        <Text strong style={{ fontSize: 24, color: '#cb8670' }}>
                                            {roomType.price_per_night ? formatVNDWithUnit(roomType.price_per_night, '/đêm') : 'N/A'}
                                        </Text>
                                    </div>

                                    <Divider />

                                    {/* Date Picker */}
                                    <div>
                                        <Text strong style={{ display: 'block', marginBottom: 8 }}>
                                            <CalendarOutlined /> Chọn ngày
                                        </Text>
                                        <RangePicker
                                            style={{ width: '100%' }}
                                            value={cartDateRange}
                                            onChange={(dates) => {
                                                // Kiểm tra nếu ngày nhận phòng và trả phòng trùng nhau
                                                if (dates && dates[0] && dates[1]) {
                                                    if (dates[0].isSame(dates[1], 'day')) {
                                                        message.warning('Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 ngày!');
                                                        return;
                                                    }
                                                    if (dates[1].isSameOrBefore(dates[0], 'day')) {
                                                        message.warning('Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 ngày!');
                                                        return;
                                                    }
                                                    setCartDateRange([dates[0], dates[1]]);
                                                } else {
                                                    setCartDateRange(null);
                                                }
                                            }}
                                            disabledDate={(current) => {
                                                if (!current) return false;
                                                const today = dayjs().startOf('day');
                                                const currentDate = current.startOf('day');

                                                // Không cho chọn ngày quá khứ
                                                if (currentDate.isBefore(today)) {
                                                    return true;
                                                }

                                                // Nếu đã chọn ngày nhận phòng, không cho chọn ngày trả phòng trùng hoặc trước ngày nhận
                                                if (cartDateRange && cartDateRange[0]) {
                                                    const checkInDate = cartDateRange[0].startOf('day');
                                                    if (currentDate.isSame(checkInDate, 'day') || currentDate.isBefore(checkInDate)) {
                                                        return true;
                                                    }
                                                }

                                                return false;
                                            }}
                                        />
                                    </div>

                                    {numNights > 0 && (
                                        <div>
                                            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                                <Text>{numNights} đêm</Text>
                                                <Text strong>{formatVND(totalPrice)}</Text>
                                            </Space>
                                        </div>
                                    )}

                                    <Button
                                        type="primary"
                                        block
                                        size="large"
                                        icon={<ShoppingCartOutlined />}
                                        onClick={handleAddToCart}
                                        disabled={
                                            !cartDateRange ||
                                            !cartDateRange[0] ||
                                            !cartDateRange[1] ||
                                            isRoomTypeInCart(roomType.id) ||
                                            (roomType.available_count || 0) === 0
                                        }
                                        style={{
                                            backgroundColor: '#52c41a',
                                            borderColor: '#52c41a',
                                        }}
                                    >
                                        {isRoomTypeInCart(roomType.id)
                                            ? 'Đã thêm vào booking'
                                            : 'Thêm vào booking'}
                                    </Button>

                                    {roomType.available_count === 0 && (
                                        <Text type="danger" style={{ textAlign: 'center', display: 'block' }}>
                                            Loại phòng này hiện đã hết phòng
                                        </Text>
                                    )}
                                </Space>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </Content>
        </div>
    );
};

export default RoomTypeDetailPage;

