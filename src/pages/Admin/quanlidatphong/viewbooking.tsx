import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Descriptions, Tag, Space, Button, Spin, message, Table, Divider } from "antd";
import { 
  ArrowLeftOutlined,
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CloseCircleOutlined, 
  PhoneOutlined, 
  CalendarOutlined,
  DollarOutlined,
  HomeOutlined,
  UserOutlined,
  MailOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getBooking } from "../../../api/booking";
import type { BookingOrder, BookingDetail } from "../../../types/booking/booking";

const ViewBooking: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [booking, setBooking] = useState<BookingOrder | null>(null);
    const [loading, setLoading] = useState(false);

    // Load dữ liệu booking khi component mount hoặc id thay đổi
    useEffect(() => {
        if (id) {
            fetchBookingDetail(parseInt(id));
        }
    }, [id]); // Dependency array: re-run khi id thay đổi

    const fetchBookingDetail = async (bookingId: number) => {
        try {
            setLoading(true);
            // Gọi API với include details và guests
            const data = await getBooking(bookingId, 'details,details.guests,details.room');
            setBooking(data);
        } catch (error: any) {
            message.error("Không thể tải thông tin đặt phòng");
        } finally {
            setLoading(false);
        }
    };

    // Hàm lấy màu sắc và icon cho trạng thái
    const getStatusConfig = (status: BookingOrder['status']) => {
        const configs = {
            pending: { 
                color: "warning", 
                icon: <ClockCircleOutlined />,
                text: "Đang chờ"
            },
            confirmed: { 
                color: "processing", 
                icon: <CheckCircleOutlined />,
                text: "Đã xác nhận"
            },
            completed: { 
                color: "success", 
                icon: <CheckCircleOutlined />,
                text: "Hoàn thành"
            },
            cancelled: { 
                color: "error", 
                icon: <CloseCircleOutlined />,
                text: "Đã hủy"
            },
        };
        return configs[status];
    };

    // Columns cho bảng chi tiết phòng
    const detailColumns = [
        {
            title: 'Tên phòng',
            dataIndex: 'room_name',
            key: 'room_name',
            render: (name: string) => (
                <Space>
                    <HomeOutlined style={{ color: '#1890ff' }} />
                    {name || 'N/A'}
                </Space>
            ),
        },
        {
            title: 'Check-in',
            dataIndex: 'check_in_date',
            key: 'check_in_date',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Check-out',
            dataIndex: 'check_out_date',
            key: 'check_out_date',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Số đêm',
            key: 'nights',
            render: (_: any, record: BookingDetail) => {
                const checkIn = dayjs(record.check_in_date);
                const checkOut = dayjs(record.check_out_date);
                return checkOut.diff(checkIn, 'day');
            },
        },
        {
            title: 'Số khách',
            key: 'guests',
            render: (_: any, record: BookingDetail) => (
                <Space>
                    <UserOutlined />
                    {record.num_adults} người lớn, {record.num_children} trẻ em
                </Space>
            ),
        },
        {
            title: 'Giá phòng',
            dataIndex: 'sub_total',
            key: 'sub_total',
            render: (amount: number) => `${amount.toLocaleString('vi-VN')} đ`,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const statusMap: any = {
                    active: { color: 'success', text: 'Đang hoạt động' },
                    cancelled: { color: 'error', text: 'Đã hủy' },
                    checked_in: { color: 'processing', text: 'Đã check-in' },
                    checked_out: { color: 'default', text: 'Đã check-out' },
                };
                const config = statusMap[status] || { color: 'default', text: status };
                return <Tag color={config.color}>{config.text}</Tag>;
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_: any, record: BookingDetail) => (
                <Button
                    type="primary"
                    icon={<TeamOutlined />}
                    size="small"
                    onClick={() => navigate(`/admin/booking-details/${record.id}/guests`)}
                >
                    Quản lý khách
                </Button>
            ),
        },
    ];

    if (loading) {
        return (
            <div style={{ padding: 24, textAlign: 'center', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Spin size="large" tip="Đang tải thông tin đặt phòng...">
                    <div style={{ padding: '50px' }} />
                </Spin>
            </div>
        );
    }

    if (!booking) {
        return (
            <div style={{ padding: 24, textAlign: 'center' }}>
                <p>Không tìm thấy thông tin đặt phòng</p>
                <Button onClick={() => navigate('/admin/booking')}>Quay lại danh sách</Button>
            </div>
        );
    }

    const statusConfig = getStatusConfig(booking.status);

    return (
        <div style={{ padding: 24 }}>
            {/* Nút quay lại */}
            <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/admin/booking')}
                style={{ marginBottom: 16 }}
            >
                Quay lại danh sách
            </Button>

            {/* Card thông tin chính */}
            <Card 
                title={
                    <Space>
                        <CalendarOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                        <span>Chi tiết đặt phòng #{booking.code}</span>
                    </Space>
                }
                extra={
                    <Tag 
                        icon={statusConfig.icon} 
                        color={statusConfig.color}
                        style={{ fontSize: 14, padding: '4px 12px' }}
                    >
                        {statusConfig.text}
                    </Tag>
                }
            >
                <Descriptions bordered column={2}>
                    {/* Row 1: Mã đơn và Ngày tạo */}
                    <Descriptions.Item label="Mã đơn" span={1}>
                        <strong style={{ fontSize: 15 }}>{booking.code}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo" span={1}>
                        {dayjs(booking.created_at).format("DD/MM/YYYY HH:mm")}
                    </Descriptions.Item>
                    
                    {/* Row 2: Tên khách hàng và SĐT */}
                    <Descriptions.Item label="Tên khách hàng" span={1}>
                        <Space>
                            <UserOutlined style={{ color: '#1890ff' }} />
                            <strong>{booking.customer_name || 'N/A'}</strong>
                        </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại" span={1}>
                        <Space>
                            <PhoneOutlined style={{ color: '#52c41a' }} />
                            {booking.customer_phone || 'N/A'}
                        </Space>
                    </Descriptions.Item>
                    
                    {/* Row 3: Email (full width) */}
                    <Descriptions.Item label="Email" span={2}>
                        <Space>
                            <MailOutlined style={{ color: '#fa8c16' }} />
                            {booking.customer_email || 'N/A'}
                        </Space>
                    </Descriptions.Item>
                    
                    {/* Row 4: Check-in và Check-out */}
                    <Descriptions.Item label="Check-in" span={1}>
                        <Space>
                            <CalendarOutlined style={{ color: '#1890ff' }} />
                            <strong>{booking.checkin_date ? dayjs(booking.checkin_date).format("DD/MM/YYYY") : 'N/A'}</strong>
                        </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Check-out" span={1}>
                        <Space>
                            <CalendarOutlined style={{ color: '#ff4d4f' }} />
                            <strong>{booking.checkout_date ? dayjs(booking.checkout_date).format("DD/MM/YYYY") : 'N/A'}</strong>
                        </Space>
                    </Descriptions.Item>
                    
                    {/* Row 5: Tổng tiền (full width, nổi bật) */}
                    <Descriptions.Item label="Tổng tiền" span={1}>
                        <Space>
                            <DollarOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                            <span style={{ fontSize: 20, fontWeight: 'bold', color: '#52c41a' }}>
                                {booking.total_amount.toLocaleString('vi-VN')} đ
                            </span>
                        </Space>
                    </Descriptions.Item>
                    
                    {/* Row 6: Số phòng đặt */}
                    <Descriptions.Item label="Số phòng đặt" span={1}>
                        <Space>
                            <HomeOutlined style={{ color: '#1890ff' }} />
                            <strong>{booking.details_count} phòng</strong>
                        </Space>
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            {/* Bảng chi tiết phòng */}
            {booking.details && booking.details.length > 0 && (
                <>
                    <Divider orientation="left">Chi tiết phòng đặt</Divider>
                    <Table
                        columns={detailColumns}
                        dataSource={booking.details}
                        rowKey="id"
                        pagination={false}
                        bordered
                    />
                </>
            )}
        </div>
    );
};

export default ViewBooking;
