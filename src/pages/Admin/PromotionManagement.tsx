import React, { useState } from "react";
import {
    Table,
    Button,
    Space,
    Input,
    Select,
    Tag,
    Modal,
    Form,
    message,
    Card,
    Row,
    Col,
    Statistic,
    DatePicker,
    Tooltip,
    Badge,
    InputNumber,
    Switch,
    Popconfirm,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    PercentageOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    CalendarOutlined,
    TagsOutlined,
    CopyOutlined,
    GiftOutlined,
    EnvironmentOutlined,
    DollarOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

type PromotionStatus = "Đang hoạt động" | "Chưa áp dụng" | "Hết hạn" | "Vô hiệu hóa";
type DiscountType = "Phần trăm" | "Số tiền cố định";

interface Promotion {
    id: string;
    code: string;
    name: string;
    description: string;
    discountType: DiscountType;
    discountValue: number;
    minOrderValue: number;
    maxDiscount?: number;
    startDate: string;
    endDate: string;
    usageLimit: number;
    usedCount: number;
    status: PromotionStatus;
    applicableLocations: string[];
    createdAt: string;
    updatedAt: string;
}

const mockPromotions: Promotion[] = [
    {
        id: "1",
        code: "SUMMER2025",
        name: "Ưu đãi mùa hè 2025",
        description: "Giảm 20% cho tất cả đặt phòng trong mùa hè",
        discountType: "Phần trăm",
        discountValue: 20,
        minOrderValue: 1000000,
        maxDiscount: 500000,
        startDate: "2025-06-01",
        endDate: "2025-08-31",
        usageLimit: 1000,
        usedCount: 245,
        status: "Chưa áp dụng",
        applicableLocations: ["Đà Lạt", "Nha Trang", "Phú Quốc"],
        createdAt: "2025-05-15",
        updatedAt: "2025-10-20",
    },
    {
        id: "2",
        code: "DALAT50K",
        name: "Giảm 50K Đà Lạt",
        description: "Giảm 50.000đ cho homestay tại Đà Lạt",
        discountType: "Số tiền cố định",
        discountValue: 50000,
        minOrderValue: 500000,
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        usageLimit: 500,
        usedCount: 156,
        status: "Đang hoạt động",
        applicableLocations: ["Đà Lạt"],
        createdAt: "2025-01-01",
        updatedAt: "2025-10-22",
    },
    {
        id: "3",
        code: "NEWYEAR30",
        name: "Tết Nguyên Đán 2025",
        description: "Giảm 30% dịp Tết Nguyên Đán",
        discountType: "Phần trăm",
        discountValue: 30,
        minOrderValue: 2000000,
        maxDiscount: 1000000,
        startDate: "2025-01-25",
        endDate: "2025-02-05",
        usageLimit: 200,
        usedCount: 200,
        status: "Hết hạn",
        applicableLocations: ["Tất cả"],
        createdAt: "2024-12-20",
        updatedAt: "2025-02-05",
    },
    {
        id: "4",
        code: "WELCOME100K",
        name: "Chào mừng khách mới",
        description: "Giảm 100.000đ cho khách hàng đặt phòng lần đầu",
        discountType: "Số tiền cố định",
        discountValue: 100000,
        minOrderValue: 800000,
        startDate: "2025-10-01",
        endDate: "2025-12-31",
        usageLimit: 2000,
        usedCount: 567,
        status: "Đang hoạt động",
        applicableLocations: ["Tất cả"],
        createdAt: "2025-10-01",
        updatedAt: "2025-10-28",
    },
    {
        id: "5",
        code: "WEEKEND15",
        name: "Giảm giá cuối tuần",
        description: "Giảm 15% cho đặt phòng cuối tuần",
        discountType: "Phần trăm",
        discountValue: 15,
        minOrderValue: 500000,
        maxDiscount: 300000,
        startDate: "2025-10-01",
        endDate: "2025-11-30",
        usageLimit: 1500,
        usedCount: 89,
        status: "Đang hoạt động",
        applicableLocations: ["Hà Nội", "TP.HCM", "Hội An"],
        createdAt: "2025-10-01",
        updatedAt: "2025-10-25",
    },
];

const allLocations = [
    "Tất cả",
    "Hà Nội",
    "TP.HCM",
    "Đà Nẵng",
    "Đà Lạt",
    "Nha Trang",
    "Phú Quốc",
    "Hội An",
    "Vũng Tàu",
    "Sapa",
];

const PromotionManagement: React.FC = () => {
    const [promotions, setPromotions] = useState<Promotion[]>(mockPromotions);
    const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>(mockPromotions);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [form] = Form.useForm();

    // Calculate statistics
    const stats = {
        total: promotions.length,
        active: promotions.filter((p) => p.status === "Đang hoạt động").length,
        upcoming: promotions.filter((p) => p.status === "Chưa áp dụng").length,
        expired: promotions.filter((p) => p.status === "Hết hạn").length,
        disabled: promotions.filter((p) => p.status === "Vô hiệu hóa").length,
        totalUsed: promotions.reduce((sum, p) => sum + p.usedCount, 0),
    };

    // Apply filters
    const applyFilters = (search: string, status: string) => {
        let filtered = promotions;

        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(
                (p) =>
                    p.code.toLowerCase().includes(searchLower) ||
                    p.name.toLowerCase().includes(searchLower) ||
                    p.description.toLowerCase().includes(searchLower)
            );
        }

        if (status !== "all") {
            filtered = filtered.filter((p) => p.status === status);
        }

        setFilteredPromotions(filtered);
    };

    const handleSearch = (value: string) => {
        setSearchText(value);
        applyFilters(value, statusFilter);
    };

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value);
        applyFilters(searchText, value);
    };

    const handleAdd = () => {
        setEditingPromotion(null);
        setIsModalOpen(true);
        form.resetFields();
        form.setFieldsValue({
            discountType: "Phần trăm",
            status: "Đang hoạt động",
            applicableLocations: ["Tất cả"],
        });
    };

    const handleEdit = (promotion: Promotion) => {
        setEditingPromotion(promotion);
        setIsModalOpen(true);
        form.setFieldsValue({
            ...promotion,
            dateRange: [dayjs(promotion.startDate), dayjs(promotion.endDate)],
        });
    };

    const handleSave = (values: any) => {
        const now = new Date().toISOString().split("T")[0];
        const [startDate, endDate] = values.dateRange;

        const promotionData = {
            code: values.code.toUpperCase(),
            name: values.name,
            description: values.description,
            discountType: values.discountType,
            discountValue: values.discountValue,
            minOrderValue: values.minOrderValue,
            maxDiscount: values.maxDiscount,
            startDate: startDate.format("YYYY-MM-DD"),
            endDate: endDate.format("YYYY-MM-DD"),
            usageLimit: values.usageLimit,
            status: values.status,
            applicableLocations: values.applicableLocations,
            updatedAt: now,
        };

        if (editingPromotion) {
            const updatedPromotions = promotions.map((p) =>
                p.id === editingPromotion.id
                    ? { ...p, ...promotionData }
                    : p
            );
            setPromotions(updatedPromotions);
            setFilteredPromotions(updatedPromotions);
            message.success("Cập nhật mã giảm giá thành công!");
        } else {
            const newPromotion: Promotion = {
                id: String(Math.max(...promotions.map((p) => Number(p.id))) + 1),
                ...promotionData,
                usedCount: 0,
                createdAt: now,
            };
            const updatedPromotions = [...promotions, newPromotion];
            setPromotions(updatedPromotions);
            setFilteredPromotions(updatedPromotions);
            message.success("Thêm mã giảm giá thành công!");
        }

        setIsModalOpen(false);
        form.resetFields();
    };

    const handleDelete = (id: string) => {
        const updatedPromotions = promotions.filter((p) => p.id !== id);
        setPromotions(updatedPromotions);
        applyFilters(searchText, statusFilter);
        message.success("Đã xóa mã giảm giá!");
    };

    const handleBulkDelete = () => {
        const updatedPromotions = promotions.filter(
            (p) => !selectedRowKeys.includes(p.id)
        );
        setPromotions(updatedPromotions);
        applyFilters(searchText, statusFilter);
        setSelectedRowKeys([]);
        message.success(`Đã xóa ${selectedRowKeys.length} mã giảm giá!`);
    };

    const handleStatusChange = (id: string, newStatus: PromotionStatus) => {
        const updatedPromotions = promotions.map((p) =>
            p.id === id ? { ...p, status: newStatus } : p
        );
        setPromotions(updatedPromotions);
        applyFilters(searchText, statusFilter);
        message.success("Cập nhật trạng thái thành công!");
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        message.success("Đã sao chép mã giảm giá!");
    };

    const getStatusConfig = (status: PromotionStatus) => {
        const configs: Record<PromotionStatus, { color: string; icon: any }> = {
            "Đang hoạt động": { color: "success", icon: <CheckCircleOutlined /> },
            "Chưa áp dụng": { color: "processing", icon: <CloseCircleOutlined /> },
            "Hết hạn": { color: "default", icon: <CloseCircleOutlined /> },
            "Vô hiệu hóa": { color: "error", icon: <CloseCircleOutlined /> },
        };
        return configs[status];
    };

    const columns: ColumnsType<Promotion> = [
        {
            title: "Mã giảm giá",
            dataIndex: "code",
            key: "code",
            width: 150,
            fixed: "left",
            sorter: (a, b) => a.code.localeCompare(b.code),
            render: (code) => (
                <Space>
                    <span style={{ fontWeight: 600, color: "#1890ff" }}>{code}</span>
                    <Tooltip title="Sao chép mã">
                        <Button
                            type="text"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => handleCopyCode(code)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
        {
            title: "Tên chương trình",
            dataIndex: "name",
            key: "name",
            width: 200,
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (name, record) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{name}</div>
                    <div style={{ fontSize: 12, color: "#999" }}>
                        {record.description}
                    </div>
                </div>
            ),
        },
        {
            title: "Loại giảm giá",
            dataIndex: "discountType",
            key: "discountType",
            width: 130,
            filters: [
                { text: "Phần trăm", value: "Phần trăm" },
                { text: "Số tiền cố định", value: "Số tiền cố định" },
            ],
            onFilter: (value, record) => record.discountType === value,
            render: (type, record) => (
                <Tag color={type === "Phần trăm" ? "blue" : "green"}>
                    {type === "Phần trăm"
                        ? `${record.discountValue}%`
                        : `${record.discountValue.toLocaleString("vi-VN")}₫`
                    }
                </Tag>
            ),
        },
        {
            title: "Điều kiện",
            key: "conditions",
            width: 180,
            render: (_, record) => (
                <div style={{ fontSize: 12 }}>
                    <div>
                        <DollarOutlined style={{ color: "#f5222d", marginRight: 4 }} />
                        Tối thiểu: {record.minOrderValue.toLocaleString("vi-VN")}₫
                    </div>
                    {record.maxDiscount && (
                        <div style={{ marginTop: 4 }}>
                            <PercentageOutlined style={{ color: "#52c41a", marginRight: 4 }} />
                            Tối đa: {record.maxDiscount.toLocaleString("vi-VN")}₫
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: "Thời gian",
            key: "duration",
            width: 200,
            sorter: (a, b) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix(),
            render: (_, record) => (
                <div style={{ fontSize: 12 }}>
                    <div>
                        <CalendarOutlined style={{ color: "#52c41a", marginRight: 4 }} />
                        {dayjs(record.startDate).format("DD/MM/YYYY")}
                    </div>
                    <div style={{ marginTop: 4 }}>
                        <CalendarOutlined style={{ color: "#f5222d", marginRight: 4 }} />
                        {dayjs(record.endDate).format("DD/MM/YYYY")}
                    </div>
                </div>
            ),
        },
        {
            title: "Địa điểm",
            dataIndex: "applicableLocations",
            key: "applicableLocations",
            width: 150,
            render: (locations: string[]) => (
                <div>
                    {locations.slice(0, 2).map((loc) => (
                        <Tag
                            key={loc}
                            color="orange"
                            style={{ marginBottom: 4 }}
                            icon={<EnvironmentOutlined />}
                        >
                            {loc}
                        </Tag>
                    ))}
                    {locations.length > 2 && (
                        <Tag color="orange">+{locations.length - 2}</Tag>
                    )}
                </div>
            ),
        },
        {
            title: "Sử dụng",
            key: "usage",
            width: 120,
            sorter: (a, b) => a.usedCount - b.usedCount,
            render: (_, record) => {
                const percentage = (record.usedCount / record.usageLimit) * 100;
                return (
                    <div>
                        <div style={{ fontSize: 12, marginBottom: 4 }}>
                            {record.usedCount} / {record.usageLimit}
                        </div>
                        <div style={{ width: 80 }}>
                            <div
                                style={{
                                    height: 6,
                                    background: "#f0f0f0",
                                    borderRadius: 3,
                                    overflow: "hidden",
                                }}
                            >
                                <div
                                    style={{
                                        height: "100%",
                                        width: `${percentage}%`,
                                        background:
                                            percentage >= 90
                                                ? "#f5222d"
                                                : percentage >= 70
                                                    ? "#faad14"
                                                    : "#52c41a",
                                        transition: "width 0.3s",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 150,
            filters: [
                { text: "Đang hoạt động", value: "Đang hoạt động" },
                { text: "Chưa áp dụng", value: "Chưa áp dụng" },
                { text: "Hết hạn", value: "Hết hạn" },
                { text: "Vô hiệu hóa", value: "Vô hiệu hóa" },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status: PromotionStatus, record) => {
                const config = getStatusConfig(status);
                return (
                    <Select
                        value={status}
                        style={{ width: 140 }}
                        onChange={(value) => handleStatusChange(record.id, value)}
                        disabled={status === "Hết hạn"}
                    >
                        <Option value="Đang hoạt động">
                            <Badge status="success" text="Đang hoạt động" />
                        </Option>
                        <Option value="Chưa áp dụng">
                            <Badge status="processing" text="Chưa áp dụng" />
                        </Option>
                        <Option value="Hết hạn">
                            <Badge status="default" text="Hết hạn" />
                        </Option>
                        <Option value="Vô hiệu hóa">
                            <Badge status="error" text="Vô hiệu hóa" />
                        </Option>
                    </Select>
                );
            },
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 120,
            sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
            render: (date) => dayjs(date).format("DD/MM/YYYY"),
        },
        {
            title: "Hành động",
            key: "action",
            width: 120,
            fixed: "right",
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xác nhận xóa"
                        description="Bạn có chắc chắn muốn xóa mã giảm giá này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Tooltip title="Xóa">
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedKeys: React.Key[]) => {
            setSelectedRowKeys(selectedKeys);
        },
    };

    return (
        <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <Space size="large" style={{ marginBottom: 16 }}>
                    <GiftOutlined style={{ fontSize: 28, color: "#1890ff" }} />
                    <span style={{ fontSize: 24, fontWeight: 600 }}>Quản lý Mã giảm giá</span>
                </Space>
            </div>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng mã"
                            value={stats.total}
                            prefix={<TagsOutlined />}
                            valueStyle={{ color: "#1890ff" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Đang hoạt động"
                            value={stats.active}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: "#52c41a" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Chưa áp dụng"
                            value={stats.upcoming}
                            prefix={<CloseCircleOutlined />}
                            valueStyle={{ color: "#1890ff" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Hết hạn"
                            value={stats.expired}
                            prefix={<CloseCircleOutlined />}
                            valueStyle={{ color: "#999" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Vô hiệu hóa"
                            value={stats.disabled}
                            prefix={<CloseCircleOutlined />}
                            valueStyle={{ color: "#f5222d" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng lượt dùng"
                            value={stats.totalUsed}
                            prefix={<PercentageOutlined />}
                            valueStyle={{ color: "#722ed1" }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Table Card */}
            <Card style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                <Space
                    style={{
                        marginBottom: 16,
                        width: "100%",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                    }}
                >
                    <Space wrap>
                        <Search
                            placeholder="Tìm kiếm mã, tên chương trình..."
                            allowClear
                            enterButton={<SearchOutlined />}
                            size="large"
                            style={{ width: 350 }}
                            onSearch={handleSearch}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                        <Select
                            value={statusFilter}
                            size="large"
                            style={{ width: 180 }}
                            onChange={handleStatusFilterChange}
                        >
                            <Option value="all">
                                <Badge status="default" text="Tất cả trạng thái" />
                            </Option>
                            <Option value="Đang hoạt động">
                                <Badge status="success" text="Đang hoạt động" />
                            </Option>
                            <Option value="Chưa áp dụng">
                                <Badge status="processing" text="Chưa áp dụng" />
                            </Option>
                            <Option value="Hết hạn">
                                <Badge status="default" text="Hết hạn" />
                            </Option>
                            <Option value="Vô hiệu hóa">
                                <Badge status="error" text="Vô hiệu hóa" />
                            </Option>
                        </Select>
                    </Space>
                    <Space>
                        {selectedRowKeys.length > 0 && (
                            <Popconfirm
                                title="Xác nhận xóa"
                                description={`Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} mã giảm giá?`}
                                onConfirm={handleBulkDelete}
                                okText="Xóa"
                                cancelText="Hủy"
                            >
                                <Button danger icon={<DeleteOutlined />}>
                                    Xóa {selectedRowKeys.length} mã
                                </Button>
                            </Popconfirm>
                        )}
                        <Button
                            type="primary"
                            size="large"
                            icon={<PlusOutlined />}
                            onClick={handleAdd}
                        >
                            Thêm mã giảm giá
                        </Button>
                    </Space>
                </Space>

                <Table
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={filteredPromotions}
                    rowKey="id"
                    scroll={{ x: 1600 }}
                    pagination={{
                        pageSize: 15,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} mã giảm giá`,
                        pageSizeOptions: [15, 30, 45],
                    }}
                />
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                title={
                    <Space>
                        <GiftOutlined />
                        <span>
                            {editingPromotion ? "Chỉnh sửa mã giảm giá" : "Thêm mã giảm giá mới"}
                        </span>
                    </Space>
                }
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingPromotion(null);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                okText="Lưu"
                cancelText="Hủy"
                width={700}
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="code"
                                label="Mã giảm giá"
                                rules={[
                                    { required: true, message: "Vui lòng nhập mã giảm giá" },
                                    {
                                        pattern: /^[A-Z0-9]+$/,
                                        message: "Mã chỉ chứa chữ in hoa và số",
                                    },
                                ]}
                            >
                                <Input
                                    placeholder="VD: SUMMER2025"
                                    maxLength={20}
                                    style={{ textTransform: "uppercase" }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="status"
                                label="Trạng thái"
                                rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
                            >
                                <Select>
                                    <Option value="Đang hoạt động">Đang hoạt động</Option>
                                    <Option value="Chưa áp dụng">Chưa áp dụng</Option>
                                    <Option value="Vô hiệu hóa">Vô hiệu hóa</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="name"
                        label="Tên chương trình"
                        rules={[{ required: true, message: "Vui lòng nhập tên chương trình" }]}
                    >
                        <Input placeholder="VD: Ưu đãi mùa hè 2025" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
                    >
                        <TextArea rows={3} placeholder="Mô tả chi tiết về chương trình..." />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="discountType"
                                label="Loại giảm giá"
                                rules={[{ required: true, message: "Vui lòng chọn loại" }]}
                            >
                                <Select>
                                    <Option value="Phần trăm">Phần trăm</Option>
                                    <Option value="Số tiền cố định">Số tiền cố định</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item
                                name="discountValue"
                                label="Giá trị giảm"
                                rules={[{ required: true, message: "Vui lòng nhập giá trị giảm" }]}
                            >
                                <InputNumber
                                    min={0}
                                    style={{ width: "100%" }}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                    parser={(value) => value!.replace(/,/g, "")}
                                    addonAfter={<PercentageOutlined />}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item
                                name="maxDiscount"
                                label="Giảm tối đa (₫)"
                                tooltip="Chỉ áp dụng cho loại giảm phần trăm"
                            >
                                <InputNumber
                                    min={0}
                                    style={{ width: "100%" }}
                                    placeholder="VD: 500000"
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                    parser={(value) => value!.replace(/,/g, "")}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="minOrderValue"
                                label="Giá trị đơn hàng tối thiểu (₫)"
                                rules={[{ required: true, message: "Vui lòng nhập giá trị tối thiểu" }]}
                            >
                                <InputNumber
                                    min={0}
                                    style={{ width: "100%" }}
                                    placeholder="VD: 1000000"
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                    parser={(value) => value!.replace(/,/g, "")}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="usageLimit"
                                label="Giới hạn sử dụng"
                                rules={[{ required: true, message: "Vui lòng nhập giới hạn sử dụng" }]}
                            >
                                <InputNumber min={1} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="dateRange"
                        label="Thời gian áp dụng"
                        rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
                    >
                        <RangePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                    </Form.Item>

                    <Form.Item
                        name="applicableLocations"
                        label="Địa điểm áp dụng"
                        rules={[{ required: true, message: "Vui lòng chọn ít nhất một địa điểm" }]}
                    >
                        <Select
                            mode="multiple"
                            placeholder="Chọn địa điểm áp dụng"
                            allowClear
                            style={{ width: "100%" }}
                        >
                            {allLocations.map((loc) => (
                                <Option key={loc} value={loc}>
                                    {loc}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PromotionManagement;
