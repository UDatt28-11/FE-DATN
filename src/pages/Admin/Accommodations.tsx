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
    Avatar,
    Tooltip,
    Badge,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    HomeOutlined,
    UserOutlined,
    SearchOutlined,
    DollarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ToolOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

interface Accommodation {
    id: number;
    name: string;
    status: "Trống" | "Đã đặt" | "Đang dùng" | "Bảo trì";
    price: number;
    type: string;
    manager: string;
    updatedAt: string;
    address?: string;
    capacity?: number;
    description?: string;
    amenities?: string[];
}

const mockData: Accommodation[] = [
    {
        id: 1,
        name: "Homestay Đà Lạt View Núi",
        status: "Trống",
        price: 1200000,
        type: "Phòng đôi",
        manager: "Nguyễn Văn A",
        updatedAt: "2025-10-20",
        address: "123 Đường Trần Phú, Đà Lạt",
        capacity: 2,
        description: "Phòng view núi đẹp, yên tĩnh",
        amenities: ["WiFi", "Điều hòa", "TV"],
    },
    {
        id: 2,
        name: "Villa Biển Nha Trang",
        status: "Đã đặt",
        price: 3500000,
        type: "Villa",
        manager: "Trần Thị B",
        updatedAt: "2025-10-22",
        address: "456 Đường Trần Phú, Nha Trang",
        capacity: 6,
        description: "Villa cao cấp view biển",
        amenities: ["WiFi", "Bể bơi", "BBQ", "Điều hòa"],
    },
    {
        id: 3,
        name: "Căn hộ Hồ Tây",
        status: "Bảo trì",
        price: 1800000,
        type: "Căn hộ",
        manager: "Lê Văn C",
        updatedAt: "2025-10-25",
        address: "789 Đường Âu Cơ, Hà Nội",
        capacity: 4,
        description: "Căn hộ hiện đại, view hồ",
        amenities: ["WiFi", "Điều hòa", "Bếp"],
    },
    {
        id: 4,
        name: "Phòng Studio Quận 1",
        status: "Đang dùng",
        price: 900000,
        type: "Studio",
        manager: "Phạm Thị D",
        updatedAt: "2025-10-26",
        address: "321 Nguyễn Huệ, Q1, TP.HCM",
        capacity: 2,
        description: "Studio tiện nghi trung tâm thành phố",
        amenities: ["WiFi", "Điều hòa"],
    },
    {
        id: 5,
        name: "Homestay Hội An Cổ Kính",
        status: "Trống",
        price: 1500000,
        type: "Phòng gia đình",
        manager: "Hoàng Văn E",
        updatedAt: "2025-10-27",
        address: "567 Phố Cổ, Hội An",
        capacity: 5,
        description: "Không gian truyền thống Hội An",
        amenities: ["WiFi", "Xe đạp", "Tour"],
    },
];

