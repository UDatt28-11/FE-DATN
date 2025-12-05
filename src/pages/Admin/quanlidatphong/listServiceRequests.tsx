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
    Badge,
    Popconfirm,
    Input as AntdInput,
    Typography,
} from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    ReloadOutlined,
    ShoppingOutlined,
    UserOutlined,
    HomeOutlined,
    DollarOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
    getServiceRequests,
    approveServiceRequest,
    rejectServiceRequest,
} from '../../../service/bookingService';
import { formatVND } from '../../../utils/currency';

const { TextArea } = AntdInput;
const { Option } = Select;
const { Text } = Typography;

interface ServiceRequest {
    id: number;
    booking_id: number;
    booking_order_code: string;
    room_name: string;
    service: {
        id: number;
        name: string;
        price: number;
        unit: string;
    };
    quantity: number;
    price_at_booking: number;
    total_amount: number;
    status: 'pending' | 'approved' | 'rejected';
    notes?: string;
    customer_name: string;
    created_at: string;
}

interface Pagination {
    page: number;
    per_page: number;
    total: number;
    last_page: number;
}

const ListServiceRequests: React.FC = () => {
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<Pagination | undefined>();
    const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
    const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [approveModalVisible, setApproveModalVisible] = useState(false);
    const [approveNotes, setApproveNotes] = useState('');

    const fetchData = async (page = 1, status?: string) => {
        setLoading(true);
        try {
            const result = await getServiceRequests({
                page,
                per_page: 15,
                status: status === 'all' ? undefined : (status as any),
            });
            
            setRequests(result.data || []);
            setPagination(result.pagination);
        } catch (error: any) {
            console.error('Error fetching service requests:', error);
            message.error('Không thể tải danh sách yêu cầu dịch vụ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(1, statusFilter);
    }, [statusFilter]);

    const handleApprove = async () => {
        if (!selectedRequest) return;

        try {
            await approveServiceRequest(selectedRequest.id, approveNotes);
            message.success('Đã duyệt yêu cầu dịch vụ và thêm vào hóa đơn');
            setApproveModalVisible(false);
            setSelectedRequest(null);
            setApproveNotes('');
            fetchData(pagination?.page || 1, statusFilter);
        } catch (error: any) {
            console.error('Error approving request:', error);
            message.error(error.response?.data?.message || 'Không thể duyệt yêu cầu dịch vụ');
        }
    };

    const handleReject = async () => {
        if (!selectedRequest || !rejectReason.trim()) {
            message.warning('Vui lòng nhập lý do từ chối');
            return;
        }

        try {
            await rejectServiceRequest(selectedRequest.id, rejectReason);
            message.success('Đã từ chối yêu cầu dịch vụ');
            setRejectModalVisible(false);
            setRejectReason('');
            setSelectedRequest(null);
            fetchData(pagination?.page || 1, statusFilter);
        } catch (error: any) {
            console.error('Error rejecting request:', error);
            message.error(error.response?.data?.message || 'Không thể từ chối yêu cầu dịch vụ');
        }
    };

    const handleViewDetail = (request: ServiceRequest) => {
        setSelectedRequest(request);
        setDetailModalVisible(true);
    };

    const handleTableChange = (page: number) => {
        fetchData(page, statusFilter);
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'Khách hàng',
            key: 'customer',
            render: (_: any, record: ServiceRequest) => (
                <Space direction="vertical" size="small">
                    <div>
                        <UserOutlined /> {record.customer_name}
                    </div>
                    <div style={{ fontSize: 12, color: '#999' }}>
                        Mã: #{record.booking_order_code}
                    </div>
                </Space>
            ),
        },
        {
            title: 'Phòng',
            key: 'room',
            render: (_: any, record: ServiceRequest) => (
                <Space>
                    <HomeOutlined />
                    <span>{record.room_name || 'N/A'}</span>
                </Space>
            ),
        },
        {
            title: 'Dịch vụ',
            key: 'service',
            render: (_: any, record: ServiceRequest) => (
                <Space direction="vertical" size="small">
                    <Text strong>{record.service?.name || 'N/A'}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {record.quantity} {record.service?.unit || 'đơn vị'}
                    </Text>
                </Space>
            ),
        },
        {
            title: 'Tổng tiền',
            key: 'total',
            render: (_: any, record: ServiceRequest) => (
                <Text strong style={{ color: '#1890ff' }}>
                    {formatVND(record.total_amount)}
                </Text>
            ),
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
            title: 'Ngày tạo',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 200,
            render: (_: any, record: ServiceRequest) => (
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
                            <Popconfirm
                                title="Xác nhận duyệt"
                                description="Dịch vụ sẽ được thêm vào hóa đơn. Bạn có chắc chắn?"
                                onConfirm={() => {
                                    setSelectedRequest(record);
                                    setApproveModalVisible(true);
                                }}
                                okText="Duyệt"
                                cancelText="Hủy"
                            >
                                <Button
                                    type="link"
                                    danger={false}
                                    icon={<CheckCircleOutlined />}
                                    style={{ color: '#52c41a' }}
                                >
                                    Duyệt
                                </Button>
                            </Popconfirm>
                            <Button
                                type="link"
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
                            <ShoppingOutlined /> Quản lý yêu cầu dịch vụ
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
                                onClick={() => fetchData(pagination?.page || 1, statusFilter)}
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
                        current: pagination?.page || 1,
                        pageSize: pagination?.per_page || 15,
                        total: pagination?.total || 0,
                        onChange: handleTableChange,
                    }}
                />
            </Card>

            {/* Modal chi tiết */}
            <Modal
                title="Chi tiết yêu cầu dịch vụ"
                open={detailModalVisible}
                onCancel={() => {
                    setDetailModalVisible(false);
                    setSelectedRequest(null);
                }}
                footer={[
                    <Button key="close" onClick={() => setDetailModalVisible(false)}>
                        Đóng
                    </Button>,
                ]}
            >
                {selectedRequest && (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Mã đặt phòng">
                            #{selectedRequest.booking_order_code}
                        </Descriptions.Item>
                        <Descriptions.Item label="Khách hàng">
                            {selectedRequest.customer_name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phòng">
                            {selectedRequest.room_name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Dịch vụ">
                            {selectedRequest.service?.name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số lượng">
                            {selectedRequest.quantity} {selectedRequest.service?.unit}
                        </Descriptions.Item>
                        <Descriptions.Item label="Đơn giá">
                            {formatVND(selectedRequest.price_at_booking)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tổng tiền">
                            <Text strong style={{ color: '#1890ff', fontSize: 16 }}>
                                {formatVND(selectedRequest.total_amount)}
                            </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag
                                color={
                                    selectedRequest.status === 'pending'
                                        ? 'orange'
                                        : selectedRequest.status === 'approved'
                                        ? 'green'
                                        : 'red'
                                }
                            >
                                {selectedRequest.status === 'pending'
                                    ? 'Chờ xử lý'
                                    : selectedRequest.status === 'approved'
                                    ? 'Đã duyệt'
                                    : 'Đã từ chối'}
                            </Tag>
                        </Descriptions.Item>
                        {selectedRequest.notes && (
                            <Descriptions.Item label="Ghi chú">
                                {selectedRequest.notes}
                            </Descriptions.Item>
                        )}
                        <Descriptions.Item label="Ngày tạo">
                            {dayjs(selectedRequest.created_at).format('DD/MM/YYYY HH:mm:ss')}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>

            {/* Modal duyệt */}
            <Modal
                title="Duyệt yêu cầu dịch vụ"
                open={approveModalVisible}
                onOk={handleApprove}
                onCancel={() => {
                    setApproveModalVisible(false);
                    setSelectedRequest(null);
                    setApproveNotes('');
                }}
                okText="Duyệt"
                cancelText="Hủy"
            >
                <p>Dịch vụ sẽ được thêm vào hóa đơn của booking này.</p>
                {selectedRequest && (
                    <Descriptions bordered size="small" column={1}>
                        <Descriptions.Item label="Dịch vụ">
                            {selectedRequest.service?.name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số lượng">
                            {selectedRequest.quantity} {selectedRequest.service?.unit}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tổng tiền">
                            <Text strong>{formatVND(selectedRequest.total_amount)}</Text>
                        </Descriptions.Item>
                    </Descriptions>
                )}
                <div style={{ marginTop: 16 }}>
                    <TextArea
                        rows={3}
                        placeholder="Ghi chú (tùy chọn)"
                        value={approveNotes}
                        onChange={(e) => setApproveNotes(e.target.value)}
                        maxLength={1000}
                    />
                </div>
            </Modal>

            {/* Modal từ chối */}
            <Modal
                title="Từ chối yêu cầu dịch vụ"
                open={rejectModalVisible}
                onOk={handleReject}
                onCancel={() => {
                    setRejectModalVisible(false);
                    setSelectedRequest(null);
                    setRejectReason('');
                }}
                okText="Từ chối"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
            >
                <p>Vui lòng nhập lý do từ chối:</p>
                <TextArea
                    rows={4}
                    placeholder="Nhập lý do từ chối..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    maxLength={1000}
                />
            </Modal>
        </div>
    );
};

export default ListServiceRequests;

