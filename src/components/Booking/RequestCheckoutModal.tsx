import React, { useState } from 'react';
import {
    Modal,
    Form,
    Button,
    Space,
    Typography,
    Alert,
    Checkbox,
    Input,
    message,
} from 'antd';
import {
    LogoutOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { BookingOrder, BookingDetail } from '../../types/booking/booking';
import { requestCheckOut } from '../../service/bookingService';

const { Text, TextArea } = Typography;

interface RequestCheckoutModalProps {
    open: boolean;
    booking: BookingOrder | null;
    onCancel: () => void;
    onSuccess: () => void;
}

const RequestCheckoutModal: React.FC<RequestCheckoutModalProps> = ({
    open,
    booking,
    onCancel,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!booking) return;

        try {
            const values = await form.validateFields();
            
            if (!values.booking_detail_ids || values.booking_detail_ids.length === 0) {
                message.warning('Vui lòng chọn ít nhất một phòng để checkout.');
                return;
            }

            setLoading(true);
            await requestCheckOut(booking.id, values.booking_detail_ids, values.notes);
            
            message.success('Yêu cầu checkout đã được gửi thành công!');
            form.resetFields();
            onSuccess();
        } catch (error: any) {
            console.error('Request checkout error:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu checkout.');
        } finally {
            setLoading(false);
        }
    };

    if (!booking) return null;

    // Lấy danh sách phòng đã check-in
    const checkedInDetails = booking.details?.filter(
        (detail: BookingDetail) => detail.status === 'checked_in'
    ) || [];

    if (checkedInDetails.length === 0) {
        return (
            <Modal
                title={
                    <Space>
                        <LogoutOutlined />
                        <span>Yêu cầu Check-out</span>
                    </Space>
                }
                open={open}
                onCancel={onCancel}
                footer={[
                    <Button key="close" onClick={onCancel}>
                        Đóng
                    </Button>,
                ]}
            >
                <Alert
                    message="Không có phòng nào đã check-in"
                    description="Bạn cần check-in trước khi có thể yêu cầu checkout."
                    type="warning"
                    showIcon
                />
            </Modal>
        );
    }

    return (
        <Modal
            title={
                <Space>
                    <LogoutOutlined />
                    <span>Yêu cầu Check-out</span>
                </Space>
            }
            open={open}
            onCancel={onCancel}
            width={600}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Hủy
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={loading}
                    onClick={handleSubmit}
                    style={{
                        backgroundColor: '#fa8c16',
                        borderColor: '#fa8c16',
                    }}
                >
                    Gửi yêu cầu
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical">
                <Alert
                    message="Thông báo"
                    description="Yêu cầu checkout của bạn sẽ được gửi đến admin/staff để xử lý. Sau khi được duyệt, hệ thống sẽ tự động tạo hóa đơn để bạn thanh toán."
                    type="info"
                    showIcon
                    icon={<ExclamationCircleOutlined />}
                    style={{ marginBottom: 16 }}
                />

                <Form.Item
                    name="booking_detail_ids"
                    label="Chọn phòng cần checkout"
                    rules={[{ required: true, message: 'Vui lòng chọn ít nhất một phòng' }]}
                >
                    <Checkbox.Group style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                        {checkedInDetails.map((detail: BookingDetail) => (
                            <Checkbox key={detail.id} value={detail.id} style={{ marginBottom: 8 }}>
                                <Space>
                                    <Text strong>{detail.room?.name || 'N/A'}</Text>
                                    <Text type="secondary">
                                        ({detail.check_in_date} - {detail.check_out_date})
                                    </Text>
                                </Space>
                            </Checkbox>
                        ))}
                    </Checkbox.Group>
                </Form.Item>

                <Form.Item
                    name="notes"
                    label="Ghi chú (tùy chọn)"
                >
                    <TextArea
                        rows={4}
                        placeholder="Nhập ghi chú nếu có (ví dụ: lý do checkout sớm, yêu cầu đặc biệt...)"
                        maxLength={1000}
                        showCount
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default RequestCheckoutModal;

