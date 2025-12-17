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
    Image,
    message,
    Badge,
    Popconfirm,
    Input as AntdInput,
    Tabs,
} from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    ReloadOutlined,
    IdcardOutlined,
    UserOutlined,
    CalendarOutlined,
    PhoneOutlined,
    LoginOutlined,
    HomeOutlined,
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
    const [selectedBookingDetailId, setSelectedBookingDetailId] = useState<number | undefined>(undefined);
    const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
    const [activeTab, setActiveTab] = useState<string>('today');

    const fetchData = async (page = 1, status?: string) => {
        setLoading(true);
        try {
            const result = await getCheckInRequests({
                page,
                per_page: 15,
                status: status === 'all' ? undefined : (status as any),
                include_ready_bookings: true, // Bao gồm các booking đã confirmed và sẵn sàng check-in
            });
            
            // 1) Chuẩn hóa dữ liệu ready_booking: đảm bảo booking.details có guests
            const normalized = (result.data as any[]).map((req) => {
                if (req.type === 'ready_booking' || req.status === 'ready_for_checkin') {
                    const booking = req.booking_order || req.bookingOrder;
                    if (booking && booking.details) {
                        booking.details = booking.details.map((detail: any) => {
                            // Đảm bảo guests được map đúng từ checkedInGuests
                            const guests = detail.guests || detail.checkedInGuests || [];
                            // Nếu guests là array rỗng nhưng có checkedInGuests, sử dụng checkedInGuests
                            const finalGuests = Array.isArray(guests) && guests.length > 0 
                                ? guests 
                                : (Array.isArray(detail.checkedInGuests) ? detail.checkedInGuests : []);
                            
                            return {
                                ...detail,
                                guests: finalGuests,
                                // Giữ lại checkedInGuests để fallback
                                checkedInGuests: finalGuests,
                            };
                        });
                        req.booking_order = booking;
                    }
                }
                return req;
            });

            // 2) Gộp các ready_booking theo booking_order_id để tránh trùng lặp mỗi phòng 1 dòng
            const groupedReadyBookings = new Map<number, any>();
            const finalList: any[] = [];

            normalized.forEach((req) => {
                if (req.type === 'ready_booking' || req.status === 'ready_for_checkin') {
                    const booking = req.booking_order || req.bookingOrder;
                    const bookingId: number | undefined =
                        booking?.id ?? req.booking_order_id ?? req.bookingOrderId;

                    if (!bookingId) {
                        // Nếu không xác định được bookingId thì push thẳng
                        finalList.push(req);
                        return;
                    }

                    const existing = groupedReadyBookings.get(bookingId);
                    if (!existing) {
                        // Clone record làm đại diện cho booking này
                        // Đảm bảo map guests từ checkedInGuests
                        const clonedDetails = Array.isArray(booking?.details)
                            ? booking.details.map((detail: any) => {
                                // Đảm bảo guests được map đúng từ checkedInGuests
                                const guests = detail.guests || detail.checkedInGuests || [];
                                const finalGuests = Array.isArray(guests) && guests.length > 0 
                                    ? guests 
                                    : (Array.isArray(detail.checkedInGuests) ? detail.checkedInGuests : []);
                                
                                return {
                                    ...detail,
                                    guests: finalGuests,
                                    checkedInGuests: finalGuests,
                                };
                            })
                            : [];
                        
                        const clone = {
                            ...req,
                            booking_order: {
                                ...booking,
                                details: clonedDetails,
                            },
                        };
                        groupedReadyBookings.set(bookingId, clone);
                    } else {
                        // Merge thêm các details mới (nếu có) để tránh thiếu phòng
                        const existingBooking = existing.booking_order || existing.bookingOrder;
                        const existingDetails: any[] = Array.isArray(existingBooking.details)
                            ? existingBooking.details
                            : [];
                        const newDetails: any[] = Array.isArray(booking?.details)
                            ? booking.details
                            : [];

                        // Merge details: cập nhật details đã có và thêm details mới
                        newDetails.forEach((newDetail) => {
                            const existingDetailIndex = existingDetails.findIndex((d) => d.id === newDetail.id);
                            if (existingDetailIndex >= 0) {
                                // Cập nhật detail đã có với guests mới từ backend
                                // Ưu tiên checkedInGuests mới từ backend (có thể đã được cập nhật sau check-in)
                                const newGuests = newDetail.checkedInGuests || newDetail.guests || [];
                                const existingGuests = existingDetails[existingDetailIndex].guests || [];
                                
                                // Nếu backend trả về checkedInGuests mới, dùng nó (có thể đã check-in)
                                // Nếu không có, giữ nguyên guests cũ
                                const finalGuests = newGuests.length > 0 ? newGuests : existingGuests;
                                
                                existingDetails[existingDetailIndex] = {
                                    ...existingDetails[existingDetailIndex],
                                    ...newDetail, // Cập nhật tất cả fields từ backend
                                    guests: finalGuests, // Đảm bảo guests được cập nhật
                                    checkedInGuests: newDetail.checkedInGuests || existingDetails[existingDetailIndex].checkedInGuests,
                                };
                            } else {
                                // Thêm detail mới
                                existingDetails.push({
                                    ...newDetail,
                                    guests: newDetail.guests || newDetail.checkedInGuests || [],
                                });
                            }
                        });

                        existing.booking_order = {
                            ...existingBooking,
                            details: existingDetails,
                        };
                        groupedReadyBookings.set(bookingId, existing);
                    }
                } else {
                    // Các CheckInRequest bình thường giữ nguyên
                    finalList.push(req);
                }
            });

            // Thêm các ready_booking đã gộp vào danh sách cuối cùng
            groupedReadyBookings.forEach((value) => {
                finalList.push(value);
            });

            setRequests(finalList);
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
            render: (_: any, record: any) => {
                // Nếu là booking sẵn sàng check-in, hiển thị số phòng
                if (record.type === 'ready_booking' || record.status === 'ready_for_checkin') {
                    const booking = record.booking_order || record.bookingOrder;
                    const detailsCount = booking?.details?.length || 0;
                    return (
                        <Space>
                            <HomeOutlined />
                            <span>{detailsCount} phòng</span>
                        </Space>
                    );
                }
                // CheckInRequest thông thường
                return (
                    <span>{record.booking_detail?.room?.name || 'N/A'}</span>
                );
            },
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
    ];

    // Phân loại requests thành 2 nhóm: Check-in hôm nay và Chưa thể check-in
    const today = dayjs().startOf('day');
    const todayRequests = requests.filter((record: any) => {
        if (record.type === 'ready_booking' || record.status === 'ready_for_checkin') {
            const booking = record.booking_order || record.bookingOrder;
            const details = booking?.details || [];
            // Kiểm tra xem có ít nhất 1 phòng có check_in_date là hôm nay
            return details.some((detail: any) => {
                if (detail.check_in_date) {
                    const checkInDate = dayjs(detail.check_in_date).startOf('day');
                    return checkInDate.isSame(today, 'day');
                }
                return false;
            });
        }
        // CheckInRequest thông thường
        if (record.booking_detail?.check_in_date) {
            const checkInDate = dayjs(record.booking_detail.check_in_date).startOf('day');
            return checkInDate.isSame(today, 'day');
        }
        return false;
    });

    const notTodayRequests = requests.filter((record: any) => {
        if (record.type === 'ready_booking' || record.status === 'ready_for_checkin') {
            const booking = record.booking_order || record.bookingOrder;
            const details = booking?.details || [];
            // Kiểm tra xem tất cả phòng đều có check_in_date không phải hôm nay
            return details.every((detail: any) => {
                if (detail.check_in_date) {
                    const checkInDate = dayjs(detail.check_in_date).startOf('day');
                    return !checkInDate.isSame(today, 'day');
                }
                return true; // Nếu không có check_in_date, coi như chưa thể check-in
            });
        }
        // CheckInRequest thông thường
        if (record.booking_detail?.check_in_date) {
            const checkInDate = dayjs(record.booking_detail.check_in_date).startOf('day');
            return !checkInDate.isSame(today, 'day');
        }
        return true; // Nếu không có check_in_date, coi như chưa thể check-in
    });

    // Hàm render table
    const renderTable = (dataSource: any[]) => (
        <Table
            columns={columns}
            dataSource={dataSource}
            rowKey={(record: any) => {
                // Nếu là ready_booking, dùng booking_order_id làm key
                if (record.type === 'ready_booking' || record.status === 'ready_for_checkin') {
                    return `ready_${record.booking_order?.id || record.booking_order_id}`;
                }
                return record.id;
            }}
            loading={loading}
            expandable={{
                expandedRowKeys,
                onExpandedRowsChange: (keys) => setExpandedRowKeys(keys as React.Key[]),
                expandIcon: () => null, // Ẩn dấu +
                expandedRowRender: (record: any) => {
                            // Chỉ expand cho ready_bookings
                            if (record.type !== 'ready_booking' && record.status !== 'ready_for_checkin') {
                                return null;
                            }

                            const booking = record.booking_order || record.bookingOrder;
                            const details = booking?.details || [];

                            if (details.length === 0) {
                                return <div style={{ padding: '16px' }}>Không có thông tin phòng</div>;
                            }

                            // Columns cho bảng phòng
                            const roomColumns = [
                                {
                                    title: 'Phòng',
                                    key: 'room',
                                    render: (_: any, detail: any) => (
                                        <Space>
                                            <HomeOutlined style={{ color: '#1890ff' }} />
                                            <span style={{ fontWeight: 500 }}>
                                                {detail.room?.name || 'N/A'}
                                            </span>
                                            {detail.room?.roomType && (
                                                <Tag color="blue">{detail.room.roomType.name}</Tag>
                                            )}
                                        </Space>
                                    ),
                                },
                                {
                                    title: 'Check-in',
                                    dataIndex: 'check_in_date',
                                    key: 'check_in_date',
                                    render: (date: string) => (
                                        <Space>
                                            <CalendarOutlined style={{ color: '#52c41a' }} />
                                            <span>{dayjs(date).format('DD/MM/YYYY')}</span>
                                        </Space>
                                    ),
                                },
                                {
                                    title: 'Check-out',
                                    dataIndex: 'check_out_date',
                                    key: 'check_out_date',
                                    render: (date: string) => (
                                        <Space>
                                            <CalendarOutlined style={{ color: '#ff4d4f' }} />
                                            <span>{dayjs(date).format('DD/MM/YYYY')}</span>
                                        </Space>
                                    ),
                                },
                                {
                                    title: 'Số khách',
                                    key: 'guests',
                                    render: (_: any, detail: any) => (
                                        <Space>
                                            <UserOutlined />
                                            <span>
                                                {detail.num_adults || 0} người lớn
                                                {detail.num_children ? `, ${detail.num_children} trẻ em` : ''}
                                            </span>
                                        </Space>
                                    ),
                                },
                                {
                                    title: 'Trạng thái',
                                    key: 'status',
                                    render: (_: any, detail: any) => {
                                        // Kiểm tra cả guests và checkedInGuests để đảm bảo phát hiện đúng trạng thái check-in
                                        const checkedInGuests = detail.guests || detail.checkedInGuests || [];
                                        const isCheckedIn = checkedInGuests.length > 0;

                                        return (
                                            <Space>
                                                {isCheckedIn ? (
                                                    <>
                                                        <Badge status="success" />
                                                        <Tag color="success">
                                                            Đã check-in ({checkedInGuests.length} khách)
                                                        </Tag>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Badge status="warning" />
                                                        <Tag color="warning">Chưa check-in</Tag>
                                                    </>
                                                )}
                                            </Space>
                                        );
                                    },
                                },
                                {
                                    title: 'Thao tác',
                                    key: 'action',
                                    render: (_: any, detail: any) => {
                                        // Kiểm tra cả guests và checkedInGuests để đảm bảo phát hiện đúng trạng thái check-in
                                        const checkedInGuests = detail.guests || detail.checkedInGuests || [];
                                        const isCheckedIn = checkedInGuests.length > 0;

                                        return (
                                            <Button
                                                type="primary"
                                                icon={<LoginOutlined />}
                                                onClick={() => {
                                                    const booking = record.booking_order || record.bookingOrder;
                                                    if (booking) {
                                                        setSelectedBookingForCheckIn(booking);
                                                        setSelectedBookingDetailId(detail.id);
                                                        setCheckInModalVisible(true);
                                                    }
                                                }}
                                                disabled={isCheckedIn}
                                                style={{
                                                    backgroundColor: isCheckedIn ? undefined : '#52c41a',
                                                    borderColor: isCheckedIn ? undefined : '#52c41a',
                                                }}
                                            >
                                                {isCheckedIn ? 'Đã check-in' : 'Check-in'}
                                            </Button>
                                        );
                                    },
                                },
                            ];

                            return (
                                <Table
                                    columns={roomColumns}
                                    dataSource={details}
                                    rowKey={(detail) => `detail-${detail.id}`}
                                    pagination={false}
                                    size="small"
                                    key={`rooms-${booking?.id}-${details.length}-${details.reduce((acc: number, d: any) => acc + (d.guests?.length || d.checkedInGuests?.length || 0), 0)}`}
                                />
                            );
                        },
                rowExpandable: (record: any) => {
                    // Chỉ expand cho ready_bookings
                    return record.type === 'ready_booking' || record.status === 'ready_for_checkin';
                },
            }}
            onRow={(record: any) => {
                // Click vào row để expand/collapse
                return {
                    onClick: () => {
                        const key = record.type === 'ready_booking' || record.status === 'ready_for_checkin'
                            ? `ready_${record.booking_order?.id || record.booking_order_id}`
                            : record.id;
                        
                        if (expandedRowKeys.includes(key)) {
                            setExpandedRowKeys(expandedRowKeys.filter(k => k !== key));
                        } else {
                            setExpandedRowKeys([...expandedRowKeys, key]);
                        }
                    },
                    style: { cursor: 'pointer' },
                };
            }}
            pagination={{
                current: pagination?.page || 1,
                pageSize: pagination?.per_page || 15,
                total: pagination?.total || 0,
                onChange: handleTableChange,
            }}
        />
    );

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

                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={[
                        {
                            key: 'today',
                            label: (
                                <span>
                                    <CalendarOutlined /> Check-in hôm nay ({todayRequests.length})
                                </span>
                            ),
                            children: renderTable(todayRequests),
                        },
                        {
                            key: 'not_today',
                            label: (
                                <span>
                                    <CalendarOutlined /> Chưa thể check-in ({notTodayRequests.length})
                                </span>
                            ),
                            children: renderTable(notTodayRequests),
                        },
                    ]}
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
                bookingDetailId={selectedBookingDetailId}
                onCancel={() => {
                    setCheckInModalVisible(false);
                    setSelectedBookingForCheckIn(null);
                    setSelectedBookingDetailId(undefined);
                }}
                onSuccess={() => {
                    message.success('Check-in thành công!');
                    setCheckInModalVisible(false);
                    setSelectedBookingForCheckIn(null);
                    setSelectedBookingDetailId(undefined);
                    // Đợi một chút để backend kịp commit transaction và serialize dữ liệu
                    // Tăng timeout để đảm bảo backend đã hoàn tất tất cả các bước
                    setTimeout(() => {
                        fetchData(pagination?.page || 1, statusFilter);
                    }, 1500);
                }}
            />
        </div>
    );
};

export default ListCheckInRequests;

