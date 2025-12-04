import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Result, Button, Spin, Card, Typography, Space, Divider } from 'antd';
import { CheckCircleOutlined, HomeOutlined, FileTextOutlined } from '@ant-design/icons';
import { getUserBooking, getUserInvoice } from '../../../service/bookingService';
import { useBookingCart } from '../../../context/BookingCartContext';
import type { BookingOrder } from '../../../types/booking/booking';

const { Title, Text, Paragraph } = Typography;

const PaymentSuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState<BookingOrder | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isInvoicePayment, setIsInvoicePayment] = useState(false);
    const { clearCart } = useBookingCart();

    const bookingId = searchParams.get('booking_id');
    const invoiceId = searchParams.get('invoice_id');
    const orderCode = searchParams.get('orderCode');
    const status = searchParams.get('status');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Nếu có invoice_id, đây là thanh toán invoice sau checkout
                if (invoiceId) {
                    setIsInvoicePayment(true);
                    const invoice = await getUserInvoice(Number(invoiceId));
                    
                    console.log('Invoice data:', invoice);
                    
                    // Invoice có thể có booking_order_id trực tiếp hoặc qua bookingOrder relationship
                    const bookingOrderId = invoice.booking_order_id || (invoice.bookingOrder && invoice.bookingOrder.id);
                    
                    if (bookingOrderId) {
                        const bookingData = await getUserBooking(bookingOrderId);
                        setBooking(bookingData);
                    } else {
                        setError('Không tìm thấy thông tin đơn đặt phòng từ hóa đơn');
                    }
                } 
                // Nếu có booking_id, đây là thanh toán cọc
                else if (bookingId) {
                    setIsInvoicePayment(false);
                    const bookingData = await getUserBooking(Number(bookingId));
                    setBooking(bookingData);
                    
                    // Clear cart khi thanh toán cọc thành công và đã có invoice
                    // Kiểm tra payment_status là 'partial' (đã đặt cọc) hoặc 'paid' (đã thanh toán đầy đủ)
                    if (bookingData.payment_status === 'partial' || bookingData.payment_status === 'paid') {
                        clearCart();
                    }
                } else {
                    setError('Không tìm thấy thông tin đơn đặt phòng');
                }
            } catch (err: any) {
                console.error('Error fetching data:', err);
                setError('Không thể tải thông tin đơn đặt phòng: ' + (err.response?.data?.message || err.message || 'Lỗi không xác định'));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [bookingId, invoiceId, clearCart]);


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
                title={isInvoicePayment ? "Thanh toán hóa đơn thành công!" : "Thanh toán thành công!"}
                subTitle={
                    <Space direction="vertical" size="small" style={{ marginTop: 16 }}>
                        <Paragraph>
                            {isInvoicePayment 
                                ? "Cảm ơn bạn đã thanh toán hóa đơn. Đơn đặt phòng của bạn đã được hoàn tất."
                                : "Cảm ơn bạn đã thanh toán. Đơn đặt phòng của bạn đã được xác nhận."
                            }
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
                        key="bookings"
                        icon={<FileTextOutlined />}
                        onClick={() => navigate(isInvoicePayment ? '/my-bookings?tab=paid' : '/my-bookings')}
                        size="large"
                    >
                        {isInvoicePayment ? 'Xem đơn đã thanh toán' : 'Xem đơn đặt phòng'}
                    </Button>,
                    <Button
                        key="home"
                        icon={<HomeOutlined />}
                        onClick={() => navigate('/')}
                        size="large"
                    >
                        Về trang chủ
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

