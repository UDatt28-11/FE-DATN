import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Button,
    Space,
    Tag,
    Input,
    Switch,
    Popconfirm,
    message,
    Typography,
    Tooltip,
    Badge,
    Select,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    GiftOutlined,
    PercentageOutlined,
    DollarOutlined,
    ReloadOutlined,
    CopyOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import {
    getVouchers,
    deleteVoucher,
    toggleVoucherActive,
    type Voucher,
} from '../../../service/admin/voucherService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;

const ListVoucher: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [searchKeyword, setSearchKeyword] = useState('');
    const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        fetchVouchers();
    }, [pagination.current, pagination.pageSize, searchKeyword, filterActive]);

    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const { vouchers, pagination: meta } = await getVouchers({
                page: pagination.current,
                per_page: pagination.pageSize,
                keyword: searchKeyword || undefined,
                is_active: filterActive,
            });
            setVouchers(vouchers);
            setPagination(prev => ({
                ...prev,
                total: meta?.total || 0,
            }));
        } catch (error) {
            message.error('Không thể tải danh sách voucher');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteVoucher(id);
            message.success('Xóa voucher thành công');
            fetchVouchers();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể xóa voucher');
        }
    };

    const handleToggleActive = async (id: number, checked: boolean) => {
        try {
            await toggleVoucherActive(id, checked);
            message.success(checked ? 'Đã kích hoạt voucher' : 'Đã vô hiệu hóa voucher');
            fetchVouchers();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
        }
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        message.success('Đã sao chép mã: ' + code);
    };

    const getVoucherStatus = (voucher: Voucher) => {
        if (!voucher.is_active) {
            return { status: 'inactive', color: 'default', text: 'Vô hiệu' };
        }
        
        const now = dayjs();
        const startDate = dayjs(voucher.start_date);
        const endDate = dayjs(voucher.end_date);

        if (now.isBefore(startDate)) {
            return { status: 'upcoming', color: 'blue', text: 'Chưa bắt đầu' };
        }
        if (now.isAfter(endDate)) {
            return { status: 'expired', color: 'red', text: 'Hết hạn' };
        }
        if (voucher.usage_limit && voucher.usage_count >= voucher.usage_limit) {
            return { status: 'exhausted', color: 'orange', text: 'Hết lượt' };
        }
        return { status: 'active', color: 'green', text: 'Đang hoạt động' };
    };

    const columns: ColumnsType<Voucher> = [
        {
            title: 'Mã voucher',
            key: 'code',
            width: 180,
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Space size={4}>
                        <Tag 
                            color={record.discount_type === 'percentage' ? 'red' : 'green'}
                            icon={record.discount_type === 'percentage' ? <PercentageOutlined /> : <DollarOutlined />}
                            style={{ margin: 0 }}
                        >
                            {record.code}
                        </Tag>
                        <Tooltip title="Sao chép">
                            <CopyOutlined 
                                style={{ cursor: 'pointer', color: '#1890ff', fontSize: 14 }}
                                onClick={() => copyCode(record.code)}
                            />
                        </Tooltip>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>
                        {record.name || record.code}
                    </Text>
                </Space>
            ),
        },
        {
            title: 'Giảm giá',
            key: 'discount',
            width: 160,
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong style={{ color: '#eb2f96', fontSize: 13 }}>
                        {record.discount_type === 'percentage' 
                            ? `${record.discount_value}%`
                            : new Intl.NumberFormat('vi-VN').format(record.discount_value) + 'đ'
                        }
                    </Text>
                    {record.max_discount_amount && (
                        <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>
                            Tối đa: {new Intl.NumberFormat('vi-VN').format(record.max_discount_amount)}đ
                        </Text>
                    )}
                    {record.min_order_amount > 0 && (
                        <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>
                            Đơn tối thiểu: {new Intl.NumberFormat('vi-VN').format(record.min_order_amount)}đ
                        </Text>
                    )}
                </Space>
            ),
        },
        {
            title: 'Thời gian',
            key: 'dates',
            width: 170,
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text style={{ fontSize: 11, display: 'block' }}>
                        Từ: {dayjs(record.start_date).format('DD/MM/YYYY HH:mm')}
                    </Text>
                    <Text style={{ fontSize: 11, display: 'block' }}>
                        Đến: {dayjs(record.end_date).format('DD/MM/YYYY HH:mm')}
                    </Text>
                </Space>
            ),
        },
        {
            title: 'Sử dụng',
            key: 'usage',
            width: 110,
            align: 'center',
            render: (_, record) => (
                <Space direction="vertical" size={0} style={{ textAlign: 'center', width: '100%' }}>
                    <Text strong style={{ fontSize: 12 }}>
                        {record.usage_count} / {record.usage_limit || '∞'}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>
                        {record.max_usage_per_user} lần/user
                    </Text>
                </Space>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 130,
            render: (_, record) => {
                const { color, text } = getVoucherStatus(record);
                return (
                    <Space direction="vertical" size={2}>
                        <Tag color={color} style={{ margin: 0, fontSize: 11 }}>{text}</Tag>
                        {record.is_public ? (
                            <Tag color="cyan" style={{ margin: 0, fontSize: 10 }}>Công khai</Tag>
                        ) : (
                            <Tag style={{ margin: 0, fontSize: 10 }}>Riêng tư</Tag>
                        )}
                    </Space>
                );
            },
        },
        {
            title: 'Kích hoạt',
            key: 'is_active',
            width: 100,
            align: 'center',
            render: (_, record) => (
                <Switch
                    checked={record.is_active}
                    onChange={(checked) => handleToggleActive(record.id, checked)}
                    checkedChildren="Bật"
                    unCheckedChildren="Tắt"
                    size="small"
                />
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 100,
            fixed: 'right' as const,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/admin/vouchers/edit/${record.id}`)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa voucher"
                        description="Bạn có chắc chắn muốn xóa voucher này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Xóa">
                            <Button
                                type="text"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card>
                <div style={{ marginBottom: 24 }}>
                    <Space align="center" style={{ marginBottom: 16 }}>
                        <GiftOutlined style={{ fontSize: 28, color: '#eb2f96' }} />
                        <Title level={3} style={{ margin: 0 }}>Quản lý Voucher</Title>
                    </Space>

                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                        <Space wrap>
                            <Search
                                placeholder="Tìm theo mã, tên voucher..."
                                allowClear
                                style={{ width: 300 }}
                                onSearch={setSearchKeyword}
                                prefix={<SearchOutlined />}
                            />
                            <Select
                                placeholder="Trạng thái"
                                allowClear
                                style={{ width: 150 }}
                                onChange={(value) => setFilterActive(value)}
                                options={[
                                    { value: true, label: 'Đang kích hoạt' },
                                    { value: false, label: 'Vô hiệu hóa' },
                                ]}
                            />
                            <Button icon={<ReloadOutlined />} onClick={fetchVouchers}>
                                Làm mới
                            </Button>
                        </Space>

                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => navigate('/admin/vouchers/add')}
                        >
                            Thêm Voucher
                        </Button>
                    </div>
                </div>

                <Table
                    columns={columns}
                    dataSource={vouchers}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} voucher`,
                        pageSizeOptions: ['10', '20', '50'],
                    }}
                    onChange={(pag) => {
                        setPagination(prev => ({
                            ...prev,
                            current: pag.current || 1,
                            pageSize: pag.pageSize || 10,
                        }));
                    }}
                    scroll={{ x: 950 }}
                    size="small"
                />
            </Card>
        </div>
    );
};

export default ListVoucher;

