import React, { useState } from "react";
import {
    Table,
    Input,
    Button,
    Space,
    Tag,
    Modal,
    Form,
    Select,
    message,
    Typography,
    Pagination,
    Dropdown,
    MenuProps,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    FilterOutlined,
    SettingOutlined,
    MoreOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

interface Amenity {
    id: number;
    name: string;
    type: "Cơ bản" | "Nâng cao";
    icon: string;
    description: string;
    status: "Hoạt động" | "Ẩn";
    createdAt: string;
    updatedAt: string;
}

// ⚙️ Dữ liệu mẫu
const initialData: Amenity[] = [
    {
        id: 1,
        name: "Wi-Fi miễn phí",
        type: "Cơ bản",
        icon: "📶",
        description: "Kết nối Internet tốc độ cao trong toàn bộ phòng",
        status: "Hoạt động",
        createdAt: "2025-10-01",
        updatedAt: "2025-10-10",
    },
    {
        id: 2,
        name: "Bếp riêng",
        type: "Cơ bản",
        icon: "🍳",
        description: "Đầy đủ dụng cụ nấu ăn và bếp gas",
        status: "Hoạt động",
        createdAt: "2025-09-15",
        updatedAt: "2025-09-30",
    },
    {
        id: 3,
        name: "Hồ bơi ngoài trời",
        type: "Nâng cao",
        icon: "🏊",
        description: "Hồ bơi rộng 25m với khu vực thư giãn",
        status: "Ẩn",
        createdAt: "2025-08-20",
        updatedAt: "2025-09-05",
    },
];

const Amenities: React.FC = () => {
    const [data, setData] = useState<Amenity[]>(initialData);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isVariantModalVisible, setIsVariantModalVisible] = useState(false);
    const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
    const [form] = Form.useForm();

    // 🔍 Tìm kiếm + lọc
    const filteredData = data.filter((item) => {
        const matchName =
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.description.toLowerCase().includes(search.toLowerCase());
        const matchType = filterType ? item.type === filterType : true;
        return matchName && matchType;
    });

    // 🧩 Xử lý thêm/sửa tiện ích
    const handleOk = () => {
        form
            .validateFields()
            .then((values) => {
                if (editingAmenity) {
                    const updated = data.map((item) =>
                        item.id === editingAmenity.id ? { ...editingAmenity, ...values } : item
                    );
                    setData(updated);
                    message.success("Cập nhật tiện ích thành công!");
                } else {
                    const newAmenity: Amenity = {
                        id: data.length + 1,
                        ...values,
                        createdAt: new Date().toISOString().split("T")[0],
                        updatedAt: new Date().toISOString().split("T")[0],
                    };
                    setData([...data, newAmenity]);
                    message.success("Thêm tiện ích mới thành công!");
                }
                form.resetFields();
                setIsModalVisible(false);
                setEditingAmenity(null);
            })
            .catch(() => { });
    };

    const handleEdit = (record: Amenity) => {
        setEditingAmenity(record);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: "Xóa tiện ích này?",
            content: "Thao tác này không thể hoàn tác.",
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            onOk: () => {
                setData(data.filter((item) => item.id !== id));
                message.success("Đã xóa tiện ích!");
            },
        });
    };

    const handleVariant = (record: Amenity) => {
        setEditingAmenity(record);
        setIsVariantModalVisible(true);
    };

    // ⚙️ Cột bảng
    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            sorter: (a: Amenity, b: Amenity) => a.id - b.id,
            width: 70,
        },
        {
            title: "Tên tiện ích",
            dataIndex: "name",
            sorter: (a: Amenity, b: Amenity) => a.name.localeCompare(b.name),
        },
        {
            title: "Biểu tượng",
            dataIndex: "icon",
            width: 100,
            render: (icon: string) => <span style={{ fontSize: 20 }}>{icon}</span>,
        },
        {
            title: "Loại",
            dataIndex: "type",
            filters: [
                { text: "Cơ bản", value: "Cơ bản" },
                { text: "Nâng cao", value: "Nâng cao" },
            ],
            onFilter: (value: any, record: Amenity) => record.type === value,
            render: (type: string) => (
                <Tag color={type === "Cơ bản" ? "blue" : "purple"}>{type}</Tag>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            render: (status: string) => (
                <Tag color={status === "Hoạt động" ? "green" : "red"}>{status}</Tag>
            ),
        },
        {
            title: "Ngày cập nhật",
            dataIndex: "updatedAt",
            sorter: (a: Amenity, b: Amenity) =>
                new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
        },
        {
            title: "Thao tác",
            key: "actions",
            render: (_: any, record: Amenity) => {
                const menuItems: MenuProps["items"] = [
                    {
                        key: "edit",
                        label: "Chỉnh sửa",
                        icon: <EditOutlined />,
                        onClick: () => handleEdit(record),
                    },
                    {
                        key: "variant",
                        label: "Giá trị tiện ích",
                        icon: <SettingOutlined />,
                        onClick: () => handleVariant(record),
                    },
                    {
                        key: "delete",
                        label: "Xóa",
                        icon: <DeleteOutlined />,
                        danger: true,
                        onClick: () => handleDelete(record.id),
                    },
                ];
                return (
                    <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
                        <Button icon={<MoreOutlined />} />
                    </Dropdown>
                );
            },
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Title level={3}>Quản lý tiện ích</Title>

            {/* Bộ lọc và tìm kiếm */}
            <Space style={{ marginBottom: 16, flexWrap: "wrap" }}>
                <Search
                    placeholder="Tìm kiếm tiện ích..."
                    allowClear
                    onSearch={(value) => setSearch(value)}
                    style={{ width: 260 }}
                />
                <Select
                    placeholder="Lọc theo loại"
                    allowClear
                    style={{ width: 160 }}
                    onChange={(value) => setFilterType(value)}
                >
                    <Option value="Cơ bản">Cơ bản</Option>
                    <Option value="Nâng cao">Nâng cao</Option>
                </Select>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsModalVisible(true)}
                >
                    Thêm tiện ích
                </Button>
            </Space>

            {/* Bảng tiện ích */}
            <Table
                rowKey="id"
                columns={columns}
                dataSource={filteredData}
                loading={loading}
                pagination={{ pageSize: 15, showSizeChanger: true, pageSizeOptions: [15, 30, 45] }}
                bordered
            />

            {/* Modal thêm/sửa tiện ích */}
            <Modal
                title={editingAmenity ? "Chỉnh sửa tiện ích" : "Thêm tiện ích mới"}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={() => {
                    setIsModalVisible(false);
                    setEditingAmenity(null);
                    form.resetFields();
                }}
                okText="Lưu"
                cancelText="Hủy"
            >
                <Form layout="vertical" form={form}>
                    <Form.Item
                        name="name"
                        label="Tên tiện ích"
                        rules={[{ required: true, message: "Vui lòng nhập tên tiện ích" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="icon" label="Biểu tượng">
                        <Input placeholder="Ví dụ: 🏊, 🍳, 📶..." />
                    </Form.Item>
                    <Form.Item name="type" label="Loại" rules={[{ required: true }]}>
                        <Select>
                            <Option value="Cơ bản">Cơ bản</Option>
                            <Option value="Nâng cao">Nâng cao</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                    <Form.Item name="status" label="Trạng thái" initialValue="Hoạt động">
                        <Select>
                            <Option value="Hoạt động">Hoạt động</Option>
                            <Option value="Ẩn">Ẩn</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal giá trị tiện ích */}
            <Modal
                title={`Giá trị tiện ích: ${editingAmenity?.name}`}
                open={isVariantModalVisible}
                onCancel={() => setIsVariantModalVisible(false)}
                footer={null}
            >
                <p>Trang quản lý biến thể tiện ích (chưa triển khai chi tiết).</p>
            </Modal>
        </div>
    );
};

export default Amenities;
