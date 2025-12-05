import React, { useState, useMemo } from 'react';
import {
    Modal,
    Button,
    Space,
    Typography,
    Alert,
    Spin,
    Divider,
    List,
    Tag,
} from 'antd';
import {
    LogoutOutlined,
    ExclamationCircleOutlined,
    ShoppingOutlined,
} from '@ant-design/icons';
import type { BookingOrder, BookingService } from '../../types/booking/booking';
import { checkOutUserBooking } from '../../service/bookingService';
import { formatVND } from '../../utils/currency';

const { Text, Title } = Typography;

interface CheckoutModalProps {
    open?: boolean;
    visible?: boolean; // Deprecated, use open instead
    booking: BookingOrder | null;
    onCancel: () => void;
    onSuccess: (invoiceId?: number) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
    open,
    visible, // Deprecated, use open instead
    booking,
    onCancel,
    onSuccess,
}) => {
    const isOpen = open !== undefined ? open : visible; // Support both for backward compatibility
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        if (!booking) return;

        try {
            setLoading(true);
            const result = await checkOutUserBooking(booking.id);
            
            // Checkout thành công, invoice đã được tạo
            // Admin/Staff sẽ quản lý invoice (thêm service, damage) trước khi thanh toán
            onSuccess();
        } catch (error: any) {
            console.error('Checkout error:', error);
            // Error sẽ được xử lý bởi message.error trong component cha
        } finally {
            setLoading(false);
        }
    };

    if (!booking) return null;

    const roomName = booking.details?.[0]?.room?.name || 'N/A';
    
    // Tính tổng tiền bao gồm cả dịch vụ đã được approve
    const approvedServices = useMemo(() => {
        const services: BookingService[] = [];
        booking.details?.forEach(detail => {
            if (detail.booking_services) {
                detail.booking_services.forEach((bs: BookingService) => {
                    if (bs.status === 'approved') {
                        services.push(bs);
                    }
                });
            }
        });
        return services;
    }, [booking]);

    const servicesTotal = approvedServices.reduce((sum, bs) => {
        return sum + (bs.price_at_booking * bs.quantity);
    }, 0);

    const baseAmount = booking.total_amount || 0;
    const totalAmount = baseAmount + servicesTotal;

    return (
        <Modal
            title={
                <Space>
                    <LogoutOutlined />
                    <span>Xác nhận Check-out</span>
                </Space>
            }
            open={isOpen}
            onCancel={onCancel}
            width={500}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Hủy
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={loading}
                    onClick={handleCheckout}
                    style={{
                        backgroundColor: '#52c41a',
                        borderColor: '#52c41a',
                    }}
                >
                    Xác nhận Check-out
                </Button>,
            ]}
        >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Alert
                    message="Thông báo"
                    description="Sau khi check-out, hệ thống sẽ tự động tạo hóa đơn để bạn thanh toán."
                    type="info"
                    showIcon
                    icon={<ExclamationCircleOutlined />}
                />

                <div>
                    <Text type="secondary">Phòng:</Text>
                    <br />
                    <Text strong>{roomName}</Text>
                </div>

                {approvedServices.length > 0 && (
                    <>
                        <Divider style={{ margin: '12px 0' }} />
                        <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>Dịch vụ đã được duyệt:</Text>
                            <List
                                size="small"
                                dataSource={approvedServices}
                                renderItem={(service) => (
                                    <List.Item style={{ padding: '8px 0' }}>
                                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                            <Space>
                                                <ShoppingOutlined style={{ color: '#52c41a' }} />
                                                <Text>{service.service?.name || 'N/A'}</Text>
                                                <Text type="secondary">x{service.quantity}</Text>
                                            </Space>
                                            <Text strong>
                                                {formatVND(service.price_at_booking * service.quantity)}
                                            </Text>
                                        </Space>
                                    </List.Item>
                                )}
                            />
                        </div>
                        <Divider style={{ margin: '12px 0' }} />
                    </>
                )}

                <div>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Text type="secondary">Tổng tiền cần thanh toán:</Text>
                        <Title level={4} style={{ margin: 0, color: '#52c41a' }}>
                            {formatVND(totalAmount)}
                        </Title>
                    </Space>
                    {approvedServices.length > 0 && (
                        <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
                            (Bao gồm {approvedServices.length} dịch vụ đã được duyệt)
                        </Text>
                    )}
                </div>

                <Text type="secondary" style={{ fontSize: '12px' }}>
                    Bạn có chắc chắn muốn check-out không? Sau khi xác nhận, hệ thống sẽ tự động tạo hóa đơn bao gồm phòng và các dịch vụ đã được duyệt.
                </Text>
            </Space>
        </Modal>
    );
};

export default CheckoutModal;

