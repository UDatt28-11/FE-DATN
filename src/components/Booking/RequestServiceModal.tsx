import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Select,
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
    bookingDetail: BookingDetail | null; // Phòng được chọn mặc định (nếu có)
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
    const [selectedBookingDetailId, setSelectedBookingDetailId] = useState<number | null>(null);

    useEffect(() => {
        if (open && booking) {
            // Nếu có bookingDetail được truyền vào, dùng nó làm mặc định
            if (bookingDetail) {
                setSelectedBookingDetailId(bookingDetail.id);
                form.setFieldsValue({ booking_detail_id: bookingDetail.id });
                loadServices(bookingDetail);
            } else if (booking.details && booking.details.length > 0) {
                // Nếu không có bookingDetail, chọn phòng đầu tiên
                const firstDetail = booking.details[0];
                setSelectedBookingDetailId(firstDetail.id);
                form.setFieldsValue({ booking_detail_id: firstDetail.id });
                loadServices(firstDetail);
            }
        }
    }, [open, booking, bookingDetail, form]);

    const loadServices = async (detail?: BookingDetail) => {
        const currentDetail = detail || booking?.details?.find(d => d.id === selectedBookingDetailId) || bookingDetail;
        
        if (!currentDetail) {
            console.warn('RequestServiceModal: bookingDetail is null');
            return;
        }
        
        // Lấy room_type_id từ room
        const room = currentDetail.room as any;
        // Thử nhiều cách để lấy room_type_id
        let roomTypeId: number | null = null;
        
        if (room) {
            // Cách 1: Từ roomType object (nếu đã được load đầy đủ)
            if (room.roomType && typeof room.roomType === 'object' && room.roomType.id) {
                roomTypeId = room.roomType.id;
            }
            // Cách 2: Từ room_type_id trực tiếp (đã được thêm vào BookingOrderResource)
            else if (room.room_type_id) {
                roomTypeId = room.room_type_id;
            }
            // Cách 3: Từ room.room_type_id (nếu có trong database trực tiếp)
            else if ((room as any).room_type_id) {
                roomTypeId = (room as any).room_type_id;
            }
        }
        
        const propertyId = 
            room?.property?.id ||
            room?.property_id ||
            room?.roomType?.property_id ||
            room?.roomType?.property?.id;
        
        console.log('RequestServiceModal: Loading services', {
            bookingDetailId: currentDetail.id,
            room: room ? { id: room.id, name: room.name } : null,
            roomTypeId,
            propertyId,
        });
        
        if (!roomTypeId) {
            console.warn('RequestServiceModal: Cannot find room_type_id', {
                bookingDetail: currentDetail,
                room,
            });
            message.warning('Không tìm thấy thông tin loại phòng. Vui lòng thử lại.');
            return;
        }
        
        setLoadingServices(true);
        try {
            // Lấy services theo room_type_id để chỉ hiển thị dịch vụ thuộc loại phòng này
            const data = await serviceService.getAll({
                room_type_id: roomTypeId,
            });
            console.log('RequestServiceModal: Services loaded', {
                propertyId,
                servicesCount: Array.isArray(data) ? data.length : 0,
                data,
            });
            setServices(Array.isArray(data) ? data : []);
            if (Array.isArray(data) && data.length === 0) {
                message.warning('Hiện tại chưa có dịch vụ nào được gán cho loại phòng này. Vui lòng liên hệ admin để thêm dịch vụ.');
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
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            
            if (!booking) {
                message.error('Thông tin booking không hợp lệ');
                return;
            }

            // Lấy booking_detail_id từ form hoặc selectedBookingDetailId
            const detailId = values.booking_detail_id || selectedBookingDetailId;
            if (!detailId) {
                message.error('Vui lòng chọn phòng');
                return;
            }

            setLoading(true);
            await requestService(booking.id, {
                booking_detail_id: detailId,
                service_id: values.service_id,
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
                {/* Thông tin booking */}
                {booking && (
                    <Card size="small" style={{ marginBottom: 24, backgroundColor: '#f5f5f5' }}>
                        <Row gutter={16}>
                            <Col span={24}>
                                <Text type="secondary">Mã đặt phòng</Text>
                                <br />
                                <Text strong>#{booking.order_code}</Text>
                            </Col>
                        </Row>
                    </Card>
                )}

                {/* Chọn phòng (nếu booking có nhiều phòng) */}
                {booking && booking.details && booking.details.length > 1 && (
                    <Form.Item
                        name="booking_detail_id"
                        label="Chọn phòng"
                        rules={[{ required: true, message: 'Vui lòng chọn phòng' }]}
                    >
                        <Select
                            placeholder="Chọn phòng cần dịch vụ"
                            onChange={(value) => {
                                setSelectedBookingDetailId(value);
                                const selectedDetail = booking.details?.find(d => d.id === value);
                                if (selectedDetail) {
                                    loadServices(selectedDetail);
                                }
                            }}
                        >
                            {booking.details.map((detail) => (
                                <Select.Option key={detail.id} value={detail.id}>
                                    {detail.room?.name || `Phòng ${detail.id}`}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}

                {/* Hiển thị phòng đã chọn (nếu chỉ có 1 phòng) */}
                {booking && booking.details && booking.details.length === 1 && bookingDetail && (
                    <Card size="small" style={{ marginBottom: 24, backgroundColor: '#f0f9ff' }}>
                        <Row gutter={16}>
                            <Col span={24}>
                                <Text type="secondary">Phòng</Text>
                                <br />
                                <Text strong>{bookingDetail.room?.name || 'N/A'}</Text>
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

                {/* Thông tin giá */}
                {selectedService && (
                    <Card size="small" style={{ marginBottom: 16, backgroundColor: '#e6f7ff' }}>
                        <Row justify="space-between" align="middle">
                            <Col>
                                <Text type="secondary">Mức giá:</Text>
                            </Col>
                            <Col>
                                <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                                    <DollarOutlined /> {formatVND(selectedService.price)}/{selectedService.unit}
                                </Title>
                            </Col>
                        </Row>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
                            Giá trị cụ thể sẽ được xác nhận sau khi dịch vụ kết thúc
                        </Text>
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

