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
    List,
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
    StarOutlined,
} from '@ant-design/icons';
import { getUserBookings, getUserBooking, getUserInvoices, cancelUserBooking, getUserBookingCounts } from '../../../service/bookingService';
import type { BookingOrder, BookingDetail } from '../../../types/booking/booking';
import { formatVND } from '../../../utils/currency';
import { useAuth } from '../../../context/AuthContext';
import PaymentModal from '../../../components/Booking/PaymentModal';
import ViewInvoiceModal from '../../../components/Booking/ViewInvoiceModal';
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
    const [viewInvoiceId, setViewInvoiceId] = useState<number | null>(null);
    const [bookingInvoices, setBookingInvoices] = useState<any[]>([]);
    const [selectInvoiceModalVisible, setSelectInvoiceModalVisible] = useState(false);
    const [invoicesForSelection, setInvoicesForSelection] = useState<any[]>([]);
    const [invoiceSelectionMode, setInvoiceSelectionMode] = useState<'view' | 'pay'>('view');
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [reviewBookingDetail, setReviewBookingDetail] = useState<BookingDetail | null>(null);
    const [selectRoomForReviewModalVisible, setSelectRoomForReviewModalVisible] = useState(false);
    const [selectedBookingForReview, setSelectedBookingForReview] = useState<BookingOrder | null>(null);
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
                include: 'details,details.room,details.room.roomType,details.room.roomType.images,invoices,invoices.payments,invoices.invoiceItems,invoices.splitFrom,invoices.splitFrom.bookingDetail,checkoutRequests',
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
                // CHỜ THANH TOÁN - CHỈ fetch checked_out, partially_checked_out, và completed (nếu còn hóa đơn chưa thanh toán)
                // checked_out và partially_checked_out LUÔN ở tab này và LUÔN có nút thanh toán
                statusFilter = ['checked_out', 'partially_checked_out', 'completed'];
            } else if (activeTab === 'paid') {
                // ĐÃ THANH TOÁN - CHỈ fetch completed (đã hoàn thành và đã thanh toán đầy đủ)
                // KHÔNG fetch checked_out và partially_checked_out vì chúng LUÔN ở tab "Chờ thanh toán"
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
                include: 'details,details.room,details.room.roomType,details.room.roomType.images,details.review,details.bookingServices,details.bookingServices.service,invoices,invoices.payments,invoices.invoiceItems,invoices.splitFrom,invoices.splitFrom.bookingDetail,checkoutRequests', // Thêm bookingServices và splitFrom để hiển thị dịch vụ đang sử dụng và kiểm tra invoice đã tách
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
            const fullBooking = await getUserBooking(booking.id, 'details,details.room,details.room.property,details.room.roomType,details.room.roomType.images,details.guests,details.bookingServices,details.bookingServices.service');
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
            // Lấy tất cả hóa đơn của user và lọc theo booking_order_id
            const invoicesRes = await getUserInvoices();
            const invoicesForBooking = (invoicesRes.data || []).filter(
                (inv: any) => inv.booking_order_id === booking.id
            );

            if (!invoicesForBooking.length) {
                message.info('Chưa có hóa đơn cho đơn đặt phòng này.');
                return;
            }

            if (invoicesForBooking.length === 1) {
                // Chỉ có 1 hóa đơn -> mở trực tiếp
                setViewInvoiceId(invoicesForBooking[0].id);
                setInvoiceModalVisible(true);
                return;
            }

            // Có nhiều hơn 1 hóa đơn (ví dụ sau khi tách hóa đơn theo phòng)
            // Hiển thị modal chọn hóa đơn
            setInvoicesForSelection(invoicesForBooking);
            setSelectInvoiceModalVisible(true);
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

    // Helper: chuẩn hóa invoices thành mảng
    const getInvoicesArray = (booking: BookingOrder): any[] => {
        const invoicesData: any = (booking as any).invoices;
        if (!invoicesData) return [];
        return Array.isArray(invoicesData) ? invoicesData : Object.values(invoicesData);
    };

    /**
     * Helper: Kiểm tra booking còn hóa đơn chưa thanh toán
     * 
     * Trả về true nếu:
     * - Có ít nhất 1 invoice với status: 'pending', 'partially_paid', hoặc 'sent'
     * - Đối với split invoices: chỉ tính nếu phòng đã checkout
     * 
     * Trả về false nếu:
     * - Không có invoice nào
     * - Tất cả invoices đã thanh toán đầy đủ (status: 'paid')
     */
    const hasUnpaidInvoices = React.useCallback((booking: BookingOrder): boolean => {
        const invoicesArray = getInvoicesArray(booking);
        if (!invoicesArray.length) {
            console.log('hasUnpaidInvoices: No invoices found for booking', booking.id);
            return false;
        }

        // Phân loại invoices: split invoices và invoice gốc
        const splitInvoices = invoicesArray.filter((inv: any) => inv.split_from || inv.splitFrom);
        const originalInvoices = invoicesArray.filter((inv: any) => !inv.split_from && !inv.splitFrom);

        console.log('hasUnpaidInvoices: Checking booking', booking.id, {
            total_invoices: invoicesArray.length,
            split_invoices: splitInvoices.length,
            original_invoices: originalInvoices.length,
            booking_status: booking.status,
            booking_details_count: booking.details?.length || 0,
        });

        // Nếu có split invoices và đơn có nhiều phòng
        if (splitInvoices.length > 0 && booking.details && booking.details.length > 1) {
            // Kiểm tra các split invoices có phòng đã checkout và còn pending
            const hasUnpaidSplitInvoice = splitInvoices.some((inv: any) => {
                const status = inv.payment_status || inv.status || inv.invoice_status;
                const splitFrom = inv.split_from || inv.splitFrom;
                
                let detailStatus: string | undefined;
                if (splitFrom) {
                    const bd = splitFrom.booking_detail || splitFrom.bookingDetail;
                    if (bd) {
                        detailStatus = bd.status;
                    }
                }
                const isDetailCheckedOut =
                    detailStatus === 'checked_out' ||
                    detailStatus === 'partially_checked_out' ||
                    detailStatus === 'completed';

                const isPayableStatus =
                    status === 'pending' ||
                    status === 'partially_paid' ||
                    status === 'sent';

                const result = isDetailCheckedOut && isPayableStatus;
                
                if (result) {
                    console.log('hasUnpaidInvoices: Found unpaid split invoice', {
                        invoice_id: inv.id,
                        invoice_status: status,
                        detail_status: detailStatus,
                    });
                }

                return result;
            });

            // Nếu có split invoice chưa thanh toán, trả về true
            if (hasUnpaidSplitInvoice) {
                console.log('hasUnpaidInvoices: Has unpaid split invoice - returning true');
                return true;
            }

            // Nếu không có split invoice chưa thanh toán, kiểm tra invoice gốc (nếu có)
            // Invoice gốc có thể còn pending nếu chưa được split hoàn toàn
            if (originalInvoices.length > 0) {
                const hasUnpaidOriginal = originalInvoices.some((inv: any) => {
                    const status = inv.payment_status || inv.status || inv.invoice_status;
                    const isPayable = (
                        status === 'pending' ||
                        status === 'partially_paid' ||
                        status === 'sent'
                    );
                    
                    if (isPayable) {
                        console.log('hasUnpaidInvoices: Found unpaid original invoice', {
                            invoice_id: inv.id,
                            invoice_status: status,
                        });
                    }
                    
                    return isPayable;
                });
                
                if (hasUnpaidOriginal) {
                    console.log('hasUnpaidInvoices: Has unpaid original invoice - returning true');
                    return true;
                }
            }

            console.log('hasUnpaidInvoices: No unpaid invoices found - returning false');
            return false;
        }

        // Đơn 1 phòng (không tách) hoặc chưa tách: bất kỳ invoice nào còn ở trạng thái chờ thanh toán
        const hasUnpaid = invoicesArray.some((inv: any) => {
            const status = inv.payment_status || inv.status || inv.invoice_status;
            const isPayable = (
                status === 'pending' ||
                status === 'partially_paid' ||
                status === 'sent'
            );
            
            if (isPayable) {
                console.log('hasUnpaidInvoices: Found unpaid invoice (single room)', {
                    invoice_id: inv.id,
                    invoice_status: status,
                });
            }
            
            return isPayable;
        });
        
        console.log('hasUnpaidInvoices: Single room check - returning', hasUnpaid);
        return hasUnpaid;
    }, []);

    /**
     * LOGIC PHÂN LOẠI BOOKING CHO TỪNG TAB:
     * 
     * 1. "ĐÃ ĐẶT" (booked):
     *    - Status: 'pending' hoặc 'confirmed'
     *    - Đã thanh toán cọc (payment_status: 'partial' hoặc 'paid', hoặc paid_amount > 0)
     *    - Chưa check-in (chưa có status 'checked_in' hoặc 'checked_out')
     *    - Không bị hủy
     * 
     * 2. "ĐANG SỬ DỤNG" (in_use):
     *    - Status: 'checked_in' hoặc 'partially_checked_in'
     *    - Đang ở trong phòng
     * 
     * 3. "CHỜ THANH TOÁN" (pending_payment):
     *    - Status: 'checked_out', 'partially_checked_out' (LUÔN ở đây, LUÔN có nút thanh toán)
     *    - Status: 'completed' (chỉ ở đây nếu còn hóa đơn chưa thanh toán)
     *    - Không bị hủy
     *    → Hiển thị nút "Thanh toán"
     * 
     * 4. "ĐÃ THANH TOÁN" (paid):
     *    - Status: 'completed' (CHỈ status này)
     *    - Không còn hóa đơn nào chưa thanh toán (hasUnpaidInvoices === false)
     *    - Không bị hủy
     *    → Hiển thị nút "Đánh giá"
     *    - KHÔNG bao gồm 'checked_out' và 'partially_checked_out' (chúng LUÔN ở tab "Chờ thanh toán")
     * 
     * 5. "ĐÃ HỦY" (cancelled):
     *    - Status: 'cancelled'
     */
    const filteredBookings = React.useMemo(() => {
        if (activeTab === 'booked') {
            // ĐÃ ĐẶT: CHỈ đơn chưa check-in (pending/confirmed), không bị hủy
            return bookings.filter((booking) => {
                // Loại trừ booking đã hủy
                if (booking.status === 'cancelled') return false;
                
                // CHỈ chấp nhận pending hoặc confirmed - LOẠI TRỪ tất cả status khác
                const isPendingOrConfirmed = booking.status === 'pending' || booking.status === 'confirmed';
                if (!isPendingOrConfirmed) {
                    // Log để debug nếu có booking không đúng status
                    console.warn('Booking filtered out from "booked" tab - wrong status:', {
                        booking_id: booking.id,
                        status: booking.status,
                        expected: ['pending', 'confirmed'],
                    });
                    return false;
                }
                
                // Đã thanh toán cọc (có thể partial hoặc paid) - không cần kiểm tra invoice vì đây là booking mới chưa checkout
                // Kiểm tra payment_status hoặc paid_amount > 0 để đảm bảo đã có thanh toán
                const hasPaidDeposit = (booking.payment_status === 'partial' || booking.payment_status === 'paid') || 
                                      (booking.paid_amount && booking.paid_amount > 0);
                return hasPaidDeposit;
            });
        } else if (activeTab === 'pending_payment') {
            // CHỜ THANH TOÁN: 
            // - checked_out và partially_checked_out LUÔN ở đây (không cần kiểm tra invoice)
            // - completed chỉ ở đây nếu còn hóa đơn chưa thanh toán
            return bookings.filter((booking) => {
                // Loại trừ booking đã hủy
                if (booking.status === 'cancelled') return false;
                
                // checked_out và partially_checked_out LUÔN ở tab này (LUÔN có nút thanh toán)
                if (booking.status === 'checked_out' || booking.status === 'partially_checked_out') {
                    return true;
                }
                
                // completed chỉ ở đây nếu còn hóa đơn chưa thanh toán
                if (booking.status === 'completed') {
                    const hasUnpaid = hasUnpaidInvoices(booking);
                    if (!hasUnpaid) {
                        console.warn('Booking filtered out from "pending_payment" tab - completed but no unpaid invoices:', {
                            booking_id: booking.id,
                            status: booking.status,
                        });
                    }
                    return hasUnpaid;
                }
                
                // Loại trừ tất cả status khác
                console.warn('Booking filtered out from "pending_payment" tab - wrong status:', {
                    booking_id: booking.id,
                    status: booking.status,
                    expected: ['checked_out', 'partially_checked_out', 'completed'],
                });
                return false;
            });
        } else if (activeTab === 'paid') {
            // ĐÃ THANH TOÁN: CHỈ completed và không còn hóa đơn nào chưa thanh toán, không bị hủy
            // KHÔNG bao gồm checked_out và partially_checked_out (chúng LUÔN ở tab "Chờ thanh toán")
            return bookings.filter((booking) => {
                // Loại trừ booking đã hủy
                if (booking.status === 'cancelled') return false;
                
                // CHỈ chấp nhận completed
                if (booking.status !== 'completed') {
                    console.warn('Booking filtered out from "paid" tab - wrong status:', {
                        booking_id: booking.id,
                        status: booking.status,
                        expected: ['completed'],
                    });
                    return false;
                }
                
                // PHẢI không còn hóa đơn nào chưa thanh toán
                const hasUnpaid = hasUnpaidInvoices(booking);
                if (hasUnpaid) {
                    console.warn('Booking filtered out from "paid" tab - completed but still has unpaid invoices:', {
                        booking_id: booking.id,
                        status: booking.status,
                    });
                }
                return !hasUnpaid;
            });
        } else if (activeTab === 'cancelled') {
            // ĐÃ HỦY: chỉ booking có status = cancelled
            return bookings.filter((booking) => booking.status === 'cancelled');
        }
        return bookings; // Các tab khác giữ nguyên
    }, [bookings, activeTab, hasUnpaidInvoices]);

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
                            <Col style={{ flexShrink: 0 }}>
                                {/* Nút Xem hóa đơn - hiển thị cho tất cả booking (sẽ kiểm tra invoice khi click) */}
                                <Button
                                    icon={<FileTextOutlined />}
                                    style={{ whiteSpace: 'nowrap' }}
                                    onClick={() => handleViewInvoice(booking)}
                                >
                                    Xem hóa đơn
                                </Button>
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
                                    {/* 
                                        NÚT "THANH TOÁN":
                                        - checked_out và partially_checked_out: LUÔN hiển thị nút (không cần kiểm tra invoice)
                                        - completed: chỉ hiển thị nếu còn hóa đơn chưa thanh toán
                                        - Booking này sẽ xuất hiện trong tab "Chờ thanh toán"
                                    */}
                                    {((booking.status === 'checked_out' || booking.status === 'partially_checked_out') ||
                                        (booking.status === 'completed' && hasUnpaidInvoices(booking))) && (
                                            <Button
                                                type="primary"
                                                icon={<DollarOutlined />}
                                                onClick={async () => {
                                                    try {
                                                        // Lấy tất cả hóa đơn của user và lọc theo booking_order_id
                                                        const invoicesRes = await getUserInvoices();
                                                        const invoicesForBooking = (invoicesRes.data || []).filter(
                                                            (inv: any) => inv.booking_order_id === booking.id
                                                        );

                                                        if (!invoicesForBooking.length) {
                                                            message.warning('Chưa có hóa đơn cho đơn đặt phòng này. Vui lòng liên hệ admin.');
                                                            return;
                                                        }

                                                        // Kiểm tra xem booking có hóa đơn tách theo phòng hay không
                                                        const hasSplitChild = invoicesForBooking.some((inv: any) => inv.split_from || inv.splitFrom);

                                                        let payableInvoices: any[] = [];

                                                        if (hasSplitChild && booking.details && booking.details.length > 1) {
                                                            // Đơn nhiều phòng đã tách hóa đơn:
                                                            // Chỉ cho phép thanh toán các hóa đơn PHÒNG (có split_from),
                                                            // đã duyệt checkout (booking_detail.status đã checkout) và đang ở trạng thái chờ thanh toán.
                                                            payableInvoices = invoicesForBooking.filter((inv: any) => {
                                                                const status = inv.payment_status || inv.status || inv.invoice_status;
                                                                const splitFrom = inv.split_from || inv.splitFrom;
                                                                const isSplitChild = !!splitFrom;

                                                                // Lấy trạng thái của booking_detail gắn với hóa đơn tách
                                                                let detailStatus: string | undefined;
                                                                if (splitFrom) {
                                                                    const bd = splitFrom.booking_detail || splitFrom.bookingDetail;
                                                                    if (bd) {
                                                                        detailStatus = bd.status;
                                                                    }
                                                                }
                                                                const isDetailCheckedOut =
                                                                    detailStatus === 'checked_out' ||
                                                                    detailStatus === 'partially_checked_out' ||
                                                                    detailStatus === 'completed';

                                                                const isPayableStatus =
                                                                    status === 'pending' ||
                                                                    status === 'partially_paid' ||
                                                                    status === 'sent';

                                                                // Chỉ cho phép thanh toán khi:
                                                                // - Là hóa đơn phòng (tách từ booking_detail)
                                                                // - Phòng đó đã checkout (detail.status)
                                                                // - Invoice đang chờ thanh toán
                                                                return isSplitChild && isDetailCheckedOut && isPayableStatus;
                                                            });
                                                        } else {
                                                            // Đơn 1 phòng (không tách) hoặc chưa tách: cho phép thanh toán hóa đơn thường
                                                            payableInvoices = invoicesForBooking.filter((inv: any) => {
                                                                const status = inv.payment_status || inv.status || inv.invoice_status;
                                                                return (
                                                                    status === 'pending' ||
                                                                    status === 'partially_paid' ||
                                                                    status === 'sent'
                                                                );
                                                            });
                                                        }

                                                        if (!payableInvoices.length) {
                                                            message.info('Không có hóa đơn nào đã duyệt checkout và cần thanh toán cho đơn này.');
                                                            return;
                                                        }

                                                        if (payableInvoices.length === 1) {
                                                            const inv = payableInvoices[0];
                                                            setPaymentInvoiceId(inv.id);
                                                            setPaymentTotalAmount(inv.total_amount || booking.total_amount || 0);
                                                            setPaymentModalVisible(true);
                                                            return;
                                                        }

                                                        // Có nhiều hóa đơn phòng (đã tách) → cho user chọn hóa đơn để thanh toán
                                                        setInvoicesForSelection(payableInvoices);
                                                        setInvoiceSelectionMode('pay');
                                                        setSelectInvoiceModalVisible(true);
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
                                        )}
                                    {/* 
                                        NÚT "ĐÁNH GIÁ" / "XEM ĐÁNH GIÁ":
                                        - CHỈ hiển thị khi booking có status 'completed'
                                        - VÀ không còn hóa đơn nào chưa thanh toán (hasUnpaidInvoices === false)
                                        - VÀ không bị hủy
                                        - Booking này sẽ xuất hiện trong tab "Đã thanh toán"
                                    */}
                                    {booking.status === 'completed'
                                        && !hasUnpaidInvoices(booking)
                                        && booking.status !== 'cancelled'
                                        && booking.details 
                                        && booking.details.length > 0 && (() => {
                                            // Kiểm tra xem có phòng nào đã đánh giá chưa
                                            const firstDetail = booking.details[0];
                                            // Kiểm tra cả review (số ít) và reviews (số nhiều) vì relationship là hasMany
                                            const review = firstDetail.review || (firstDetail.reviews && firstDetail.reviews.length > 0 ? firstDetail.reviews[0] : null);
                                            const hasReview = review && review.id;
                                            const roomTypeId = firstDetail.room?.roomType?.id || firstDetail.room?.room_type_id;
                                            
                                            // Nếu chỉ có 1 phòng và đã đánh giá: hiển thị nút "Xem đánh giá" và điều hướng
                                            if (booking.details.length === 1 && hasReview && roomTypeId) {
                                                return (
                                                    <Button
                                                        icon={<EyeOutlined />}
                                                        onClick={() => {
                                                            navigate(`/room-types/${roomTypeId}`);
                                                        }}
                                                        style={{
                                                            backgroundColor: '#1890ff',
                                                            borderColor: '#1890ff',
                                                            color: '#fff',
                                                        }}
                                                    >
                                                        Xem đánh giá
                                                    </Button>
                                                );
                                            }
                                            
                                            // Nếu chưa đánh giá hoặc có nhiều phòng: hiển thị nút "Đánh giá"
                                            return (
                                                <Button
                                                    icon={<StarOutlined />}
                                                    onClick={async () => {
                                                        // Nếu chỉ có 1 phòng: đánh giá luôn
                                                        if (booking.details && booking.details.length === 1) {
                                                            setReviewBookingDetail(booking.details[0]);
                                                            setReviewModalVisible(true);
                                                        } else {
                                                            // Nếu có nhiều phòng: fetch lại booking data mới nhất và mở modal chọn phòng
                                                            try {
                                                                const freshBooking = await getUserBooking(
                                                                    booking.id,
                                                                    'details,details.room,details.room.property,details.room.roomType,details.room.roomType.images,details.guests,details.bookingServices,details.bookingServices.service,details.review'
                                                                );
                                                                setSelectedBookingForReview(freshBooking);
                                                                setSelectRoomForReviewModalVisible(true);
                                                            } catch (error) {
                                                                console.error('Error fetching booking details:', error);
                                                                // Fallback: dùng booking data hiện tại
                                                                setSelectedBookingForReview(booking);
                                                                setSelectRoomForReviewModalVisible(true);
                                                            }
                                                        }
                                                    }}
                                                    style={{
                                                        backgroundColor: '#faad14',
                                                        borderColor: '#faad14',
                                                        color: '#fff',
                                                    }}
                                                >
                                                    {booking.details && booking.details.length > 1 
                                                        ? 'Đánh giá phòng' 
                                                        : 'Đánh giá'}
                                                </Button>
                                            );
                                        })()}
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

            <Content style={{ padding: '30px 0', minHeight: '70vh', background: '#fff' }}>
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
                                label: `Đã đặt (${allBookings.filter(b => {
                                    // Loại trừ booking đã hủy
                                    if (b.status === 'cancelled') return false;
                                    
                                    const isPendingOrConfirmed = b.status === 'pending' || b.status === 'confirmed';
                                    // Đã thanh toán cọc (có thể partial hoặc paid)
                                    const hasPaidDeposit = (b.payment_status === 'partial' || b.payment_status === 'paid') || 
                                                          (b.paid_amount && b.paid_amount > 0);
                                    return isPendingOrConfirmed && hasPaidDeposit;
                                }).length})`,
                            },
                            {
                                key: 'in_use',
                                label: `Đang sử dụng (${(bookingCounts.checked_in || 0) + (bookingCounts.partially_checked_in || 0)})`,
                            },
                            {
                                key: 'pending_payment',
                                label: `Chờ thanh toán (${allBookings.filter(b => {
                                    // Loại trừ booking đã hủy
                                    if (b.status === 'cancelled') return false;
                                    
                                    // checked_out và partially_checked_out LUÔN ở tab này (không cần kiểm tra invoice)
                                    if (b.status === 'checked_out' || b.status === 'partially_checked_out') {
                                        return true;
                                    }
                                    
                                    // completed chỉ ở đây nếu còn hóa đơn chưa thanh toán
                                    if (b.status === 'completed') {
                                        const hasUnpaid = hasUnpaidInvoices(b as any);
                                        return hasUnpaid;
                                    }
                                    
                                    return false;
                                }).length})`,
                            },
                            {
                                key: 'paid',
                                label: `Đã thanh toán (${allBookings.filter(b => {
                                    // Loại trừ booking đã hủy
                                    if (b.status === 'cancelled') return false;
                                    
                                    // CHỈ completed và không còn hóa đơn nào chưa thanh toán
                                    if (b.status !== 'completed') {
                                        return false;
                                    }
                                    
                                    // Không còn hóa đơn nào chưa thanh toán
                                    const hasUnpaid = hasUnpaidInvoices(b as any);
                                    return !hasUnpaid;
                                }).length})`,
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
                                        {/* Dịch vụ đang sử dụng */}
                                        {detail.booking_services && detail.booking_services.length > 0 && (
                                            <Descriptions.Item label="Dịch vụ đang sử dụng" span={2}>
                                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                    {detail.booking_services
                                                        .filter((bs: any) => bs.status === 'in_use')
                                                        .map((bs: any) => (
                                                            <Card key={bs.id} size="small" style={{ backgroundColor: '#e6f7ff', borderColor: '#1890ff' }}>
                                                                <Row justify="space-between" align="middle">
                                                                    <Col>
                                                                        <Space>
                                                                            <ShoppingOutlined style={{ color: '#1890ff' }} />
                                                                            <Text strong>{bs.service?.name || 'N/A'}</Text>
                                                                        </Space>
                                                                        {bs.notes && (
                                                                            <div style={{ marginTop: 4 }}>
                                                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                                                    {bs.notes}
                                                                                </Text>
                                                                            </div>
                                                                        )}
                                                                    </Col>
                                                                    <Col>
                                                                        <Tag color="processing">Đang sử dụng</Tag>
                                                                    </Col>
                                                                </Row>
                                                            </Card>
                                                        ))}
                                                    {detail.booking_services.filter((bs: any) => bs.status === 'in_use').length === 0 && (
                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                            Chưa có dịch vụ nào đang sử dụng
                                                        </Text>
                                                    )}
                                                </Space>
                                            </Descriptions.Item>
                                        )}
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

                        {/* Dịch vụ đang sử dụng (tổng hợp từ tất cả details) */}
                        {selectedBooking.details && selectedBooking.details.some((detail: any) => 
                            detail.booking_services && detail.booking_services.some((bs: any) => bs.status === 'in_use')
                        ) && (
                            <Descriptions title="Dịch vụ đang sử dụng" bordered column={1}>
                                {selectedBooking.details.map((detail: any) => {
                                    const inUseServices = detail.booking_services?.filter((bs: any) => bs.status === 'in_use') || [];
                                    if (inUseServices.length === 0) return null;
                                    
                                    return (
                                        <Descriptions.Item key={detail.id} label={`Phòng: ${detail.room?.name || 'N/A'}`} span={2}>
                                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                {inUseServices.map((bs: any) => (
                                                    <Card key={bs.id} size="small" style={{ backgroundColor: '#e6f7ff', borderColor: '#1890ff' }}>
                                                        <Row justify="space-between" align="middle">
                                                            <Col>
                                                                <Space>
                                                                    <ShoppingOutlined style={{ color: '#1890ff' }} />
                                                                    <Text strong>{bs.service?.name || 'N/A'}</Text>
                                                                    {bs.service && (
                                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                                            ({formatVND(bs.service.price)}/{bs.service.unit})
                                                                        </Text>
                                                                    )}
                                                                </Space>
                                                                {bs.notes && (
                                                                    <div style={{ marginTop: 4 }}>
                                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                                            {bs.notes}
                                                                        </Text>
                                                                    </div>
                                                                )}
                                                            </Col>
                                                            <Col>
                                                                <Tag color="processing">Đang sử dụng</Tag>
                                                            </Col>
                                                        </Row>
                                                    </Card>
                                                ))}
                                            </Space>
                                        </Descriptions.Item>
                                    );
                                })}
                            </Descriptions>
                        )}

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

            <ReviewModal
                open={reviewModalVisible}
                bookingDetail={reviewBookingDetail}
                mode={reviewBookingDetail?.review ? 'view' : 'create'}
                reviewId={reviewBookingDetail?.review?.id || null}
                onCancel={() => {
                    setReviewModalVisible(false);
                    setReviewBookingDetail(null);
                }}
                onSuccess={async () => {
                    // Refresh bookings sau khi đánh giá thành công
                    await fetchBookings();
                    await fetchAllBookingsForCount();
                    
                    // Nếu đang có modal chọn phòng mở, refresh lại booking data
                    if (selectedBookingForReview) {
                        try {
                            const updatedBooking = await getUserBooking(
                                selectedBookingForReview.id,
                                'details,details.room,details.room.property,details.room.roomType,details.room.roomType.images,details.guests,details.bookingServices,details.bookingServices.service,details.review'
                            );
                            setSelectedBookingForReview(updatedBooking);
                        } catch (error) {
                            console.error('Error refreshing booking for review modal:', error);
                        }
                    }
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

            {/* Modal chọn hóa đơn (dùng cho cả Xem hóa đơn & Thanh toán) */}
            <Modal
                title={invoiceSelectionMode === 'pay' ? 'Chọn hóa đơn cần thanh toán' : 'Chọn hóa đơn cần xem'}
                open={selectInvoiceModalVisible}
                onCancel={() => {
                    setSelectInvoiceModalVisible(false);
                    setInvoicesForSelection([]);
                }}
                footer={null}
                maskClosable={true}
                width={600}
            >
                <List
                    dataSource={invoicesForSelection}
                    renderItem={(inv: any) => {
                        // Kiểm tra cả snake_case và camelCase
                        const splitInvoices = inv.split_invoices || inv.splitInvoices || [];
                        const splitFrom = inv.split_from || inv.splitFrom;
                        const isOriginal = Array.isArray(splitInvoices) && splitInvoices.length > 0;
                        const isSplitChild = !!splitFrom;
                        
                        // Lấy tên phòng nếu là hóa đơn đã tách
                        let roomName = '';
                        if (isSplitChild && splitFrom) {
                            const bookingDetail = splitFrom.booking_detail || splitFrom.bookingDetail;
                            if (bookingDetail) {
                                const room = bookingDetail.room;
                                if (room) {
                                    roomName = room.name || '';
                                }
                            }
                        }
                        
                        const title = isOriginal
                            ? `Hóa đơn gốc (#${inv.id})`
                            : isSplitChild && roomName
                            ? `Hóa đơn phòng ${roomName} (#${inv.id})`
                            : isSplitChild
                            ? `Hóa đơn phòng (#${inv.id})`
                            : `Hóa đơn #${inv.id}`;

                        const description = isOriginal
                            ? 'Hóa đơn ban đầu trước khi tách'
                            : isSplitChild && roomName
                            ? `Hóa đơn đã tách cho phòng ${roomName}`
                            : isSplitChild
                            ? 'Hóa đơn đã tách theo phòng'
                            : 'Hóa đơn';

                        return (
                            <List.Item
                                style={{
                                    cursor: 'pointer',
                                    padding: '12px 16px',
                                    border: '1px solid #f0f0f0',
                                    borderRadius: 8,
                                    marginBottom: 8,
                                    transition: 'all 0.3s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                                    e.currentTarget.style.borderColor = '#cb8670';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.borderColor = '#f0f0f0';
                                }}
                                onClick={() => {
                                    if (invoiceSelectionMode === 'pay') {
                                        setPaymentInvoiceId(inv.id);
                                        setPaymentTotalAmount(inv.total_amount || 0);
                                        setSelectInvoiceModalVisible(false);
                                        setInvoicesForSelection([]);
                                        setPaymentModalVisible(true);
                                    } else {
                                        setViewInvoiceId(inv.id);
                                        setInvoiceModalVisible(true);
                                        setSelectInvoiceModalVisible(false);
                                        setInvoicesForSelection([]);
                                    }
                                }}
                            >
                                <List.Item.Meta
                                    title={
                                        <Space>
                                            <FileTextOutlined style={{ color: '#cb8670' }} />
                                            <Text strong style={{ fontSize: 16 }}>
                                                {title}
                                            </Text>
                                            {isOriginal && (
                                                <Tag color="orange">Gốc</Tag>
                                            )}
                                            {isSplitChild && (
                                                <Tag color="blue">Đã tách</Tag>
                                            )}
                                        </Space>
                                    }
                                    description={
                                        <Text type="secondary" style={{ fontSize: 14 }}>
                                            {description}
                                        </Text>
                                    }
                                />
                            </List.Item>
                        );
                    }}
                />
            </Modal>

            {/* Modal chọn phòng để đánh giá (cho đơn có nhiều phòng) */}
            <Modal
                title={
                    <Space>
                        <StarOutlined />
                        <span>Chọn phòng để đánh giá</span>
                    </Space>
                }
                open={selectRoomForReviewModalVisible}
                onCancel={() => {
                    setSelectRoomForReviewModalVisible(false);
                    setSelectedBookingForReview(null);
                }}
                footer={null}
                maskClosable={true}
                width={600}
            >
                {selectedBookingForReview && selectedBookingForReview.details && (
                    <List
                        dataSource={selectedBookingForReview.details}
                        renderItem={(detail: BookingDetail) => {
                            // Kiểm tra cả review (số ít) và reviews (số nhiều) vì relationship là hasMany
                            const review = detail.review || (detail.reviews && detail.reviews.length > 0 ? detail.reviews[0] : null);
                            const hasReview = review && review.id;
                            const roomName = detail.room?.name || `Phòng #${detail.id}`;
                            
                            return (
                                <List.Item
                                    style={{
                                        padding: '16px',
                                        border: '1px solid #f0f0f0',
                                        borderRadius: 8,
                                        marginBottom: 12,
                                        transition: 'all 0.3s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                                        e.currentTarget.style.borderColor = '#cb8670';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.borderColor = '#f0f0f0';
                                    }}
                                >
                                    <List.Item.Meta
                                        title={
                                            <Space>
                                                <HomeOutlined style={{ color: '#cb8670' }} />
                                                <Text strong style={{ fontSize: 16 }}>
                                                    {roomName}
                                                </Text>
                                                {hasReview && (
                                                    <Tag color="green">Đã đánh giá</Tag>
                                                )}
                                                {!hasReview && (
                                                    <Tag color="orange">Chưa đánh giá</Tag>
                                                )}
                                            </Space>
                                        }
                                        description={
                                            <Space direction="vertical" size="small" style={{ width: '100%', marginTop: 8 }}>
                                                <Text type="secondary">
                                                    Nhận phòng: {new Date(detail.check_in_date).toLocaleDateString('vi-VN')}
                                                </Text>
                                                <Text type="secondary">
                                                    Trả phòng: {new Date(detail.check_out_date).toLocaleDateString('vi-VN')}
                                                </Text>
                                            </Space>
                                        }
                                    />
                                    <Button
                                        type={hasReview ? 'default' : 'primary'}
                                        icon={hasReview ? <EyeOutlined /> : <StarOutlined />}
                                        onClick={() => {
                                            if (hasReview) {
                                                // Nếu đã đánh giá: điều hướng đến trang chi tiết loại phòng
                                                const roomTypeId = detail.room?.roomType?.id || detail.room?.room_type_id;
                                                if (roomTypeId) {
                                                    navigate(`/room-types/${roomTypeId}`);
                                                    setSelectRoomForReviewModalVisible(false);
                                                    setSelectedBookingForReview(null);
                                                } else {
                                                    message.warning('Không tìm thấy thông tin loại phòng');
                                                }
                                            } else {
                                                // Nếu chưa đánh giá: mở modal đánh giá
                                                setReviewBookingDetail(detail);
                                                setSelectRoomForReviewModalVisible(false);
                                                setSelectedBookingForReview(null);
                                                setReviewModalVisible(true);
                                            }
                                        }}
                                        style={{
                                            backgroundColor: hasReview ? '#1890ff' : '#faad14',
                                            borderColor: hasReview ? '#1890ff' : '#faad14',
                                            color: '#fff',
                                        }}
                                    >
                                        {hasReview ? 'Xem đánh giá' : 'Đánh giá'}
                                    </Button>
                                </List.Item>
                            );
                        }}
                    />
                )}
            </Modal>
        </div>
    );
};

export default MyBookingsPage;
