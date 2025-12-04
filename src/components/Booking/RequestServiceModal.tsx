import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Select,
    InputNumber,
    Input,
    Button,
    Space,
    Typography,
    message,
    Spin,
    Card,
    Row,
    Col,
} from 'antd';
import {
    ShoppingOutlined,
    DollarOutlined,
} from '@ant-design/icons';
import type { BookingOrder, BookingDetail } from '../../types/booking/booking';
import { requestService } from '../../service/bookingService';
import serviceService from '../../service/serviceService';
import { formatVND } from '../../utils/currency';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface Service {
    id: number;
    name: string;
    price: number;
    unit: string;
    property_id?: number;
}

interface RequestServiceModalProps {
    open: boolean;
    booking: BookingOrder | null;
    bookingDetail: BookingDetail | null;
    onCancel: () => void;
    onSuccess: () => void;
}

const RequestServiceModal: React.FC<RequestServiceModalProps> = ({
    open,
    booking,
    bookingDetail,
    onCancel,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [services, setServices] = useState<Service[]>([]);
    const [loadingServices, setLoadingServices] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    useEffect(() => {
        if (open && bookingDetail) {
            loadServices();
        }
    }, [open, bookingDetail]);

    const loadServices = async () => {
        if (!bookingDetail) {
            console.warn('RequestServiceModal: bookingDetail is null');
            return;
        }
        
        // Lấy property_id từ nhiều nguồn khác nhau
        const room = bookingDetail.room as any;
        const propertyId = 
            room?.property?.id ||
            room?.property_id ||
            room?.roomType?.property_id ||
            room?.roomType?.property?.id;
        
        console.log('RequestServiceModal: Loading services', {
            bookingDetailId: bookingDetail.id,
            room: room ? { id: room.id, name: room.name } : null,
            propertyId,
            roomProperty: room?.property,
            roomPropertyId: room?.property_id,
            roomTypePropertyId: room?.roomType?.property_id,
            roomTypeProperty: room?.roomType?.property,
        });
        
        if (!propertyId) {
            console.warn('RequestServiceModal: Cannot find property_id', {
                bookingDetail,
                room,
            });
            message.warning('Không tìm thấy thông tin property. Vui lòng thử lại.');
            return;
        }
        
        setLoadingServices(true);
        try {
            const data = await serviceService.getAll({
                property_id: propertyId,
            });
            console.log('RequestServiceModal: Services loaded', {
                propertyId,
                servicesCount: Array.isArray(data) ? data.length : 0,
                data,
            });
            setServices(Array.isArray(data) ? data : []);
            if (Array.isArray(data) && data.length === 0) {
                message.info('Hiện tại chưa có dịch vụ nào cho property này.');
            }
        } catch (error: any) {
            console.error('RequestServiceModal: Error loading services', {
                propertyId,
                error: error.response?.data || error.message,
                fullError: error,
            });
            message.error('Không thể tải danh sách dịch vụ: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoadingServices(false);
        }
    };

    const handleServiceChange = (serviceId: number) => {
        const service = services.find(s => s.id === serviceId);
        setSelectedService(service || null);
        form.setFieldsValue({ quantity: 1 });
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            
            if (!booking || !bookingDetail) {
                message.error('Thông tin booking không hợp lệ');
                return;
            }

            setLoading(true);
            await requestService(booking.id, {
                booking_detail_id: bookingDetail.id,
                service_id: values.service_id,
                quantity: values.quantity,
                notes: values.notes,
            });

            message.success('Yêu cầu dịch vụ đã được gửi. Vui lòng chờ admin xác nhận.');
            form.resetFields();
            setSelectedService(null);
            onSuccess();
            onCancel();
        } catch (error: any) {
            console.error('Error requesting service:', error);
            message.error(error.response?.data?.message || 'Không thể gửi yêu cầu dịch vụ');
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = () => {
        if (!selectedService || !form.getFieldValue('quantity')) return 0;
        return selectedService.price * form.getFieldValue('quantity');
    };

    return (
        <Modal
            title={
                <Space>
                    <ShoppingOutlined />
                    <span>Yêu cầu dịch vụ</span>
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
                    disabled={!selectedService}
                >
                    Gửi yêu cầu
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical">
                {/* Thông tin phòng */}
                {bookingDetail && (
                    <Card size="small" style={{ marginBottom: 24, backgroundColor: '#f5f5f5' }}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Text type="secondary">Phòng</Text>
                                <br />
                                <Text strong>{bookingDetail.room?.name || 'N/A'}</Text>
                            </Col>
                            <Col span={12}>
                                <Text type="secondary">Mã đặt phòng</Text>
                                <br />
                                <Text strong>#{booking?.order_code}</Text>
                            </Col>
                        </Row>
                    </Card>
                )}

                {/* Chọn dịch vụ */}
                <Form.Item
                    name="service_id"
                    label="Chọn dịch vụ"
                    rules={[{ required: true, message: 'Vui lòng chọn dịch vụ' }]}
                >
                    <Select
                        placeholder="Chọn dịch vụ"
                        loading={loadingServices}
                        onChange={handleServiceChange}
                        showSearch
                        filterOption={(input, option) => {
                            const service = services.find(s => s.id === option?.value);
                            return service?.name.toLowerCase().includes(input.toLowerCase()) ?? false;
                        }}
                    >
                        {services.map(service => (
                            <Select.Option key={service.id} value={service.id}>
                                <Space>
                                    <span>{service.name}</span>
                                    <Text type="secondary">-</Text>
                                    <Text strong>{formatVND(service.price)}</Text>
                                    <Text type="secondary">/{service.unit}</Text>
                                </Space>
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                {/* Số lượng */}
                <Form.Item
                    name="quantity"
                    label="Số lượng"
                    rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                >
                    <InputNumber
                        min={1}
                        max={100}
                        defaultValue={1}
                        style={{ width: '100%' }}
                        addonAfter={selectedService?.unit || 'đơn vị'}
                    />
                </Form.Item>

                {/* Tổng tiền */}
                {selectedService && (
                    <Card size="small" style={{ marginBottom: 16, backgroundColor: '#e6f7ff' }}>
                        <Row justify="space-between" align="middle">
                            <Col>
                                <Text type="secondary">Tổng tiền dự kiến:</Text>
                            </Col>
                            <Col>
                                <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                                    <DollarOutlined /> {formatVND(calculateTotal())}
                                </Title>
                            </Col>
                        </Row>
                    </Card>
                )}

                {/* Ghi chú */}
                <Form.Item name="notes" label="Ghi chú (tùy chọn)">
                    <TextArea
                        rows={3}
                        placeholder="Nhập ghi chú nếu có"
                        maxLength={1000}
                        showCount
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default RequestServiceModal;

