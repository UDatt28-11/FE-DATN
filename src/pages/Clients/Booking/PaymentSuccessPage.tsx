import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Result, Button, Spin, Card, Typography, Space, Divider } from 'antd';
import { CheckCircleOutlined, HomeOutlined, FileTextOutlined } from '@ant-design/icons';
import { getUserBooking } from '../../../service/bookingService';
import type { BookingOrder } from '../../../types/booking/booking';

const { Title, Text, Paragraph } = Typography;

const PaymentSuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState<BookingOrder | null>(null);
    const [error, setError] = useState<string | null>(null);

    const bookingId = searchParams.get('booking_id');
    const orderCode = searchParams.get('orderCode');
    const status = searchParams.get('status');

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
                status="success"
                icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                title="Thanh toán thành công!"
                subTitle={
                    <Space direction="vertical" size="small" style={{ marginTop: 16 }}>
                        <Paragraph>
                            Cảm ơn bạn đã thanh toán. Đơn đặt phòng của bạn đã được xác nhận.
                        </Paragraph>
                        {orderCode && (
                            <Paragraph>
                                <Text type="secondary">Mã giao dịch: </Text>
                                <Text strong>{orderCode}</Text>
                            </Paragraph>
                        )}
                        {status && (
                            <Paragraph>
                                <Text type="secondary">Trạng thái: </Text>
                                <Text strong style={{ color: '#52c41a' }}>
                                    {status === 'PAID' ? 'Đã thanh toán' : status}
                                </Text>
                            </Paragraph>
                        )}
                    </Space>
                }
                extra={[
                    <Button
                        type="primary"
                        key="home"
                        icon={<HomeOutlined />}
                        onClick={() => navigate('/')}
                        size="large"
                    >
                        Về trang chủ
                    </Button>,
                    <Button
                        key="bookings"
                        icon={<FileTextOutlined />}
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
                    <Divider />
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <div>
                            <Text type="secondary">Mã đơn hàng: </Text>
                            <Text strong>{booking.order_code}</Text>
                        </div>
                        {booking.check_in && (
                            <div>
                                <Text type="secondary">Ngày nhận phòng: </Text>
                                <Text strong>{new Date(booking.check_in).toLocaleDateString('vi-VN')}</Text>
                            </div>
                        )}
                        {booking.check_out && (
                            <div>
                                <Text type="secondary">Ngày trả phòng: </Text>
                                <Text strong>{new Date(booking.check_out).toLocaleDateString('vi-VN')}</Text>
                            </div>
                        )}
                        <div>
                            <Text type="secondary">Tổng tiền: </Text>
                            <Text strong style={{ fontSize: 18, color: '#cb8670' }}>
                                {Number(booking.total_amount).toLocaleString('vi-VN')} VNĐ
                            </Text>
                        </div>
                        {booking.payment_status && (
                            <div>
                                <Text type="secondary">Trạng thái thanh toán: </Text>
                                <Text strong style={{ 
                                    color: booking.payment_status === 'paid' ? '#52c41a' : 
                                           booking.payment_status === 'partial' ? '#faad14' : '#ff4d4f'
                                }}>
                                    {booking.payment_status === 'paid' ? 'Đã thanh toán đầy đủ' :
                                     booking.payment_status === 'partial' ? 'Đã đặt cọc' :
                                     'Chưa thanh toán'}
                                </Text>
                            </div>
                        )}
                    </Space>
                </Card>
            )}

            <Card style={{ marginTop: 16, background: '#f6ffed', border: '1px solid #b7eb8f' }}>
                <Paragraph style={{ margin: 0 }}>
                    <Text type="secondary">
                        <strong>Lưu ý:</strong> Chúng tôi đã gửi email xác nhận đến địa chỉ email của bạn. 
                        Vui lòng kiểm tra hộp thư và thanh toán số tiền còn lại khi nhận phòng tại khách sạn.
                    </Text>
                </Paragraph>
            </Card>
        </div>
    );
};

export default PaymentSuccessPage;

