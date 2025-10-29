import React, { useState } from "react";
import {
    Table,
    Card,
    Button,
    Input,
    Space,
    Tag,
    Modal,
    Form,
    Row,
    Col,
    Switch,
    Typography,
    Tooltip,
    message,
    Upload,
    Select,
    Image,
    Tabs,
    Descriptions,
    List,
    Checkbox,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { UploadFile } from "antd/es/upload/interface";
import {
    SearchOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    HistoryOutlined,
    HomeOutlined,
    PictureOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SortAscendingOutlined,
    SortDescendingOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface Category {
    key: string;
    id: number;
    name: string;
    description: string;
    image: string;
    status: "active" | "inactive";
    amenityCount: number;
    homestayCount: number;
    createdAt: string;
    updatedAt: string;
}

interface Amenity {
    id: number;
    name: string;
    icon: string;
}

const CategoryManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>("list");
    const [searchText, setSearchText] = useState<string>("");
    const [pageSize, setPageSize] = useState<number>(15);
    const [sortField, setSortField] = useState<string>("id");
    const [sortOrder, setSortOrder] = useState<"ascend" | "descend">("ascend");

    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");

    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    // Mock data - Categories
    const [categories, setCategories] = useState<Category[]>([
        {
            key: "1",
            id: 1,
            name: "Nhà gỗ",
            description: "Homestay kiểu nhà gỗ truyền thống, gần gũi với thiên nhiên, phù hợp cho du khách yêu thích sự yên tĩnh.",
            image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233",
            status: "active",
            amenityCount: 12,
            homestayCount: 45,
            createdAt: "2023-01-15",
            updatedAt: "2024-10-20",
        },
        {
            key: "2",
            id: 2,
            name: "Căn hộ",
            description: "Căn hộ hiện đại, đầy đủ tiện nghi, nằm ở trung tâm thành phố, thuận tiện đi lại.",
            image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
            status: "active",
            amenityCount: 18,
            homestayCount: 67,
            createdAt: "2023-02-10",
            updatedAt: "2024-10-25",
        },
        {
            key: "3",
            id: 3,
            name: "Villa",
            description: "Biệt thự sang trọng với hồ bơi riêng, phù hợp cho gia đình hoặc nhóm bạn.",
            image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
            status: "active",
            amenityCount: 25,
            homestayCount: 23,
            createdAt: "2023-03-05",
            updatedAt: "2024-10-28",
        },
        {
            key: "4",
            id: 4,
            name: "Nhà vườn",
            description: "Nhà vườn rộng rãi, không gian xanh mát, thích hợp nghỉ dưỡng cuối tuần.",
            image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
            status: "inactive",
            amenityCount: 10,
            homestayCount: 15,
            createdAt: "2023-04-12",
            updatedAt: "2024-09-30",
        },
        {
            key: "5",
            id: 5,
            name: "Nhà container",
            description: "Homestay độc đáo từ container, phong cách hiện đại, sáng tạo.",
            image: "https://images.unsplash.com/photo-1449844908441-8829872d2607",
            status: "active",
            amenityCount: 8,
            homestayCount: 12,
            createdAt: "2023-05-20",
            updatedAt: "2024-10-15",
        },
    ]);

    const [historyCategories, setHistoryCategories] = useState<Category[]>([]);

    // Mock amenities
    const allAmenities: Amenity[] = [
        { id: 1, name: "WiFi miễn phí", icon: "📶" },
        { id: 2, name: "Điều hòa", icon: "❄️" },
        { id: 3, name: "Bếp", icon: "🍳" },
        { id: 4, name: "Máy giặt", icon: "🧺" },
        { id: 5, name: "TV", icon: "📺" },
        { id: 6, name: "Hồ bơi", icon: "🏊" },
        { id: 7, name: "Bãi đỗ xe", icon: "🚗" },
        { id: 8, name: "Thang máy", icon: "🛗" },
        { id: 9, name: "Ban công", icon: "🪟" },
        { id: 10, name: "Sân vườn", icon: "🌳" },
    ];

    const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);

    const getStatusTag = (status: string) => {
        return status === "active" ? (
            <Tag icon={<CheckCircleOutlined />} color="success">
                Kích hoạt
            </Tag>
        ) : (
            <Tag icon={<CloseCircleOutlined />} color="default">
                Khóa
            </Tag>
        );
    };

    const handleStatusChange = (checked: boolean, record: Category) => {
        Modal.confirm({
            title: "Xác nhận thay đổi trạng thái",
            content: `Bạn có chắc muốn ${checked ? "kích hoạt" : "khóa"} danh mục "${record.name}"?`,
            okText: "Xác nhận",
            cancelText: "Hủy",
            onOk: () => {
                setCategories(
                    categories.map((cat) =>
                        cat.key === record.key
                            ? { ...cat, status: checked ? "active" : "inactive" }
                            : cat
                    )
                );
                message.success(`Đã ${checked ? "kích hoạt" : "khóa"} danh mục thành công!`);
            },
        });
    };

    const moveToHistory = (record: Category) => {
        Modal.confirm({
            title: "Chuyển vào lịch sử",
            content: `Bạn có chắc muốn chuyển danh mục "${record.name}" vào lịch sử?`,
            okText: "Xác nhận",
            cancelText: "Hủy",
            onOk: () => {
                setCategories(categories.filter((cat) => cat.key !== record.key));
                setHistoryCategories([...historyCategories, record]);
                message.success("Đã chuyển vào lịch sử thành công!");
            },
        });
    };

    const restoreFromHistory = (record: Category) => {
        Modal.confirm({
            title: "Khôi phục danh mục",
            content: `Bạn có chắc muốn khôi phục danh mục "${record.name}"?`,
            okText: "Khôi phục",
            cancelText: "Hủy",
            onOk: () => {
                setHistoryCategories(historyCategories.filter((cat) => cat.key !== record.key));
                setCategories([...categories, record]);
                message.success("Đã khôi phục danh mục thành công!");
            },
        });
    };

    const columns: ColumnsType<Category> = [
        {
            title: (
                <Space>
                    ID
                    <Tooltip title="Sắp xếp">
                        <Button
                            type="text"
                            size="small"
                            icon={sortField === "id" && sortOrder === "ascend" ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                            onClick={() => {
                                setSortField("id");
                                setSortOrder(sortOrder === "ascend" ? "descend" : "ascend");
                            }}
                        />
                    </Tooltip>
                </Space>
            ),
            dataIndex: "id",
            key: "id",
            width: 80,
            sorter: (a, b) => a.id - b.id,
            sortOrder: sortField === "id" ? sortOrder : null,
        },
        {
            title: "Hình ảnh",
            dataIndex: "image",
            key: "image",
            width: 100,
            render: (image: string) => (
                <Image
                    src={image}
                    alt="Category"
                    width={60}
                    height={60}
                    style={{ borderRadius: 8, objectFit: "cover" }}
                />
            ),
        },
        {
            title: (
                <Space>
                    Tên danh mục
                    <Tooltip title="Sắp xếp">
                        <Button
                            type="text"
                            size="small"
                            icon={sortField === "name" && sortOrder === "ascend" ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                            onClick={() => {
                                setSortField("name");
                                setSortOrder(sortOrder === "ascend" ? "descend" : "ascend");
                            }}
                        />
                    </Tooltip>
                </Space>
            ),
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
            sortOrder: sortField === "name" ? sortOrder : null,
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
            render: (text: string) => (
                <Tooltip title={text}>
                    <Text type="secondary">{text}</Text>
                </Tooltip>
            ),
        },
        {
            title: (
                <Space>
                    Trạng thái
                    <Tooltip title="Sắp xếp">
                        <Button
                            type="text"
                            size="small"
                            icon={sortField === "status" && sortOrder === "ascend" ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                            onClick={() => {
                                setSortField("status");
                                setSortOrder(sortOrder === "ascend" ? "descend" : "ascend");
                            }}
                        />
                    </Tooltip>
                </Space>
            ),
            dataIndex: "status",
            key: "status",
            width: 140,
            sorter: (a, b) => a.status.localeCompare(b.status),
            sortOrder: sortField === "status" ? sortOrder : null,
            render: (status: string, record: Category) => (
                <Switch
                    checked={status === "active"}
                    onChange={(checked) => handleStatusChange(checked, record)}
                    checkedChildren="Bật"
                    unCheckedChildren="Tắt"
                />
            ),
        },
        {
            title: "Tiện ích",
            dataIndex: "amenityCount",
            key: "amenityCount",
            width: 100,
            render: (count: number) => (
                <Tag color="blue">{count} tiện ích</Tag>
            ),
        },
        {
            title: "Homestay",
            dataIndex: "homestayCount",
            key: "homestayCount",
            width: 110,
            render: (count: number) => (
                <Text strong style={{ color: "#52c41a" }}>
                    {count} homestay
                </Text>
            ),
        },
        {
            title: (
                <Space>
                    Ngày tạo
                    <Tooltip title="Sắp xếp">
                        <Button
                            type="text"
                            size="small"
                            icon={sortField === "createdAt" && sortOrder === "ascend" ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                            onClick={() => {
                                setSortField("createdAt");
                                setSortOrder(sortOrder === "ascend" ? "descend" : "ascend");
                            }}
                        />
                    </Tooltip>
                </Space>
            ),
            dataIndex: "createdAt",
            key: "createdAt",
            width: 120,
            sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
            sortOrder: sortField === "createdAt" ? sortOrder : null,
            render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
        },
        {
            title: (
                <Space>
                    Cập nhật
                    <Tooltip title="Sắp xếp">
                        <Button
                            type="text"
                            size="small"
                            icon={sortField === "updatedAt" && sortOrder === "ascend" ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                            onClick={() => {
                                setSortField("updatedAt");
                                setSortOrder(sortOrder === "ascend" ? "descend" : "ascend");
                            }}
                        />
                    </Tooltip>
                </Space>
            ),
            dataIndex: "updatedAt",
            key: "updatedAt",
            width: 120,
            sorter: (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
            sortOrder: sortField === "updatedAt" ? sortOrder : null,
            render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
        },
        {
            title: "Thao tác",
            key: "action",
            fixed: "right",
            width: 180,
            render: (_: any, record: Category) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => {
                                setSelectedCategory(record);
                                setIsDetailModalVisible(true);
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Chuyển vào lịch sử">
                        <Button
                            type="text"
                            icon={<HistoryOutlined />}
                            onClick={() => moveToHistory(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const historyColumns: ColumnsType<Category> = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 80,
        },
        {
            title: "Hình ảnh",
            dataIndex: "image",
            key: "image",
            width: 100,
            render: (image: string) => (
                <Image
                    src={image}
                    alt="Category"
                    width={60}
                    height={60}
                    style={{ borderRadius: 8, objectFit: "cover" }}
                />
            ),
        },
        {
            title: "Tên danh mục",
            dataIndex: "name",
            key: "name",
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => getStatusTag(status),
        },
        {
            title: "Ngày xóa",
            dataIndex: "updatedAt",
            key: "updatedAt",
            render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
        },
        {
            title: "Thao tác",
            key: "action",
            width: 150,
            render: (_: any, record: Category) => (
                <Space>
                    <Button
                        type="primary"
                        size="small"
                        onClick={() => restoreFromHistory(record)}
                    >
                        Khôi phục
                    </Button>
                    <Button
                        type="primary"
                        danger
                        size="small"
                        onClick={() => {
                            Modal.confirm({
                                title: "Xác nhận xóa vĩnh viễn",
                                content: `Bạn có chắc muốn xóa vĩnh viễn danh mục "${record.name}"? Hành động này không thể hoàn tác!`,
                                okText: "Xóa",
                                cancelText: "Hủy",
                                okButtonProps: { danger: true },
                                onOk: () => {
                                    setHistoryCategories(historyCategories.filter((cat) => cat.key !== record.key));
                                    message.success("Đã xóa vĩnh viễn!");
                                },
                            });
                        }}
                    >
                        Xóa vĩnh viễn
                    </Button>
                </Space>
            ),
        },
    ];

    const handleAdd = () => {
        setModalMode("add");
        form.resetFields();
        setFileList([]);
        setSelectedAmenities([]);
        setIsModalVisible(true);
    };

    const handleEdit = (record: Category) => {
        setModalMode("edit");
        setSelectedCategory(record);
        form.setFieldsValue(record);
        setFileList([
            {
                uid: "-1",
                name: "image.png",
                status: "done",
                url: record.image,
            },
        ]);
        setSelectedAmenities([1, 2, 3]); // Mock selected amenities
        setIsModalVisible(true);
    };

    const handleModalOk = () => {
        form.validateFields().then((values) => {
            if (modalMode === "add") {
                const newCategory: Category = {
                    key: Date.now().toString(),
                    id: categories.length + 1,
                    image: fileList[0]?.url || "https://via.placeholder.com/150",
                    status: "active",
                    amenityCount: selectedAmenities.length,
                    homestayCount: 0,
                    createdAt: new Date().toISOString().split("T")[0],
                    updatedAt: new Date().toISOString().split("T")[0],
                    ...values,
                };
                setCategories([newCategory, ...categories]);
                message.success("Thêm danh mục thành công!");
            } else {
                setCategories(
                    categories.map((cat) =>
                        cat.key === selectedCategory?.key
                            ? {
                                ...cat,
                                ...values,
                                image: fileList[0]?.url || cat.image,
                                amenityCount: selectedAmenities.length,
                                updatedAt: new Date().toISOString().split("T")[0],
                            }
                            : cat
                    )
                );
                message.success("Cập nhật danh mục thành công!");
            }
            setIsModalVisible(false);
            form.resetFields();
        });
    };

    const filteredCategories = categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const pagination: TablePaginationConfig = {
        pageSize: pageSize,
        showSizeChanger: true,
        pageSizeOptions: ["15", "30", "45"],
        onShowSizeChange: (_, size) => setPageSize(size),
        showTotal: (total) => `Tổng ${total} danh mục`,
    };

    return (
        <div>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
                {/* TAB 1: DANH SÁCH */}
                <TabPane
                    tab={
                        <span>
                            <HomeOutlined />
                            Danh sách danh mục
                        </span>
                    }
                    key="list"
                >
                    <Card
                        title={
                            <Space>
                                <HomeOutlined style={{ fontSize: 20, color: "#1890ff" }} />
                                <Title level={4} style={{ margin: 0 }}>
                                    Quản lý Danh mục Homestay
                                </Title>
                            </Space>
                        }
                        extra={
                            <Space>
                                <Input
                                    placeholder="Tìm kiếm theo tên..."
                                    prefix={<SearchOutlined />}
                                    style={{ width: 250 }}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    allowClear
                                />
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={handleAdd}
                                >
                                    Thêm danh mục
                                </Button>
                            </Space>
                        }
                    >
                        <Table
                            columns={columns}
                            dataSource={filteredCategories}
                            pagination={pagination}
                            scroll={{ x: 1600 }}
                        />
                    </Card>
                </TabPane>

                {/* TAB 2: LỊCH SỬ */}
                <TabPane
                    tab={
                        <span>
                            <HistoryOutlined />
                            Lịch sử ({historyCategories.length})
                        </span>
                    }
                    key="history"
                >
                    <Card
                        title={
                            <Space>
                                <HistoryOutlined style={{ fontSize: 20, color: "#ff4d4f" }} />
                                <Title level={4} style={{ margin: 0 }}>
                                    Lịch sử Danh mục
                                </Title>
                            </Space>
                        }
                    >
                        <Table
                            columns={historyColumns}
                            dataSource={historyCategories}
                            pagination={pagination}
                        />
                    </Card>
                </TabPane>
            </Tabs>

            {/* MODAL THÊM/SỬA */}
            <Modal
                title={
                    <Space>
                        {modalMode === "add" ? <PlusOutlined /> : <EditOutlined />}
                        {modalMode === "add" ? "Thêm danh mục mới" : "Chỉnh sửa danh mục"}
                    </Space>
                }
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                width={700}
                okText={modalMode === "add" ? "Thêm mới" : "Cập nhật"}
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
                    <Form.Item
                        name="name"
                        label="Tên danh mục"
                        rules={[{ required: true, message: "Vui lòng nhập tên danh mục!" }]}
                    >
                        <Input placeholder="VD: Nhà gỗ, Villa, Căn hộ..." size="large" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Nhập mô tả chi tiết về loại homestay này..."
                        />
                    </Form.Item>

                    <Form.Item label="Hình ảnh">
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            onChange={({ fileList }) => setFileList(fileList)}
                            maxCount={1}
                            beforeUpload={() => false}
                        >
                            {fileList.length === 0 && (
                                <div>
                                    <PictureOutlined />
                                    <div style={{ marginTop: 8 }}>Upload</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>

                    <Form.Item label="Tiện ích liên quan">
                        <Checkbox.Group
                            value={selectedAmenities}
                            onChange={(values) => setSelectedAmenities(values as number[])}
                            style={{ width: "100%" }}
                        >
                            <Row gutter={[16, 16]}>
                                {allAmenities.map((amenity) => (
                                    <Col span={12} key={amenity.id}>
                                        <Checkbox value={amenity.id}>
                                            <Space>
                                                <span style={{ fontSize: 18 }}>{amenity.icon}</span>
                                                {amenity.name}
                                            </Space>
                                        </Checkbox>
                                    </Col>
                                ))}
                            </Row>
                        </Checkbox.Group>
                    </Form.Item>
                </Form>
            </Modal>

            {/* MODAL CHI TIẾT */}
            <Modal
                title={
                    <Space>
                        <EyeOutlined />
                        Chi tiết danh mục
                    </Space>
                }
                open={isDetailModalVisible}
                onCancel={() => setIsDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
                        Đóng
                    </Button>,
                    <Button
                        key="edit"
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => {
                            setIsDetailModalVisible(false);
                            if (selectedCategory) handleEdit(selectedCategory);
                        }}
                    >
                        Chỉnh sửa
                    </Button>,
                ]}
                width={800}
            >
                {selectedCategory && (
                    <div style={{ padding: "20px 0" }}>
                        <Row gutter={24}>
                            <Col span={10}>
                                <Image
                                    src={selectedCategory.image}
                                    alt={selectedCategory.name}
                                    style={{ borderRadius: 12, width: "100%" }}
                                />
                            </Col>
                            <Col span={14}>
                                <Title level={3}>{selectedCategory.name}</Title>
                                {getStatusTag(selectedCategory.status)}
                                <Paragraph style={{ marginTop: 16 }}>
                                    {selectedCategory.description}
                                </Paragraph>
                                <Descriptions column={1} bordered size="small" style={{ marginTop: 20 }}>
                                    <Descriptions.Item label="ID">
                                        {selectedCategory.id}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Số homestay">
                                        <Text strong style={{ color: "#52c41a" }}>
                                            {selectedCategory.homestayCount}
                                        </Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Số tiện ích">
                                        {selectedCategory.amenityCount}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ngày tạo">
                                        {new Date(selectedCategory.createdAt).toLocaleDateString("vi-VN")}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Cập nhật">
                                        {new Date(selectedCategory.updatedAt).toLocaleDateString("vi-VN")}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Col>
                        </Row>

                        <div style={{ marginTop: 30 }}>
                            <Title level={5}>Tiện ích liên quan</Title>
                            <List
                                grid={{ gutter: 16, column: 3 }}
                                dataSource={allAmenities.slice(0, 6)}
                                renderItem={(item) => (
                                    <List.Item>
                                        <Card size="small">
                                            <Space>
                                                <span style={{ fontSize: 24 }}>{item.icon}</span>
                                                <Text>{item.name}</Text>
                                            </Space>
                                        </Card>
                                    </List.Item>
                                )}
                            />                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default CategoryManagement;
