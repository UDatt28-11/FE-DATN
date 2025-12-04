import React, { useState, useEffect } from 'react';
import {
    Modal,
    Button,
    Space,
    Typography,
    Alert,
    DatePicker,
    Spin,
    Divider,
    Tag,
    Descriptions,
} from 'antd';
import {
    CalendarOutlined,
    InfoCircleOutlined,
    SwapOutlined,
} from '@ant-design/icons';
import { changeDates, type DateChangeInfo } from '../../service/bookingService';
import { formatVND } from '../../utils/currency';
import dayjs, { Dayjs } from 'dayjs';
import { message } from 'antd';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

interface ChangeDateModalProps {
    open: boolean;
    bookingId: number | null;
    bookingCode?: string;
    currentCheckIn?: string;
    currentCheckOut?: string;
    dateChangeCount?: number;
    onCancel: () => void;
    onSuccess: (message: string) => void;
}

const ChangeDateModal: React.FC<ChangeDateModalProps> = ({
    open,
    bookingId,
    bookingCode,
    currentCheckIn,
    currentCheckOut,
    dateChangeCount = 0,
    onCancel,
    onSuccess,
}) => {
    const [submitting, setSubmitting] = useState(false);
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!open) {
            setDateRange(null);
            setError(null);
        }
    }, [open]);

    const handleSubmit = async () => {
        if (!bookingId || !dateRange || !dateRange[0] || !dateRange[1]) {
            setError('Vui lòng chọn ngày check-in và check-out mới');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const result = await changeDates(
                bookingId,
                dateRange[0].format('YYYY-MM-DD'),
                dateRange[1].format('YYYY-MM-DD')
            );
            onSuccess(result.message);
            onCancel();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Không thể đổi ngày đặt phòng');
        } finally {
            setSubmitting(false);
        }
    };

    const canChange = dateChangeCount < 1;
    const remainingChanges = Math.max(0, 1 - dateChangeCount);

    // Disable dates before today
    const disabledDate = (current: Dayjs) => {
        return current && current < dayjs().startOf('day');
    };

    // Handle date range change with validation
    const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
        if (dates && dates[0] && dates[1]) {
            if (dates[0].isSame(dates[1], 'day')) {
                message.warning('Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 ngày!');
                return;
            }
        }
        setDateRange(dates);
    };

    return (
        <Modal
            title={
                <Space>
                    <SwapOutlined style={{ color: '#1890ff' }} />
                    <span>Đổi ngày đặt phòng {bookingCode ? `#${bookingCode}` : ''}</span>
                </Space>
            }
            open={open}
            onCancel={onCancel}
            footer={null}
            width={550}
            destroyOnClose
        >
            <div>
                {/* Chính sách đổi ngày */}
                <Alert
                    message="Chính sách đổi ngày"
                    description={
                        <div>
                            <p style={{ margin: '8px 0' }}>
                                Khách có thể đổi ngày <strong>1 lần miễn phí</strong> (tùy thuộc tình trạng phòng trống).
                            </p>
                            <p style={{ margin: 0 }}>
                                Số lần đổi ngày còn lại: <Tag color={remainingChanges > 0 ? 'green' : 'red'}>{remainingChanges} lần</Tag>
                            </p>
                        </div>
                    }
                    type="info"
                    showIcon
                    icon={<InfoCircleOutlined />}
                    style={{ marginBottom: 24 }}
                />

                {!canChange ? (
                    <Alert
                        message="Không thể đổi ngày"
                        description="Bạn đã sử dụng hết số lần đổi ngày miễn phí (1 lần). Nếu cần thay đổi, vui lòng hủy đặt phòng và đặt lại."
                        type="warning"
                        showIcon
                        style={{ marginBottom: 24 }}
                    />
                ) : (
                    <>
                        {/* Ngày hiện tại */}
                        <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
                            <Descriptions.Item label={<><CalendarOutlined /> Ngày check-in hiện tại</>}>
                                <Text strong>
                                    {currentCheckIn ? dayjs(currentCheckIn).format('DD/MM/YYYY') : 'N/A'}
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label={<><CalendarOutlined /> Ngày check-out hiện tại</>}>
                                <Text strong>
                                    {currentCheckOut ? dayjs(currentCheckOut).format('DD/MM/YYYY') : 'N/A'}
                                </Text>
                            </Descriptions.Item>
                        </Descriptions>

                        {/* Chọn ngày mới */}
                        <div style={{ marginBottom: 24 }}>
                            <Text strong style={{ display: 'block', marginBottom: 8 }}>
                                Chọn ngày mới:
                            </Text>
                            <RangePicker
                                value={dateRange}
                                onChange={handleDateRangeChange}
                                format="DD/MM/YYYY"
                                placeholder={['Ngày check-in mới', 'Ngày check-out mới']}
                                disabledDate={disabledDate}
                                style={{ width: '100%' }}
                                size="large"
                            />
                        </div>

                        {/* Cảnh báo về giá */}
                        <Alert
                            message="Lưu ý"
                            description="Tổng tiền có thể thay đổi tùy thuộc vào số đêm ở. Nếu số đêm tăng, bạn cần thanh toán thêm phần chênh lệch."
                            type="warning"
                            showIcon
                            style={{ marginBottom: 24 }}
                        />

                        {error && (
                            <Alert
                                message="Lỗi"
                                description={error}
                                type="error"
                                showIcon
                                style={{ marginBottom: 16 }}
                            />
                        )}
                    </>
                )}

                <Divider />

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <Button onClick={onCancel}>
                        Quay lại
                    </Button>
                    {canChange && (
                        <Button
                            type="primary"
                            loading={submitting}
                            onClick={handleSubmit}
                            disabled={!dateRange || !dateRange[0] || !dateRange[1]}
                            icon={<SwapOutlined />}
                        >
                            Xác nhận đổi ngày
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ChangeDateModal;

