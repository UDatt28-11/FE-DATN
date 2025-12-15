import React, { useState, useEffect } from "react";
import { Table, Button, Space, Input, Tag, Card, Badge, message, Modal, List, Descriptions, Divider, Typography } from "antd";
import { HomeOutlined, UserOutlined, CalendarOutlined, IdcardOutlined, PhoneOutlined, SearchOutlined, ReloadOutlined, EyeOutlined, TeamOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { getCheckedInGuests } from "../../../service/bookingService";

const { Text } = Typography;

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

// Nhóm khách theo CCCD/Hộ chiếu
interface GroupedGuest {
    identity_number: string;
    identity_type: string;
    full_name: string;
    date_of_birth?: string;
    stays: CheckedInGuest[]; // Các lần lưu trú
    stay_count: number;
    latest_check_in?: string;
}

const ListAccommodation: React.FC = () => {
    const [data, setData] = useState<CheckedInGuest[]>([]);
    const [groupedData, setGroupedData] = useState<GroupedGuest[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [pagination, setPagination] = useState({
        page: 1,
        per_page: 15,
        total: 0,
        last_page: 1,
    });
    
    // Modal xem chi tiết các lần lưu trú
    const [detailModal, setDetailModal] = useState(false);
    const [selectedGuest, setSelectedGuest] = useState<GroupedGuest | null>(null);

    // Nhóm dữ liệu theo CCCD/Hộ chiếu
    const groupByIdentity = (guests: CheckedInGuest[]): GroupedGuest[] => {
        const groupMap = new Map<string, GroupedGuest>();
        
        guests.forEach(guest => {
            const key = guest.identity_number || `unknown_${guest.id}`;
            
            if (groupMap.has(key)) {
                const existing = groupMap.get(key)!;
                existing.stays.push(guest);
                existing.stay_count = existing.stays.length;
                // Cập nhật check-in mới nhất
                if (guest.check_in_time && (!existing.latest_check_in || dayjs(guest.check_in_time).isAfter(dayjs(existing.latest_check_in)))) {
                    existing.latest_check_in = guest.check_in_time;
                }
            } else {
                groupMap.set(key, {
                    identity_number: guest.identity_number || 'Chưa có',
                    identity_type: guest.identity_type || 'cccd',
                    full_name: guest.full_name,
                    date_of_birth: guest.date_of_birth,
                    stays: [guest],
                    stay_count: 1,
                    latest_check_in: guest.check_in_time,
                });
            }
        });
        
        // Sắp xếp theo thời gian check-in mới nhất
        return Array.from(groupMap.values()).sort((a, b) => {
            if (!a.latest_check_in) return 1;
            if (!b.latest_check_in) return -1;
            return dayjs(b.latest_check_in).valueOf() - dayjs(a.latest_check_in).valueOf();
        });
    };

    const fetchData = async (page = 1, search?: string) => {
        setLoading(true);
        try {
            const result = await getCheckedInGuests({
                page,
                per_page: 100, // Lấy nhiều hơn để gộp
                search: search || undefined,
            });
            setData(result.data);
            setGroupedData(groupByIdentity(result.data));
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

    const handleViewDetail = (guest: GroupedGuest) => {
        setSelectedGuest(guest);
        setDetailModal(true);
    };

    const columns: ColumnsType<GroupedGuest> = [
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
                </Space>
            ),
        },
        {
            title: "CCCD/Hộ chiếu",
            key: "identity",
            render: (_, record) => (
                <Space direction="vertical" size="small">
                    <div>
                        <IdcardOutlined style={{ marginRight: 4, color: '#fa8c16' }} />
                        <strong>{record.identity_number}</strong>
                    </div>
                    <Tag color={record.identity_type === 'cccd' ? 'blue' : 'green'}>
                        {record.identity_type === 'cccd' ? 'CCCD/CMND' : 'Hộ chiếu'}
                    </Tag>
                </Space>
            ),
        },
        {
            title: "Phòng hiện tại",
            key: "current_room",
            render: (_, record) => {
                // Lấy lần lưu trú mới nhất
                const latestStay = record.stays.sort((a, b) => {
                    if (!a.check_in_time) return 1;
                    if (!b.check_in_time) return -1;
                    return dayjs(b.check_in_time).valueOf() - dayjs(a.check_in_time).valueOf();
                })[0];
                
                return latestStay?.room ? (
                    <Space direction="vertical" size="small">
                        <div>
                            <HomeOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                            <strong>{latestStay.room.name}</strong>
                        </div>
                        {latestStay.room.room_type && (
                            <Tag color="cyan">{latestStay.room.room_type}</Tag>
                        )}
                    </Space>
                ) : 'N/A';
            },
        },
        {
            title: "Số lần lưu trú",
            key: "stay_count",
            width: 130,
            align: 'center',
            render: (_, record) => (
                <Badge 
                    count={record.stay_count} 
                    style={{ 
                        backgroundColor: record.stay_count > 1 ? '#fa8c16' : '#52c41a',
                        fontSize: 14,
                        padding: '0 8px'
                    }}
                    overflowCount={99}
                />
            ),
            sorter: (a, b) => a.stay_count - b.stay_count,
        },
        {
            title: "Check-in gần nhất",
            key: "latest_check_in",
            render: (_, record) => (
                record.latest_check_in ? (
                    <div>
                        <Badge status="success" />
                        {dayjs(record.latest_check_in).format('DD/MM/YYYY HH:mm')}
                    </div>
                ) : 'N/A'
            ),
            sorter: (a, b) => {
                if (!a.latest_check_in) return 1;
                if (!b.latest_check_in) return -1;
                return dayjs(b.latest_check_in).valueOf() - dayjs(a.latest_check_in).valueOf();
            },
        },
        {
            title: "Thao tác",
            key: "actions",
            width: 100,
            align: 'center',
            render: (_, record) => (
                <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetail(record)}
                    title="Xem chi tiết các lần lưu trú"
                >
                    Chi tiết
                </Button>
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
                    <Space>
                        <Tag icon={<TeamOutlined />} color="blue">
                            Tổng: {groupedData.length} khách (gộp theo CCCD/Hộ chiếu)
                        </Tag>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => fetchData(pagination.page, searchText)}
                        >
                            Làm mới
                        </Button>
                    </Space>
                </Space>
                <Table
                    rowKey="identity_number"
                    columns={columns}
                    dataSource={groupedData}
                    loading={loading}
                    pagination={{
                        pageSize: 15,
                        showTotal: (total) => `Tổng ${total} khách đang lưu trú`,
                    }}
                />
            </Card>

            {/* Modal xem chi tiết các lần lưu trú */}
            <Modal
                title={
                    <Space>
                        <UserOutlined />
                        <span>Chi tiết lưu trú - {selectedGuest?.full_name}</span>
                    </Space>
                }
                open={detailModal}
                onCancel={() => setDetailModal(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailModal(false)}>
                        Đóng
                    </Button>
                ]}
                width={800}
            >
                {selectedGuest && (
                    <>
                        {/* Thông tin khách */}
                        <Descriptions bordered size="small" column={2} style={{ marginBottom: 24 }}>
                            <Descriptions.Item label="Họ tên">
                                <strong>{selectedGuest.full_name}</strong>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày sinh">
                                {selectedGuest.date_of_birth 
                                    ? dayjs(selectedGuest.date_of_birth).format('DD/MM/YYYY') 
                                    : 'Chưa có'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Loại giấy tờ">
                                <Tag color={selectedGuest.identity_type === 'cccd' ? 'blue' : 'green'}>
                                    {selectedGuest.identity_type === 'cccd' ? 'CCCD/CMND' : 'Hộ chiếu'}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Số giấy tờ">
                                <strong>{selectedGuest.identity_number}</strong>
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider orientation="left">
                            <TeamOutlined /> Danh sách các lần lưu trú ({selectedGuest.stay_count} lần)
                        </Divider>

                        <List
                            dataSource={selectedGuest.stays.sort((a, b) => {
                                if (!a.check_in_time) return 1;
                                if (!b.check_in_time) return -1;
                                return dayjs(b.check_in_time).valueOf() - dayjs(a.check_in_time).valueOf();
                            })}
                            renderItem={(stay, index) => (
                                <List.Item>
                                    <Card 
                                        size="small" 
                                        style={{ width: '100%' }}
                                        title={
                                            <Space>
                                                <Badge count={index + 1} style={{ backgroundColor: '#1890ff' }} />
                                                <HomeOutlined style={{ color: '#52c41a' }} />
                                                <Text strong>Phòng: {stay.room?.name || 'N/A'}</Text>
                                                {stay.room?.room_type && (
                                                    <Tag color="cyan">{stay.room.room_type}</Tag>
                                                )}
                                            </Space>
                                        }
                                    >
                                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                            <div>
                                                <Text type="secondary">Mã đặt phòng: </Text>
                                                <Tag color="blue">#{stay.booking?.order_code || 'N/A'}</Tag>
                                                {stay.booking?.customer_phone && (
                                                    <>
                                                        <Text type="secondary" style={{ marginLeft: 16 }}>
                                                            <PhoneOutlined /> {stay.booking.customer_phone}
                                                        </Text>
                                                    </>
                                                )}
                                            </div>
                                            <div>
                                                <Text type="secondary">Thời gian: </Text>
                                                <Text>
                                                    <CalendarOutlined style={{ color: '#52c41a', marginRight: 4 }} />
                                                    {stay.check_in_date ? dayjs(stay.check_in_date).format('DD/MM/YYYY') : 'N/A'}
                                                    {' → '}
                                                    <CalendarOutlined style={{ color: '#ff4d4f', marginRight: 4 }} />
                                                    {stay.check_out_date ? dayjs(stay.check_out_date).format('DD/MM/YYYY') : 'N/A'}
                                                </Text>
                                            </div>
                                            <div>
                                                <Text type="secondary">Thời gian check-in: </Text>
                                                <Text>
                                                    {stay.check_in_time 
                                                        ? dayjs(stay.check_in_time).format('DD/MM/YYYY HH:mm:ss')
                                                        : 'Chưa check-in'}
                                                </Text>
                                            </div>
                                        </Space>
                                    </Card>
                                </List.Item>
                            )}
                        />
                    </>
                )}
            </Modal>
        </div>
    );
};

export default ListAccommodation;
