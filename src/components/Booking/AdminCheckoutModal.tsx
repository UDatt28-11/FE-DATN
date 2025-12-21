import React, { useState, useEffect, useMemo } from 'react';
import {
    Modal,
    Form,
    Button,
    Space,
    Typography,
    Alert,
    Divider,
    List,
    Tag,
    Select,
    InputNumber,
    Input,
    Table,
    Card,
    Row,
    Col,
    message,
    Spin,
    Empty,
    Upload,
    Image,
} from 'antd';
import {
    LogoutOutlined,
    ExclamationCircleOutlined,
    ShoppingOutlined,
    WarningOutlined,
    PlusOutlined,
    DeleteOutlined,
    EyeOutlined,
    ToolOutlined,
    UploadOutlined,
    DeleteOutlined as DeleteIcon,
} from '@ant-design/icons';
import type { BookingOrder, BookingService } from '../../types/booking/booking';
import { checkOutDirect, getSuppliesForCheckout, previewCheckout } from '../../service/bookingService';
import { formatVND } from '../../utils/currency';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface Supply {
    id: number;
    name: string;
    description?: string;
    category?: string;
    unit?: string;
    unit_price: number;
    current_stock: number;
}

interface DamagedItem {
    supply_id: number;
    supply_name: string;
    quantity: number;
    unit_price: number;
    notes?: string;
    total: number;
    damage_images?: File[];
    preview_images?: string[];
}

interface PreviewData {
    existing_total: number;
    paid_amount: number;
    damage_items: {
        supply_id: number;
        name: string;
        category?: string;
        quantity: number;
        unit?: string;
        unit_price: number;
        total: number;
    }[];
    total_damage_fee: number;
    service_items: any[];
    total_service_fee: number;
    grand_total: number;
    remaining_amount: number;
}

interface AdminCheckoutModalProps {
    open?: boolean;
    visible?: boolean;
    booking: BookingOrder | null;
    onCancel: () => void;
    onSuccess: () => void;
}

