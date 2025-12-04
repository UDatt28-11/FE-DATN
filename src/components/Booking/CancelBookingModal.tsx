import React, { useState, useEffect } from 'react';
import {
    Modal,
    Button,
    Space,
    Typography,
    Descriptions,
    Alert,
    Input,
    Spin,
    Divider,
    Tag,
} from 'antd';
import {
    ExclamationCircleOutlined,
    DollarOutlined,
    CalendarOutlined,
    InfoCircleOutlined,
} from '@ant-design/icons';
import { getCancellationPolicy, cancelUserBooking, type CancellationPolicy } from '../../service/bookingService';
import { formatVND } from '../../utils/currency';

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;

interface CancelBookingModalProps {
    open: boolean;
    bookingId: number | null;
    bookingCode?: string;
    onCancel: () => void;
    onSuccess: (message: string) => void;
}

const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
    open,
    bookingId,
    bookingCode,
    onCancel,
    onSuccess,
}) => {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [policy, setPolicy] = useState<CancellationPolicy | null>(null);
    const [reason, setReason] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Fetch cancellation policy when modal opens
    useEffect(() => {
        const fetchPolicy = async () => {
            if (!open || !bookingId) return;
            
            setLoading(true);
            setError(null);
            try {
                const policyData = await getCancellationPolicy(bookingId);
                setPolicy(policyData);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Không thể tải chính sách hủy phòng');
            } finally {
                setLoading(false);
            }
        };

        fetchPolicy();
    }, [open, bookingId]);

    // Reset state when modal closes
    useEffect(() => {
        if (!open) {
            setPolicy(null);
            setReason('');
            setError(null);
        }
    }, [open]);

    const handleConfirmCancel = async () => {
        if (!bookingId || !policy?.can_cancel) return;

        setSubmitting(true);
        try {
            const result = await cancelUserBooking(bookingId, reason);
            onSuccess(result.message);
            onCancel();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Không thể hủy đặt phòng');
        } finally {
            setSubmitting(false);
        }
    };

    const getRefundTagColor = (percentage: number) => {
        if (percentage >= 100) return 'green';
        if (percentage >= 50) return 'orange';
        return 'red';
    };

    return (
        <Modal
            title={
                <Space>
                    <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                    <span>Hủy đặt phòng {bookingCode ? `#${bookingCode}` : ''}</span>
                </Space>
            }
            open={open}
            onCancel={onCancel}
            footer={null}
            width={600}
            destroyOnClose
        >
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin size="large" />
                    <Text style={{ display: 'block', marginTop: 16 }}>
                        Đang tải chính sách hủy phòng...
                    </Text>
                </div>
            ) : error ? (
                <Alert
                    message="Lỗi"
                    description={error}
                    type="error"
                    showIcon
                />
            ) : policy ? (
                <div>
                    {/* Chính sách hủy */}
                    <Alert
                        message="Chính sách hủy phòng"
                        description={
                            <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                                <li>Hủy trước <strong>7 ngày</strong>: Hoàn lại <Tag color="green">100%</Tag> tiền cọc</li>
                                <li>Hủy trong vòng <strong>3-6 ngày</strong>: Hoàn lại <Tag color="orange">50%</Tag> tiền cọc</li>
                                <li>Hủy trong vòng <strong>0-2 ngày</strong> hoặc không đến: <Tag color="red">Mất 100%</Tag> tiền cọc</li>
                            </ul>
                        }
                        type="info"
                        showIcon
                        icon={<InfoCircleOutlined />}
                        style={{ marginBottom: 24 }}
                    />

                    {/* Thông tin đơn đặt phòng */}
                    <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
                        <Descriptions.Item label={<><CalendarOutlined /> Ngày check-in</>}>
                            {policy.check_in_date ? new Date(policy.check_in_date).toLocaleDateString('vi-VN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            }) : 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số ngày còn lại đến check-in">
                            <Text strong style={{ color: policy.days_until_checkin >= 7 ? '#52c41a' : policy.days_until_checkin >= 3 ? '#faad14' : '#ff4d4f' }}>
                                {policy.days_until_checkin} ngày
                            </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label={<><DollarOutlined /> Tiền cọc đã đặt</>}>
                            <Text strong>{formatVND(policy.deposit_amount)}</Text>
                        </Descriptions.Item>
                    </Descriptions>

                    {/* Kết quả hoàn tiền */}
                    <div style={{ 
                        background: policy.refund_percentage >= 50 ? '#f6ffed' : '#fff2f0', 
                        border: `1px solid ${policy.refund_percentage >= 50 ? '#b7eb8f' : '#ffa39e'}`,
                        borderRadius: 8, 
                        padding: 16, 
                        marginBottom: 24 
                    }}>
                        <Title level={5} style={{ margin: 0, marginBottom: 12 }}>
                            <Tag color={getRefundTagColor(policy.refund_percentage)} style={{ fontSize: 14 }}>
                                {policy.policy_text}
                            </Tag>
                        </Title>
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text>Số tiền được hoàn lại:</Text>
                                <Text strong style={{ color: '#52c41a', fontSize: 18 }}>
                                    {formatVND(policy.refund_amount)}
                                </Text>
                            </div>
                            {policy.forfeited_amount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text>Số tiền không được hoàn:</Text>
                                    <Text type="danger">
                                        {formatVND(policy.forfeited_amount)}
                                    </Text>
                                </div>
                            )}
                        </Space>
                    </div>

                    {/* Lý do hủy (tùy chọn) */}
                    <div style={{ marginBottom: 24 }}>
                        <Text strong style={{ display: 'block', marginBottom: 8 }}>
                            Lý do hủy (không bắt buộc):
                        </Text>
                        <TextArea
                            rows={3}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Nhập lý do hủy đặt phòng..."
                            maxLength={1000}
                            showCount
                        />
                    </div>

                    {/* Cảnh báo */}
                    {policy.refund_percentage < 100 && (
                        <Alert
                            message="Lưu ý"
                            description={
                                policy.refund_percentage === 0
                                    ? "Bạn sẽ mất toàn bộ tiền cọc nếu hủy đặt phòng ngay bây giờ."
                                    : `Bạn sẽ mất ${formatVND(policy.forfeited_amount)} tiền cọc nếu hủy đặt phòng ngay bây giờ.`
                            }
                            type="warning"
                            showIcon
                            style={{ marginBottom: 24 }}
                        />
                    )}

                    <Divider />

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <Button onClick={onCancel}>
                            Quay lại
                        </Button>
                        <Button
                            type="primary"
                            danger
                            loading={submitting}
                            onClick={handleConfirmCancel}
                            disabled={!policy.can_cancel}
                        >
                            Xác nhận hủy đặt phòng
                        </Button>
                    </div>

                    {!policy.can_cancel && policy.cancel_reason && (
                        <Alert
                            message={policy.cancel_reason}
                            type="error"
                            showIcon
                            style={{ marginTop: 16 }}
                        />
                    )}
                </div>
            ) : null}
        </Modal>
    );
};

export default CancelBookingModal;

