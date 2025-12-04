import React, { useState, useMemo, useEffect } from "react";
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
    Pagination,
    Empty,
    Modal,
    Form,
    Input as AntdInput,
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
import dayjs from "dayjs";
import { useAuth } from "../../../context/AuthContext";
import { useBookingCart } from "../../../context/BookingCartContext";
import { LoginModal, RegisterModal } from "../../../components/Auth";
import { getRoomById, getRoomReviews, getRooms, checkRoomAvailability } from "../../../service/room";
import reviewService from "../../../service/reviewService";
import { getUserBookings } from "../../../service/bookingService";
import type { Room, Review } from "../../../types/room/room";
import type { BookingOrder } from "../../../types/booking/booking";
import { formatVND, formatVNDWithUnit } from "../../../utils/currency";
import "./RoomDetail.css";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

// Helper function để map amenities thành format UI
const mapAmenitiesToUI = (amenities?: { id: number; name: string }[]) => {
    if (!amenities || amenities.length === 0) return [];
    
    // Map tên amenity thành icon và text
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

// Helper function để lấy gallery images từ roomType
const getGalleryImages = (room: Room): string[] => {
    // Lấy images từ roomType thay vì room
    if (room.roomType?.images && room.roomType.images.length > 0) {
        return room.roomType.images.map((img: any) => img.image_url).filter(Boolean);
    }
    // Fallback: nếu vẫn có images trong room (backward compatibility)
    if (room.images && room.images.length > 0) {
        return room.images.map((img: any) => img.image_url).filter(Boolean);
    }
    return ["/img/bg-img/1.jpg"]; // Fallback
};

// Helper function để format location
const getRoomLocation = (room: Room): string => {
    if (room.property?.address) return room.property.address;
    if (room.property?.name) return room.property.name;
    return "N/A";
};

// Helper function để format bed type
const getBedType = (room: Room): string => {
    if (room.max_adults <= 1) return "1 giường đơn";
    if (room.max_adults <= 2) return "1 giường King";
    if (room.max_adults <= 4) return "1 giường King + 1 giường Queen";
    return "2 giường King";
};

// Helper function để format room size
const getRoomSize = (room: Room): string => {
    if (room.max_adults <= 1) return "20 m²";
    if (room.max_adults <= 2) return "35 m²";
    if (room.max_adults <= 4) return "65 m²";
    return "85 m²";
};

const RoomDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();
    const { addToCart, dateRange: cartDateRange, setDateRange: setCartDateRange, isInCart } = useBookingCart();
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
    const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);

    // Sử dụng dateRange từ cart (không dùng local state nữa)
    const effectiveDateRange = cartDateRange;

    // State cho dữ liệu
    const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [totalReviews, setTotalReviews] = useState<number>(0);
    const [reviewsPage, setReviewsPage] = useState<number>(1);
    const [reviewsPageSize, setReviewsPageSize] = useState<number>(5);
    const [similarRooms, setSimilarRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingReviews, setLoadingReviews] = useState<boolean>(false);
    
    // State cho review form
    const [reviewModalVisible, setReviewModalVisible] = useState<boolean>(false);
    const [reviewForm] = Form.useForm();
    const [submittingReview, setSubmittingReview] = useState<boolean>(false);
    const [canReview, setCanReview] = useState<boolean>(false);
    const [bookingDetailId, setBookingDetailId] = useState<number | null>(null);

    // Fetch room detail từ API
    useEffect(() => {
        const fetchRoomDetail = async () => {
            if (!id) return;
            
            setLoading(true);
            try {
                // Fetch room detail trước để lấy property_id và room_type_id
                const roomResponse = await getRoomById(id);
                if (roomResponse.success && roomResponse.data) {
                    setCurrentRoom(roomResponse.data);
                    
                    // Fetch services và similar rooms song song (reviews sẽ fetch riêng)
                    const similarParams: any = {
                        per_page: 4,
                    };
                    if (roomResponse.data.property_id) {
                        similarParams.property_id = roomResponse.data.property_id;
                    }
                    if (roomResponse.data.room_type_id) {
                        similarParams.room_type_id = roomResponse.data.room_type_id;
                    }
                    
                    // Fetch similar rooms
                    const similarResponse = await Promise.allSettled([
                        getRooms(similarParams),
                    ]);
                    
                    // Xử lý similar rooms response
                    if (similarResponse[0].status === 'fulfilled' && similarResponse[0].value.success && similarResponse[0].value.data) {
                        const filtered = similarResponse[0].value.data
                            .filter((r: Room) => r.id !== roomResponse.data.id)
                            .slice(0, 3);
                        setSimilarRooms(filtered);
                    } else if (import.meta.env.DEV) {
                        console.error("Error fetching similar rooms:", similarResponse[0]);
                    }
                } else {
                    message.error("Không tìm thấy phòng");
                    navigate("/rooms");
                }
            } catch (error: any) {
                if (import.meta.env.DEV) {
                    console.error("Error fetching room:", error);
                }
                const errorMessage = error.response?.data?.message || "Không thể tải thông tin phòng. Vui lòng thử lại sau.";
                message.error(errorMessage);
                // Chỉ navigate nếu không phải lỗi 404 (có thể là lỗi network)
                if (error.response?.status === 404) {
                    navigate("/rooms");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchRoomDetail();
    }, [id, navigate]);

    // Fetch reviews khi có room và khi page thay đổi
    useEffect(() => {
        const fetchReviews = async () => {
            if (!id || !currentRoom) return;
            
            setLoadingReviews(true);
            try {
                const reviewsResponse = await getRoomReviews(id, { 
                    page: reviewsPage, 
                    per_page: reviewsPageSize 
                });
                
                if (reviewsResponse.success) {
                    const reviewsData = reviewsResponse.data || [];
                    setReviews(Array.isArray(reviewsData) ? reviewsData : []);
                    setTotalReviews(reviewsResponse.meta?.pagination?.total || 0);
                }
            } catch (error: any) {
                // Không log error cho 401/403 vì axios interceptor sẽ xử lý redirect
                if (error.response?.status !== 401 && error.response?.status !== 403) {
                    if (import.meta.env.DEV) {
                        console.error("Error fetching reviews:", error);
                    }
                    // Không hiển thị error message cho reviews vì không quan trọng lắm
                }
            } finally {
                setLoadingReviews(false);
            }
        };

        if (currentRoom) {
            fetchReviews();
        }
    }, [id, reviewsPage, reviewsPageSize, currentRoom]);

    // Kiểm tra xem user có thể đánh giá phòng này không
    useEffect(() => {
        const checkCanReview = async () => {
            if (!isLoggedIn || !currentRoom) {
                setCanReview(false);
                return;
            }

            try {
                // Lấy danh sách bookings của user đã check-out
                const bookingsResponse = await getUserBookings({
                    status: ['checked_out', 'completed'],
                    include: 'details,details.room',
                });

                // Kiểm tra xem có booking nào đã check-out cho phòng này không
                const eligibleBooking = bookingsResponse.data.find((booking: BookingOrder) => {
                    return booking.details?.some((detail) => {
                        return detail.room_id === currentRoom.id && 
                               (detail.status === 'checked_out' || booking.status === 'completed');
                    });
                });

                if (eligibleBooking) {
                    const eligibleDetail = eligibleBooking.details?.find(
                        (detail) => detail.room_id === currentRoom.id
                    );
                    if (eligibleDetail) {
                        setCanReview(true);
                        setBookingDetailId(eligibleDetail.id);
                    } else {
                        setCanReview(false);
                    }
                } else {
                    setCanReview(false);
                }
            } catch (error: any) {
                // Không log error cho 401/403 vì axios interceptor sẽ xử lý redirect
                if (error.response?.status !== 401 && error.response?.status !== 403) {
                    if (import.meta.env.DEV) {
                        console.error("Error checking review eligibility:", error);
                    }
                }
                setCanReview(false);
            }
        };

        if (isLoggedIn && currentRoom) {
            checkCanReview();
        } else {
            setCanReview(false);
        }
    }, [isLoggedIn, currentRoom]);

    // Tính tổng tiền
    const totalPrice = useMemo(() => {
        if (!currentRoom) return 0;
        if (!effectiveDateRange || !effectiveDateRange[0] || !effectiveDateRange[1]) return currentRoom.price_per_night;
        const nights = effectiveDateRange[1].diff(effectiveDateRange[0], 'day');
        return currentRoom.price_per_night * nights;
    }, [effectiveDateRange, currentRoom]);

    // Disable dates: không cho chọn ngày quá khứ và ngày trả phòng phải sau ngày nhận
    const disabledDate: RangePickerProps['disabledDate'] = (current) => {
        if (!current) return false;
        
        // Lấy ngày hôm nay (bắt đầu của ngày, không có giờ phút giây)
        const today = dayjs().startOf('day');
        const currentDate = current.startOf('day');
        
        // Không cho chọn ngày quá khứ (trước hôm nay)
        if (currentDate.isBefore(today)) {
            return true;
        }
        
        // Nếu đã chọn ngày nhận phòng, không cho chọn ngày trả phòng trùng hoặc trước ngày nhận
        if (effectiveDateRange && effectiveDateRange[0]) {
            const checkInDate = effectiveDateRange[0].startOf('day');
            // Ngày trả phòng phải sau ngày nhận ít nhất 1 ngày
            if (currentDate.isSame(checkInDate) || currentDate.isBefore(checkInDate)) {
                return true;
            }
        }
        
        return false;
    };

    const handleDateChange: RangePickerProps['onChange'] = (dates) => {
        const newRange = dates as [Dayjs | null, Dayjs | null] | null;
        
        // Kiểm tra nếu ngày nhận phòng và trả phòng trùng nhau
        if (newRange && newRange[0] && newRange[1]) {
            if (newRange[0].isSame(newRange[1], 'day')) {
                message.warning('Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 ngày!');
                return; // Không cập nhật state
            }
        }
        
        // Cập nhật trực tiếp vào context (sẽ tự động sync với localStorage)
        setCartDateRange(newRange);
    };

    // Xử lý submit review
    const handleSubmitReview = async () => {
        try {
            const values = await reviewForm.validateFields();
            
            if (!bookingDetailId) {
                message.error('Không tìm thấy thông tin đặt phòng để đánh giá');
                return;
            }

            setSubmittingReview(true);
            
            await reviewService.create({
                bookingDetailsId: bookingDetailId.toString(),
                rating: values.rating,
                title: values.title,
                comment: values.comment || undefined,
            } as any);

            message.success('Đánh giá của bạn đã được gửi và đang chờ duyệt');
            setReviewModalVisible(false);
            reviewForm.resetFields();
            
            // Refresh reviews
            if (id) {
                const reviewsResponse = await getRoomReviews(id, { 
                    page: reviewsPage, 
                    per_page: reviewsPageSize 
                });
                
                if (reviewsResponse.success) {
                    const reviewsData = reviewsResponse.data || [];
                    setReviews(Array.isArray(reviewsData) ? reviewsData : []);
                    setTotalReviews(reviewsResponse.meta?.pagination?.total || 0);
                }
            }
        } catch (error: any) {
            // Không log error cho 401/403 vì axios interceptor sẽ xử lý redirect
            if (error.response?.status !== 401 && error.response?.status !== 403) {
                console.error("Error submitting review:", error);
                const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá';
                message.error(errorMessage);
            }
        } finally {
            setSubmittingReview(false);
        }
    };

    // Không cần sync nữa vì đã dùng trực tiếp từ context

    const [addingToCart, setAddingToCart] = useState(false);
    
    const handleAddToCart = async () => {
        if (!effectiveDateRange || !effectiveDateRange[0] || !effectiveDateRange[1]) {
            message.warning('Vui lòng chọn ngày nhận và trả phòng!');
            return;
        }

        if (!currentRoom) return;

        // Kiểm tra xem phòng đã có trong cart chưa
        if (isInCart(currentRoom.id)) {
            message.warning(`Phòng "${currentRoom.name}" đã có trong booking cart!`);
            return;
        }

        const checkInFormatted = effectiveDateRange[0].format('DD/MM/YYYY');
        const checkOutFormatted = effectiveDateRange[1].format('DD/MM/YYYY');
        const checkInAPI = effectiveDateRange[0].format('YYYY-MM-DD');
        const checkOutAPI = effectiveDateRange[1].format('YYYY-MM-DD');
        const nights = effectiveDateRange[1].diff(effectiveDateRange[0], 'day');

        // Kiểm tra phòng còn trống không trước khi thêm vào cart
        setAddingToCart(true);
        try {
            const availability = await checkRoomAvailability(currentRoom.id, checkInAPI, checkOutAPI);
            
            if (!availability.available) {
                message.error(`Phòng "${currentRoom.name}" đã được đặt trong khoảng thời gian ${checkInFormatted} - ${checkOutFormatted}. Vui lòng chọn ngày khác!`);
                return;
            }

            // Thêm vào booking cart
            addToCart(
                currentRoom,
                checkInFormatted,
                checkOutFormatted,
                nights,
                totalPrice
            );
        } catch (error) {
            console.error('Error checking room availability:', error);
            message.error('Không thể kiểm tra tình trạng phòng. Vui lòng thử lại!');
        } finally {
            setAddingToCart(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" />
            </div>
        );
    }

    // No room found
    if (!currentRoom) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Empty description="Không tìm thấy phòng" />
                <Button type="primary" onClick={() => navigate("/rooms")} style={{ marginTop: 16 }}>
                    Quay lại danh sách phòng
                </Button>
            </div>
        );
    }

    // Map data for UI
    const roomAmenities = mapAmenitiesToUI(currentRoom.amenities);
    const galleryImages = getGalleryImages(currentRoom);
    const roomLocation = getRoomLocation(currentRoom);
    const bedType = getBedType(currentRoom);
    const roomSize = getRoomSize(currentRoom);
    const roomRating = currentRoom.rating || 0;

    // SEO Metadata
    const pageTitle = currentRoom ? `${currentRoom.name} - BookStay` : "Chi tiết phòng - BookStay";
    const pageDescription = currentRoom?.description 
        ? `${currentRoom.description.substring(0, 160)}...` 
        : `Đặt phòng ${currentRoom?.name || ""} với giá tốt nhất. Xem chi tiết, đánh giá và đặt ngay!`;
    const pageImage = galleryImages[0] || "/img/bg-img/1.jpg";

    return (
        <div className="room-detail-page">
            {/* SEO Metadata */}
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content={pageImage} />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <meta name="twitter:image" content={pageImage} />
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
                                title: currentRoom?.name || "Chi tiết phòng",
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

                    <Row gutter={[32, 32]} align="top">
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
                                            <Rate disabled defaultValue={roomRating} allowHalf />
                                            <Text strong>{roomRating.toFixed(1)}</Text>
                                            <Text type="secondary">({reviews.length} đánh giá)</Text>
                                        </Space>
                                        <Space>
                                            <EnvironmentOutlined />
                                            <Text>{roomLocation}</Text>
                                        </Space>
                                    </Space>
                                </div>

                                {/* Gallery ảnh */}
                                <Card variant="borderless" bodyStyle={{ padding: 0 }}>
                                    <Image.PreviewGroup>
                                        <Row gutter={[8, 8]}>
                                            <Col span={24}>
                                                <Image
                                                    width="100%"
                                                    height={400}
                                                    src={galleryImages[0] || "/img/bg-img/1.jpg"}
                                                    alt={currentRoom.name}
                                                    style={{ objectFit: 'cover', borderRadius: 8 }}
                                                    placeholder={
                                                        <div style={{ 
                                                            width: '100%', 
                                                            height: 400, 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            justifyContent: 'center',
                                                            background: '#f0f0f0'
                                                        }}>
                                                            <Spin size="large" />
                                                        </div>
                                                    }
                                                    fallback="/img/bg-img/1.jpg"
                                                />
                                            </Col>
                                            {galleryImages.slice(1, 4).map((img, idx) => (
                                                <Col span={8} key={idx}>
                                                    <Image
                                                        width="100%"
                                                        height={150}
                                                        src={img}
                                                        alt={`${currentRoom.name} ${idx + 2}`}
                                                        style={{ objectFit: 'cover', borderRadius: 8 }}
                                                        placeholder={
                                                            <div style={{ 
                                                                width: '100%', 
                                                                height: 150, 
                                                                display: 'flex', 
                                                                alignItems: 'center', 
                                                                justifyContent: 'center',
                                                                background: '#f0f0f0'
                                                            }}>
                                                                <Spin size="small" />
                                                            </div>
                                                        }
                                                        fallback="/img/bg-img/1.jpg"
                                                    />
                                                </Col>
                                            ))}
                                        </Row>
                                    </Image.PreviewGroup>
                                </Card>

                                {/* Thông tin phòng */}
                                <Card title="Thông tin phòng" variant="borderless">
                                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                        <Row gutter={[16, 16]}>
                                            <Col span={8}>
                                                <Text type="secondary">Diện tích</Text>
                                                <br />
                                                <Text strong>{roomSize}</Text>
                                            </Col>
                                            <Col span={8}>
                                                <Text type="secondary">Loại giường</Text>
                                                <br />
                                                <Text strong>{bedType}</Text>
                                            </Col>
                                            <Col span={8}>
                                                <Text type="secondary">Số khách tối đa</Text>
                                                <br />
                                                <Text strong>{currentRoom.max_adults + currentRoom.max_children} người</Text>
                                            </Col>
                                        </Row>
                                        <Divider />
                                        <Paragraph>{currentRoom.description || "Phòng đẹp, tiện nghi đầy đủ"}</Paragraph>
                                    </Space>
                                </Card>

                                {/* Tiện nghi */}
                                <Card title="Tiện nghi phòng" variant="borderless">
                                    {roomAmenities.length > 0 ? (
                                        <Row gutter={[16, 16]}>
                                            {roomAmenities.map((amenity, index) => (
                                                <Col span={12} key={index}>
                                                    <Space>
                                                        {amenity.icon}
                                                        <Text>{amenity.text}</Text>
                                                    </Space>
                                                </Col>
                                            ))}
                                        </Row>
                                    ) : (
                                        <Text type="secondary">Đang cập nhật...</Text>
                                    )}
                                </Card>

                                {/* Đánh giá */}
                                <Card 
                                    title={`Đánh giá (${totalReviews})`} 
                                    variant="borderless"
                                    extra={
                                        <Space>
                                            {canReview && (
                                                <Button
                                                    type="primary"
                                                    onClick={() => {
                                                        if (!isLoggedIn) {
                                                            message.warning('Vui lòng đăng nhập để đánh giá!');
                                                            setIsLoginModalVisible(true);
                                                            return;
                                                        }
                                                        setReviewModalVisible(true);
                                                    }}
                                                    style={{
                                                        backgroundColor: '#cb8670',
                                                        borderColor: '#cb8670',
                                                    }}
                                                >
                                                    Viết đánh giá
                                                </Button>
                                            )}
                                            {totalReviews > reviewsPageSize && (
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    Trang {reviewsPage} / {Math.ceil(totalReviews / reviewsPageSize)}
                                                </Text>
                                            )}
                                        </Space>
                                    }
                                >
                                    {loadingReviews ? (
                                        <div style={{ textAlign: 'center', padding: '20px' }}>
                                            <Spin />
                                        </div>
                                    ) : reviews.length > 0 ? (
                                        <>
                                            <List
                                                itemLayout="horizontal"
                                                dataSource={reviews}
                                                renderItem={(review) => (
                                                    <List.Item>
                                                        <List.Item.Meta
                                                            avatar={
                                                                <Avatar 
                                                                    src={review.user?.avatar} 
                                                                    icon={<UserOutlined />} 
                                                                />
                                                            }
                                                            title={
                                                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                                    <Space>
                                                                        <Text strong>{review.user?.full_name || "Khách"}</Text>
                                                                        <Rate disabled defaultValue={review.rating} allowHalf style={{ fontSize: 14 }} />
                                                                    </Space>
                                                                    {review.title && (
                                                                        <Text strong style={{ fontSize: 16, color: '#333' }}>
                                                                            {review.title}
                                                                        </Text>
                                                                    )}
                                                                </Space>
                                                            }
                                                            description={
                                                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                                    {review.comment && (
                                                                        <Text style={{ fontSize: 14, lineHeight: 1.6 }}>
                                                                            {review.comment}
                                                                        </Text>
                                                                    )}
                                                                    {review.reviewed_at && (
                                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                                            {new Date(review.reviewed_at).toLocaleDateString('vi-VN', {
                                                                                year: 'numeric',
                                                                                month: 'long',
                                                                                day: 'numeric'
                                                                            })}
                                                                        </Text>
                                                                    )}
                                                                </Space>
                                                            }
                                                        />
                                                    </List.Item>
                                                )}
                                            />
                                            {totalReviews > reviewsPageSize && (
                                                <div style={{ marginTop: 16, textAlign: 'center' }}>
                                                    <Pagination
                                                        current={reviewsPage}
                                                        total={totalReviews}
                                                        pageSize={reviewsPageSize}
                                                        showSizeChanger
                                                        showQuickJumper
                                                        showTotal={(total) => `${total} đánh giá`}
                                                        onChange={(page, size) => {
                                                            setReviewsPage(page);
                                                            if (size) setReviewsPageSize(size);
                                                        }}
                                                        onShowSizeChange={(_, size) => {
                                                            setReviewsPage(1);
                                                            setReviewsPageSize(size);
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <Text type="secondary" style={{ textAlign: 'center', display: 'block', padding: '20px' }}>
                                            Chưa có đánh giá nào
                                        </Text>
                                    )}
                                </Card>
                            </Space>
                        </Col>

                        {/* Cột phải: Form đặt phòng */}
                        <Col xs={24} lg={8}>
                            <Card
                                title="Đặt phòng"
                                bordered={false}
                                style={{ 
                                    position: 'sticky', 
                                    top: 20,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
                                }}
                            >
                                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                        {/* Giá */}
                                        <div>
                                            <Text style={{ fontSize: 28, color: '#cb8670', fontWeight: 'bold' }}>
                                                {formatVNDWithUnit(currentRoom.price_per_night, '/đêm')}
                                            </Text>
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
                                                value={effectiveDateRange}
                                                onChange={handleDateChange}
                                                disabledDate={disabledDate}
                                                placeholder={['Nhận phòng', 'Trả phòng']}
                                                allowClear
                                            />
                                        </div>

                                        {/* Thông tin số khách */}
                                        {currentRoom && (
                                            <div style={{ 
                                                padding: '12px', 
                                                background: '#f5f5f5', 
                                                borderRadius: 8,
                                                border: '1px solid #e8e8e8'
                                            }}>
                                                <Text strong style={{ display: 'block', marginBottom: 12 }}>
                                                    <UserOutlined /> Thông tin số khách
                                                </Text>
                                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                    <Row justify="space-between">
                                                        <Col>
                                                            <Text type="secondary">Người lớn tối đa:</Text>
                                                        </Col>
                                                        <Col>
                                                            <Text strong>{currentRoom.max_adults} người</Text>
                                                        </Col>
                                                    </Row>
                                                    <Row justify="space-between">
                                                        <Col>
                                                            <Text type="secondary">Trẻ em tối đa:</Text>
                                                        </Col>
                                                        <Col>
                                                            <Text strong>{currentRoom.max_children} trẻ</Text>
                                                        </Col>
                                                    </Row>
                                                    <Divider style={{ margin: '8px 0' }} />
                                                    <Row justify="space-between">
                                                        <Col>
                                                            <Text strong>Tổng sức chứa:</Text>
                                                        </Col>
                                                        <Col>
                                                            <Text strong style={{ color: '#cb8670', fontSize: 16 }}>
                                                                {currentRoom.max_adults + currentRoom.max_children} người
                                                            </Text>
                                                        </Col>
                                                    </Row>
                                                </Space>
                                            </div>
                                        )}

                                        <Divider style={{ margin: '8px 0' }} />

                                        {/* Tổng tiền */}
                                        <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: 8 }}>
                                            {effectiveDateRange && effectiveDateRange[0] && effectiveDateRange[1] && (
                                                <>
                                                    <Row justify="space-between" style={{ marginBottom: 8 }}>
                                                        <Col>
                                                            <Text type="secondary">
                                                                {effectiveDateRange[1].diff(effectiveDateRange[0], 'day')} đêm × {formatVND(currentRoom?.price_per_night || 0)}
                                                            </Text>
                                                        </Col>
                                                        <Col>
                                                            <Text>
                                                                {formatVND((currentRoom?.price_per_night || 0) * effectiveDateRange[1].diff(effectiveDateRange[0], 'day'))}
                                                            </Text>
                                                        </Col>
                                                    </Row>
                                                </>
                                            )}
                                            <Divider style={{ margin: '8px 0' }} />
                                            <Row justify="space-between" align="middle">
                                                <Col>
                                                    <Text strong style={{ fontSize: 16 }}>Tổng cộng:</Text>
                                                </Col>
                                                <Col>
                                                    <Text style={{ fontSize: 24, color: '#cb8670', fontWeight: 'bold' }}>
                                                        {formatVND(totalPrice)}
                                                    </Text>
                                                </Col>
                                            </Row>
                                        </div>

                                        {/* Nút đặt phòng */}
                                        <Button
                                            type="primary"
                                            size="large"
                                            block
                                            onClick={handleAddToCart}
                                            loading={addingToCart}
                                            disabled={!effectiveDateRange || !effectiveDateRange[0] || !effectiveDateRange[1] || isInCart(currentRoom?.id || 0) || addingToCart}
                                            style={{
                                                backgroundColor: isInCart(currentRoom?.id || 0) ? '#52c41a' : '#cb8670',
                                                borderColor: isInCart(currentRoom?.id || 0) ? '#52c41a' : '#cb8670',
                                                height: 50,
                                                fontSize: 16,
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {addingToCart ? 'Đang kiểm tra...' : isInCart(currentRoom?.id || 0) ? 'Đã thêm vào booking cart' : 'Thêm vào booking cart'}
                                        </Button>

                                        <Text type="secondary" style={{ fontSize: 12, textAlign: 'center', display: 'block' }}>
                                            {isInCart(currentRoom?.id || 0) 
                                                ? 'Phòng này đã có trong booking cart của bạn' 
                                                : 'Bạn có thể thêm nhiều phòng vào booking cart và đặt cùng lúc'}
                                        </Text>
                                    </Space>
                                </Card>
                        </Col>
                    </Row>

                    {/* Phòng tương tự */}
                    <Divider style={{ margin: '60px 0 40px' }} />
                    <div>
                        <Title level={3} style={{ marginBottom: 24, textAlign: 'center' }}>
                            Phòng tương tự
                        </Title>
                        <Row gutter={[24, 24]}>
                            {similarRooms.length > 0 ? (
                                similarRooms.map((room) => {
                                    const similarImages = getGalleryImages(room);
                                    const similarLocation = getRoomLocation(room);
                                    const similarRating = room.rating || 0;
                                    
                                    return (
                                        <Col xs={24} sm={12} lg={8} key={room.id}>
                                            <Card
                                                hoverable
                                                cover={
                                                    <div style={{ height: 220, overflow: 'hidden' }}>
                                                        <Image
                                                            alt={room.name}
                                                            src={similarImages[0] || "/img/bg-img/1.jpg"}
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
                                                                <Rate disabled defaultValue={similarRating} allowHalf style={{ fontSize: 14 }} />
                                                                <Text type="secondary" style={{ fontSize: 12 }}>({similarRating.toFixed(1)})</Text>
                                                            </Space>
                                                        </Space>
                                                    }
                                                    description={
                                                        <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: 12 }}>
                                                            <div>
                                                                <Space>
                                                                    <EnvironmentOutlined style={{ color: '#cb8670' }} />
                                                                    <Text type="secondary" style={{ fontSize: 13 }}>{similarLocation}</Text>
                                                                </Space>
                                                            </div>
                                                            <Paragraph
                                                                ellipsis={{ rows: 2 }}
                                                                style={{ marginBottom: 12, fontSize: 13 }}
                                                            >
                                                                {room.description || "Phòng đẹp, tiện nghi đầy đủ"}
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
                                                                        {formatVNDWithUnit(room.price_per_night, '/đêm')}
                                                                    </Text>
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
                                    );
                                })
                            ) : (
                                <Col span={24}>
                                    <Text type="secondary">Không có phòng tương tự</Text>
                                </Col>
                            )}
                        </Row>
                    </div>
                </div>
            </Content>

            {/* Modal đăng nhập/đăng ký */}
            <LoginModal
                open={isLoginModalVisible}
                onClose={() => setIsLoginModalVisible(false)}
                onSwitchToRegister={() => {
                    setIsLoginModalVisible(false);
                    setIsRegisterModalVisible(true);
                }}
            />
            <RegisterModal
                open={isRegisterModalVisible}
                onClose={() => setIsRegisterModalVisible(false)}
                onSwitchToLogin={() => {
                    setIsRegisterModalVisible(false);
                    setIsLoginModalVisible(true);
                }}
            />

            {/* Modal viết đánh giá */}
            <Modal
                title="Viết đánh giá"
                open={reviewModalVisible}
                onCancel={() => {
                    setReviewModalVisible(false);
                    reviewForm.resetFields();
                }}
                onOk={handleSubmitReview}
                confirmLoading={submittingReview}
                okText="Gửi đánh giá"
                cancelText="Hủy"
                width={600}
            >
                <Form
                    form={reviewForm}
                    layout="vertical"
                    initialValues={{
                        rating: 5,
                    }}
                >
                    <Form.Item
                        name="rating"
                        label="Đánh giá"
                        rules={[{ required: true, message: 'Vui lòng chọn điểm đánh giá' }]}
                    >
                        <Rate />
                    </Form.Item>

                    <Form.Item
                        name="title"
                        label="Tiêu đề"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tiêu đề đánh giá' },
                            { max: 100, message: 'Tiêu đề không được vượt quá 100 ký tự' }
                        ]}
                    >
                        <AntdInput placeholder="Nhập tiêu đề đánh giá" />
                    </Form.Item>

                    <Form.Item
                        name="comment"
                        label="Nội dung đánh giá"
                        rules={[
                            { max: 2000, message: 'Nội dung không được vượt quá 2000 ký tự' }
                        ]}
                    >
                        <AntdInput.TextArea
                            rows={6}
                            placeholder="Chia sẻ trải nghiệm của bạn về phòng này..."
                            showCount
                            maxLength={2000}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default RoomDetailPage;
