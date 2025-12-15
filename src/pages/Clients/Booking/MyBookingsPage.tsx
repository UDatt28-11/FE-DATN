import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Layout,
    Card,
    Row,
    Col,
    Typography,
    Tag,
    Button,
    Space,
    Empty,
    Image,
    Divider,
    Modal,
    Descriptions,
    Tabs,
    Spin,
    App,
    Popconfirm,
} from 'antd';
import {
    CalendarOutlined,
    UserOutlined,
    HomeOutlined,
    PhoneOutlined,
    MailOutlined,
    IdcardOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    ArrowLeftOutlined,
    LoginOutlined,
    LogoutOutlined,
    DollarOutlined,
    FileTextOutlined,
    RedoOutlined,
    ShoppingOutlined,
    StarOutlined,
    AppstoreOutlined,
} from '@ant-design/icons';
import { getUserBookings, getUserBooking, getUserInvoices, cancelUserBooking, getUserBookingCounts } from '../../../service/bookingService';
import type { BookingOrder, BookingDetail } from '../../../types/booking/booking';
import { formatVND } from '../../../utils/currency';
import { useAuth } from '../../../context/AuthContext';
import PaymentModal from '../../../components/Booking/PaymentModal';
import ViewInvoiceModal from '../../../components/Booking/ViewInvoiceModal';
import RequestServiceModal from '../../../components/Booking/RequestServiceModal';
import RequestAmenityModal from '../../../components/Booking/RequestAmenityModal';
import ReviewModal from '../../../components/Booking/ReviewModal';
import CancelBookingModal from '../../../components/Booking/CancelBookingModal';
import ChangeDateModal from '../../../components/Booking/ChangeDateModal';
import { message } from 'antd';
import './MyBookings.css';

const { Content } = Layout;
const { Title, Text } = Typography;

// Helper function để format date từ API
const formatDate = (dateString?: string | null): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    } catch {
        return dateString;
    }
};

// Helper function để format datetime
const formatDateTime = (dateString?: string | null): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN');
    } catch {
        return dateString;
    }
};

// Helper function để tính số đêm
const calculateNights = (checkIn?: string | null, checkOut?: string | null): number => {
    if (!checkIn || !checkOut) return 0;
    try {
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const diffTime = checkOutDate.getTime() - checkInDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    } catch {
        return 0;
    }
};

// Helper function để lấy ảnh phòng từ booking (từ roomType)
const getRoomImage = (booking: BookingOrder): string => {
    if (booking.details && booking.details.length > 0) {
        const firstDetail = booking.details[0];
        // Lấy images từ roomType thay vì room
        const roomType = (firstDetail.room as any)?.roomType;
        if (roomType?.images && Array.isArray(roomType.images) && roomType.images.length > 0) {
            const primaryImage = roomType.images.find((img: any) => img.is_primary);
            if (primaryImage?.image_url) return primaryImage.image_url;
            if (roomType.images[0]?.image_url) return roomType.images[0].image_url;
        }
        // Fallback: nếu vẫn có images trong room (backward compatibility)
        const roomImages = (firstDetail.room as any)?.images;
        if (roomImages && Array.isArray(roomImages) && roomImages.length > 0) {
            const primaryImage = roomImages.find((img: any) => img.is_primary);
            if (primaryImage?.image_url) return primaryImage.image_url;
            if (roomImages[0]?.image_url) return roomImages[0].image_url;
        }
    }
    return '/img/bg-img/1.jpg'; // Fallback
};

// Helper function để lấy tên phòng
const getRoomName = (booking: BookingOrder): string => {
    if (booking.details && booking.details.length > 0) {
        const firstDetail = booking.details[0];
        const roomName = firstDetail.room?.name || firstDetail.room_name || 'Phòng';
        
        // Nếu có nhiều hơn 1 phòng, hiển thị số lượng
        if (booking.details.length > 1) {
            return `${roomName} và ${booking.details.length - 1} phòng khác`;
        }
        
        return roomName;
    }
    return 'N/A';
};

// Helper function để lấy tổng số khách
const getTotalGuests = (booking: BookingOrder): { adults: number; children: number } => {
    if (booking.details && booking.details.length > 0) {
        const totalAdults = booking.details.reduce((sum, detail) => sum + (detail.num_adults || 0), 0);
        const totalChildren = booking.details.reduce((sum, detail) => sum + (detail.num_children || 0), 0);
        return { adults: totalAdults, children: totalChildren };
    }
    return { adults: 0, children: 0 };
};

// Helper function để lấy room_id từ booking
const getRoomId = (booking: BookingOrder): number | null => {
    if (booking.details && booking.details.length > 0) {
        const firstDetail = booking.details[0];
        if (firstDetail.room?.id) return firstDetail.room.id;
        if (firstDetail.room_id) return firstDetail.room_id;
    }
    return null;
};

const MyBookingsPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useAuth();
    const { message } = App.useApp();
    const [bookings, setBookings] = useState<BookingOrder[]>([]);
    const [allBookings, setAllBookings] = useState<BookingOrder[]>([]); // Lưu tất cả bookings để tính số lượng
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedBooking, setSelectedBooking] = useState<BookingOrder | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [detailLoading, setDetailLoading] = useState<boolean>(false);
    
    // Đọc tab từ URL query params, mặc định là 'booked'
    const tabFromUrl = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState<string>(tabFromUrl || 'booked');
    
    // Cập nhật activeTab khi URL thay đổi
    useEffect(() => {
        if (tabFromUrl) {
            setActiveTab(tabFromUrl);
        }
    }, [tabFromUrl]);

    // Handler để thay đổi tab và cập nhật URL
    const handleTabChange = (key: string) => {
        setActiveTab(key);
        const newSearchParams = new URLSearchParams(searchParams);
        if (key === 'booked') {
            // Xóa tab param nếu là tab mặc định
            newSearchParams.delete('tab');
        } else {
            newSearchParams.set('tab', key);
        }
        setSearchParams(newSearchParams, { replace: true });
    };
    const [bookingCounts, setBookingCounts] = useState<{
        all: number;
        active: number;
        pending: number;
        confirmed: number;
        checked_in: number;
        partially_checked_in: number;
        checked_out: number;
        partially_checked_out: number;
        completed: number;
        cancelled: number;
    }>({
        all: 0,
        active: 0,
        pending: 0,
        confirmed: 0,
        checked_in: 0,
        partially_checked_in: 0,
        checked_out: 0,
        partially_checked_out: 0,
        completed: 0,
        cancelled: 0,
    });
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [paymentInvoiceId, setPaymentInvoiceId] = useState<number | null>(null);
    const [paymentTotalAmount, setPaymentTotalAmount] = useState<number>(0);
    const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
    const [requestServiceModalVisible, setRequestServiceModalVisible] = useState(false);
    const [requestServiceBooking, setRequestServiceBooking] = useState<BookingOrder | null>(null);
    const [requestServiceDetail, setRequestServiceDetail] = useState<BookingDetail | null>(null);
    const [requestAmenityModalVisible, setRequestAmenityModalVisible] = useState(false);
    const [requestAmenityBooking, setRequestAmenityBooking] = useState<BookingOrder | null>(null);
    const [requestAmenityDetail, setRequestAmenityDetail] = useState<BookingDetail | null>(null);
    const [viewInvoiceId, setViewInvoiceId] = useState<number | null>(null);
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [reviewBookingDetail, setReviewBookingDetail] = useState<BookingDetail | null>(null);
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [cancelBookingId, setCancelBookingId] = useState<number | null>(null);
    const [cancelBookingCode, setCancelBookingCode] = useState<string | undefined>(undefined);
    const [changeDateModalVisible, setChangeDateModalVisible] = useState(false);
    const [changeDateBooking, setChangeDateBooking] = useState<BookingOrder | null>(null);

    // Fetch booking counts
    const fetchBookingCounts = async () => {
        if (!user) return;
        try {
            const counts = await getUserBookingCounts();
            setBookingCounts(counts);
        } catch (error: any) {
            console.error("MyBookingsPage - Error fetching booking counts:", error);
        }
    };

    // Fetch tất cả bookings để tính số lượng (không filter)
    const fetchAllBookingsForCount = async () => {
        if (!user) return;
        try {
            const response = await getUserBookings({
                page: 1,
                per_page: 1000, // Lấy tất cả để đếm
                sort: '-created_at',
                include: 'details,details.room,details.room.roomType,details.room.roomType.images,invoices,invoices.payments,invoices.invoiceItems,checkoutRequests',
            });
            setAllBookings(response.data || []);
        } catch (error: any) {
            console.error("MyBookingsPage - Error fetching all bookings for count:", error);
        }
    };

    // Fetch bookings function - tách ra để có thể gọi từ nhiều nơi
    const fetchBookings = async () => {
        if (!user) return;

        setLoading(true);
        try {
            // Map tab -> các trạng thái backend
            let statusFilter: string[] | undefined;
            if (activeTab === 'booked') {
                // ĐÃ ĐẶT: mọi đơn chưa check-in
                statusFilter = ['pending', 'confirmed'];
            } else if (activeTab === 'in_use') {
                // ĐANG DÙNG: đang check-in
                statusFilter = ['checked_in', 'partially_checked_in'];
            } else if (activeTab === 'pending_payment') {
                // CHỜ THANH TOÁN - Đã checkout nhưng chưa thanh toán đầy đủ
                statusFilter = ['checked_out', 'partially_checked_out'];
            } else if (activeTab === 'paid') {
                // ĐÃ THANH TOÁN - Đã thanh toán đầy đủ
                statusFilter = ['completed'];
            } else if (activeTab === 'cancelled') {
                statusFilter = ['cancelled'];
            } else if (activeTab === 'all') {
                statusFilter = undefined;
            } else {
                statusFilter = undefined;
            }

            const response = await getUserBookings({
                page: 1,
                per_page: 20, // Giảm từ 50 xuống 20 để tăng tốc độ
                status: statusFilter,
                sort: '-created_at',
                include: 'details,details.room,details.room.roomType,details.room.roomType.images,details.review,invoices,invoices.payments,invoices.invoiceItems,checkoutRequests', // Thêm checkoutRequests và reviews để kiểm tra trạng thái
            });

            setBookings(response.data || []);
        } catch (error: any) {
            console.error("MyBookingsPage - Error fetching bookings:", error);
            if (error.response?.status === 403) {
                const errorData = error.response?.data;
                const errorMessage = errorData?.message || "Bạn không có quyền truy cập.";
                if (errorData?.debug) {
                    console.error("403 Error Details:", errorData.debug);
                    message.error(`${errorMessage} (Role: ${errorData.debug.user_role}, Required: ${errorData.debug.required_roles?.join(', ')})`);
                } else {
                    message.error(errorMessage);
                }
            } else if (error.response?.status === 404) {
                message.error("Không tìm thấy route. Vui lòng kiểm tra lại server.");
            } else if (error.response?.status === 401) {
                message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            } else {
                message.error("Không thể tải danh sách đặt phòng. Vui lòng thử lại sau.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Fetch bookings từ API
    useEffect(() => {
        // Nếu chưa có user, không fetch
        if (!user) {
            console.log("MyBookingsPage: Chưa có user, chờ AuthContext load...");
            setLoading(false);
            return;
        }

        console.log("MyBookingsPage: Bắt đầu fetch bookings cho user:", {
            id: user.id,
            role: user.role,
            email: user.email,
        });

        fetchBookingCounts();
        fetchBookings();
        fetchAllBookingsForCount(); // Fetch tất cả để tính số lượng
    }, [user, activeTab]);

    const getStatusConfig = (status: BookingOrder['status']) => {
        const configs: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
            pending: {
                color: 'gold',
                icon: <ClockCircleOutlined />,
                text: 'Chờ xác nhận',
            },
            confirmed: {
                color: 'green',
                icon: <CheckCircleOutlined />,
                text: 'Đã xác nhận',
            },
            cancelled: {
                color: 'red',
                icon: <CloseCircleOutlined />,
                text: 'Đã hủy',
            },
            completed: {
                color: 'blue',
                icon: <CheckCircleOutlined />,
                text: 'Hoàn thành',
            },
            checked_in: {
                color: 'cyan',
                icon: <CheckCircleOutlined />,
                text: 'Đã check-in',
            },
            partially_checked_in: {
                color: 'orange',
                icon: <ClockCircleOutlined />,
                text: 'Đã check-in một phần',
            },
            checked_out: {
                color: 'purple',
                icon: <LogoutOutlined />,
                text: 'Đã check-out',
            },
            partially_checked_out: {
                color: 'orange',
                icon: <LogoutOutlined />,
                text: 'Đã check-out một phần',
            },
        };
        // Fallback nếu status không hợp lệ
        return configs[status || 'pending'] || {
            color: 'default',
            icon: <ClockCircleOutlined />,
            text: status || 'Không xác định',
        };
    };


    const handleViewDetail = async (booking: BookingOrder) => {
        setDetailModalVisible(true);
        setDetailLoading(true);
        try {
            // Fetch full booking details
            const fullBooking = await getUserBooking(booking.id, 'details,details.room,details.room.property,details.room.roomType,details.room.roomType.images,details.guests');
            setSelectedBooking(fullBooking);
        } catch (error: any) {
            console.error("Error fetching booking detail:", error);
            message.error("Không thể tải chi tiết đặt phòng.");
            // Fallback to basic booking info
            setSelectedBooking(booking);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleViewInvoice = async (booking: BookingOrder) => {
        try {
            // Lấy invoice của booking
            const invoices = await getUserInvoices();
            const bookingInvoice = invoices.data?.find((inv: any) => inv.booking_order_id === booking.id);
            
            if (bookingInvoice) {
                setViewInvoiceId(bookingInvoice.id);
                setInvoiceModalVisible(true);
            } else {
                message.info('Chưa có hóa đơn cho đơn đặt phòng này.');
            }
        } catch (error: any) {
            console.error('Error fetching invoice:', error);
            message.error('Không thể tải thông tin hóa đơn.');
        }
    };


    const handlePaymentSuccess = () => {
        fetchBookingCounts();
        fetchBookings();
        fetchAllBookingsForCount(); // Cập nhật số lượng
        setPaymentModalVisible(false);
        setPaymentInvoiceId(null);
        setPaymentTotalAmount(0);
        message.success('Thanh toán thành công!');
    };

    // Filter bookings dựa trên activeTab và payment_status
    const filteredBookings = React.useMemo(() => {
        if (activeTab === 'pending_payment') {
            // Chỉ hiển thị bookings đã checkout nhưng chưa thanh toán đầy đủ
            return bookings.filter(booking => {
                const isCheckedOut = booking.status === 'checked_out' || booking.status === 'partially_checked_out';
                const isNotFullyPaid = booking.payment_status !== 'paid';
                return isCheckedOut && isNotFullyPaid;
            });
        } else if (activeTab === 'paid') {
            // Chỉ hiển thị bookings đã thanh toán đầy đủ
            return bookings.filter(booking => {
                return booking.payment_status === 'paid' || booking.status === 'completed';
            });
        }
        return bookings; // Các tab khác giữ nguyên
    }, [bookings, activeTab]);

    // Tính số tiền còn phải thanh toán
    const calculateRemainingAmount = (booking: BookingOrder): number => {
        // Ưu tiên 1: Sử dụng remaining_amount từ backend nếu có (đã được tính sẵn)
        if (booking.remaining_amount !== undefined && booking.remaining_amount !== null) {
            return booking.remaining_amount;
        }
        
        // Ưu tiên 2: Nếu có invoice, tính dựa trên invoice
        if (booking.invoices && booking.invoices.length > 0) {
            const invoice = booking.invoices[0]; // Lấy invoice đầu tiên
            
            // Ưu tiên 2a: Sử dụng remaining_amount từ invoice nếu có
            if (invoice.remaining_amount !== undefined && invoice.remaining_amount !== null) {
                return invoice.remaining_amount;
            }
            
            // Ưu tiên 2b: Tính từ invoice.total_amount và payments
            // invoice.total_amount đã được tính = room_charge - deposit (vì deposit item có giá trị âm)
            // remaining_amount = invoice.total_amount - tổng payments thành công
            const invoiceTotal = invoice.total_amount || 0;
            
            // Tính tổng tiền đã thanh toán từ payments thành công
            const paidAmount = invoice.payments 
                ? invoice.payments
                    .filter((p: any) => p.status === 'success' || p.status === 'paid')
                    .reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
                : invoice.paid_amount || 0;
            
            // remaining_amount = invoice.total_amount - tổng payments
            return Math.max(0, invoiceTotal - paidAmount);
        }
        
        // Fallback: Nếu chưa có invoice, tính dựa trên booking
        const bookingTotal = booking.total_amount || 0;
        const bookingPaid = (booking as any).paid_amount || 0;
        return Math.max(0, bookingTotal - bookingPaid);
    };

    const renderBookingCard = (booking: BookingOrder) => {
        const statusConfig = getStatusConfig(booking.status);
        const roomName = getRoomName(booking);
        const roomImage = getRoomImage(booking);
        const checkIn = formatDate(booking.checkin_date || booking.details?.[0]?.check_in_date);
        const checkOut = formatDate(booking.checkout_date || booking.details?.[0]?.check_out_date);
        const nights = calculateNights(
            booking.checkin_date || booking.details?.[0]?.check_in_date,
            booking.checkout_date || booking.details?.[0]?.check_out_date
        );
        const guests = getTotalGuests(booking);
        const createdAt = formatDateTime(booking.created_at);
        
        // Lấy remaining_amount từ invoice nếu có, nếu không thì tính từ booking
        const remainingAmount = booking.invoices && booking.invoices.length > 0 && booking.invoices[0].remaining_amount !== undefined
            ? booking.invoices[0].remaining_amount
            : (booking.remaining_amount !== undefined ? booking.remaining_amount : calculateRemainingAmount(booking));

        return (
            <Card
                key={booking.id}
                className="booking-card"
                hoverable
                style={{ marginBottom: 24 }}
            >
                <Row gutter={[24, 24]}>
                    {/* Hình ảnh phòng */}
                    <Col xs={24} sm={8} md={6}>
                        <Image
                            src={roomImage}
                            alt={roomName}
                            style={{
                                width: '100%',
                                height: 180,
                                objectFit: 'cover',
                                borderRadius: 8,
                            }}
                            preview={false}
                        />
                    </Col>

                    {/* Thông tin đặt phòng */}
                    <Col xs={24} sm={16} md={18}>
                        <Row justify="space-between" align="top">
                            <Col>
                                <Space direction="vertical" size="small">
                                    <Title level={4} style={{ margin: 0 }}>
                                        {roomName}
                                    </Title>
                                    <Text type="secondary">
                                        Mã đặt phòng: <Text strong style={{ color: '#cb8670' }}>#{booking.code || booking.order_code}</Text>
                                    </Text>
                                    <Tag icon={statusConfig.icon} color={statusConfig.color}>
                                        {statusConfig.text}
                                    </Tag>
                                </Space>
                            </Col>
                        </Row>

                        <Divider style={{ margin: '16px 0' }} />

                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} md={8}>
                                <Space>
                                    <CalendarOutlined style={{ color: '#cb8670' }} />
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 12 }}>Nhận phòng</Text>
                                        <br />
                                        <Text strong>{checkIn}</Text>
                                    </div>
                                </Space>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Space>
                                    <CalendarOutlined style={{ color: '#cb8670' }} />
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 12 }}>Trả phòng</Text>
                                        <br />
                                        <Text strong>{checkOut}</Text>
                                    </div>
                                </Space>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Space>
                                    <UserOutlined style={{ color: '#cb8670' }} />
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 12 }}>Số khách</Text>
                                        <br />
                                        <Text strong>
                                            {guests.adults} người lớn
                                            {guests.children > 0 && `, ${guests.children} trẻ em`}
                                        </Text>
                                    </div>
                                </Space>
                            </Col>
                        </Row>

                        <Divider style={{ margin: '16px 0' }} />

                        <Row justify="space-between" align="middle">
                            <Col>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    Đặt lúc: {createdAt}
                                </Text>
                            </Col>
                            <Col>
                                <Space>
                                    <Button
                                        type="primary"
                                        icon={<EyeOutlined />}
                                        onClick={() => handleViewDetail(booking)}
                                        style={{
                                            backgroundColor: '#cb8670',
                                            borderColor: '#cb8670',
                                        }}
                                    >
                                        Xem chi tiết
                                    </Button>
                                    {(booking.status === 'checked_in' || booking.status === 'partially_checked_in') && (
                                        <>
                                            <Button
                                                type="default"
                                                icon={<ShoppingOutlined />}
                                                onClick={() => {
                                                    // Chọn booking detail đầu tiên hoặc cho user chọn
                                                    const firstDetail = booking.details?.[0];
                                                    if (firstDetail) {
                                                        setRequestServiceBooking(booking);
                                                        setRequestServiceDetail(firstDetail);
                                                        setRequestServiceModalVisible(true);
                                                    } else {
                                                        message.warning('Không tìm thấy thông tin phòng');
                                                    }
                                                }}
                                            >
                                                Yêu cầu dịch vụ
                                            </Button>
                                            <Button
                                                type="default"
                                                icon={<AppstoreOutlined />}
                                                onClick={() => {
                                                    const firstDetail = booking.details?.[0];
                                                    if (firstDetail) {
                                                        setRequestAmenityBooking(booking);
                                                        setRequestAmenityDetail(firstDetail);
                                                        setRequestAmenityModalVisible(true);
                                                    } else {
                                                        message.warning('Không tìm thấy thông tin phòng');
                                                    }
                                                }}
                                            >
                                                Yêu cầu tiện ích
                                            </Button>
                                        </>
                                    )}
                                    {(booking.status === 'checked_out' || booking.status === 'partially_checked_out' || booking.status === 'completed') && (
                                        <>
                                            <Button
                                                icon={<FileTextOutlined />}
                                                onClick={async () => {
                                                    try {
                                                        // Ưu tiên sử dụng invoice từ booking (đã được eager load)
                                                        let bookingInvoice = booking.invoices && booking.invoices.length > 0 
                                                            ? booking.invoices[0] 
                                                            : null;
                                                        
                                                        // Nếu không có trong booking, fetch từ API
                                                        if (!bookingInvoice) {
                                                            const invoices = await getUserInvoices();
                                                            bookingInvoice = invoices.data?.find((inv: any) => inv.booking_order_id === booking.id);
                                                        }
                                                        
                                                        if (bookingInvoice) {
                                                            setViewInvoiceId(bookingInvoice.id);
                                                            setInvoiceModalVisible(true);
                                                        } else {
                                                            message.info('Chưa có hóa đơn cho đơn đặt phòng này.');
                                                        }
                                                    } catch (error: any) {
                                                        console.error('Error fetching invoice:', error);
                                                        message.error('Không thể tải thông tin hóa đơn.');
                                                    }
                                                }}
                                            >
                                                Xem hóa đơn
                                            </Button>
                                            {/* Chỉ hiển thị nút "Thanh toán" nếu chưa thanh toán đầy đủ và chưa completed */}
                                            {booking.payment_status !== 'paid' && booking.status !== 'completed' && (() => {
                                                // Kiểm tra xem tất cả phòng đã checkout chưa
                                                const allRoomsCheckedOut = booking.details?.every(
                                                    (detail: BookingDetail) => detail.status === 'checked_out'
                                                ) ?? false;
                                                
                                                if (!allRoomsCheckedOut) {
                                                    return (
                                                        <Button
                                                            type="primary"
                                                            icon={<DollarOutlined />}
                                                            disabled
                                                            style={{
                                                                backgroundColor: '#f0f0f0',
                                                                borderColor: '#d9d9d9',
                                                                color: '#999',
                                                            }}
                                                            title="Vui lòng checkout tất cả phòng trước khi thanh toán"
                                                        >
                                                            Thanh toán
                                                        </Button>
                                                    );
                                                }
                                                
                                                return (
                                                    <Button
                                                        type="primary"
                                                        icon={<DollarOutlined />}
                                                        onClick={async () => {
                                                            try {
                                                                console.log('Payment button clicked for booking:', booking.id);
                                                                console.log('Booking invoices:', booking.invoices);
                                                                
                                                                // Ưu tiên sử dụng invoice từ booking (đã được eager load)
                                                                let bookingInvoice = booking.invoices && booking.invoices.length > 0 
                                                                    ? booking.invoices[0] 
                                                                    : null;
                                                                
                                                                console.log('Invoice from booking:', bookingInvoice);
                                                                
                                                                // Nếu không có trong booking, fetch từ API
                                                                if (!bookingInvoice) {
                                                                    console.log('Fetching invoices from API...');
                                                                    const invoices = await getUserInvoices();
                                                                    console.log('All invoices from API:', invoices);
                                                                    bookingInvoice = invoices.data?.find((inv: any) => inv.booking_order_id === booking.id);
                                                                    console.log('Found invoice:', bookingInvoice);
                                                                }
                                                                
                                                                if (!bookingInvoice) {
                                                                    console.warn('No invoice found for booking:', booking.id);
                                                                    message.warning('Chưa có hóa đơn cho đơn đặt phòng này. Vui lòng liên hệ admin.');
                                                                    return;
                                                                }
                                                                
                                                                // Cho phép thanh toán nếu invoice status là 'pending', 'sent', hoặc chưa được thanh toán đầy đủ
                                                                const invoiceStatus = bookingInvoice.status || bookingInvoice.invoice_status;
                                                                console.log('Invoice status:', invoiceStatus);
                                                                const canPay = invoiceStatus === 'pending' || 
                                                                               invoiceStatus === 'sent' ||
                                                                               (invoiceStatus !== 'paid' && invoiceStatus !== 'cancelled');
                                                                
                                                                console.log('Can pay:', canPay);
                                                                
                                                                if (canPay) {
                                                                    console.log('Opening payment modal with invoice ID:', bookingInvoice.id);
                                                                    setPaymentInvoiceId(bookingInvoice.id);
                                                                    setPaymentTotalAmount(bookingInvoice.total_amount || booking.total_amount || 0);
                                                                    setPaymentModalVisible(true);
                                                                    console.log('Payment modal should be visible now');
                                                                } else {
                                                                    if (invoiceStatus === 'paid') {
                                                                        message.info('Hóa đơn này đã được thanh toán.');
                                                                    } else if (invoiceStatus === 'cancelled') {
                                                                        message.warning('Hóa đơn này đã bị hủy.');
                                                                    } else {
                                                                        message.info(`Hóa đơn đang ở trạng thái: ${invoiceStatus}. Vui lòng liên hệ admin.`);
                                                                    }
                                                                }
                                                            } catch (error: any) {
                                                                console.error('Error processing payment:', error);
                                                                message.error('Không thể xử lý thanh toán. Vui lòng thử lại.');
                                                            }
                                                        }}
                                                        style={{
                                                            backgroundColor: '#52c41a',
                                                            borderColor: '#52c41a',
                                                        }}
                                                    >
                                                        Thanh toán
                                                    </Button>
                                                );
                                            })()}
                                            {/* Nút đánh giá/xem đánh giá cho các booking đã thanh toán */}
                                            {(booking.payment_status === 'paid' || booking.status === 'completed') && booking.details && booking.details.length > 0 && (
                                                <>
                                                    {booking.details.map((detail: BookingDetail) => {
                                                        const hasReview = detail.review && detail.review.id;
                                                        
                                                        if (hasReview) {
                                                            // Đã có review - hiển thị nút "Xem/Sửa đánh giá"
                                                            return (
                                                                <Button
                                                                    key={detail.id}
                                                                    icon={<EyeOutlined />}
                                                                    onClick={() => {
                                                                        setReviewBookingDetail(detail);
                                                                        setReviewModalVisible(true);
                                                                    }}
                                                                    style={{
                                                                        backgroundColor: '#1890ff',
                                                                        borderColor: '#1890ff',
                                                                        color: '#fff',
                                                                    }}
                                                                >
                                                                    Xem đánh giá phòng {detail.room?.name || ''}
                                                                </Button>
                                                            );
                                                        } else {
                                                            // Chưa có review - hiển thị nút "Đánh giá"
                                                            return (
                                                                <Button
                                                                    key={detail.id}
                                                                    icon={<StarOutlined />}
                                                                    onClick={() => {
                                                                        setReviewBookingDetail(detail);
                                                                        setReviewModalVisible(true);
                                                                    }}
                                                                    style={{
                                                                        backgroundColor: '#faad14',
                                                                        borderColor: '#faad14',
                                                                        color: '#fff',
                                                                    }}
                                                                >
                                                                    Đánh giá phòng {detail.room?.name || ''}
                                                                </Button>
                                                            );
                                                        }
                                                    })}
                                                </>
                                            )}
                                        </>
                                    )}
                                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                        <>
                                            {/* Nút đổi ngày - chỉ hiện nếu chưa dùng hết lượt */}
                                            {(booking.date_change_count ?? 0) < 1 && (
                                                <Button 
                                                    icon={<CalendarOutlined />}
                                                    onClick={() => {
                                                        setChangeDateBooking(booking);
                                                        setChangeDateModalVisible(true);
                                                    }}
                                                >
                                                    Đổi ngày
                                                </Button>
                                            )}
                                            <Button 
                                                danger
                                                onClick={() => {
                                                    setCancelBookingId(booking.id);
                                                    setCancelBookingCode(booking.code || booking.order_code);
                                                    setCancelModalVisible(true);
                                                }}
                                            >
                                                Hủy đặt phòng
                                            </Button>
                                        </>
                                    )}
                                    {booking.status === 'cancelled' && (
                                        <Button
                                            type="primary"
                                            icon={<RedoOutlined />}
                                            onClick={() => {
                                                const roomId = getRoomId(booking);
                                                if (roomId) {
                                                    navigate(`/rooms/${roomId}`);
                                                } else {
                                                    message.warning('Không tìm thấy thông tin phòng. Vui lòng chọn phòng từ danh sách.');
                                                    navigate('/rooms');
                                                }
                                            }}
                                            style={{
                                                backgroundColor: '#52c41a',
                                                borderColor: '#52c41a',
                                            }}
                                        >
                                            Đặt lại
                                        </Button>
                                    )}
                                </Space>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Card>
        );
    };

    return (
        <div className="my-bookings-page">
            {/* Breadcrumb */}
            <div className="breadcrumb-wrapper" style={{ padding: '20px 0', background: '#f5f5f5' }}>
                <div className="container">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(-1)}
                        size="large"
                    >
                        Trở về
                    </Button>
                </div>
            </div>

            <Content style={{ padding: '40px 0', minHeight: '70vh', background: '#fff' }}>
                <div className="container">
                    <Title level={2} style={{ marginBottom: 24 }}>
                        <HomeOutlined /> Đơn đặt phòng của tôi
                    </Title>

                    {/* Tabs lọc theo nhóm trạng thái thân thiện hơn */}
                    <Tabs
                        activeKey={activeTab}
                        onChange={handleTabChange}
                        style={{ marginBottom: 24 }}
                        items={[
                            {
                                key: 'booked',
                                label: `Đã đặt (${(bookingCounts.pending || 0) + (bookingCounts.confirmed || 0)})`,
                            },
                            {
                                key: 'in_use',
                                label: `Đang sử dụng (${(bookingCounts.checked_in || 0) + (bookingCounts.partially_checked_in || 0)})`,
                            },
                            {
                                key: 'pending_payment',
                                label: `Chờ thanh toán (${allBookings.filter(b => {
                                    const isCheckedOut = b.status === 'checked_out' || b.status === 'partially_checked_out';
                                    const isNotFullyPaid = b.payment_status !== 'paid';
                                    return isCheckedOut && isNotFullyPaid;
                                }).length})`,
                            },
                            {
                                key: 'paid',
                                label: `Đã thanh toán (${allBookings.filter(b => b.payment_status === 'paid' || b.status === 'completed').length})`,
                            },
                            {
                                key: 'cancelled',
                                label: `Đã hủy (${bookingCounts.cancelled || 0})`,
                            },
                            {
                                key: 'all',
                                label: `Tất cả (${bookingCounts.all || 0})`,
                            },
                        ]}
                    />

                    {/* Danh sách đơn đặt phòng */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px 0' }}>
                            <Spin size="large" />
                        </div>
                    ) : filteredBookings.length > 0 ? (
                        filteredBookings.map(renderBookingCard)
                    ) : (
                        <Empty
                            description="Chưa có đơn đặt phòng nào"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        >
                            <Button
                                type="primary"
                                onClick={() => navigate('/rooms')}
                                style={{
                                    backgroundColor: '#cb8670',
                                    borderColor: '#cb8670',
                                }}
                            >
                                Đặt phòng ngay
                            </Button>
                        </Empty>
                    )}
                </div>
            </Content>

            {/* Modal chi tiết đơn đặt phòng */}
            <Modal
                title={
                    <Space>
                        <HomeOutlined />
                        <span>Chi tiết đơn đặt phòng</span>
                    </Space>
                }
                open={detailModalVisible}
                onCancel={() => {
                    setDetailModalVisible(false);
                    setSelectedBooking(null);
                }}
                footer={[
                    <Button key="close" onClick={() => {
                        setDetailModalVisible(false);
                        setSelectedBooking(null);
                    }}>
                        Đóng
                    </Button>,
                    selectedBooking && (selectedBooking.status === 'pending' || selectedBooking.status === 'confirmed') && (
                        <Button 
                            key="cancel"
                            danger
                            onClick={() => {
                                if (!selectedBooking) return;
                                setCancelBookingId(selectedBooking.id);
                                setCancelBookingCode(selectedBooking.code || selectedBooking.order_code);
                                setDetailModalVisible(false);
                                setCancelModalVisible(true);
                            }}
                        >
                            Hủy đặt phòng
                        </Button>
                    ),
                    selectedBooking?.status === 'cancelled' && (
                        <Button
                            key="rebook"
                            type="primary"
                            icon={<RedoOutlined />}
                            onClick={() => {
                                if (!selectedBooking) return;
                                const roomId = getRoomId(selectedBooking);
                                setDetailModalVisible(false);
                                setSelectedBooking(null);
                                if (roomId) {
                                    navigate(`/rooms/${roomId}`);
                                } else {
                                    message.warning('Không tìm thấy thông tin phòng. Vui lòng chọn phòng từ danh sách.');
                                    navigate('/rooms');
                                }
                            }}
                            style={{
                                backgroundColor: '#52c41a',
                                borderColor: '#52c41a',
                            }}
                        >
                            Đặt lại
                        </Button>
                    ),
                    selectedBooking && (
                        <Button
                            key="view-invoice"
                            icon={<FileTextOutlined />}
                            onClick={async () => {
                                try {
                                    // Lấy invoice của booking hiện tại
                                    const invoices = await getUserInvoices();
                                    const bookingInvoice = invoices.data?.find((inv: any) => inv.booking_order_id === selectedBooking.id);

                                    if (bookingInvoice) {
                                        setViewInvoiceId(bookingInvoice.id);
                                        setInvoiceModalVisible(true);
                                    } else {
                                        message.info('Chưa có hóa đơn cho đơn đặt phòng này.');
                                    }
                                } catch (error: any) {
                                    console.error('Error fetching invoice:', error);
                                    message.error('Không thể tải thông tin hóa đơn.');
                                }
                            }}
                        >
                            Xem hóa đơn
                        </Button>
                    ),
                ]}
                width={700}
            >
                {detailLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <Spin size="large" />
                    </div>
                ) : selectedBooking ? (
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        {/* Mã đặt phòng và trạng thái */}
                        <div style={{ textAlign: 'center', padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
                            <Text type="secondary">Mã đặt phòng</Text>
                            <br />
                            <Title level={3} style={{ margin: '8px 0', color: '#cb8670' }}>
                                #{selectedBooking.code || selectedBooking.order_code}
                            </Title>
                            <Tag
                                icon={getStatusConfig(selectedBooking.status).icon}
                                color={getStatusConfig(selectedBooking.status).color}
                                style={{ fontSize: 14, padding: '4px 12px' }}
                            >
                                {getStatusConfig(selectedBooking.status).text}
                            </Tag>
                        </div>

                        {/* Thông tin phòng */}
                        <Descriptions title="Thông tin phòng" bordered column={1}>
                            {selectedBooking.details && selectedBooking.details.length > 0 ? (
                                selectedBooking.details.map((detail, index) => (
                                    <React.Fragment key={detail.id}>
                                        {index > 0 && <Divider />}
                                        <Descriptions.Item label="Phòng đã được gán" span={2}>
                                            <Space direction="vertical" size="small">
                                                <Text strong style={{ fontSize: 16 }}>
                                                    {detail.room?.name || detail.room_name || 'N/A'}
                                                </Text>
                                                {detail.room?.id && (
                                                    <Text type="secondary" style={{ fontSize: 13 }}>
                                                        Mã phòng: <Text strong>#{detail.room.id}</Text>
                                                    </Text>
                                                )}
                                                {detail.room?.roomType && (
                                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                                        Loại phòng: {detail.room.roomType.name}
                                                    </Text>
                                                )}
                                            </Space>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Ngày nhận phòng">
                                            {formatDate(detail.check_in_date)}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Ngày trả phòng">
                                            {formatDate(detail.check_out_date)}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Số đêm">
                                            {calculateNights(detail.check_in_date, detail.check_out_date)} đêm
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Số khách">
                                            {detail.num_adults} người lớn
                                            {detail.num_children > 0 && `, ${detail.num_children} trẻ em`}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Giá phòng">
                                            {formatVND(detail.sub_total)}
                                        </Descriptions.Item>
                                    </React.Fragment>
                                ))
                            ) : (
                                <>
                                    <Descriptions.Item label="Tên phòng">
                                        <Text strong>{getRoomName(selectedBooking)}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ngày nhận phòng">
                                        {formatDate(selectedBooking.checkin_date)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ngày trả phòng">
                                        {formatDate(selectedBooking.checkout_date)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Số đêm">
                                        {calculateNights(selectedBooking.checkin_date, selectedBooking.checkout_date)} đêm
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Số khách">
                                        {getTotalGuests(selectedBooking).adults} người lớn
                                        {getTotalGuests(selectedBooking).children > 0 && `, ${getTotalGuests(selectedBooking).children} trẻ em`}
                                    </Descriptions.Item>
                                </>
                            )}
                        </Descriptions>

                        {/* Thông tin người đặt */}
                        <Descriptions title="Thông tin người đặt" bordered column={1}>
                            <Descriptions.Item label={<><UserOutlined /> Họ tên</>}>
                                {selectedBooking.customer_name || selectedBooking.guest?.full_name || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>}>
                                {selectedBooking.customer_phone || selectedBooking.guest?.phone_number || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label={<><MailOutlined /> Email</>}>
                                {selectedBooking.customer_email || selectedBooking.guest?.email || 'N/A'}
                            </Descriptions.Item>
                        </Descriptions>

                        {/* Thông tin thanh toán */}
                        <Descriptions title="Thông tin thanh toán" bordered column={1}>
                            <Descriptions.Item label="Phương thức thanh toán">
                                {selectedBooking.payment_method || 'Chưa xác định'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng tiền">
                                <Text strong style={{ fontSize: 18, color: '#cb8670' }}>
                                    {formatVND(selectedBooking.total_amount)}
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Thời gian đặt">
                                {formatDateTime(selectedBooking.created_at)}
                            </Descriptions.Item>
                            {selectedBooking.notes && (
                                <Descriptions.Item label="Ghi chú">
                                    {selectedBooking.notes}
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </Space>
                ) : null}
            </Modal>

            <PaymentModal
                open={paymentModalVisible}
                invoiceId={paymentInvoiceId}
                totalAmount={paymentTotalAmount}
                onCancel={() => {
                    setPaymentModalVisible(false);
                    setPaymentInvoiceId(null);
                    setPaymentTotalAmount(0);
                }}
                onSuccess={handlePaymentSuccess}
            />

            <ViewInvoiceModal
                open={invoiceModalVisible}
                invoiceId={viewInvoiceId}
                onCancel={() => {
                    setInvoiceModalVisible(false);
                    setViewInvoiceId(null);
                }}
            />

            <RequestServiceModal
                open={requestServiceModalVisible}
                booking={requestServiceBooking}
                bookingDetail={requestServiceDetail}
                onCancel={() => {
                    setRequestServiceModalVisible(false);
                    setRequestServiceBooking(null);
                    setRequestServiceDetail(null);
                }}
                onSuccess={() => {
                    // Refresh bookings sau khi yêu cầu dịch vụ thành công
                    fetchBookings();
                }}
            />

            <RequestAmenityModal
                open={requestAmenityModalVisible}
                booking={requestAmenityBooking}
                bookingDetail={requestAmenityDetail}
                onCancel={() => {
                    setRequestAmenityModalVisible(false);
                    setRequestAmenityBooking(null);
                    setRequestAmenityDetail(null);
                }}
                onSuccess={() => {
                    // Refresh bookings sau khi yêu cầu tiện ích thành công
                    fetchBookings();
                }}
            />

            <ReviewModal
                open={reviewModalVisible}
                bookingDetail={reviewBookingDetail}
                mode={reviewBookingDetail?.review ? 'view' : 'create'}
                reviewId={reviewBookingDetail?.review?.id || null}
                onCancel={() => {
                    setReviewModalVisible(false);
                    setReviewBookingDetail(null);
                }}
                onSuccess={() => {
                    // Refresh bookings sau khi đánh giá thành công
                    fetchBookings();
                    fetchAllBookingsForCount();
                }}
            />

            <CancelBookingModal
                open={cancelModalVisible}
                bookingId={cancelBookingId}
                bookingCode={cancelBookingCode}
                onCancel={() => {
                    setCancelModalVisible(false);
                    setCancelBookingId(null);
                    setCancelBookingCode(undefined);
                }}
                onSuccess={(successMessage) => {
                    message.success(successMessage);
                    setCancelModalVisible(false);
                    setCancelBookingId(null);
                    setCancelBookingCode(undefined);
                    setSelectedBooking(null);
                    // Refresh danh sách & counters
                    fetchBookingCounts();
                    fetchBookings();
                    fetchAllBookingsForCount();
                }}
            />

            <ChangeDateModal
                open={changeDateModalVisible}
                bookingId={changeDateBooking?.id || null}
                bookingCode={changeDateBooking?.code || changeDateBooking?.order_code}
                currentCheckIn={changeDateBooking?.checkin_date}
                currentCheckOut={changeDateBooking?.checkout_date}
                dateChangeCount={changeDateBooking?.date_change_count ?? 0}
                onCancel={() => {
                    setChangeDateModalVisible(false);
                    setChangeDateBooking(null);
                }}
                onSuccess={(successMessage) => {
                    message.success(successMessage);
                    setChangeDateModalVisible(false);
                    setChangeDateBooking(null);
                    // Refresh danh sách & counters
                    fetchBookingCounts();
                    fetchBookings();
                    fetchAllBookingsForCount();
                }}
            />
        </div>
    );
};

export default MyBookingsPage;
