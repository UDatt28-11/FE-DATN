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
    Empty,
} from 'antd';
import {
    AppstoreOutlined,
    WifiOutlined,
    CoffeeOutlined,
    SafetyOutlined,
    ThunderboltOutlined,
    CheckCircleFilled,
} from '@ant-design/icons';
import type { BookingOrder, BookingDetail } from '../../types/booking/booking';
import { requestAmenity } from '../../service/bookingService';
import api from '../../service/axiosConfig';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface Amenity {
    id: number;
    name: string;
    icon_url?: string;
    type?: string;
    category?: string;
    filter_category?: string;
    property_id?: number;
}

interface RequestAmenityModalProps {
    open: boolean;
    booking: BookingOrder | null;
    bookingDetail: BookingDetail | null;
    onCancel: () => void;
    onSuccess: () => void;
}

// Helper để lấy icon cho amenity
const getAmenityIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('wifi') || lowerName.includes('internet')) {
        return <WifiOutlined />;
    } else if (lowerName.includes('coffee') || lowerName.includes('cà phê') || lowerName.includes('minibar')) {
        return <CoffeeOutlined />;
    } else if (lowerName.includes('safe') || lowerName.includes('két')) {
        return <SafetyOutlined />;
    } else if (lowerName.includes('tv') || lowerName.includes('tivi')) {
        return <ThunderboltOutlined />;
    }
    return <AppstoreOutlined />;
};

const RequestAmenityModal: React.FC<RequestAmenityModalProps> = ({
    open,
    booking,
    bookingDetail,
    onCancel,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [loadingAmenities, setLoadingAmenities] = useState(false);
    const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);

    useEffect(() => {
        if (open && bookingDetail) {
            loadAmenities();
        }
    }, [open, bookingDetail]);

    const loadAmenities = async () => {
        if (!bookingDetail) {
            console.warn('RequestAmenityModal: bookingDetail is null');
            return;
        }
        
        // Lấy property_id từ nhiều nguồn khác nhau
        const room = bookingDetail.room as any;
        const propertyId = 
            room?.property?.id ||
            room?.property_id ||
            room?.roomType?.property_id ||
            room?.roomType?.property?.id;
        
        console.log('RequestAmenityModal: Loading amenities', {
            bookingDetailId: bookingDetail.id,
            room: room ? { id: room.id, name: room.name } : null,
            propertyId,
        });
        
        setLoadingAmenities(true);
        try {
            // Dùng public endpoint để lấy amenities
            const params: Record<string, any> = { limit: 100 };
            if (propertyId) {
                params.property_id = propertyId;
            }
            
            const response = await api.get('/public/amenities', { params });
            
            console.log('RequestAmenityModal: Loaded amenities', response.data);
            // Chỉ lấy amenities có category là "service"
            const allAmenities = response.data?.data || [];
            const serviceAmenities = allAmenities.filter((a: Amenity) => a.category === 'service');
            console.log('RequestAmenityModal: Filtered service amenities', serviceAmenities);
            setAmenities(serviceAmenities);
        } catch (error: any) {
            console.error('Error loading amenities:', error);
            message.error('Không thể tải danh sách tiện ích');
        } finally {
            setLoadingAmenities(false);
        }
    };

    const handleAmenityChange = (amenityId: number) => {
        const selected = amenities.find(a => a.id === amenityId) || null;
        setSelectedAmenity(selected);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            
            if (!booking || !bookingDetail) {
                message.error('Thông tin booking không hợp lệ');
                return;
            }

            setLoading(true);
            await requestAmenity(booking.id, {
                booking_detail_id: bookingDetail.id,
                amenity_id: values.amenity_id,
                quantity: 1, // Tiện ích chỉ có thể yêu cầu 1 lần
                notes: values.notes,
            });

            message.success('Yêu cầu tiện ích đã được gửi. Vui lòng chờ admin xác nhận.');
            form.resetFields();
            setSelectedAmenity(null);
            onSuccess();
            onCancel();
        } catch (error: any) {
            console.error('Error requesting amenity:', error);
            message.error(error.response?.data?.message || 'Không thể gửi yêu cầu tiện ích');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={
                <Space>
                    <AppstoreOutlined style={{ color: '#1890ff' }} />
                    <span>Yêu cầu tiện ích dịch vụ</span>
                </Space>
            }
            open={open}
            onCancel={() => {
                form.resetFields();
                setSelectedAmenity(null);
                onCancel();
            }}
            footer={null}
            width={600}
            destroyOnHidden
        >
            {loadingAmenities ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16 }}>Đang tải danh sách tiện ích...</div>
                </div>
            ) : amenities.length === 0 ? (
                <Empty description="Không có tiện ích dịch vụ nào khả dụng" />
            ) : (
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    {/* Thông tin phòng */}
                    {bookingDetail && (
                        <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f5f5f5' }}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Text type="secondary">Phòng:</Text>
                                    <br />
                                    <Text strong>{(bookingDetail.room as any)?.name || 'N/A'}</Text>
                                </Col>
                                <Col span={12}>
                                    <Text type="secondary">Loại phòng:</Text>
                                    <br />
                                    <Text strong>
                                        {(bookingDetail.room as any)?.room_type ||
                                         (bookingDetail.room as any)?.roomType?.name || 'N/A'}
                                    </Text>
                                </Col>
                            </Row>
                        </Card>
                    )}

                    {/* Chọn tiện ích */}
                    <Form.Item
                        name="amenity_id"
                        label="Chọn tiện ích"
                        rules={[{ required: true, message: 'Vui lòng chọn tiện ích' }]}
                    >
                        <Select
                            placeholder="Chọn tiện ích dịch vụ cần yêu cầu"
                            onChange={handleAmenityChange}
                            size="large"
                            showSearch
                            optionFilterProp="children"
                        >
                            {amenities.map((amenity) => (
                                <Select.Option key={amenity.id} value={amenity.id}>
                                    <Space>
                                        {getAmenityIcon(amenity.name)}
                                        <span>{amenity.name}</span>
                                    </Space>
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {/* Thông tin tiện ích đã chọn */}
                    {selectedAmenity && (
                        <Card 
                            size="small" 
                            style={{ 
                                marginBottom: 16, 
                                backgroundColor: '#e6f7ff',
                                border: '1px solid #91d5ff'
                            }}
                        >
                            <Space>
                                <CheckCircleFilled style={{ color: '#52c41a', fontSize: 20 }} />
                                <div>
                                    <Text strong>{selectedAmenity.name}</Text>
                                    <br />
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {selectedAmenity.category || selectedAmenity.filter_category || 'Tiện ích dịch vụ'}
                                    </Text>
                                </div>
                            </Space>
                        </Card>
                    )}

                    {/* Ghi chú */}
                    <Form.Item
                        name="notes"
                        label="Ghi chú (không bắt buộc)"
                    >
                        <TextArea
                            rows={3}
                            placeholder="Nhập ghi chú hoặc yêu cầu đặc biệt..."
                            maxLength={1000}
                            showCount
                        />
                    </Form.Item>

                    {/* Buttons */}
                    <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={onCancel}>
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                icon={<AppstoreOutlined />}
                            >
                                Gửi yêu cầu
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            )}
        </Modal>
    );
};

export default RequestAmenityModal;

