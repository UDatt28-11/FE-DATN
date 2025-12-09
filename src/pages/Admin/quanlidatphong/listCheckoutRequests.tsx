import React, { useEffect, useState } from 'react';
import {
    Table,
    Card,
    Row,
    Col,
    Space,
    Select,
    Button,
    Tag,
    Modal,
    Descriptions,
    message,
    Input as AntdInput,
    InputNumber,
    Empty,
    Spin,
    Divider,
    Alert,
} from 'antd';
import {
    EyeOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ReloadOutlined,
    LogoutOutlined,
    UserOutlined,
    HomeOutlined,
    CalendarOutlined,
    PhoneOutlined,
    WarningOutlined,
    PlusOutlined,
    DeleteOutlined,
    DollarOutlined,
    ToolOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
    getCheckoutRequests,
    rejectCheckoutRequest,
    getSuppliesForCheckout,
    approveCheckoutRequest,
    type CheckoutRequest,
    type DamagedSupply,
} from '../../../service/bookingService';
import type { Pagination } from '../../../types/booking/booking';
import { formatVND } from '../../../utils/currency';

const { TextArea } = AntdInput;
const { Option } = Select;

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
}

const ListCheckoutRequests: React.FC = () => {
    const [requests, setRequests] = useState<CheckoutRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<Pagination | undefined>();
    const [selectedRequest, setSelectedRequest] = useState<CheckoutRequest | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

    // State cho checkout với thiệt hại
    const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
    const [supplies, setSupplies] = useState<Supply[]>([]);
    const [loadingSupplies, setLoadingSupplies] = useState(false);
    const [damagedItems, setDamagedItems] = useState<DamagedItem[]>([]);
    const [roomStatus, setRoomStatus] = useState<'available' | 'maintenance'>('available');
    const [checkoutNotes, setCheckoutNotes] = useState('');
    const [processingCheckout, setProcessingCheckout] = useState(false);

    const fetchData = async (page = 1, status?: string) => {
        setLoading(true);
        try {
            const result = await getCheckoutRequests({
                page,
                per_page: 15,
                status: status === 'all' ? undefined : (status as any),
            });
            setRequests(result.data);
            setPagination(result.pagination);
        } catch (error: any) {
            console.error('Error fetching checkout requests:', error);
            message.error(error.response?.data?.message || 'Không thể tải danh sách yêu cầu checkout');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(1, statusFilter);
    }, [statusFilter]);

    // Mở modal checkout với thiệt hại
    const handleOpenCheckoutModal = async (request: CheckoutRequest) => {
        setSelectedRequest(request);
        setDamagedItems([]);
        setRoomStatus('available');
        setCheckoutNotes('');
        setCheckoutModalVisible(true);

        // Fetch supplies cho booking này
        if (request.booking_order_id) {
            setLoadingSupplies(true);
            try {
                const result = await getSuppliesForCheckout(request.booking_order_id);
                setSupplies(result.data || []);
            } catch (error: any) {
                console.error('Error fetching supplies:', error);
                // Don't show error, just continue without supplies
            } finally {
                setLoadingSupplies(false);
            }
        }
    };

    // Xử lý checkout với thiệt hại
    const handleProcessCheckout = async () => {
        if (!selectedRequest) return;

        setProcessingCheckout(true);
        try {
            const validDamageItems: DamagedSupply[] = damagedItems
                .filter(item => item.supply_id > 0 && item.quantity > 0)
                .map(item => ({
                    supply_id: item.supply_id,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    notes: item.notes,
                }));

            await approveCheckoutRequest(selectedRequest.id, {
                room_status: roomStatus,
                notes: checkoutNotes,
                damaged_supplies: validDamageItems.length > 0 ? validDamageItems : undefined,
            });

            message.success('Checkout thành công! Hóa đơn đã được tạo.');
            setCheckoutModalVisible(false);
            setDetailModalVisible(false);
            fetchData(pagination?.current_page || 1, statusFilter);
        } catch (error: any) {
            console.error('Error processing checkout:', error);
            if (error.response?.status !== 401 && error.response?.status !== 403) {
                message.error(error.response?.data?.message || 'Không thể xử lý checkout');
            }
        } finally {
            setProcessingCheckout(false);
        }
    };

    // Thêm thiệt hại mới
    const handleAddDamageItem = () => {
        if (supplies.length === 0) {
            message.warning('Không có vật tư nào để thêm');
            return;
        }

        setDamagedItems([
            ...damagedItems,
            {
                supply_id: 0,
                supply_name: '',
                quantity: 1,
                unit_price: 0,
                notes: '',
                total: 0,
            },
        ]);
    };

    // Xóa thiệt hại
    const handleRemoveDamageItem = (index: number) => {
        const newItems = [...damagedItems];
        newItems.splice(index, 1);
        setDamagedItems(newItems);
    };

    // Cập nhật thiệt hại
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
        }

        setDamagedItems(newItems);
    };

    const handleReject = async () => {
        if (!selectedRequest || !rejectReason.trim()) {
            message.warning('Vui lòng nhập lý do từ chối');
            return;
        }

        try {
            await rejectCheckoutRequest(selectedRequest.id, rejectReason);
            message.success('Yêu cầu checkout đã bị từ chối');
            setRejectModalVisible(false);
            setRejectReason('');
            setSelectedRequest(null);
            fetchData(pagination?.current_page || 1, statusFilter);
            setDetailModalVisible(false);
        } catch (error: any) {
            if (error.response?.status !== 401 && error.response?.status !== 403) {
                console.error('Error rejecting request:', error);
                message.error(error.response?.data?.message || 'Không thể từ chối yêu cầu checkout');
            }
        }
    };

    const handleViewDetail = (request: CheckoutRequest) => {
        setSelectedRequest(request);
        setDetailModalVisible(true);
    };

    const handleTableChange = (page: number) => {
        fetchData(page, statusFilter);
    };

    // Tính tổng thiệt hại
    const totalDamage = damagedItems.reduce((sum, item) => sum + item.total, 0);

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'Mã đặt phòng',
            key: 'booking_code',
            render: (_: any, record: CheckoutRequest) => (
                <span>#{record.booking_order?.order_code || record.booking_order_id}</span>
            ),
        },
        {
            title: 'Khách hàng',
            key: 'guest',
            render: (_: any, record: CheckoutRequest) => (
                <Space direction="vertical" size="small">
                    <div>
                        <UserOutlined /> {record.booking_order?.guest?.full_name || record.booking_order?.customer_name || 'N/A'}
                    </div>
                    <div style={{ fontSize: 12, color: '#999' }}>
                        <PhoneOutlined /> {record.booking_order?.guest?.phone_number || record.booking_order?.customer_phone || 'N/A'}
                    </div>
                </Space>
            ),
        },
        {
            title: 'Phòng',
            key: 'room',
            render: (_: any, record: CheckoutRequest) => (
                <Space direction="vertical" size="small">
                    <div>
                        <HomeOutlined /> {record.booking_detail?.room?.name || 'N/A'}
                    </div>
                    {record.booking_detail?.room?.roomType?.name && (
                        <Tag color="blue">{record.booking_detail.room.roomType.name}</Tag>
                    )}
                </Space>
            ),
        },
        {
            title: 'Ngày check-in/out',
            key: 'dates',
            render: (_: any, record: CheckoutRequest) => (
                <Space direction="vertical" size="small">
                    <div>
                        <CalendarOutlined /> {record.booking_detail?.check_in_date || 'N/A'}
                    </div>
                    <div>
                        <LogoutOutlined /> {record.booking_detail?.check_out_date || 'N/A'}
                    </div>
                </Space>
            ),
        },
        {
            title: 'Ghi chú',
            dataIndex: 'notes',
            key: 'notes',
            render: (notes: string) => notes || <span style={{ color: '#999' }}>Không có</span>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const config: Record<string, { color: string; text: string }> = {
                    pending: { color: 'orange', text: 'Chờ xử lý' },
                    approved: { color: 'green', text: 'Đã duyệt' },
                    rejected: { color: 'red', text: 'Đã từ chối' },
                };
                const cfg = config[status] || { color: 'default', text: status };
                return <Tag color={cfg.color}>{cfg.text}</Tag>;
            },
        },
        {
            title: 'Ngày yêu cầu',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 280,
            render: (_: any, record: CheckoutRequest) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetail(record)}
                    >
                        Xem
                    </Button>
                    {record.status === 'pending' && (
                        <>
                            <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                                onClick={() => handleOpenCheckoutModal(record)}
                            >
                                Duyệt & Checkout
                            </Button>
                            <Button
                                danger
                                icon={<CloseCircleOutlined />}
                                onClick={() => {
                                    setSelectedRequest(record);
                                    setRejectModalVisible(true);
                                }}
                            >
                                Từ chối
                            </Button>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                    <Col>
                        <h2 style={{ margin: 0 }}>
                            <LogoutOutlined /> Quản lý yêu cầu checkout
                        </h2>
                    </Col>
                    <Col>
                        <Space>
                            <Select
                                value={statusFilter}
                                onChange={(value) => setStatusFilter(value)}
                                style={{ width: 150 }}
                            >
                                <Option value="all">Tất cả</Option>
                                <Option value="pending">Chờ xử lý</Option>
                                <Option value="approved">Đã duyệt</Option>
                                <Option value="rejected">Đã từ chối</Option>
                            </Select>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={() => fetchData(pagination?.current_page || 1, statusFilter)}
                            >
                                Làm mới
                            </Button>
                        </Space>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={requests}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: pagination?.current_page || 1,
                        pageSize: pagination?.per_page || 15,
                        total: pagination?.total || 0,
                        onChange: handleTableChange,
                    }}
                />
            </Card>

            {/* Modal chi tiết yêu cầu checkout */}
            <Modal
                title="Chi tiết yêu cầu checkout"
                open={detailModalVisible}
                onCancel={() => {
                    setDetailModalVisible(false);
                    setSelectedRequest(null);
                }}
                footer={[
                    <Button key="close" onClick={() => setDetailModalVisible(false)}>
                        Đóng
                    </Button>,
                    selectedRequest?.status === 'pending' && (
                        <Button
                            key="approve"
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                            onClick={() => {
                                setDetailModalVisible(false);
                                handleOpenCheckoutModal(selectedRequest);
                            }}
                        >
                            Duyệt & Checkout
                        </Button>
                    ),
                    selectedRequest?.status === 'pending' && (
                        <Button
                            key="reject"
                            danger
                            icon={<CloseCircleOutlined />}
                            onClick={() => setRejectModalVisible(true)}
                        >
                            Từ chối
                        </Button>
                    ),
                ]}
                width={700}
            >
                {selectedRequest ? (
                    <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label="Mã yêu cầu">{selectedRequest.id}</Descriptions.Item>
                        <Descriptions.Item label="Mã đặt phòng">
                            #{selectedRequest.booking_order?.order_code || selectedRequest.booking_order_id}
                        </Descriptions.Item>
                        <Descriptions.Item label="Khách hàng">
                            {selectedRequest.booking_order?.guest?.full_name || selectedRequest.booking_order?.customer_name || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">
                            {selectedRequest.booking_order?.guest?.phone_number || selectedRequest.booking_order?.customer_phone || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phòng">
                            {selectedRequest.booking_detail?.room?.name || 'N/A'}
                            {selectedRequest.booking_detail?.room?.roomType?.name && (
                                <Tag color="blue" style={{ marginLeft: 8 }}>
                                    {selectedRequest.booking_detail.room.roomType.name}
                                </Tag>
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày check-in">
                            {selectedRequest.booking_detail?.check_in_date || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày check-out">
                            {selectedRequest.booking_detail?.check_out_date || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ghi chú">
                            {selectedRequest.notes || 'Không có'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color={selectedRequest.status === 'pending' ? 'orange' : selectedRequest.status === 'approved' ? 'green' : 'red'}>
                                {selectedRequest.status === 'pending' ? 'Chờ xử lý' : selectedRequest.status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
                            </Tag>
                        </Descriptions.Item>
                        {selectedRequest.status === 'rejected' && selectedRequest.rejection_reason && (
                            <Descriptions.Item label="Lý do từ chối">
                                <Tag color="red">{selectedRequest.rejection_reason}</Tag>
                            </Descriptions.Item>
                        )}
                        {selectedRequest.reviewer && (
                            <Descriptions.Item label="Người xử lý">
                                {selectedRequest.reviewer?.full_name || 'N/A'}
                            </Descriptions.Item>
                        )}
                        {selectedRequest.reviewed_at && (
                            <Descriptions.Item label="Thời gian xử lý">
                                {dayjs(selectedRequest.reviewed_at).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                        )}
                        <Descriptions.Item label="Ngày yêu cầu">
                            {dayjs(selectedRequest.created_at).format('DD/MM/YYYY HH:mm')}
                        </Descriptions.Item>
                    </Descriptions>
                ) : (
                    <div>Đang tải...</div>
                )}
            </Modal>

            {/* Modal checkout với thiệt hại vật tư */}
            <Modal
                title={
                    <Space>
                        <LogoutOutlined style={{ color: '#52c41a' }} />
                        <span>Checkout & Ghi nhận thiệt hại</span>
                    </Space>
                }
                open={checkoutModalVisible}
                onCancel={() => {
                    setCheckoutModalVisible(false);
                    setDamagedItems([]);
                }}
                width={900}
                footer={[
                    <Button key="cancel" onClick={() => setCheckoutModalVisible(false)}>
                        Hủy
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={processingCheckout}
                        icon={<CheckCircleOutlined />}
                        onClick={handleProcessCheckout}
                        style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                    >
                        Xác nhận Checkout
                    </Button>,
                ]}
            >
                {selectedRequest && (
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        {/* Thông tin booking */}
                        <Card size="small" style={{ backgroundColor: '#f5f5f5' }}>
                            <Row gutter={16}>
                                <Col span={8}>
                                    <div><strong>Mã đặt phòng:</strong></div>
                                    <div>#{selectedRequest.booking_order?.order_code}</div>
                                </Col>
                                <Col span={8}>
                                    <div><strong>Phòng:</strong></div>
                                    <div>{selectedRequest.booking_detail?.room?.name || 'N/A'}</div>
                                </Col>
                                <Col span={8}>
                                    <div><strong>Khách hàng:</strong></div>
                                    <div>{selectedRequest.booking_order?.guest?.full_name || selectedRequest.booking_order?.customer_name || 'N/A'}</div>
                                </Col>
                            </Row>
                        </Card>

                        {/* Trạng thái phòng sau checkout */}
                        <Card size="small" title={<><ToolOutlined /> Trạng thái phòng sau checkout</>}>
                            <Select
                                style={{ width: 350 }}
                                value={roomStatus}
                                onChange={setRoomStatus}
                            >
                                <Option value="available">
                                    <Tag color="green">Sẵn sàng</Tag> - Phòng sạch, có thể cho khách mới
                                </Option>
                                <Option value="maintenance">
                                    <Tag color="orange">Bảo trì</Tag> - Cần dọn dẹp/sửa chữa
                                </Option>
                            </Select>
                        </Card>

                        {/* Thiệt hại vật tư */}
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
                                    description="Chưa có thiệt hại vật tư nào. Click 'Thêm thiệt hại' để ghi nhận."
                                />
                            ) : (
                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                    {damagedItems.map((item, index) => (
                                        <Card key={index} size="small" style={{ backgroundColor: '#fff7e6' }}>
                                            <Row gutter={16} align="middle">
                                                <Col span={7}>
                                                    <div style={{ marginBottom: 4 }}>Vật tư:</div>
                                                    <Select
                                                        style={{ width: '100%' }}
                                                        placeholder="Chọn vật tư"
                                                        value={item.supply_id || undefined}
                                                        onChange={(value) => handleDamageItemChange(index, 'supply_id', value)}
                                                        showSearch
                                                        optionFilterProp="children"
                                                    >
                                                        {supplies.map(supply => (
                                                            <Option key={supply.id} value={supply.id}>
                                                                {supply.name} ({supply.category || 'N/A'})
                                                            </Option>
                                                        ))}
                                                    </Select>
                                                </Col>
                                                <Col span={4}>
                                                    <div style={{ marginBottom: 4 }}>Số lượng:</div>
                                                    <InputNumber
                                                        min={1}
                                                        max={100}
                                                        value={item.quantity}
                                                        onChange={(value) => handleDamageItemChange(index, 'quantity', value || 1)}
                                                        style={{ width: '100%' }}
                                                    />
                                                </Col>
                                                <Col span={5}>
                                                    <div style={{ marginBottom: 4 }}>Đơn giá:</div>
                                                    <InputNumber
                                                        min={0}
                                                        step={10000}
                                                        value={item.unit_price}
                                                        onChange={(value) => handleDamageItemChange(index, 'unit_price', value || 0)}
                                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                        parser={(value) => Number(value?.replace(/\$\s?|(,*)/g, ''))}
                                                        style={{ width: '100%' }}
                                                    />
                                                </Col>
                                                <Col span={5}>
                                                    <div style={{ marginBottom: 4 }}>Ghi chú:</div>
                                                    <AntdInput
                                                        placeholder="Ghi chú"
                                                        value={item.notes}
                                                        onChange={(e) => handleDamageItemChange(index, 'notes', e.target.value)}
                                                    />
                                                </Col>
                                                <Col span={3} style={{ textAlign: 'right' }}>
                                                    <div style={{ marginBottom: 4 }}>Thành tiền:</div>
                                                    <Space>
                                                        <span style={{ color: '#f5222d', fontWeight: 'bold' }}>
                                                            {formatVND(item.total)}
                                                        </span>
                                                        <Button
                                                            type="text"
                                                            danger
                                                            icon={<DeleteOutlined />}
                                                            onClick={() => handleRemoveDamageItem(index)}
                                                        />
                                                    </Space>
                                                </Col>
                                            </Row>
                                        </Card>
                                    ))}
                                    <Divider style={{ margin: '12px 0' }} />
                                    <div style={{ textAlign: 'right' }}>
                                        <Space>
                                            <span>Tổng thiệt hại:</span>
                                            <span style={{ fontSize: 18, color: '#f5222d', fontWeight: 'bold' }}>
                                                {formatVND(totalDamage)}
                                            </span>
                                        </Space>
                                    </div>
                                </Space>
                            )}
                        </Card>

                        {/* Ghi chú checkout */}
                        <Card size="small" title="Ghi chú checkout">
                            <TextArea
                                rows={2}
                                placeholder="Nhập ghi chú nếu có..."
                                value={checkoutNotes}
                                onChange={(e) => setCheckoutNotes(e.target.value)}
                                maxLength={1000}
                            />
                        </Card>

                        {/* Thông báo */}
                        <Alert
                            message="Lưu ý"
                            description={
                                <ul style={{ margin: 0, paddingLeft: 20 }}>
                                    <li>Thiệt hại vật tư sẽ được thêm vào hóa đơn của khách hàng</li>
                                    <li>Tồn kho vật tư sẽ được cập nhật tự động</li>
                                    <li>Sau khi checkout, phòng sẽ chuyển sang trạng thái đã chọn</li>
                                </ul>
                            }
                            type="info"
                            showIcon
                        />
                    </Space>
                )}
            </Modal>

            {/* Modal từ chối yêu cầu checkout */}
            <Modal
                title="Từ chối yêu cầu checkout"
                open={rejectModalVisible}
                onOk={handleReject}
                onCancel={() => {
                    setRejectModalVisible(false);
                    setRejectReason('');
                }}
                okText="Từ chối"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
            >
                <div style={{ marginBottom: 16 }}>
                    <label>Lý do từ chối <span style={{ color: 'red' }}>*</span></label>
                    <TextArea
                        rows={4}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Nhập lý do từ chối yêu cầu checkout này..."
                        maxLength={1000}
                        showCount
                    />
                </div>
            </Modal>
        </div>
    );
};

export default ListCheckoutRequests;
