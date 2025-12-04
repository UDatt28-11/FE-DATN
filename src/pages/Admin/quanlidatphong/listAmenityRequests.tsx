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
    Input as AntdInput,
    Typography,
} from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    ReloadOutlined,
    AppstoreOutlined,
    UserOutlined,
    HomeOutlined,
    EyeOutlined,
    CheckOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
    getAmenityRequests,
    approveAmenityRequest,
    rejectAmenityRequest,
    completeAmenityRequest,
} from '../../../service/bookingService';

const { TextArea } = AntdInput;
const { Option } = Select;
const { Text } = Typography;

interface Amenity {
    id: number;
    name: string;
    icon_url?: string;
    type?: string;
    category?: string;
}

interface AmenityRequest {
    id: number;
    booking_id: number;
    booking_order_code: string;
    room_name: string;
    amenity: Amenity | null;
    quantity: number;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    notes?: string;
    admin_notes?: string;
    customer_name: string;
    processed_by?: {
        id: number;
        name: string;
    };
    created_at: string;
    approved_at?: string;
    rejected_at?: string;
    completed_at?: string;
}

interface Pagination {
    page: number;
    per_page: number;
    total: number;
    last_page: number;
}

const ListAmenityRequests: React.FC = () => {
    const [requests, setRequests] = useState<AmenityRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<Pagination | undefined>();
    const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'completed' | 'all'>('pending');
    const [selectedRequest, setSelectedRequest] = useState<AmenityRequest | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [approveModalVisible, setApproveModalVisible] = useState(false);
    const [approveNotes, setApproveNotes] = useState('');

    const fetchData = async (page = 1, status?: string) => {
        setLoading(true);
        try {
            const result = await getAmenityRequests({
                page,
                per_page: 15,
                status: status === 'all' ? undefined : (status as any),
            });
            
            setRequests(result.data || []);
            setPagination(result.pagination);
        } catch (error: any) {
            console.error('Error fetching amenity requests:', error);
            message.error('Không thể tải danh sách yêu cầu tiện ích');
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
            await approveAmenityRequest(selectedRequest.id, approveNotes);
            message.success('Đã duyệt yêu cầu tiện ích');
            setApproveModalVisible(false);
            setSelectedRequest(null);
            setApproveNotes('');
            fetchData(pagination?.page || 1, statusFilter);
        } catch (error: any) {
            console.error('Error approving request:', error);
            message.error(error.response?.data?.message || 'Không thể duyệt yêu cầu tiện ích');
        }
    };

    const handleReject = async () => {
        if (!selectedRequest) return;

        try {
            await rejectAmenityRequest(selectedRequest.id, rejectReason);
            message.success('Đã từ chối yêu cầu tiện ích');
            setRejectModalVisible(false);
            setRejectReason('');
            setSelectedRequest(null);
            fetchData(pagination?.page || 1, statusFilter);
        } catch (error: any) {
            console.error('Error rejecting request:', error);
            message.error(error.response?.data?.message || 'Không thể từ chối yêu cầu tiện ích');
        }
    };

    const handleComplete = async (request: AmenityRequest) => {
        try {
            await completeAmenityRequest(request.id);
            message.success('Đã đánh dấu yêu cầu tiện ích là hoàn thành');
            fetchData(pagination?.page || 1, statusFilter);
        } catch (error: any) {
            console.error('Error completing request:', error);
            message.error(error.response?.data?.message || 'Không thể hoàn thành yêu cầu tiện ích');
        }
    };

    const handleViewDetail = (request: AmenityRequest) => {
        setSelectedRequest(request);
        setDetailModalVisible(true);
    };

    const handleTableChange = (page: number) => {
        fetchData(page, statusFilter);
    };

    const getStatusTag = (status: string) => {
        const config: Record<string, { color: string; text: string }> = {
            pending: { color: 'orange', text: 'Chờ xử lý' },
            approved: { color: 'blue', text: 'Đã duyệt' },
            rejected: { color: 'red', text: 'Đã từ chối' },
            completed: { color: 'green', text: 'Hoàn thành' },
        };
        const cfg = config[status] || { color: 'default', text: status };
        return <Tag color={cfg.color}>{cfg.text}</Tag>;
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
            render: (_: any, record: AmenityRequest) => (
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
            render: (_: any, record: AmenityRequest) => (
                <Space>
                    <HomeOutlined />
                    <span>{record.room_name || 'N/A'}</span>
                </Space>
            ),
        },
        {
            title: 'Tiện ích',
            key: 'amenity',
            render: (_: any, record: AmenityRequest) => (
                <Space direction="vertical" size="small">
                    <Text strong>{record.amenity?.name || 'N/A'}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        SL: {record.quantity}
                        {record.amenity?.category && (
                            <Tag size="small" style={{ marginLeft: 8 }}>
                                {record.amenity.category}
                            </Tag>
                        )}
                    </Text>
                </Space>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => getStatusTag(status),
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
            width: 280,
            render: (_: any, record: AmenityRequest) => (
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
                                type="link"
                                icon={<CheckCircleOutlined />}
                                style={{ color: '#52c41a' }}
                                onClick={() => {
                                    setSelectedRequest(record);
                                    setApproveModalVisible(true);
                                }}
                            >
                                Duyệt
                            </Button>
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
                    {record.status === 'approved' && (
                        <Button
                            type="link"
                            icon={<CheckOutlined />}
                            style={{ color: '#1890ff' }}
                            onClick={() => handleComplete(record)}
                        >
                            Hoàn thành
                        </Button>
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
                            <AppstoreOutlined /> Quản lý yêu cầu tiện ích
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
                                <Option value="completed">Hoàn thành</Option>
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
                title="Chi tiết yêu cầu tiện ích"
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
                width={600}
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
                        <Descriptions.Item label="Tiện ích">
                            <Space>
                                <AppstoreOutlined />
                                {selectedRequest.amenity?.name || 'N/A'}
                                {selectedRequest.amenity?.category && (
                                    <Tag>{selectedRequest.amenity.category}</Tag>
                                )}
                            </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Số lượng">
                            {selectedRequest.quantity}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            {getStatusTag(selectedRequest.status)}
                        </Descriptions.Item>
                        {selectedRequest.notes && (
                            <Descriptions.Item label="Ghi chú khách hàng">
                                {selectedRequest.notes}
                            </Descriptions.Item>
                        )}
                        {selectedRequest.admin_notes && (
                            <Descriptions.Item label="Ghi chú Admin">
                                {selectedRequest.admin_notes}
                            </Descriptions.Item>
                        )}
                        {selectedRequest.processed_by && (
                            <Descriptions.Item label="Xử lý bởi">
                                {selectedRequest.processed_by.name}
                            </Descriptions.Item>
                        )}
                        <Descriptions.Item label="Ngày tạo">
                            {dayjs(selectedRequest.created_at).format('DD/MM/YYYY HH:mm:ss')}
                        </Descriptions.Item>
                        {selectedRequest.approved_at && (
                            <Descriptions.Item label="Ngày duyệt">
                                {dayjs(selectedRequest.approved_at).format('DD/MM/YYYY HH:mm:ss')}
                            </Descriptions.Item>
                        )}
                        {selectedRequest.rejected_at && (
                            <Descriptions.Item label="Ngày từ chối">
                                {dayjs(selectedRequest.rejected_at).format('DD/MM/YYYY HH:mm:ss')}
                            </Descriptions.Item>
                        )}
                        {selectedRequest.completed_at && (
                            <Descriptions.Item label="Ngày hoàn thành">
                                {dayjs(selectedRequest.completed_at).format('DD/MM/YYYY HH:mm:ss')}
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                )}
            </Modal>

            {/* Modal duyệt */}
            <Modal
                title="Duyệt yêu cầu tiện ích"
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
                <p>Xác nhận duyệt yêu cầu tiện ích này?</p>
                {selectedRequest && (
                    <Descriptions bordered size="small" column={1}>
                        <Descriptions.Item label="Tiện ích">
                            {selectedRequest.amenity?.name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số lượng">
                            {selectedRequest.quantity}
                        </Descriptions.Item>
                        {selectedRequest.notes && (
                            <Descriptions.Item label="Ghi chú khách">
                                {selectedRequest.notes}
                            </Descriptions.Item>
                        )}
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
                title="Từ chối yêu cầu tiện ích"
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

export default ListAmenityRequests;


