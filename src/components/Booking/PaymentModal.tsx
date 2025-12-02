import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Select,
    Input,
    Button,
    Space,
    Typography,
    Descriptions,
    Divider,
    Alert,
} from 'antd';
import {
    DollarOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';
import { payInvoice } from '../../service/bookingService';
import { formatVND } from '../../utils/currency';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface PaymentModalProps {
    open?: boolean;
    visible?: boolean; // Deprecated, use open instead
    invoiceId: number | null;
    totalAmount: number;
    onCancel: () => void;
    onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
    open,
    visible, // Deprecated, use open instead
    invoiceId,
    totalAmount,
    onCancel,
    onSuccess,
}) => {
    const isOpen = open !== undefined ? open : visible; // Support both for backward compatibility
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            form.resetFields();
        }
    }, [isOpen, form]);

    const handleSubmit = async () => {
        if (!invoiceId) return;

        try {
            const values = await form.validateFields();
            setLoading(true);

            await payInvoice(
                invoiceId,
                values.payment_method,
                values.payment_notes
            );

            onSuccess();
            onCancel();
        } catch (error: any) {
            console.error('Payment error:', error);
            // Error sẽ được xử lý bởi message.error trong component cha
        } finally {
            setLoading(false);
        }
    };

    if (!invoiceId) return null;

    return (
        <Modal
            title={
                <Space>
                    <DollarOutlined />
                    <span>Thanh toán hóa đơn</span>
                </Space>
            }
            open={isOpen}
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
                    icon={<CheckCircleOutlined />}
                    style={{
                        backgroundColor: '#52c41a',
                        borderColor: '#52c41a',
                    }}
                >
                    Xác nhận thanh toán
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical">
                <Alert
                    message="Thông tin thanh toán"
                    description="Vui lòng chọn phương thức thanh toán và xác nhận."
                    type="info"
                    style={{ marginBottom: 24 }}
                />

                <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
                    <Descriptions.Item label="Tổng tiền">
                        <Title level={4} style={{ margin: 0, color: '#52c41a' }}>
                            {formatVND(totalAmount)}
                        </Title>
                    </Descriptions.Item>
                </Descriptions>

                <Divider />

                <Form.Item
                    name="payment_method"
                    label="Phương thức thanh toán"
                    rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán' }]}
                >
                    <Select placeholder="Chọn phương thức thanh toán">
                        <Select.Option value="cash">Tiền mặt</Select.Option>
                        <Select.Option value="bank">Chuyển khoản ngân hàng</Select.Option>
                        <Select.Option value="momo">Ví MoMo</Select.Option>
                        <Select.Option value="card">Thẻ tín dụng/Ghi nợ</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="payment_notes"
                    label="Ghi chú (tùy chọn)"
                >
                    <TextArea rows={3} placeholder="Nhập ghi chú nếu có" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default PaymentModal;

