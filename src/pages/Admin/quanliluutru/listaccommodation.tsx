import React, { useState, useEffect } from "react";
import { Table, Button, Space, Input, Select, Tag, Card, Avatar, Badge, message } from "antd";
import { HomeOutlined, UserOutlined, CalendarOutlined, IdcardOutlined, PhoneOutlined, SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { getCheckedInGuests } from "../../../service/bookingService";

interface CheckedInGuest {
    id: number;
    full_name: string;
    date_of_birth?: string;
    identity_type?: string;
    identity_number?: string;
    identity_image_url?: string;
    check_in_time?: string;
    booking?: {
        id: number;
        order_code: string;
        customer_name?: string;
        customer_phone?: string;
    };
    room?: {
        id: number;
        name: string;
        room_type?: string;
    };
    check_in_date?: string;
    check_out_date?: string;
}

const ListAccommodation: React.FC = () => {
    const [data, setData] = useState<CheckedInGuest[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [pagination, setPagination] = useState({
        page: 1,
        per_page: 15,
        total: 0,
        last_page: 1,
    });

    const fetchData = async (page = 1, search?: string) => {
        setLoading(true);
        try {
            const result = await getCheckedInGuests({
                page,
                per_page: 15,
                search: search || undefined,
            });
            setData(result.data);
            setPagination(result.pagination || {
                page: 1,
                per_page: 15,
                total: 0,
                last_page: 1,
            });
        } catch (error: any) {
            console.error('Error fetching checked-in guests:', error);
            message.error('Không thể tải danh sách khách lưu trú');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(1);
    }, []);

    const handleSearch = (value: string) => {
        setSearchText(value);
        fetchData(1, value);
    };

    const handleTableChange = (page: number) => {
        fetchData(page, searchText);
    };

    const columns: ColumnsType<CheckedInGuest> = [
        {
            title: "Khách hàng",
            key: "guest",
            render: (_, record) => (
                <Space direction="vertical" size="small">
                    <div>
                        <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                        <strong>{record.full_name}</strong>
                    </div>
                    {record.date_of_birth && (
                        <div style={{ fontSize: 12, color: '#999' }}>
                            Sinh: {dayjs(record.date_of_birth).format('DD/MM/YYYY')}
                        </div>
                    )}
                    {record.identity_number && (
                        <div style={{ fontSize: 12, color: '#999' }}>
                            <IdcardOutlined style={{ marginRight: 4 }} />
                            {record.identity_type === 'cccd' ? 'CCCD/CMND' : 'Hộ chiếu'}: {record.identity_number}
                        </div>
                    )}
                </Space>
            ),
        },
        {
            title: "Mã đặt phòng",
            key: "booking",
            render: (_, record) => (
                record.booking ? (
                    <Space direction="vertical" size="small">
                        <Tag color="blue">#{record.booking.order_code}</Tag>
                        {record.booking.customer_phone && (
                            <div style={{ fontSize: 12, color: '#999' }}>
                                <PhoneOutlined style={{ marginRight: 4 }} />
                                {record.booking.customer_phone}
                            </div>
                        )}
                    </Space>
                ) : 'N/A'
            ),
        },
        {
            title: "Phòng",
            key: "room",
            render: (_, record) => (
                record.room ? (
                    <Space direction="vertical" size="small">
                        <div>
                            <HomeOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                            <strong>{record.room.name}</strong>
                        </div>
                        {record.room.room_type && (
                            <Tag color="cyan">{record.room.room_type}</Tag>
                        )}
                    </Space>
                ) : 'N/A'
            ),
        },
        {
            title: "Thời gian lưu trú",
            key: "stay_period",
            render: (_, record) => (
                <Space direction="vertical" size="small">
                    {record.check_in_date && (
                        <div>
                            <CalendarOutlined style={{ marginRight: 4, color: '#52c41a' }} />
                            Check-in: {dayjs(record.check_in_date).format('DD/MM/YYYY')}
                        </div>
                    )}
                    {record.check_out_date && (
                        <div>
                            <CalendarOutlined style={{ marginRight: 4, color: '#ff4d4f' }} />
                            Check-out: {dayjs(record.check_out_date).format('DD/MM/YYYY')}
                        </div>
                    )}
                </Space>
            ),
        },
        {
            title: "Thời gian check-in",
            key: "check_in_time",
            render: (_, record) => (
                record.check_in_time ? (
                    <div>
                        <Badge status="success" />
                        {dayjs(record.check_in_time).format('DD/MM/YYYY HH:mm')}
                    </div>
                ) : 'N/A'
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card>
                <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
                    <Space>
                        <Input.Search
                            placeholder="Tìm kiếm tên khách, số CMND/CCCD, mã đặt phòng..."
                            allowClear
                            onSearch={handleSearch}
                            style={{ width: 400 }}
                            enterButton={<SearchOutlined />}
                        />
                    </Space>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => fetchData(pagination.page, searchText)}
                    >
                        Làm mới
                    </Button>
                </Space>
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={data}
                    loading={loading}
                    pagination={{
                        current: pagination.page,
                        pageSize: pagination.per_page,
                        total: pagination.total,
                        onChange: handleTableChange,
                        showSizeChanger: false,
                        showTotal: (total) => `Tổng ${total} khách đang lưu trú`,
                    }}
                />
            </Card>
        </div>
    );
};

export default ListAccommodation;
