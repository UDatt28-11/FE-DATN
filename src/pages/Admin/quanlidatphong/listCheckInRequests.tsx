import React, { useEffect, useState } from 'react';
import {
    Table,
    Card,
    Row,
    Col,
    Space,
    Input,
    Select,
    Button,
    Tag,
    Modal,
    Descriptions,
    Image,
    message,
    Badge,
    Popconfirm,
    Input as AntdInput,
} from 'antd';
import {
    EyeOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SearchOutlined,
    ReloadOutlined,
    IdcardOutlined,
    UserOutlined,
    CalendarOutlined,
    PhoneOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
    getCheckInRequests,
    approveCheckInRequest,
    rejectCheckInRequest,
    type CheckInRequest,
} from '../../../service/bookingService';
import type { Pagination, BookingOrder } from '../../../types/booking/booking';
import AdminCheckInModal from '../../../components/Booking/AdminCheckInModal';

const { Search } = Input;
const { TextArea } = AntdInput;
const { Option } = Select;

const ListCheckInRequests: React.FC = () => {
    const [requests, setRequests] = useState<CheckInRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<Pagination | undefined>();
    const [selectedRequest, setSelectedRequest] = useState<CheckInRequest | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
    const [checkInModalVisible, setCheckInModalVisible] = useState(false);
    const [selectedBookingForCheckIn, setSelectedBookingForCheckIn] = useState<BookingOrder | null>(null);

    const fetchData = async (page = 1, status?: string) => {
        setLoading(true);
        try {
            const result = await getCheckInRequests({
                page,
                per_page: 15,
                status: status === 'all' ? undefined : (status as any),
                include_ready_bookings: true, // Bao gồm các booking đã confirmed và sẵn sàng check-in
            });
            setRequests(result.data);
            setPagination(result.pagination);
        } catch (error: any) {
            // Không log error cho 401/403 vì axios interceptor sẽ xử lý redirect
            if (error.response?.status !== 401 && error.response?.status !== 403) {
                console.error('Error fetching check-in requests:', error);
                message.error('Không thể tải danh sách yêu cầu check-in');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(1, statusFilter);
    }, [statusFilter]);

    const handleApprove = async (id: number) => {
        try {
            await approveCheckInRequest(id);
            message.success('Yêu cầu check-in đã được duyệt thành công');
            fetchData(pagination?.page || 1, statusFilter);
            if (selectedRequest?.id === id) {
                setDetailModalVisible(false);
            }
        } catch (error: any) {
            // Không log error cho 401/403 vì axios interceptor sẽ xử lý redirect
            if (error.response?.status !== 401 && error.response?.status !== 403) {
                console.error('Error approving request:', error);
                message.error(error.response?.data?.message || 'Không thể duyệt yêu cầu check-in');
            }
        }
    };

    const handleReject = async () => {
        if (!selectedRequest || !rejectReason.trim()) {
            message.warning('Vui lòng nhập lý do từ chối');
            return;
        }

        try {
            await rejectCheckInRequest(selectedRequest.id, rejectReason);
            message.success('Yêu cầu check-in đã bị từ chối');
            setRejectModalVisible(false);
            setRejectReason('');
            setSelectedRequest(null);
            fetchData(pagination?.page || 1, statusFilter);
            setDetailModalVisible(false);
        } catch (error: any) {
            // Không log error cho 401/403 vì axios interceptor sẽ xử lý redirect
            if (error.response?.status !== 401 && error.response?.status !== 403) {
                console.error('Error rejecting request:', error);
                message.error(error.response?.data?.message || 'Không thể từ chối yêu cầu check-in');
            }
        }
    };

    const handleViewDetail = (request: CheckInRequest) => {
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
            key: 'guest',
            render: (_: any, record: any) => {
                // Nếu là booking sẵn sàng check-in
                if (record.type === 'ready_booking' || record.status === 'ready_for_checkin') {
                    return (
                        <Space direction="vertical" size="small">
                            <div>
                                <UserOutlined /> {record.booking_order?.customer_name || record.full_name}
                            </div>
                            <div style={{ fontSize: 12, color: '#999' }}>
                                <PhoneOutlined /> {record.booking_order?.customer_phone || 'N/A'}
                            </div>
                        </Space>
                    );
                }
                // CheckInRequest thông thường
                return (
                    <Space direction="vertical" size="small">
                        <div>
                            <UserOutlined /> {record.full_name}
                        </div>
                        <div style={{ fontSize: 12, color: '#999' }}>
                            {record.identity_type === 'cccd' ? 'CCCD/CMND' : 'Hộ chiếu'}: {record.identity_number}
                        </div>
                    </Space>
                );
            },
        },
        {
            title: 'Mã đặt phòng',
            key: 'booking_code',
            render: (_: any, record: CheckInRequest) => (
                <span>#{record.booking_order?.order_code || record.booking_order_id}</span>
            ),
        },
        {
            title: 'Phòng',
            key: 'room',
            render: (_: any, record: CheckInRequest) => (
                <span>{record.booking_detail?.room?.name || 'N/A'}</span>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string, record: any) => {
                // Nếu là booking sẵn sàng check-in (type = 'ready_booking')
                if (record.type === 'ready_booking' || status === 'ready_for_checkin') {
                    return <Tag color="blue">Chờ check-in</Tag>;
                }
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
            width: 250,
            render: (_: any, record: any) => {
                // Nếu là booking sẵn sàng check-in
                if (record.type === 'ready_booking' || record.status === 'ready_for_checkin') {
                    return (
                        <Space>
                            <Button
                                type="link"
                                icon={<EyeOutlined />}
                                onClick={() => {
                                    // Chuyển đổi record thành format CheckInRequest để xem chi tiết
                                    const fakeRequest = {
                                        ...record,
                                        booking_order: record.booking_order || record.bookingOrder,
                                        booking_detail: record.booking_detail || record.bookingDetail,
                                    };
                                    handleViewDetail(fakeRequest);
                                }}
                            >
                                Xem
                            </Button>
                            <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                onClick={() => {
                                    // Lấy booking_order từ record
                                    const booking = record.booking_order || record.bookingOrder;
                                    if (booking) {
                                        setSelectedBookingForCheckIn(booking);
                                        setCheckInModalVisible(true);
                                    } else {
                                        message.error('Không tìm thấy thông tin booking');
                                    }
                                }}
                                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                            >
                                Check-in
                            </Button>
                        </Space>
                    );
                }
                // CheckInRequest thông thường
                return (
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
                                    description="Bạn có chắc chắn muốn duyệt yêu cầu check-in này?"
                                    onConfirm={() => handleApprove(record.id)}
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
                );
            },
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                    <Col>
                        <h2 style={{ margin: 0 }}>
                            <IdcardOutlined /> Quản lý yêu cầu check-in
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
                title="Chi tiết yêu cầu check-in"
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
                            description="Bạn có chắc chắn muốn duyệt yêu cầu check-in này?"
                            onConfirm={() => selectedRequest && handleApprove(selectedRequest.id)}
                            okText="Duyệt"
                            cancelText="Hủy"
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
                            onClick={() => {
                                setRejectModalVisible(true);
                            }}
                        >
                            Từ chối
                        </Button>
                    ),
                ]}
                width={800}
            >
                {selectedRequest && (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Mã yêu cầu">#{selectedRequest.id}</Descriptions.Item>
                        <Descriptions.Item label="Mã đặt phòng">
                            #{selectedRequest.booking_order?.order_code || selectedRequest.booking_order_id}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phòng">
                            {selectedRequest.booking_detail?.room?.name || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Họ và tên">{selectedRequest.full_name}</Descriptions.Item>
                        <Descriptions.Item label="Ngày sinh">
                            {selectedRequest.date_of_birth
                                ? dayjs(selectedRequest.date_of_birth).format('DD/MM/YYYY')
                                : 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Loại giấy tờ">
                            {selectedRequest.identity_type === 'cccd' ? 'CCCD/CMND' : 'Hộ chiếu'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số giấy tờ">{selectedRequest.identity_number}</Descriptions.Item>
                        {selectedRequest.identity_image_url && (
                            <Descriptions.Item label="Ảnh giấy tờ">
                                <Image
                                    src={selectedRequest.identity_image_url}
                                    alt="Identity"
                                    style={{ maxWidth: 300, maxHeight: 200 }}
                                />
                            </Descriptions.Item>
                        )}
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
                        {selectedRequest.rejection_reason && (
                            <Descriptions.Item label="Lý do từ chối">
                                {selectedRequest.rejection_reason}
                            </Descriptions.Item>
                        )}
                        {selectedRequest.reviewer && (
                            <Descriptions.Item label="Người xử lý">
                                {selectedRequest.reviewer.full_name || selectedRequest.reviewer.email}
                            </Descriptions.Item>
                        )}
                        {selectedRequest.reviewed_at && (
                            <Descriptions.Item label="Thời gian xử lý">
                                {dayjs(selectedRequest.reviewed_at).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                        )}
                        {selectedRequest.notes && (
                            <Descriptions.Item label="Ghi chú">{selectedRequest.notes}</Descriptions.Item>
                        )}
                        <Descriptions.Item label="Ngày tạo">
                            {dayjs(selectedRequest.created_at).format('DD/MM/YYYY HH:mm')}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>

            {/* Modal từ chối */}
            <Modal
                title="Từ chối yêu cầu check-in"
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
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <div>
                        <strong>Khách hàng:</strong> {selectedRequest?.full_name}
                    </div>
                    <div>
                        <strong>Lý do từ chối:</strong> <span style={{ color: 'red' }}>*</span>
                    </div>
                    <TextArea
                        rows={4}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Nhập lý do từ chối yêu cầu check-in..."
                    />
                </Space>
            </Modal>

            {/* Modal check-in trực tiếp */}
            <AdminCheckInModal
                open={checkInModalVisible}
                booking={selectedBookingForCheckIn}
                onCancel={() => {
                    setCheckInModalVisible(false);
                    setSelectedBookingForCheckIn(null);
                }}
                onSuccess={() => {
                    message.success('Check-in thành công!');
                    setCheckInModalVisible(false);
                    setSelectedBookingForCheckIn(null);
                    fetchData(pagination?.page || 1, statusFilter);
                }}
            />
        </div>
    );
};

export default ListCheckInRequests;