const AdminCheckoutModal: React.FC<AdminCheckoutModalProps> = ({
    open,
    visible,
    booking,
    onCancel,
    onSuccess,
}) => {
    const isOpen = open !== undefined ? open : visible;
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [loadingSupplies, setLoadingSupplies] = useState(false);
    const [loadingPreview, setLoadingPreview] = useState(false);
    
    const [supplies, setSupplies] = useState<Supply[]>([]);
    const [damagedItems, setDamagedItems] = useState<DamagedItem[]>([]);
    const [previewData, setPreviewData] = useState<PreviewData | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    
    const [roomStatus, setRoomStatus] = useState<'available' | 'maintenance'>('available');
    const [notes, setNotes] = useState('');

    // Fetch supplies when modal opens
    useEffect(() => {
        if (isOpen && booking) {
            fetchSupplies();
            setDamagedItems([]);
            setPreviewData(null);
            setShowPreview(false);
            setRoomStatus('available');
            setNotes('');
        }
    }, [isOpen, booking]);

    const fetchSupplies = async () => {
        if (!booking) return;
        
        setLoadingSupplies(true);
        try {
            const result = await getSuppliesForCheckout(booking.id);
            setSupplies(result.data || []);
        } catch (error: any) {
            console.error('Error fetching supplies:', error);
            // Don't show error, just continue without supplies
        } finally {
            setLoadingSupplies(false);
        }
    };

    const handleAddDamageItem = () => {
        if (supplies.length === 0) {
            message.warning('Không có vật tư nào để thêm');
            return;
        }
        
        // Add empty damage item
        setDamagedItems([
            ...damagedItems,
            {
                supply_id: 0,
                supply_name: '',
                quantity: 1,
                unit_price: 0,
                notes: '',
                total: 0,
                damage_images: [],
                preview_images: [],
            },
        ]);
    };

    const handleRemoveDamageItem = (index: number) => {
        const newItems = [...damagedItems];
        newItems.splice(index, 1);
        setDamagedItems(newItems);
    };

    const handleDamageItemChange = (index: number, field: string, value: any) => {
        const newItems = [...damagedItems];
        
        if (field === 'supply_id') {
            const supply = supplies.find(s => s.id === value);
            if (supply) {
                newItems[index] = {
                    ...newItems[index],
                    supply_id: value,
                    supply_name: supply.name,
                    unit_price: supply.unit_price,
                    total: supply.unit_price * newItems[index].quantity,
                };
            }
        } else if (field === 'quantity') {
            newItems[index] = {
                ...newItems[index],
                quantity: value,
                total: newItems[index].unit_price * value,
            };
        } else if (field === 'unit_price') {
            newItems[index] = {
                ...newItems[index],
                unit_price: value,
                total: value * newItems[index].quantity,
            };
        } else if (field === 'notes') {
            newItems[index] = {
                ...newItems[index],
                notes: value,
            };
        } else if (field === 'damage_images') {
            newItems[index] = {
                ...newItems[index],
                damage_images: value,
            };
        }
        
        setDamagedItems(newItems);
    };

    const handleImageUpload = (index: number, fileList: any) => {
        const newItems = [...damagedItems];
        const files = fileList.map((file: any) => file.originFileObj || file);
        const previews = fileList.map((file: any) => {
            if (file.url) return file.url;
            if (file.originFileObj) {
                return URL.createObjectURL(file.originFileObj);
            }
            return null;
        }).filter(Boolean);
        
        newItems[index] = {
            ...newItems[index],
            damage_images: files,
            preview_images: previews,
        };
        
        setDamagedItems(newItems);
        return false; // Prevent auto upload
    };

    const handleRemoveImage = (itemIndex: number, imageIndex: number) => {
        const newItems = [...damagedItems];
        const item = newItems[itemIndex];
        
        if (item.damage_images) {
            item.damage_images.splice(imageIndex, 1);
        }
        if (item.preview_images) {
            const previewUrl = item.preview_images[imageIndex];
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
            item.preview_images.splice(imageIndex, 1);
        }
        
        setDamagedItems(newItems);
    };

    const handlePreview = async () => {
        if (!booking) return;
        
        setLoadingPreview(true);
        try {
            const validDamageItems = damagedItems.filter(item => item.supply_id > 0 && item.quantity > 0);
            
            const result = await previewCheckout(booking.id, {
                damaged_supplies: validDamageItems.map(item => ({
                    supply_id: item.supply_id,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                })),
                additional_services: [],
            });
            
            setPreviewData(result.preview);
            setShowPreview(true);
        } catch (error: any) {
            console.error('Error previewing checkout:', error);
            message.error(error.response?.data?.message || 'Không thể tạo bản xem trước');
        } finally {
            setLoadingPreview(false);
        }
    };

    const handleCheckout = async () => {
        if (!booking) return;

        try {
            setLoading(true);
            
            const validDamageItems = damagedItems.filter(item => item.supply_id > 0 && item.quantity > 0);
            
            await checkOutDirect(booking.id, {
                room_status: roomStatus,
                notes: notes,
                damaged_supplies: validDamageItems.map(item => ({
                    supply_id: item.supply_id,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    notes: item.notes,
                    damage_images: item.damage_images || [],
                })),
                additional_services: [],
            });
            
            message.success('Checkout thành công!');
            onSuccess();
        } catch (error: any) {
            console.error('Checkout error:', error);
            if (error.response?.status !== 401 && error.response?.status !== 403) {
                message.error(error.response?.data?.message || 'Có lỗi xảy ra khi checkout');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!booking) return null;

    const roomName = booking.details?.[0]?.room?.name || 'N/A';
    
    // Approved services
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

    const damageTotal = damagedItems.reduce((sum, item) => sum + item.total, 0);
    const baseAmount = booking.total_amount || 0;
    const totalAmount = baseAmount + servicesTotal + damageTotal;
    const paidAmount = booking.deposit_amount || 0;
    const remainingAmount = totalAmount - paidAmount;

    // Damage items table columns
    const damageColumns = [
        {
            title: 'Vật tư',
            dataIndex: 'supply_id',
            key: 'supply_id',
            width: 200,
            render: (_: any, record: DamagedItem, index: number) => (
                <Select
                    style={{ width: '100%' }}
                    placeholder="Chọn vật tư"
                    value={record.supply_id || undefined}
                    onChange={(value) => handleDamageItemChange(index, 'supply_id', value)}
                    showSearch
                    optionFilterProp="children"
                >
                    {supplies.map(supply => (
                        <Select.Option key={supply.id} value={supply.id}>
                            {supply.name} ({supply.category || 'N/A'})
                        </Select.Option>
                    ))}
                </Select>
            ),
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 100,
            render: (_: any, record: DamagedItem, index: number) => (
                <InputNumber
                    min={1}
                    max={100}
                    value={record.quantity}
                    onChange={(value) => handleDamageItemChange(index, 'quantity', value || 1)}
                    style={{ width: '100%' }}
                />
            ),
        },
        {
            title: 'Đơn giá',
            dataIndex: 'unit_price',
            key: 'unit_price',
            width: 150,
            render: (_: any, record: DamagedItem, index: number) => (
                <InputNumber
                    min={0}
                    step={10000}
                    value={record.unit_price}
                    onChange={(value) => handleDamageItemChange(index, 'unit_price', value || 0)}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => Number(value?.replace(/\$\s?|(,*)/g, ''))}
                    style={{ width: '100%' }}
                />
            ),
        },
        {
            title: 'Thành tiền',
            dataIndex: 'total',
            key: 'total',
            width: 120,
            render: (total: number) => (
                <Text strong style={{ color: '#f5222d' }}>
                    {formatVND(total)}
                </Text>
            ),
        },
        {
            title: 'Ghi chú',
            dataIndex: 'notes',
            key: 'notes',
            width: 150,
            render: (_: any, record: DamagedItem, index: number) => (
                <Input
                    placeholder="Ghi chú"
                    value={record.notes}
                    onChange={(e) => handleDamageItemChange(index, 'notes', e.target.value)}
                />
            ),
        },
        {
            title: 'Ảnh minh chứng',
            key: 'damage_images',
            width: 200,
            render: (_: any, record: DamagedItem, index: number) => (
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Upload
                        multiple
                        beforeUpload={() => false}
                        fileList={record.damage_images?.map((file, fileIndex) => ({
                            uid: `${index}-${fileIndex}`,
                            name: file.name,
                            status: 'done',
                            url: record.preview_images?.[fileIndex] || undefined,
                            originFileObj: file,
                        })) || []}
                        onChange={(info) => handleImageUpload(index, info.fileList)}
                        accept="image/*"
                        listType="picture-card"
                        maxCount={5}
                    >
                        {(record.damage_images?.length || 0) < 5 && (
                            <div>
                                <UploadOutlined />
                                <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                        )}
                    </Upload>
                    {record.preview_images && record.preview_images.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {record.preview_images.map((preview, imgIndex) => (
                                <div key={imgIndex} style={{ position: 'relative' }}>
                                    <Image
                                        src={preview}
                                        width={50}
                                        height={50}
                                        style={{ objectFit: 'cover', borderRadius: 4 }}
                                        preview
                                    />
                                    <Button
                                        type="text"
                                        danger
                                        size="small"
                                        icon={<DeleteIcon />}
                                        style={{ position: 'absolute', top: -8, right: -8 }}
                                        onClick={() => handleRemoveImage(index, imgIndex)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </Space>
            ),
        },
        {
            title: '',
            key: 'action',
            width: 50,
            render: (_: any, __: any, index: number) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveDamageItem(index)}
                />
            ),
        },
    ];

    return (
        <Modal
            title={
                <Space>
                    <LogoutOutlined />
                    <span>Check-out & Tạo hóa đơn (Admin)</span>
                </Space>
            }
            open={isOpen}
            onCancel={onCancel}
            width={900}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Hủy
                </Button>,
                <Button
                    key="preview"
                    icon={<EyeOutlined />}
                    onClick={handlePreview}
                    loading={loadingPreview}
                    disabled={loading}
                >
                    Xem trước hóa đơn
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
                    Xác nhận Checkout
                </Button>,
            ]}
        >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {/* Booking Info */}
                <Card size="small" style={{ backgroundColor: '#f5f5f5' }}>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Text type="secondary">Mã đặt phòng</Text>
                            <br />
                            <Text strong>#{booking.order_code}</Text>
                        </Col>
                        <Col span={8}>
                            <Text type="secondary">Phòng</Text>
                            <br />
                            <Text strong>{roomName}</Text>
                        </Col>
                        <Col span={8}>
                            <Text type="secondary">Khách hàng</Text>
                            <br />
                            <Text strong>{booking.customer_name || booking.guest?.full_name || 'N/A'}</Text>
                        </Col>
                    </Row>
                </Card>

                {/* Room Status */}
                <Card size="small" title="Trạng thái phòng sau checkout">
                    <Select
                        style={{ width: 300 }}
                        value={roomStatus}
                        onChange={setRoomStatus}
                    >
                        <Select.Option value="available">
                            <Tag color="green">Sẵn sàng</Tag> - Phòng sạch, có thể cho khách mới
                        </Select.Option>
                        <Select.Option value="maintenance">
                            <Tag color="orange">Bảo trì</Tag> - Cần dọn dẹp/sửa chữa
                        </Select.Option>
                    </Select>
                </Card>

                {/* Approved Services */}
                {approvedServices.length > 0 && (
                    <Card size="small" title={<><ShoppingOutlined /> Dịch vụ đã được duyệt</>}>
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
                        <div style={{ textAlign: 'right', marginTop: 8 }}>
                            <Text>Tổng dịch vụ: </Text>
                            <Text strong style={{ color: '#1890ff' }}>{formatVND(servicesTotal)}</Text>
                        </div>
                    </Card>
                )}

                {/* Damage Items */}
                <Card 
                    size="small" 
                    title={
                        <Space>
                            <WarningOutlined style={{ color: '#f5222d' }} />
                            <span>Thiệt hại vật tư (nếu có)</span>
                        </Space>
                    }
                    extra={
                        <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={handleAddDamageItem}
                            size="small"
                            loading={loadingSupplies}
                        >
                            Thêm thiệt hại
                        </Button>
                    }
                >
                    {loadingSupplies ? (
                        <div style={{ textAlign: 'center', padding: 20 }}>
                            <Spin size="small" />
                            <div>Đang tải danh sách vật tư...</div>
                        </div>
                    ) : damagedItems.length === 0 ? (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="Chưa có thiệt hại vật tư nào"
                        />
                    ) : (
                        <>
                            <Table
                                columns={damageColumns}
                                dataSource={damagedItems}
                                rowKey={(_, index) => `damage-${index}`}
                                pagination={false}
                                size="small"
                            />
                            <div style={{ textAlign: 'right', marginTop: 8 }}>
                                <Text>Tổng thiệt hại: </Text>
                                <Text strong style={{ color: '#f5222d' }}>{formatVND(damageTotal)}</Text>
                            </div>
                        </>
                    )}
                </Card>

                {/* Notes */}
                <Card size="small" title="Ghi chú checkout">
                    <TextArea
                        rows={2}
                        placeholder="Nhập ghi chú nếu có..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        maxLength={1000}
                    />
                </Card>

                <Divider style={{ margin: '16px 0' }} />

                {/* Summary */}
                <Card size="small" style={{ backgroundColor: '#fafafa' }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text type="secondary">Tiền phòng:</Text>
                                    <Text>{formatVND(baseAmount)}</Text>
                                </div>
                                {servicesTotal > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Text type="secondary">Dịch vụ:</Text>
                                        <Text>{formatVND(servicesTotal)}</Text>
                                    </div>
                                )}
                                {damageTotal > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Text type="secondary" style={{ color: '#f5222d' }}>Thiệt hại:</Text>
                                        <Text style={{ color: '#f5222d' }}>{formatVND(damageTotal)}</Text>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text type="secondary">Đã thanh toán:</Text>
                                    <Text style={{ color: '#52c41a' }}>-{formatVND(paidAmount)}</Text>
                                </div>
                            </Space>
                        </Col>
                        <Col span={12}>
                            <div style={{ textAlign: 'right' }}>
                                <Text type="secondary">Tổng hóa đơn:</Text>
                                <br />
                                <Title level={3} style={{ margin: '4px 0', color: '#1890ff' }}>
                                    {formatVND(totalAmount)}
                                </Title>
                                <Text type="secondary">Còn phải thanh toán:</Text>
                                <br />
                                <Title level={4} style={{ margin: '4px 0', color: remainingAmount > 0 ? '#f5222d' : '#52c41a' }}>
                                    {formatVND(remainingAmount)}
                                </Title>
                            </div>
                        </Col>
                    </Row>
                </Card>

                {/* Preview Modal */}
                {showPreview && previewData && (
                    <Alert
                        message="Bản xem trước hóa đơn"
                        description={
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                <div>Tiền phòng + dịch vụ hiện có: {formatVND(previewData.existing_total)}</div>
                                <div>Đã thanh toán: {formatVND(previewData.paid_amount)}</div>
                                <div style={{ color: '#f5222d' }}>Tổng thiệt hại: {formatVND(previewData.total_damage_fee)}</div>
                                <Divider style={{ margin: '8px 0' }} />
                                <div><strong>Tổng hóa đơn: {formatVND(previewData.grand_total)}</strong></div>
                                <div style={{ color: previewData.remaining_amount > 0 ? '#f5222d' : '#52c41a' }}>
                                    <strong>Còn phải thanh toán: {formatVND(previewData.remaining_amount)}</strong>
                                </div>
                            </Space>
                        }
                        type="info"
                        showIcon
                        closable
                        onClose={() => setShowPreview(false)}
                    />
                )}
            </Space>
        </Modal>
    );
};

export default AdminCheckoutModal;

