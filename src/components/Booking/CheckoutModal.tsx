import React, { useState } from 'react';
import {
    Modal,
    Button,
    Space,
    Typography,
    Alert,
    Spin,
} from 'antd';
import {
    LogoutOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { BookingOrder } from '../../types/booking/booking';
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
    const totalAmount = booking.total_amount || 0;

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

                <div>
                    <Text type="secondary">Tổng tiền cần thanh toán:</Text>
                    <br />
                    <Title level={4} style={{ margin: 0, color: '#52c41a' }}>
                        {formatVND(totalAmount)}
                    </Title>
                </div>

                <Text type="secondary" style={{ fontSize: '12px' }}>
                    Bạn có chắc chắn muốn check-out không? Sau khi xác nhận, bạn sẽ được chuyển đến trang thanh toán.
                </Text>
            </Space>
        </Modal>
    );
};

export default CheckoutModal;

