import React, { useState } from 'react';
import {
    Layout,
    Card,
    Row,
    Col,
    Typography,
    Steps,
    Space,
    Divider,
    Button,
    App,
    Radio,
    Select,
} from 'antd';
import {
    ArrowLeftOutlined,
    CreditCardOutlined,
    SafetyOutlined,
    GiftOutlined,
    DeleteOutlined,
    BankOutlined,
    QrcodeOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    createPayOSPaymentLink,
    createUserBooking,
    createVNPayPaymentLink,
    getVNPayBanks,
} from '../../../service/bookingService';
import VoucherSelectModal from '../../../components/Booking/VoucherSelectModal';
import type { ApplyVoucherResult } from '../../../service/voucherService';
import './PaymentPage.css';

// Nếu cần tính số đêm từ ngày checkin/checkout, có thể dùng dayjs sau này
// import dayjs from 'dayjs';

const { Content } = Layout;
const { Text } = Typography;

interface GuestInfo {
    fullName: string;
    phone: string;
    email: string;
    idCard: string;
}

interface BookingRoomItem {
    roomId: string;
    roomName: string;
    price: number;
    checkIn?: string;
    checkOut?: string;
    adults?: number;
    children?: number;
    nights?: number;
    totalPrice?: number;
}

type GroupedRoomItem = BookingRoomItem & {
    count: number;
    groupTotal: number;
};

interface BookingData {
    // Hỗ trợ cả format cũ (1 phòng) và format mới (nhiều phòng)
    roomId?: string;
    roomName?: string;
    price?: number;
    checkIn?: string;
    checkOut?: string;
    adults?: number;
    children?: number;
    nights?: number;
    totalPrice?: number;
    // Format mới: mảng phòng
    rooms?: BookingRoomItem[];
    guestInfo?: GuestInfo;
    bookingId?: number;
    booking?: any;
    // Payload để tạo booking khi bấm thanh toán
    bookingPayload?: any;
}

