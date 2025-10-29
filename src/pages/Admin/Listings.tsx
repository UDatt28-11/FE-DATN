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
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { UploadFile } from "antd/es/upload/interface";
import {
    SearchOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SortAscendingOutlined,
    SortDescendingOutlined,
    HomeOutlined,
    DollarOutlined,
    EnvironmentOutlined,
    FileProtectOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface Listing {
    key: string;
    id: number;
    name: string;
    location: string;
    price: number;
    rating: number;
    status: "available" | "unavailable";
    image: string;
    createdAt: string;
    updatedAt: string;
    verified: boolean;
}

const Listings: React.FC = () => {
    const [searchText, setSearchText] = useState("");
    const [sortField, setSortField] = useState<string>("id");
    const [sortOrder, setSortOrder] = useState<"ascend" | "descend">("ascend");
    const [pageSize, setPageSize] = useState<number>(15);

    const [listings, setListings] = useState<Listing[]>([
        {
            key: "1",
            id: 1,
            name: "Villa Biển Xanh",
            location: "Nha Trang",
            price: 2500000,
            rating: 4.8,
            status: "available",
            image: "https://images.unsplash.com/photo-1505691723518-36a5ac3be353",
            createdAt: "2023-02-01",
            updatedAt: "2024-09-20",
            verified: true,
        },
        {
            key: "2",
            id: 2,
            name: "Homestay Gió Biển",
            location: "Phú Quốc",
            price: 1500000,
            rating: 4.3,
            status: "available",
            image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
            createdAt: "2023-03-10",
            updatedAt: "2024-10-05",
            verified: false,
        },
        {
            key: "3",
            id: 3,
            name: "Nhà Gỗ Tây Bắc",
            location: "Sapa",
            price: 800000,
            rating: 4.5,
            status: "unavailable",
            image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233",
            createdAt: "2023-04-15",
            updatedAt: "2024-09-25",
            verified: true,
        },
    ]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
    const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const getStatusTag = (status: string) =>
        status === "available" ? (
            <Tag icon={<CheckCircleOutlined />} color="success">
                Còn phòng
            </Tag>
        ) : (
            <Tag icon={<CloseCircleOutlined />} color="default">
                Hết phòng
            </Tag>
        );

    const handleStatusChange = (checked: boolean, record: Listing) => {
        Modal.confirm({
            title: "Xác nhận thay đổi trạng thái",
            content: `Bạn có chắc muốn ${checked ? "mở" : "đóng"} phòng "${record.name}"?`,
            okText: "Xác nhận",
            cancelText: "Hủy",
            onOk: () => {
                setListings(
                    listings.map((l) =>
                        l.key === record.key
                            ? { ...l, status: checked ? "available" : "unavailable" }
                            : l
                    )
                );
                message.success("Cập nhật trạng thái thành công!");
            },
        });
    };

    const handleAdd = () => {
        setModalMode("add");
        form.resetFields();
        setFileList([]);
        setIsModalVisible(true);
    };

    const handleEdit = (record: Listing) => {
        setModalMode("edit");
        setSelectedListing(record);
        form.setFieldsValue(record);
        setFileList([
            {
                uid: "-1",
                name: "image.png",
                status: "done",
                url: record.image,
            },
        ]);
        setIsModalVisible(true);
    };

    const handleModalOk = () => {
        form.validateFields().then((values) => {
            if (modalMode === "add") {
                const newListing: Listing = {
                    key: Date.now().toString(),
                    id: listings.length + 1,
                    status: "available",
                    verified: false,
                    image: fileList[0]?.url || "https://via.placeholder.com/150",
                    createdAt: new Date().toISOString().split("T")[0],
                    updatedAt: new Date().toISOString().split("T")[0],
                    ...values,
                };
                setListings([newListing, ...listings]);
                message.success("Thêm phòng mới thành công!");
            } else {
                setListings(
                    listings.map((l) =>
                        l.key === selectedListing?.key
                            ? {
                                ...l,
                                ...values,
                                image: fileList[0]?.url || l.image,
                                updatedAt: new Date().toISOString().split("T")[0],
                            }
                            : l
                    )
                );
                message.success("Cập nhật thông tin phòng thành công!");
            }
            setIsModalVisible(false);
        });
    };

    const filteredListings = listings.filter(
        (l) =>
            l.name.toLowerCase().includes(searchText.toLowerCase()) ||
            l.location.toLowerCase().includes(searchText.toLowerCase())
    );

    const pagination: TablePaginationConfig = {
        pageSize: pageSize,
        showSizeChanger: true,
        pageSizeOptions: ["15", "30", "45"],
        onShowSizeChange: (_, size) => setPageSize(size),
        showTotal: (total) => `Tổng ${total} phòng`,
    };

    const columns: ColumnsType<Listing> = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            sorter: (a, b) => a.id - b.id,
            sortOrder: sortField === "id" ? sortOrder : null,
            render: (id) => <Text strong>#{id}</Text>,
        },
        {
            title: "Hình ảnh",
            dataIndex: "image",
            key: "image",
            render: (image) => (
                <Image src={image} alt="Listing" width={70} height={70} style={{ borderRadius: 8 }} />
            ),
        },
        {
            title: "Tên phòng",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
            sortOrder: sortField === "name" ? sortOrder : null,
        },
        {
            title: "Địa điểm",
            dataIndex: "location",
            key: "location",
            sorter: (a, b) => a.location.localeCompare(b.location),
            render: (loc) => (
                <Space>
                    <EnvironmentOutlined />
                    {loc}
                </Space>
            ),
        },
        {
            title: "Giá (VNĐ)",
            dataIndex: "price",
            key: "price",
            sorter: (a, b) => a.price - b.price,
            sortOrder: sortField === "price" ? sortOrder : null,
            render: (price) => <Text strong>{price.toLocaleString()} ₫</Text>,
        },
        {
            title: "Đánh giá",
            dataIndex: "rating",
            key: "rating",
            sorter: (a, b) => a.rating - b.rating,
            render: (rating) => <Tag color="gold">{rating} ⭐</Tag>,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (_, record) => (
                <Switch
                    checked={record.status === "available"}
                    onChange={(checked) => handleStatusChange(checked, record)}
                    checkedChildren="Còn"
                    unCheckedChildren="Hết"
                />
            ),
        },
        {
            title: "Xác minh",
            dataIndex: "verified",
            key: "verified",
            render: (verified) =>
                verified ? (
                    <Tag color="blue" icon={<FileProtectOutlined />}>
                        Đã xác minh
                    </Tag>
                ) : (
                    <Tag color="default">Chưa xác minh</Tag>
                ),
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        },
        {
            title: "Thao tác",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            icon={<EyeOutlined />}
                            onClick={() => {
                                setSelectedListing(record);
                                setModalMode("view");
                                setIsModalVisible(true);
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() =>
                                Modal.confirm({
                                    title: "Xóa phòng",
                                    content: `Bạn có chắc muốn xóa "${record.name}"?`,
                                    onOk: () => {
                                        setListings(listings.filter((l) => l.key !== record.key));
                                        message.success("Đã xóa phòng thành công!");
                                    },
                                })
                            }
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Card
            title={
                <Space>
                    <HomeOutlined />
                    <Title level={4} style={{ margin: 0 }}>
                        Quản lý phòng (Listings)
                    </Title>
                </Space>
            }
            extra={
                <Space>
                    <Input
                        placeholder="Tìm kiếm theo tên hoặc địa điểm..."
                        prefix={<SearchOutlined />}
                        style={{ width: 300 }}
                        allowClear
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Thêm phòng
                    </Button>
                </Space>
            }
        >
            <Table
                columns={columns}
                dataSource={filteredListings}
                pagination={pagination}
                scroll={{ x: 1200 }}
            />

            {/* MODAL THÊM / SỬA / XEM */}
            <Modal
                open={isModalVisible}
                title={
                    modalMode === "add"
                        ? "Thêm phòng mới"
                        : modalMode === "edit"
                            ? "Chỉnh sửa phòng"
                            : "Chi tiết phòng"
                }
                onCancel={() => setIsModalVisible(false)}
                onOk={modalMode === "view" ? undefined : handleModalOk}
                okText={modalMode === "add" ? "Thêm" : "Lưu"}
                cancelText="Đóng"
                width={700}
                footer={
                    modalMode === "view"
                        ? [
                            <Button key="close" onClick={() => setIsModalVisible(false)}>
                                Đóng
                            </Button>,
                            <Button
                                key="edit"
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => {
                                    setIsModalVisible(false);
                                    if (selectedListing) handleEdit(selectedListing);
                                }}
                            >
                                Chỉnh sửa
                            </Button>,
                        ]
                        : undefined
                }
            >
                {modalMode === "view" && selectedListing ? (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Tên phòng">{selectedListing.name}</Descriptions.Item>
                        <Descriptions.Item label="Địa điểm">{selectedListing.location}</Descriptions.Item>
                        <Descriptions.Item label="Giá">{selectedListing.price.toLocaleString()} ₫</Descriptions.Item>
                        <Descriptions.Item label="Đánh giá">{selectedListing.rating} ⭐</Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            {getStatusTag(selectedListing.status)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Xác minh">
                            {selectedListing.verified ? "Đã xác minh" : "Chưa xác minh"}
                        </Descriptions.Item>
                    </Descriptions>
                ) : (
                    <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                        <Form.Item
                            name="name"
                            label="Tên phòng"
                            rules={[{ required: true, message: "Vui lòng nhập tên phòng!" }]}
                        >
                            <Input placeholder="VD: Homestay Gió Biển" />
                        </Form.Item>
                        <Form.Item
                            name="location"
                            label="Địa điểm"
                            rules={[{ required: true, message: "Vui lòng nhập địa điểm!" }]}
                        >
                            <Input placeholder="VD: Đà Lạt, Sapa, Phú Quốc..." />
                        </Form.Item>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="price"
                                    label="Giá (VNĐ)"
                                    rules={[{ required: true, message: "Nhập giá phòng!" }]}
                                >
                                    <Input type="number" min={0} placeholder="VD: 1000000" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="rating" label="Đánh giá (⭐)">
                                    <Input type="number" min={0} max={5} step={0.1} placeholder="VD: 4.5" />
                                </Form.Item>
                            </Col>
                        </Row>
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
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>Tải ảnh</div>
                                    </div>
                                )}
                            </Upload>
                        </Form.Item>
                        <Form.Item label="Mô tả">
                            <TextArea rows={3} placeholder="Mô tả chi tiết về phòng..." />
                        </Form.Item>
                        <Form.Item name="verified" label="Xác minh giấy tờ" valuePropName="checked">
                            <Switch checkedChildren="Đã xác minh" unCheckedChildren="Chưa" />
                        </Form.Item>
                    </Form>
                )}
            </Modal>
        </Card>
    );
};

export default Listings;
