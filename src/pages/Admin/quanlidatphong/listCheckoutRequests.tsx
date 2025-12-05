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
    Popconfirm,
    Input as AntdInput,
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
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
    getCheckoutRequests,
    approveCheckoutRequest,
    rejectCheckoutRequest,
    type CheckoutRequest,
} from '../../../service/bookingService';
import type { Pagination } from '../../../types/booking/booking';

const { TextArea } = AntdInput;
const { Option } = Select;

const ListCheckoutRequests: React.FC = () => {
    const [requests, setRequests] = useState<CheckoutRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<Pagination | undefined>();
    const [selectedRequest, setSelectedRequest] = useState<CheckoutRequest | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

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

    const handleApprove = async (id: number) => {
        try {
            await approveCheckoutRequest(id);
            message.success('Yêu cầu checkout đã được duyệt thành công');
            fetchData(pagination?.current_page || 1, statusFilter);
            if (selectedRequest?.id === id) {
                setDetailModalVisible(false);
            }
        } catch (error: any) {
            if (error.response?.status !== 401 && error.response?.status !== 403) {
                console.error('Error approving request:', error);
                message.error(error.response?.data?.message || 'Không thể duyệt yêu cầu checkout');
            }
        }
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
            width: 200,
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
                            <Popconfirm
                                title="Xác nhận duyệt"
                                description="Bạn có chắc chắn muốn duyệt yêu cầu checkout này?"
                                onConfirm={() => handleApprove(record.id)}
                                okText="Duyệt"
                                cancelText="Hủy"
                                okButtonProps={{ style: { backgroundColor: '#52c41a', borderColor: '#52c41a' } }}
                            >
                                <Button
                                    type="link"
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
                        <Popconfirm
                            key="approve"
                            title="Xác nhận duyệt"
                            description="Bạn có chắc chắn muốn duyệt yêu cầu checkout này?"
                            onConfirm={() => selectedRequest && handleApprove(selectedRequest.id)}
                            okText="Duyệt"
                            cancelText="Hủy"
                            okButtonProps={{ style: { backgroundColor: '#52c41a', borderColor: '#52c41a' } }}
                        >
                            <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                            >
                                Duyệt
                            </Button>
                        </Popconfirm>
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