const PaymentPage: React.FC = () => {
    const { message } = App.useApp();
    const navigate = useNavigate();
    const location = useLocation();
    const [payOSLoading, setPayOSLoading] = useState(false);
    const [vnpayLoading, setVnpayLoading] = useState(false);
    const [voucherModalVisible, setVoucherModalVisible] = useState(false);
    const [appliedVoucher, setAppliedVoucher] = useState<ApplyVoucherResult | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'payos' | 'vnpay'>('payos');
    const [vnpayBanks, setVnpayBanks] = useState<Record<string, string>>({});
    const [selectedBank, setSelectedBank] = useState<string>('');
    const [loadingBanks, setLoadingBanks] = useState(false);

    // Fetch VNPay banks on mount
    React.useEffect(() => {
        const fetchBanks = async () => {
            setLoadingBanks(true);
            try {
                const banks = await getVNPayBanks();
                setVnpayBanks(banks);
            } catch (error) {
                console.error('Error fetching VNPay banks:', error);
            } finally {
                setLoadingBanks(false);
            }
        };
        fetchBanks();
    }, []);

    const locationState = location.state as BookingData | null;
    const bookingData: BookingData = locationState || {};
    
    // Lấy danh sách phòng (hỗ trợ cả format cũ và mới)
    const rooms: BookingRoomItem[] = bookingData.rooms || (bookingData.roomId ? [{
        roomId: bookingData.roomId,
        roomName: bookingData.roomName || 'Phòng',
        price: bookingData.price || 0,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        adults: bookingData.adults,
        children: bookingData.children,
        nights: bookingData.nights,
        totalPrice: bookingData.totalPrice || bookingData.price || 0,
    }] : []);

    // Gom nhóm các phòng theo tên để hiển thị gọn hơn
    const groupedRooms = React.useMemo<GroupedRoomItem[]>(() => {
        const map = new Map<string, GroupedRoomItem>();

        rooms.forEach((room) => {
            const name = room.roomName || 'Phòng';
            const key = name;
            const roomTotal = room.totalPrice || (room.price || 0) * (room.nights || 1);

            if (!map.has(key)) {
                map.set(key, {
                    ...room,
                    roomName: name,
                    count: 1,
                    groupTotal: roomTotal,
                });
            } else {
                const existing = map.get(key)!;
                map.set(key, {
                    ...existing,
                    count: existing.count + 1,
                    groupTotal: existing.groupTotal + roomTotal,
                });
            }
        });

        return Array.from(map.values());
    }, [rooms]);
    
    // Tính tổng tiền gốc
    const originalTotalAmount = bookingData.totalPrice || 
        (rooms.length > 0 ? rooms.reduce((sum, room) => 
            sum + (room.totalPrice || (room.price || 0) * (room.nights || 1)), 0
        ) : 0) || 0;

    // Tính tổng tiền sau khi áp dụng voucher
    const discountAmount = appliedVoucher?.discount_amount || 0;
    const totalAmount = Math.max(0, originalTotalAmount - discountAmount);

    // Xác định đơn giá trị thấp: cần thanh toán toàn bộ
    const isLowValue = totalAmount > 0 && totalAmount < 1_000_000;

    // Cho phép khách chọn chính sách cọc: 50% hoặc 100% (với đơn >= 1tr)
    type DepositOption = 'half' | 'full';
    // Đơn < 1 triệu: mặc định là thanh toán toàn bộ, không cần lựa chọn
    const initialDepositOption: DepositOption = isLowValue ? 'full' : 'half';
    const [depositOption, setDepositOption] = useState<DepositOption>(initialDepositOption);

    let depositAmount = 0;
    if (isLowValue) {
        // Đơn nhỏ: luôn thanh toán toàn bộ
        depositAmount = Math.round(totalAmount || 0);
    } else if (depositOption === 'half') {
        depositAmount = Math.round((totalAmount || 0) * 0.5);
    } else if (depositOption === 'full') {
        depositAmount = Math.round(totalAmount || 0);
    }
    // Đảm bảo không vượt quá tổng tiền và không âm
    if (depositAmount > (totalAmount || 0)) {
        depositAmount = totalAmount || 0;
    }
    if (!Number.isFinite(depositAmount) || depositAmount < 0) {
        depositAmount = 0;
    }

    const remainingAmount = (totalAmount || 0) - (depositAmount || 0);

    // Nếu không có thông tin, redirect về trang trước
    React.useEffect(() => {
        if (!bookingData.guestInfo || rooms.length === 0) {
            message.warning('Thông tin đặt phòng không hợp lệ. Vui lòng thử lại!');
            navigate('/rooms');
        }
    }, [bookingData, rooms.length, navigate, message]);

    const handlePayWithPayOS = async () => {
        setPayOSLoading(true);
        try {
            let bookingId = bookingData.bookingId;
            
            // Nếu chưa có booking, tạo booking trước khi thanh toán
            if (!bookingId && bookingData.bookingPayload) {
                try {
                    // Thêm thông tin voucher vào payload nếu có
                    const bookingPayloadWithVoucher = {
                        ...bookingData.bookingPayload,
                        ...(appliedVoucher && {
                            voucher_id: appliedVoucher.voucher_id,
                            discount_amount: appliedVoucher.discount_amount,
                            original_total_amount: originalTotalAmount,
                            total_amount: totalAmount, // Tổng tiền sau giảm giá
                        }),
                    };
                    
                    const createdBooking = await createUserBooking(bookingPayloadWithVoucher);
                    bookingId = createdBooking.id;
                    // Cập nhật state với bookingId mới
                    // (Không cần update state vì sẽ redirect ngay)
                } catch (error: any) {
                    console.error('Error creating booking:', error);
                    const errorMessage = error.response?.data?.message || 'Không thể tạo đơn đặt phòng';
                    message.error(errorMessage);
                    setPayOSLoading(false);
                    return;
                }
            }
            
            if (!bookingId) {
                message.error('Không tìm thấy thông tin đặt phòng!');
                setPayOSLoading(false);
                return;
            }

            // Tạo payment link PayOS
            const result = await createPayOSPaymentLink(
                bookingId,
                depositAmount,
                'Dat coc dat phong'
            );

            // Mở trang thanh toán PayOS
            if (result.payment_link) {
                window.location.href = result.payment_link;
            } else {
                message.error('Không nhận được link thanh toán PayOS');
                setPayOSLoading(false);
            }
        } catch (error: any) {
            console.error('PayOS payment error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Không thể tạo link thanh toán PayOS';
            message.error(errorMessage);
            setPayOSLoading(false);
        }
    };

    const handlePayWithVNPay = async () => {
        setVnpayLoading(true);
        try {
            let bookingId = bookingData.bookingId;
            
            // Nếu chưa có booking, tạo booking trước khi thanh toán
            if (!bookingId && bookingData.bookingPayload) {
                try {
                    const bookingPayloadWithVoucher = {
                        ...bookingData.bookingPayload,
                        ...(appliedVoucher && {
                            voucher_id: appliedVoucher.voucher_id,
                            discount_amount: appliedVoucher.discount_amount,
                            original_total_amount: originalTotalAmount,
                            total_amount: totalAmount,
                        }),
                    };
                    
                    const createdBooking = await createUserBooking(bookingPayloadWithVoucher);
                    bookingId = createdBooking.id;
                } catch (error: any) {
                    console.error('Error creating booking:', error);
                    const errorMessage = error.response?.data?.message || 'Không thể tạo đơn đặt phòng';
                    message.error(errorMessage);
                    setVnpayLoading(false);
                    return;
                }
            }
            
            if (!bookingId) {
                message.error('Không tìm thấy thông tin đặt phòng!');
                setVnpayLoading(false);
                return;
            }

            // Tạo payment link VNPAY
            const result = await createVNPayPaymentLink(
                bookingId,
                depositAmount,
                'Dat coc dat phong',
                selectedBank || undefined
            );

            // Mở trang thanh toán VNPAY
            if (result.payment_url) {
                window.location.href = result.payment_url;
            } else {
                message.error('Không nhận được link thanh toán VNPAY');
                setVnpayLoading(false);
            }
        } catch (error: any) {
            console.error('VNPay payment error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Không thể tạo link thanh toán VNPAY';
            message.error(errorMessage);
            setVnpayLoading(false);
        }
    };

    const handlePayment = () => {
        if (paymentMethod === 'payos') {
            handlePayWithPayOS();
        } else {
            handlePayWithVNPay();
        }
    };


    if (!bookingData.guestInfo) {
        return null;
    }

    return (
        <div className="payment-page">
            {/* Header Steps */}
            <div style={{ background: '#f5f5f5', padding: '30px 0' }}>
                <div className="container">
                    <Steps
                        current={1}
                        items={[
                            {
                                title: 'Thông tin',
                                description: 'Nhập thông tin người đặt',
                            },
                            {
                                title: 'Thanh toán',
                                description: 'Xác nhận và thanh toán',
                            },
                            {
                                title: 'Hoàn tất',
                                description: 'Xác nhận đặt phòng',
                            },
                        ]}
                    />
                </div>
            </div>

            <Content style={{ padding: '40px 0', minHeight: '70vh', background: '#fff' }}>
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
                        {/* Cột trái: Phương thức thanh toán */}
                        <Col xs={24} lg={16}>
                            {/* Thanh toán PayOS */}
                            <Card
                                title={
                                    <Space>
                                        <CreditCardOutlined />
                                        <span>Thanh toán trực tuyến</span>
                                    </Space>
                                }
                                variant="borderless"
                            >
                                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                    {/* Chọn phương thức thanh toán */}
                                    <div style={{
                                        padding: 16,
                                        background: '#fafafa',
                                        borderRadius: 8,
                                        border: '1px solid #e8e8e8'
                                    }}>
                                        <Text strong style={{ fontSize: 14, marginBottom: 12, display: 'block' }}>
                                            Chọn cổng thanh toán:
                                        </Text>
                                        <Radio.Group
                                            value={paymentMethod}
                                            onChange={(e) => {
                                                setPaymentMethod(e.target.value);
                                                setSelectedBank('');
                                            }}
                                            style={{ width: '100%' }}
                                        >
                                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                                <Radio value="payos" style={{
                                                    padding: '12px 16px',
                                                    border: paymentMethod === 'payos' ? '2px solid #1677ff' : '1px solid #d9d9d9',
                                                    borderRadius: 8,
                                                    width: '100%',
                                                    background: paymentMethod === 'payos' ? '#f0f7ff' : '#fff'
                                                }}>
                                                    <Space>
                                                        <QrcodeOutlined style={{ fontSize: 20, color: '#1677ff' }} />
                                                        <div>
                                                            <Text strong>PayOS</Text>
                                                            <br />
                                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                                Quét mã QR, Thẻ tín dụng, Ví điện tử
                                                            </Text>
                                                        </div>
                                                    </Space>
                                                </Radio>
                                                <Radio value="vnpay" style={{
                                                    padding: '12px 16px',
                                                    border: paymentMethod === 'vnpay' ? '2px solid #1677ff' : '1px solid #d9d9d9',
                                                    borderRadius: 8,
                                                    width: '100%',
                                                    background: paymentMethod === 'vnpay' ? '#f0f7ff' : '#fff'
                                                }}>
                                                    <Space>
                                                        <BankOutlined style={{ fontSize: 20, color: '#1677ff' }} />
                                                        <div>
                                                            <Text strong>VNPAY</Text>
                                                            <br />
                                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                                Internet Banking, Thẻ ATM nội địa
                                                            </Text>
                                                        </div>
                                                    </Space>
                                                </Radio>
                                            </Space>
                                        </Radio.Group>
                                    </div>

                                    {/* Hiển thị thông tin tùy theo cổng thanh toán */}
                                    {paymentMethod === 'payos' ? (
                                        <>
                                            <div style={{
                                                padding: 16,
                                                background: '#f0f7ff',
                                                borderRadius: 8,
                                                border: '1px solid #91caff'
                                            }}>
                                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                    <Space>
                                                        <SafetyOutlined style={{ color: '#1677ff', fontSize: 20 }} />
                                                        <Text strong style={{ fontSize: 15 }}>Thanh toán an toàn qua PayOS</Text>
                                                    </Space>
                                                    <Text type="secondary" style={{ fontSize: 13, marginLeft: 28 }}>
                                                        Đối tác thanh toán uy tín, được bảo mật bởi các ngân hàng hàng đầu Việt Nam
                                                    </Text>
                                                </Space>
                                            </div>

                                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                                <Text strong style={{ fontSize: 14 }}>Các phương thức hỗ trợ:</Text>
                                                <Space wrap>
                                                    <div style={{ padding: '8px 16px', background: '#f5f5f5', borderRadius: 6, border: '1px solid #e8e8e8' }}>
                                                        <Text style={{ fontSize: 13 }}>💳 Thẻ tín dụng (Visa, Mastercard, JCB)</Text>
                                                    </div>
                                                    <div style={{ padding: '8px 16px', background: '#f5f5f5', borderRadius: 6, border: '1px solid #e8e8e8' }}>
                                                        <Text style={{ fontSize: 13 }}>💳 Thẻ ghi nợ nội địa (ATM)</Text>
                                                    </div>
                                                    <div style={{ padding: '8px 16px', background: '#f5f5f5', borderRadius: 6, border: '1px solid #e8e8e8' }}>
                                                        <Text style={{ fontSize: 13 }}>📱 Ví điện tử (MoMo, ZaloPay, ShopeePay)</Text>
                                                    </div>
                                                </Space>
                                            </Space>
                                        </>
                                    ) : (
                                        <>
                                            <div style={{
                                                padding: 16,
                                                background: '#fff7e6',
                                                borderRadius: 8,
                                                border: '1px solid #ffd591'
                                            }}>
                                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                    <Space>
                                                        <SafetyOutlined style={{ color: '#fa8c16', fontSize: 20 }} />
                                                        <Text strong style={{ fontSize: 15 }}>Thanh toán an toàn qua VNPAY</Text>
                                                    </Space>
                                                    <Text type="secondary" style={{ fontSize: 13, marginLeft: 28 }}>
                                                        Cổng thanh toán số 1 Việt Nam, hỗ trợ hơn 40 ngân hàng
                                                    </Text>
                                                </Space>
                                            </div>

                                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                                <Text strong style={{ fontSize: 14 }}>Chọn ngân hàng thanh toán:</Text>
                                                <Select
                                                    placeholder="-- Chọn ngân hàng --"
                                                    value={selectedBank || undefined}
                                                    onChange={(value) => setSelectedBank(value)}
                                                    loading={loadingBanks}
                                                    style={{ width: '100%' }}
                                                    size="large"
                                                    showSearch
                                                    optionFilterProp="label"
                                                    options={Object.entries(vnpayBanks).map(([code, name]) => ({
                                                        value: code,
                                                        label: name
                                                    }))}
                                                />
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    💡 Bạn sẽ được chuyển đến trang Internet Banking của ngân hàng đã chọn
                                                </Text>
                                                {(depositAmount || 0) < 10000 && (
                                                    <div style={{
                                                        padding: 12,
                                                        background: '#fff2f0',
                                                        borderRadius: 8,
                                                        border: '1px solid #ffccc7'
                                                    }}>
                                                        <Text type="danger" style={{ fontSize: 13 }}>
                                                            ⚠️ VNPAY yêu cầu số tiền thanh toán tối thiểu là 10.000 VNĐ. Vui lòng chọn PayOS để thanh toán đơn này.
                                                        </Text>
                                                    </div>
                                                )}
                                            </Space>
                                        </>
                                    )}

                                    <Divider style={{ margin: '16px 0' }} />

                                    {/* Chọn / hiển thị mức cọc */}
                                    {isLowValue ? (
                                        // Đơn giá trị thấp: yêu cầu thanh toán toàn bộ, không cần lựa chọn
                                        <Space
                                            direction="vertical"
                                            size="small"
                                            style={{ width: '100%', padding: 12, background: '#fafafa', borderRadius: 8 }}
                                        >
                                            <Text strong style={{ fontSize: 14 }}>
                                                Đơn này cần thanh toán toàn bộ trước khi xác nhận
                                            </Text>
                                            <Text type="secondary" style={{ fontSize: 13 }}>
                                                Tổng tiền: <Text strong>{(totalAmount || 0).toLocaleString('vi-VN')} VNĐ</Text>
                                            </Text>
                                            <Text type="secondary" style={{ fontSize: 13 }}>
                                                Số tiền sẽ thanh toán ngay:{" "}
                                                <Text strong>{(depositAmount || 0).toLocaleString('vi-VN')} VNĐ</Text>
                                            </Text>
                                            <Text type="secondary" style={{ fontSize: 13 }}>
                                                • Bạn sẽ được chuyển tới trang thanh toán bảo mật của {paymentMethod === 'payos' ? 'PayOS' : 'VNPAY'}
                                                </Text>
                                        </Space>
                                    ) : (
                                        <Space
                                            direction="vertical"
                                            size="middle"
                                            style={{ width: '100%', padding: 12, background: '#fafafa', borderRadius: 8 }}
                                        >
                                            <Text strong style={{ fontSize: 14 }}>
                                                Chọn số tiền bạn muốn thanh toán hôm nay
                                                </Text>
                                            <Radio.Group
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 8,
                                                }}
                                                value={depositOption}
                                                onChange={(e) => setDepositOption(e.target.value)}
                                            >
                                                <Radio value="half" style={{ padding: '8px 12px', borderRadius: 6 }}>
                                                    <Text strong>Cọc 50%</Text>{" "}
                                                <Text type="secondary">
                                                        ({Math.round((totalAmount || 0) * 0.5).toLocaleString("vi-VN")} VNĐ)
                                                </Text>
                                                </Radio>
                                                <Radio value="full" style={{ padding: '8px 12px', borderRadius: 6 }}>
                                                    <Text strong>Thanh toán toàn bộ</Text>{" "}
                                                <Text type="secondary">
                                                        ({(totalAmount || 0).toLocaleString("vi-VN")} VNĐ)
                                                    </Text>
                                                </Radio>
                                            </Radio.Group>

                                            <Text type="secondary" style={{ fontSize: 13 }}>
                                                • Bạn sẽ được chuyển tới trang thanh toán bảo mật của {paymentMethod === 'payos' ? 'PayOS' : 'VNPAY'}
                                                </Text>
                                            <Text type="secondary" style={{ fontSize: 13 }}>
                                                • Hệ thống sẽ tự động ghi nhận số tiền đã thanh toán vào đơn đặt phòng
                                                </Text>
                                            <Text type="secondary" style={{ fontSize: 13 }}>
                                                • Email xác nhận sẽ được gửi đến{" "}
                                                <Text strong>{bookingData.guestInfo?.email}</Text>
                                                </Text>
                                        </Space>
                                    )}
                                </Space>

                                <Divider />

                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    loading={paymentMethod === 'payos' ? payOSLoading : vnpayLoading}
                                    onClick={handlePayment}
                                    disabled={(paymentMethod === 'vnpay' && !selectedBank) || (paymentMethod === 'vnpay' && (depositAmount || 0) < 10000)}
                                    icon={paymentMethod === 'payos' ? <QrcodeOutlined /> : <BankOutlined />}
                                    style={{
                                        backgroundColor: paymentMethod === 'payos' ? '#1677ff' : '#fa8c16',
                                        borderColor: paymentMethod === 'payos' ? '#1677ff' : '#fa8c16',
                                        height: 50,
                                        fontSize: 16,
                                        fontWeight: 'bold',
                                    }}
                                >
                                    Thanh toán qua {paymentMethod === 'payos' ? 'PayOS' : 'VNPAY'} ({(depositAmount || 0).toLocaleString('vi-VN')} VNĐ)
                                </Button>
                            </Card>

                            {/* Thanh toán bằng thẻ tín dụng/ghi nợ */}
                            <Card
                                title={
                                    <Space>
                                        <CreditCardOutlined />
                                        <span>Thanh toán bằng thẻ tín dụng / thẻ ghi nợ</span>
                                    </Space>
                                }
                                variant="borderless"
                            >
                                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                    <div style={{
                                        padding: 16,
                                        background: '#fff7e6',
                                        borderRadius: 8,
                                        border: '1px solid #ffd591'
                                    }}>
                                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                            <Space>
                                                <SafetyOutlined style={{ color: '#fa8c16', fontSize: 20 }} />
                                                <Text strong style={{ fontSize: 15 }}>Tính năng đang phát triển</Text>
                                            </Space>
                                            <Text type="secondary" style={{ fontSize: 13, marginLeft: 28 }}>
                                                Phương thức thanh toán bằng thẻ tín dụng/ghi nợ trực tiếp đang được phát triển. 
                                                Vui lòng sử dụng PayOS để thanh toán.
                                            </Text>
                                        </Space>
                                    </div>

                                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                        <Text strong style={{ fontSize: 14 }}>Các loại thẻ sẽ được hỗ trợ:</Text>
                                        <Space wrap>
                                            <div style={{
                                                padding: '8px 16px',
                                                background: '#f5f5f5',
                                                borderRadius: 6,
                                                border: '1px solid #e8e8e8',
                                                opacity: 0.6
                                            }}>
                                                <Text type="secondary" style={{ fontSize: 13 }}>💳 Thẻ tín dụng (Visa, Mastercard, JCB)</Text>
                                            </div>
                                            <div style={{
                                                padding: '8px 16px',
                                                background: '#f5f5f5',
                                                borderRadius: 6,
                                                border: '1px solid #e8e8e8',
                                                opacity: 0.6
                                            }}>
                                                <Text type="secondary" style={{ fontSize: 13 }}>💳 Thẻ ghi nợ nội địa (ATM)</Text>
                                            </div>
                                        </Space>
                                    </Space>
                                </Space>

                                <Divider />

                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    disabled
                                    icon={<CreditCardOutlined />}
                                    style={{
                                        backgroundColor: '#d9d9d9',
                                        borderColor: '#d9d9d9',
                                        height: 50,
                                        fontSize: 16,
                                        fontWeight: 'bold',
                                        cursor: 'not-allowed',
                                    }}
                                >
                                    Tính năng đang phát triển
                                </Button>
                            </Card>
                        </Col>

                        {/* Cột phải: Tóm tắt đơn hàng và Thông tin người đặt */}
                        <Col xs={24} lg={8}>
                            <Card
                                title={`Tóm tắt đơn hàng (${rooms.length} phòng)`}
                                variant="borderless"
                                style={{ position: 'sticky', top: 20 }}
                            >
                                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                    {/* Danh sách phòng (gộp theo tên phòng) */}
                                    {groupedRooms.map((room, index) => (
                                        <div key={index} style={{
                                            padding: 12,
                                            background: '#fafafa',
                                            borderRadius: 8,
                                            border: '1px solid #e8e8e8'
                                        }}>
                                            <Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
                                                <Col flex="auto">
                                                    <Text strong style={{ fontSize: 14 }}>
                                                        {room.roomName}
                                                    </Text>
                                                </Col>
                                                {room.count && room.count > 1 && (
                                                    <Col>
                                                        <Text
                                                            type="secondary"
                                                            style={{ color: '#B57660', fontWeight: 'bold', fontSize: 18, whiteSpace: 'nowrap' }}
                                                        >
                                                            x{room.count}
                                                        </Text>
                                                    </Col>
                                                )}
                                            </Row>
                                            {room.checkIn && room.checkOut && (
                                                <div style={{ marginTop: 4 }}>
                                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                                        {room.checkIn} → {room.checkOut}
                                                    </Text>
                                        <br />
                                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                                        {room.nights} đêm
                                                    </Text>
                                                </div>
                                            )}
                                            {(room.adults || room.children) && (
                                                <div style={{ marginTop: 4 }}>
                                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                                        {room.adults || 0} người lớn
                                                        {room.children ? `, ${room.children} trẻ em` : ''}
                                                    </Text>
                                                </div>
                                            )}
                                            <div style={{ marginTop: 8 }}>
                                                <Text strong style={{ color: '#cb8670', fontSize: 14 }}>
                                                    {(room.groupTotal || 0).toLocaleString('vi-VN')} VNĐ
                                                </Text>
                                            </div>
                                    </div>
                                    ))}

                                    {rooms.length > 0 && rooms[0].checkIn && (
                                        <>
                                            <Divider style={{ margin: '8px 0' }} />
                                            <Row>
                                                <Col span={12}>
                                                    <Text type="secondary">Nhận phòng</Text>
                                                    <br />
                                                    <Text strong>{rooms[0].checkIn}</Text>
                                                </Col>
                                                <Col span={12}>
                                                    <Text type="secondary">Trả phòng</Text>
                                                    <br />
                                                    <Text strong>{rooms[0].checkOut}</Text>
                                                </Col>
                                            </Row>
                                        </>
                                    )}

                                    <Divider style={{ margin: '12px 0' }} />

                                    {/* Chi tiết giá từng phòng */}
                                    <div>
                                        {groupedRooms.map((room, index) => (
                                            <div key={index} style={{ marginBottom: index < groupedRooms.length - 1 ? 8 : 0 }}>
                                        <Row justify="space-between">
                                                    <Col>
                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                            {room.roomName}
                                                            {room.count && room.count > 1 ? ` x${room.count}` : ''}
                                                        </Text>
                                                    </Col>
                                                <Col>
                                                        <Text style={{ fontSize: 12 }}>
                                                            {(room.groupTotal || 0).toLocaleString('vi-VN')} VNĐ
                                                    </Text>
                                                </Col>
                                            </Row>
                                            </div>
                                        ))}
                                    </div>

                                    <Divider style={{ margin: '12px 0' }} />

                                    {/* Mã giảm giá */}
                                    <div style={{
                                        padding: 12,
                                        background: appliedVoucher ? '#f6ffed' : '#fafafa',
                                        borderRadius: 8,
                                        border: appliedVoucher ? '1px solid #b7eb8f' : '1px solid #e8e8e8'
                                    }}>
                                        {appliedVoucher ? (
                                            <Row justify="space-between" align="middle">
                                                <Col>
                                                    <Space>
                                                        <GiftOutlined style={{ color: '#52c41a' }} />
                                                        <div>
                                                            <Text strong style={{ color: '#52c41a' }}>
                                                                {appliedVoucher.voucher_code}
                                                            </Text>
                                                            <br />
                                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                                Giảm {appliedVoucher.discount_amount.toLocaleString('vi-VN')} VNĐ
                                                            </Text>
                                                        </div>
                                                    </Space>
                                                </Col>
                                                <Col>
                                                    <Button
                                                        type="text"
                                                        danger
                                                        size="small"
                                                        icon={<DeleteOutlined />}
                                                        onClick={() => setAppliedVoucher(null)}
                                                    >
                                                        Bỏ
                                                    </Button>
                                                </Col>
                                            </Row>
                                        ) : (
                                            <Row justify="space-between" align="middle">
                                                <Col>
                                                    <Space>
                                                        <GiftOutlined style={{ color: '#eb2f96' }} />
                                                        <Text>Mã giảm giá</Text>
                                                    </Space>
                                                </Col>
                                                <Col>
                                                    <Button
                                                        type="link"
                                                        onClick={() => setVoucherModalVisible(true)}
                                                        style={{ padding: 0 }}
                                                    >
                                                        Chọn mã
                                                    </Button>
                                                </Col>
                                            </Row>
                                        )}
                                    </div>

                                    <Divider style={{ margin: '12px 0' }} />

                                    {/* Chi tiết thanh toán */}
                                    <div>
                                        <Row justify="space-between" style={{ marginBottom: 8 }}>
                                            <Col>
                                                <Text>Tổng tiền phòng</Text>
                                            </Col>
                                            <Col>
                                                <Text>{(originalTotalAmount || 0).toLocaleString('vi-VN')} VNĐ</Text>
                                            </Col>
                                        </Row>
                                        {appliedVoucher && (
                                            <Row justify="space-between" style={{ marginBottom: 8 }}>
                                                <Col>
                                                    <Text style={{ color: '#52c41a' }}>Giảm giá voucher</Text>
                                                </Col>
                                                <Col>
                                                    <Text style={{ color: '#52c41a' }}>
                                                        -{discountAmount.toLocaleString('vi-VN')} VNĐ
                                                    </Text>
                                                </Col>
                                            </Row>
                                        )}
                                        {appliedVoucher && (
                                            <Row justify="space-between" style={{ marginBottom: 8 }}>
                                                <Col>
                                                    <Text strong>Thành tiền</Text>
                                                </Col>
                                                <Col>
                                                    <Text strong style={{ color: '#cb8670' }}>
                                                        {(totalAmount || 0).toLocaleString('vi-VN')} VNĐ
                                                    </Text>
                                                </Col>
                                            </Row>
                                        )}
                                        <Row justify="space-between" style={{ marginBottom: 8 }}>
                                            <Col>
                                                <Text type="secondary">Tiền cọc ({depositOption === 'half' ? '50%' : '100%'})</Text>
                                            </Col>
                                            <Col>
                                                <Text type="secondary">{(depositAmount || 0).toLocaleString('vi-VN')} VNĐ</Text>
                                            </Col>
                                        </Row>
                                        <Row justify="space-between">
                                            <Col>
                                                <Text type="secondary">Số tiền còn lại</Text>
                                            </Col>
                                            <Col>
                                                <Text type="secondary">{(remainingAmount || 0).toLocaleString('vi-VN')} VNĐ</Text>
                                            </Col>
                                        </Row>
                                    </div>

                                    <Divider style={{ margin: '12px 0' }} />

                                    <div style={{
                                        background: 'linear-gradient(135deg, #fff5f0 0%, #ffe8e0 100%)',
                                        padding: 16,
                                        borderRadius: 8,
                                        border: '2px solid #cb8670'
                                    }}>
                                        <Row justify="space-between" align="middle">
                                            <Col>
                                                <Text strong style={{ fontSize: 16 }}>Tiền cọc cần thanh toán</Text>
                                                <br />
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    Số tiền còn lại thanh toán khi nhận phòng
                                                </Text>
                                            </Col>
                                            <Col>
                                                <Text
                                                    strong
                                                    style={{
                                                        fontSize: 24,
                                                        color: '#cb8670'
                                                    }}
                                                >
                                                    {(depositAmount || 0).toLocaleString('vi-VN')} VNĐ
                                                </Text>
                                            </Col>
                                        </Row>
                                    </div>

                                    <Text type="secondary" style={{ fontSize: 12, display: 'block', textAlign: 'center', marginTop: 8 }}>
                                        * Thanh toán số tiền còn lại khi nhận phòng tại khách sạn
                                    </Text>
                                </Space>
                            </Card>

                            {/* Thông tin người đặt */}
                            <Card
                                title="Thông tin người đặt"
                                variant="borderless"
                                style={{ marginTop: 24, position: 'sticky', top: 20 }}
                            >
                                <Row gutter={[16, 16]}>
                                    <Col span={12}>
                                        <Text type="secondary">Họ tên</Text>
                                        <br />
                                        <Text strong>{bookingData.guestInfo.fullName}</Text>
                                    </Col>
                                    <Col span={12}>
                                        <Text type="secondary">Số điện thoại</Text>
                                        <br />
                                        <Text strong>{bookingData.guestInfo.phone}</Text>
                                    </Col>
                                    <Col span={12}>
                                        <Text type="secondary">Email</Text>
                                        <br />
                                        <Text strong>{bookingData.guestInfo.email}</Text>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </Content>

            {/* Voucher Selection Modal */}
            <VoucherSelectModal
                open={voucherModalVisible}
                orderAmount={originalTotalAmount}
                onCancel={() => setVoucherModalVisible(false)}
                onSelect={(result) => {
                    setAppliedVoucher(result);
                    setVoucherModalVisible(false);
                }}
            />
        </div>
    );
};

export default PaymentPage;