const Accommodations: React.FC = () => {
    const [data, setData] = useState(mockData);
    const [filteredData, setFilteredData] = useState(mockData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Accommodation | null>(null);
    const [viewingItem, setViewingItem] = useState<Accommodation | null>(null);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [form] = Form.useForm();

    // Tính toán thống kê
    const stats = {
        total: data.length,
        available: data.filter((item) => item.status === "Trống").length,
        booked: data.filter((item) => item.status === "Đã đặt").length,
        inUse: data.filter((item) => item.status === "Đang dùng").length,
        maintenance: data.filter((item) => item.status === "Bảo trì").length,
    };

    // Áp dụng bộ lọc
    const applyFilters = (search: string, status: string) => {
        let filtered = data;

        if (search) {
            filtered = filtered.filter(
                (item) =>
                    item.name.toLowerCase().includes(search.toLowerCase()) ||
                    item.address?.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (status !== "all") {
            filtered = filtered.filter((item) => item.status === status);
        }

        setFilteredData(filtered);
    };

    const handleSearch = (value: string) => {
        setSearchText(value);
        applyFilters(value, statusFilter);
    };

    const handleStatusChange = (value: string) => {
        setStatusFilter(value);
        applyFilters(searchText, value);
    };

    const handleSave = (values: any) => {
        const now = new Date().toISOString().split("T")[0];

        if (editingItem) {
            const updatedData = data.map((item) =>
                item.id === editingItem.id
                    ? { ...item, ...values, updatedAt: now }
                    : item
            );
            setData(updatedData);
            setFilteredData(updatedData);
            message.success("Cập nhật phòng thành công!");
        } else {
            const newRoom: Accommodation = {
                id: Math.max(...data.map(d => d.id)) + 1,
                ...values,
                status: "Trống",
                updatedAt: now,
            };
            const updatedData = [...data, newRoom];
            setData(updatedData);
            setFilteredData(updatedData);
            message.success("Thêm phòng mới thành công!");
        }

        setIsModalOpen(false);
        setEditingItem(null);
        form.resetFields();
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: "Xác nhận xóa",
            content: "Bạn có chắc chắn muốn xóa phòng này không?",
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            onOk: () => {
                const updatedData = data.filter((item) => item.id !== id);
                setData(updatedData);
                applyFilters(searchText, statusFilter);
                message.success("Đã xóa phòng thành công!");
            },
        });
    };

    const handleView = (record: Accommodation) => {
        setViewingItem(record);
        setIsDetailModalOpen(true);
    };

    const columns: ColumnsType<Accommodation> = [
        {
            title: "Mã",
            dataIndex: "id",
            key: "id",
            width: 70,
            sorter: (a, b) => a.id - b.id,
            render: (id) => <span style={{ fontWeight: 600 }}>#{id}</span>,
        },
        {
            title: "Tên phòng",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (name, record) => (
                <Space>
                    <Avatar icon={<HomeOutlined />} style={{ backgroundColor: "#1890ff" }} />
                    <div>
                        <div style={{ fontWeight: 500 }}>{name}</div>
                        <div style={{ fontSize: 12, color: "#999" }}>{record.address}</div>
                    </div>
                </Space>
            ),
        },
        {
            title: "Loại",
            dataIndex: "type",
            key: "type",
            width: 130,
            filters: [
                { text: "Phòng đôi", value: "Phòng đôi" },
                { text: "Villa", value: "Villa" },
                { text: "Căn hộ", value: "Căn hộ" },
                { text: "Studio", value: "Studio" },
                { text: "Phòng gia đình", value: "Phòng gia đình" },
            ],
            onFilter: (value, record) => record.type === value,
            render: (type) => <Tag color="blue">{type}</Tag>,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 130,
            filters: [
                { text: "Trống", value: "Trống" },
                { text: "Đã đặt", value: "Đã đặt" },
                { text: "Đang dùng", value: "Đang dùng" },
                { text: "Bảo trì", value: "Bảo trì" },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status) => {
                const config: Record<string, { color: string; icon: any }> = {
                    Trống: { color: "success", icon: <CheckCircleOutlined /> },
                    "Đã đặt": { color: "processing", icon: <ClockCircleOutlined /> },
                    "Đang dùng": { color: "warning", icon: <CalendarOutlined /> },
                    "Bảo trì": { color: "error", icon: <ToolOutlined /> },
                };
                return (
                    <Tag color={config[status].color} icon={config[status].icon}>
                        {status}
                    </Tag>
                );
            },
        },
        {
            title: "Giá/đêm",
            dataIndex: "price",
            key: "price",
            width: 130,
            sorter: (a, b) => a.price - b.price,
            render: (price) => (
                <span style={{ fontWeight: 500, color: "#f5222d" }}>
                    {price.toLocaleString("vi-VN")}₫
                </span>
            ),
        },
        {
            title: "Sức chứa",
            dataIndex: "capacity",
            key: "capacity",
            width: 100,
            render: (capacity) => (
                <Tag icon={<UserOutlined />}>{capacity || "N/A"} người</Tag>
            ),
        },
        {
            title: "Quản lý",
            dataIndex: "manager",
            key: "manager",
            width: 150,
            render: (manager) => (
                <Space>
                    <Avatar size="small" icon={<UserOutlined />} />
                    <span>{manager}</span>
                </Space>
            ),
        },
        {
            title: "Hành động",
            key: "action",
            width: 150,
            fixed: "right",
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => handleView(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => {
                                setEditingItem(record);
                                setIsModalOpen(true);
                                form.setFieldsValue(record);
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record.id)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
            {/* Thống kê */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6} lg={4}>
                    <Card>
                        <Statistic
                            title="Tổng phòng"
                            value={stats.total}
                            prefix={<HomeOutlined />}
                            valueStyle={{ color: "#1890ff" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6} lg={4}>
                    <Card>
                        <Statistic
                            title="Phòng trống"
                            value={stats.available}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: "#52c41a" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6} lg={4}>
                    <Card>
                        <Statistic
                            title="Đã đặt"
                            value={stats.booked}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: "#1890ff" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6} lg={4}>
                    <Card>
                        <Statistic
                            title="Đang dùng"
                            value={stats.inUse}
                            prefix={<CalendarOutlined />}
                            valueStyle={{ color: "#faad14" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6} lg={4}>
                    <Card>
                        <Statistic
                            title="Bảo trì"
                            value={stats.maintenance}
                            prefix={<ToolOutlined />}
                            valueStyle={{ color: "#f5222d" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6} lg={4}>
                    <Card>
                        <Statistic
                            title="Tổng doanh thu"
                            value={data.reduce((sum, item) => sum + item.price, 0)}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: "#eb2f96" }}
                            suffix="₫"
                        />
                    </Card>
                </Col>
            </Row>

            {/* Bảng chính */}
            <Card
                title={
                    <Space size="large">
                        <HomeOutlined style={{ fontSize: 20 }} />
                        <span style={{ fontSize: 18, fontWeight: 600 }}>
                            Quản lý Lưu trú
                        </span>
                        <Badge
                            count={filteredData.length}
                            style={{ backgroundColor: "#52c41a" }}
                        />
                    </Space>
                }
                extra={
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingItem(null);
                            setIsModalOpen(true);
                            form.resetFields();
                        }}
                    >
                        Thêm phòng mới
                    </Button>
                }
                style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
            >
                <Space
                    style={{ marginBottom: 16, width: "100%", flexWrap: "wrap" }}
                    size="middle"
                >
                    <Search
                        placeholder="Tìm kiếm tên phòng, địa chỉ..."
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
                        onChange={handleStatusChange}
                    >
                        <Option value="all">
                            <Badge status="default" text="Tất cả trạng thái" />
                        </Option>
                        <Option value="Trống">
                            <Badge status="success" text="Phòng trống" />
                        </Option>
                        <Option value="Đã đặt">
                            <Badge status="processing" text="Đã đặt" />
                        </Option>
                        <Option value="Đang dùng">
                            <Badge status="warning" text="Đang dùng" />
                        </Option>
                        <Option value="Bảo trì">
                            <Badge status="error" text="Bảo trì" />
                        </Option>
                    </Select>
                </Space>

                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    scroll={{ x: 1200 }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} phòng`,
                        pageSizeOptions: [10, 20, 50],
                    }}
                />
            </Card>

            {/* Modal Thêm/Sửa */}
            <Modal
                title={
                    <Space>
                        <HomeOutlined />
                        <span>{editingItem ? "Chỉnh sửa phòng" : "Thêm phòng mới"}</span>
                    </Space>
                }
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                okText="Lưu"
                cancelText="Hủy"
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Tên phòng"
                                rules={[{ required: true, message: "Vui lòng nhập tên phòng" }]}
                            >
                                <Input placeholder="VD: Homestay Đà Lạt" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="type"
                                label="Loại phòng"
                                rules={[{ required: true, message: "Vui lòng chọn loại phòng" }]}
                            >
                                <Select placeholder="Chọn loại phòng">
                                    <Option value="Phòng đôi">Phòng đôi</Option>
                                    <Option value="Villa">Villa</Option>
                                    <Option value="Căn hộ">Căn hộ</Option>
                                    <Option value="Studio">Studio</Option>
                                    <Option value="Phòng gia đình">Phòng gia đình</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="price"
                                label="Giá/đêm (VNĐ)"
                                rules={[{ required: true, message: "Vui lòng nhập giá" }]}
                            >
                                <Input type="number" placeholder="1000000" prefix="₫" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="capacity"
                                label="Sức chứa (người)"
                                rules={[{ required: true, message: "Vui lòng nhập sức chứa" }]}
                            >
                                <Input type="number" placeholder="2" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="address"
                        label="Địa chỉ"
                        rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                    >
                        <Input placeholder="123 Đường ABC, Thành phố XYZ" />
                    </Form.Item>

                    <Form.Item
                        name="manager"
                        label="Người quản lý"
                        rules={[{ required: true, message: "Vui lòng nhập tên người quản lý" }]}
                    >
                        <Input placeholder="Nguyễn Văn A" />
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả">
                        <TextArea rows={3} placeholder="Mô tả chi tiết về phòng..." />
                    </Form.Item>

                    {editingItem && (
                        <Form.Item name="status" label="Trạng thái">
                            <Select>
                                <Option value="Trống">Trống</Option>
                                <Option value="Đã đặt">Đã đặt</Option>
                                <Option value="Đang dùng">Đang dùng</Option>
                                <Option value="Bảo trì">Bảo trì</Option>
                            </Select>
                        </Form.Item>
                    )}
                </Form>
            </Modal>

            {/* Modal Chi tiết */}
            <Modal
                title={
                    <Space>
                        <EyeOutlined />
                        <span>Chi tiết phòng</span>
                    </Space>
                }
                open={isDetailModalOpen}
                onCancel={() => setIsDetailModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
                        Đóng
                    </Button>,
                    <Button
                        key="edit"
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => {
                            setIsDetailModalOpen(false);
                            setEditingItem(viewingItem);
                            setIsModalOpen(true);
                            if (viewingItem) form.setFieldsValue(viewingItem);
                        }}
                    >
                        Chỉnh sửa
                    </Button>,
                ]}
                width={700}
            >
                {viewingItem && (
                    <div>
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <div style={{ marginBottom: 12 }}>
                                    <div style={{ color: "#999", fontSize: 12 }}>Mã phòng</div>
                                    <div style={{ fontSize: 16, fontWeight: 500 }}>
                                        #{viewingItem.id}
                                    </div>
                                </div>
                            </Col>
                            <Col span={12}>
                                <div style={{ marginBottom: 12 }}>
                                    <div style={{ color: "#999", fontSize: 12 }}>Trạng thái</div>
                                    <div style={{ marginTop: 4 }}>
                                        <Tag
                                            color={
                                                viewingItem.status === "Trống"
                                                    ? "success"
                                                    : viewingItem.status === "Đã đặt"
                                                        ? "processing"
                                                        : viewingItem.status === "Đang dùng"
                                                            ? "warning"
                                                            : "error"
                                            }
                                        >
                                            {viewingItem.status}
                                        </Tag>
                                    </div>
                                </div>
                            </Col>
                            <Col span={24}>
                                <div style={{ marginBottom: 12 }}>
                                    <div style={{ color: "#999", fontSize: 12 }}>Tên phòng</div>
                                    <div style={{ fontSize: 18, fontWeight: 600 }}>
                                        {viewingItem.name}
                                    </div>
                                </div>
                            </Col>
                            <Col span={12}>
                                <div style={{ marginBottom: 12 }}>
                                    <div style={{ color: "#999", fontSize: 12 }}>Loại phòng</div>
                                    <div style={{ marginTop: 4 }}>
                                        <Tag color="blue">{viewingItem.type}</Tag>
                                    </div>
                                </div>
                            </Col>
                            <Col span={12}>
                                <div style={{ marginBottom: 12 }}>
                                    <div style={{ color: "#999", fontSize: 12 }}>Sức chứa</div>
                                    <div style={{ fontSize: 16 }}>
                                        {viewingItem.capacity || "N/A"} người
                                    </div>
                                </div>
                            </Col>
                            <Col span={12}>
                                <div style={{ marginBottom: 12 }}>
                                    <div style={{ color: "#999", fontSize: 12 }}>Giá/đêm</div>
                                    <div
                                        style={{
                                            fontSize: 18,
                                            fontWeight: 600,
                                            color: "#f5222d",
                                        }}
                                    >
                                        {viewingItem.price.toLocaleString("vi-VN")}₫
                                    </div>
                                </div>
                            </Col>
                            <Col span={12}>
                                <div style={{ marginBottom: 12 }}>
                                    <div style={{ color: "#999", fontSize: 12 }}>Người quản lý</div>
                                    <div style={{ fontSize: 16 }}>{viewingItem.manager}</div>
                                </div>
                            </Col>
                            <Col span={24}>
                                <div style={{ marginBottom: 12 }}>
                                    <div style={{ color: "#999", fontSize: 12 }}>Địa chỉ</div>
                                    <div style={{ fontSize: 16 }}>{viewingItem.address}</div>
                                </div>
                            </Col>
                            {viewingItem.description && (
                                <Col span={24}>
                                    <div style={{ marginBottom: 12 }}>
                                        <div style={{ color: "#999", fontSize: 12 }}>Mô tả</div>
                                        <div style={{ fontSize: 14, marginTop: 8 }}>
                                            {viewingItem.description}
                                        </div>
                                    </div>
                                </Col>
                            )}
                            <Col span={24}>
                                <div style={{ marginBottom: 12 }}>
                                    <div style={{ color: "#999", fontSize: 12 }}>
                                        Cập nhật lần cuối
                                    </div>
                                    <div style={{ fontSize: 14 }}>
                                        {new Date(viewingItem.updatedAt).toLocaleDateString("vi-VN")}
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Accommodations;