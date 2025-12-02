import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Result, Button, Spin, Card, Typography, Space } from 'antd';
import { CloseCircleOutlined, HomeOutlined, ReloadOutlined } from '@ant-design/icons';
import { getUserBooking } from '../../../service/bookingService';
import type { BookingOrder } from '../../../types/booking/booking';

const { Title, Text, Paragraph } = Typography;

const PaymentCancelPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState<BookingOrder | null>(null);
    const [error, setError] = useState<string | null>(null);

    const bookingId = searchParams.get('booking_id');
    const orderCode = searchParams.get('orderCode');

    useEffect(() => {
        const fetchBooking = async () => {
            if (!bookingId) {
                setError('Không tìm thấy thông tin đơn đặt phòng');
                setLoading(false);
                return;
            }

            try {
                const bookingData = await getUserBooking(Number(bookingId));
                setBooking(bookingData);
            } catch (err: any) {
                console.error('Error fetching booking:', err);
                setError('Không thể tải thông tin đơn đặt phòng');
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [bookingId]);

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '70vh' 
            }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '40px 20px', maxWidth: 800, margin: '0 auto' }}>
                <Result
                    status="error"
                    title="Có lỗi xảy ra"
                    subTitle={error}
                    extra={[
                        <Button type="primary" key="home" onClick={() => navigate('/')}>
                            Về trang chủ
                        </Button>,
                    ]}
                />
            </div>
        );
    }

    return (
        <div style={{ padding: '40px 20px', maxWidth: 800, margin: '0 auto' }}>
            <Result
                status="error"
                icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                title="Thanh toán đã bị hủy"
                subTitle={
                    <Space direction="vertical" size="small" style={{ marginTop: 16 }}>
                        <Paragraph>
                            Bạn đã hủy quá trình thanh toán. Đơn đặt phòng của bạn vẫn được lưu và bạn có thể thanh toán lại bất cứ lúc nào.
                        </Paragraph>
                        {orderCode && (
                            <Paragraph>
                                <Text type="secondary">Mã giao dịch: </Text>
                                <Text strong>{orderCode}</Text>
                            </Paragraph>
                        )}
                    </Space>
                }
                extra={[
                    <Button
                        type="primary"
                        key="retry"
                        icon={<ReloadOutlined />}
                        onClick={() => navigate(`/booking/payment`, { 
                            state: booking ? {
                                bookingId: booking.id,
                                booking: booking,
                                guestInfo: {
                                    fullName: booking.customer_name || '',
                                    phone: booking.customer_phone || '',
                                    email: booking.customer_email || '',
                                },
                                totalPrice: Number(booking.total_amount),
                            } : {}
                        })}
                        size="large"
                    >
                        Thanh toán lại
                    </Button>,
                    <Button
                        key="home"
                        icon={<HomeOutlined />}
                        onClick={() => navigate('/')}
                        size="large"
                    >
                        Về trang chủ
                    </Button>,
                    <Button
                        key="bookings"
                        onClick={() => navigate('/my-bookings')}
                        size="large"
                    >
                        Xem đơn đặt phòng
                    </Button>,
                ]}
            />

            {booking && (
                <Card style={{ marginTop: 24 }}>
                    <Title level={4}>Thông tin đơn đặt phòng</Title>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <div>
                            <Text type="secondary">Mã đơn hàng: </Text>
                            <Text strong>{booking.order_code}</Text>
                        </div>
                        <div>
                            <Text type="secondary">Tổng tiền: </Text>
                            <Text strong style={{ fontSize: 18, color: '#cb8670' }}>
                                {Number(booking.total_amount).toLocaleString('vi-VN')} VNĐ
                            </Text>
                        </div>
                        {booking.payment_status && (
                            <div>
                                <Text type="secondary">Trạng thái thanh toán: </Text>
                                <Text strong style={{ color: '#ff4d4f' }}>
                                    {booking.payment_status === 'paid' ? 'Đã thanh toán đầy đủ' :
                                     booking.payment_status === 'partial' ? 'Đã đặt cọc' :
                                     'Chưa thanh toán'}
                                </Text>
                            </div>
                        )}
                    </Space>
                </Card>
            )}

            <Card style={{ marginTop: 16, background: '#fff7e6', border: '1px solid #ffe58f' }}>
                <Paragraph style={{ margin: 0 }}>
                    <Text type="secondary">
                        <strong>Lưu ý:</strong> Đơn đặt phòng của bạn sẽ được giữ trong 24 giờ. 
                        Vui lòng hoàn tất thanh toán để xác nhận đặt phòng.
                    </Text>
                </Paragraph>
            </Card>
        </div>
    );
};

export default PaymentCancelPage;

