import React, { useState, useEffect } from 'react';
import {
    Modal,
    Descriptions,
    Table,
    Tag,
    Space,
    Typography,
    Spin,
    Button,
    Divider,
    Row,
    Col,
} from 'antd';
import {
    FileTextOutlined,
    PrinterOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    DollarOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { toast } from 'react-toastify';
import { getUserInvoice } from '../../service/bookingService';
import type { Invoice, InvoiceItem } from '../../types/invoice/invoice';
import { formatVND } from '../../utils/currency';

const { Title, Text } = Typography;

interface ViewInvoiceModalProps {
    open?: boolean;
    visible?: boolean; // Deprecated, use open instead
    invoiceId: number | null;
    onCancel: () => void;
}

const ViewInvoiceModal: React.FC<ViewInvoiceModalProps> = ({
    open,
    visible, // Deprecated, use open instead
    invoiceId,
    onCancel,
}) => {
    const isOpen = open !== undefined ? open : visible; // Support both for backward compatibility
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && invoiceId) {
            fetchInvoice();
        } else {
            setInvoice(null);
        }
    }, [isOpen, invoiceId]);

    const fetchInvoice = async () => {
        if (!invoiceId) return;
        setLoading(true);
        try {
            // Sử dụng getUserInvoice từ bookingService để gọi đúng endpoint /user/invoices/{id}
            const invoiceData = await getUserInvoice(invoiceId);
            // Xử lý response có thể có nhiều dạng
            let invoice: Invoice;
            if (invoiceData?.data?.data) {
                invoice = invoiceData.data.data;
            } else if (invoiceData?.data) {
                invoice = invoiceData.data;
            } else if (invoiceData) {
                invoice = invoiceData as Invoice;
            } else {
                throw new Error("Không nhận được dữ liệu từ server");
            }
            
            // Map invoice_items từ backend (snake_case) thành items cho frontend
            if ((invoice as any).invoice_items && !invoice.items) {
                invoice.items = (invoice as any).invoice_items;
            }
            // Hoặc nếu backend trả về invoiceItems (camelCase)
            if ((invoice as any).invoiceItems && !invoice.items) {
                invoice.items = (invoice as any).invoiceItems;
            }
            
            setInvoice(invoice);
        } catch (error: any) {
            console.error('Error fetching invoice:', error);
            toast.error(error.response?.data?.message || 'Không thể tải thông tin hóa đơn');
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status?: string) => {
        const configs: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
            pending: {
                color: 'gold',
                icon: <ClockCircleOutlined />,
                text: 'Chờ thanh toán',
            },
            paid: {
                color: 'green',
                icon: <CheckCircleOutlined />,
                text: 'Đã thanh toán',
            },
            overdue: {
                color: 'red',
                icon: <CloseCircleOutlined />,
                text: 'Quá hạn',
            },
            cancelled: {
                color: 'default',
                icon: <CloseCircleOutlined />,
                text: 'Đã hủy',
            },
        };
        return configs[status || 'pending'] || {
            color: 'default',
            icon: <ClockCircleOutlined />,
            text: status || 'Không xác định',
        };
    };

    const formatDate = (dateString?: string | null): string => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN');
        } catch {
            return dateString;
        }
    };

    const itemColumns: ColumnsType<InvoiceItem> = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Loại',
            dataIndex: 'item_type',
            key: 'item_type',
            width: 120,
            render: (type: string) => {
                const typeMap: Record<string, string> = {
                    room_charge: 'Phí phòng',
                    service_charge: 'Dịch vụ',
                    damage_fee: 'Thiệt hại',
                    penalty: 'Phạt',
                    other: 'Khác',
                };
                return <Tag>{typeMap[type] || type}</Tag>;
            },
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 100,
            align: 'right',
        },
        {
            title: 'Đơn giá',
            dataIndex: 'unit_price',
            key: 'unit_price',
            width: 120,
            align: 'right',
            render: (price: number) => formatVND(price),
        },
        {
            title: 'Thành tiền',
            key: 'total',
            width: 150,
            align: 'right',
            render: (_: any, record: InvoiceItem) => {
                const total = record.total || record.total_line || (record.unit_price * record.quantity);
                return <Text strong>{formatVND(total)}</Text>;
            },
        },
    ];

    const handlePrint = () => {
        window.print();
    };

    return (
        <Modal
            title={
                <Space>
                    <FileTextOutlined />
                    <span>Chi tiết hóa đơn</span>
                </Space>
            }
            open={isOpen}
            onCancel={onCancel}
            footer={[
                <Button key="close" onClick={onCancel}>
                    Đóng
                </Button>,
                <Button
                    key="print"
                    type="primary"
                    icon={<PrinterOutlined />}
                    onClick={handlePrint}
                    style={{
                        backgroundColor: '#cb8670',
                        borderColor: '#cb8670',
                    }}
                >
                    In hóa đơn
                </Button>,
            ]}
            width={900}
        >
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin size="large" />
                </div>
            ) : invoice ? (
                <div style={{ padding: '20px 0' }}>
                    {/* Header */}
                    <Row justify="space-between" align="top" style={{ marginBottom: 24 }}>
                        <Col>
                            <Title level={3} style={{ margin: 0, color: '#cb8670' }}>
                                HÓA ĐƠN
                            </Title>
                            <Text type="secondary">Số hóa đơn: {invoice.invoice_number || `#${invoice.id}`}</Text>
                        </Col>
                        <Col>
                            <Tag
                                icon={getStatusConfig(invoice.payment_status || invoice.invoice_status).icon}
                                color={getStatusConfig(invoice.payment_status || invoice.invoice_status).color}
                                style={{ fontSize: 14, padding: '4px 12px' }}
                            >
                                {getStatusConfig(invoice.payment_status || invoice.invoice_status).text}
                            </Tag>
                        </Col>
                    </Row>

                    <Divider />

                    {/* Thông tin khách hàng */}
                    <Descriptions title="Thông tin khách hàng" bordered column={2} size="small" style={{ marginBottom: 24 }}>
                        <Descriptions.Item label="Tên khách hàng">
                            {invoice.customer_name || invoice.booking_order?.customer_name || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                            {invoice.customer_email || invoice.booking_order?.customer_email || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">
                            {invoice.customer_phone || invoice.booking_order?.customer_phone || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ">
                            {invoice.customer_address || 'N/A'}
                        </Descriptions.Item>
                    </Descriptions>

                    {/* Thông tin hóa đơn */}
                    <Descriptions bordered column={2} size="small" style={{ marginBottom: 24 }}>
                        <Descriptions.Item label="Ngày phát hành">
                            {formatDate(invoice.issue_date)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Hạn thanh toán">
                            {formatDate(invoice.due_date)}
                        </Descriptions.Item>
                        {invoice.booking_order && (
                            <>
                                <Descriptions.Item label="Mã đặt phòng">
                                    <Text strong>#{invoice.booking_order.order_code || invoice.booking_order.code}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Phương thức thanh toán">
                                    {invoice.payment_method || invoice.booking_order.payment_method || 'N/A'}
                                </Descriptions.Item>
                            </>
                        )}
                    </Descriptions>

                    {/* Chi tiết hóa đơn */}
                    <div style={{ marginBottom: 24 }}>
                        <Title level={5}>Chi tiết hóa đơn</Title>
                        <Table
                            columns={itemColumns}
                            dataSource={
                                invoice.items || 
                                (invoice as any).invoice_items || 
                                (invoice as any).invoiceItems || 
                                []
                            }
                            rowKey="id"
                            pagination={false}
                            size="small"
                            bordered
                        />
                    </div>

                    {/* Tổng tiền */}
                    <Row justify="end" style={{ marginBottom: 24 }}>
                        <Col span={12}>
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                <Row justify="space-between">
                                    <Col>
                                        <Text>Tạm tính:</Text>
                                    </Col>
                                    <Col>
                                        <Text>{formatVND(invoice.subtotal || invoice.total_amount)}</Text>
                                    </Col>
                                </Row>
                                {invoice.discount_amount > 0 && (
                                    <Row justify="space-between">
                                        <Col>
                                            <Text type="secondary">Giảm giá:</Text>
                                        </Col>
                                        <Col>
                                            <Text type="secondary">-{formatVND(invoice.discount_amount)}</Text>
                                        </Col>
                                    </Row>
                                )}
                                {invoice.tax_amount > 0 && (
                                    <Row justify="space-between">
                                        <Col>
                                            <Text type="secondary">Thuế ({invoice.tax_rate}%):</Text>
                                        </Col>
                                        <Col>
                                            <Text type="secondary">{formatVND(invoice.tax_amount)}</Text>
                                        </Col>
                                    </Row>
                                )}
                                <Divider style={{ margin: '8px 0' }} />
                                <Row justify="space-between">
                                    <Col>
                                        <Text strong style={{ fontSize: 16 }}>
                                            Tổng cộng:
                                        </Text>
                                    </Col>
                                    <Col>
                                        <Text strong style={{ fontSize: 18, color: '#cb8670' }}>
                                            {formatVND(invoice.total_amount)}
                                        </Text>
                                    </Col>
                                </Row>
                                {invoice.paid_amount > 0 && (
                                    <Row justify="space-between">
                                        <Col>
                                            <Text type="secondary">Đã thanh toán:</Text>
                                        </Col>
                                        <Col>
                                            <Text type="success">{formatVND(invoice.paid_amount)}</Text>
                                        </Col>
                                    </Row>
                                )}
                                {invoice.balance > 0 && (
                                    <Row justify="space-between">
                                        <Col>
                                            <Text strong>Còn lại:</Text>
                                        </Col>
                                        <Col>
                                            <Text strong style={{ color: '#ff4d4f' }}>
                                                {formatVND(invoice.balance)}
                                            </Text>
                                        </Col>
                                    </Row>
                                )}
                            </Space>
                        </Col>
                    </Row>

                    {/* Ghi chú */}
                    {invoice.notes && (
                        <div style={{ marginTop: 24 }}>
                            <Text type="secondary">Ghi chú: </Text>
                            <Text>{invoice.notes}</Text>
                        </div>
                    )}

                    {/* Điều khoản */}
                    {invoice.terms_conditions && (
                        <div style={{ marginTop: 16 }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {invoice.terms_conditions}
                            </Text>
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Text type="secondary">Không tìm thấy thông tin hóa đơn</Text>
                </div>
            )}
        </Modal>
    );
};

export default ViewInvoiceModal;

