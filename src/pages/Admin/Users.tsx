import React, { useState } from "react";
import {
    Table,
    Card,
    Button,
    Input,
    Space,
    Tag,
    Avatar,
    Dropdown,
    Modal,
    Form,
    Select,
    Row,
    Col,
    Statistic,
    Badge,
    Typography,
    Tooltip,
    DatePicker,
    message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { MenuProps } from "antd";
import {
    UserOutlined,
    SearchOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    MoreOutlined,
    LockOutlined,
    UnlockOutlined,
    MailOutlined,
    PhoneOutlined,
    CalendarOutlined,
    TeamOutlined,
    UserAddOutlined,
    UserDeleteOutlined,
    EyeOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

interface User {
    key: string;
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    role: "admin" | "host" | "guest";
    status: "active" | "inactive" | "blocked";
    totalBookings: number;
    totalSpent: number;
    joinDate: string;
    lastLogin: string;
}

const UserManagement: React.FC = () => {
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchText, setSearchText] = useState<string>("");
    const [form] = Form.useForm();

    // Mock data
    const [users, setUsers] = useState<User[]>([
        {
            key: "1",
            id: "USR001",
            name: "Nguyễn Văn An",
            email: "nguyenvanan@gmail.com",
            phone: "0901234567",
            avatar: "https://randomuser.me/api/portraits/men/1.jpg",
            role: "host",
            status: "active",
            totalBookings: 45,
            totalSpent: 25000000,
            joinDate: "2023-01-15",
            lastLogin: "2024-10-28",
        },
        {
            key: "2",
            id: "USR002",
            name: "Trần Thị Bình",
            email: "tranthibinh@gmail.com",
            phone: "0912345678",
            avatar: "https://randomuser.me/api/portraits/women/2.jpg",
            role: "guest",
            status: "active",
            totalBookings: 12,
            totalSpent: 8500000,
            joinDate: "2023-03-20",
            lastLogin: "2024-10-29",
        },
        {
            key: "3",
            id: "USR003",
            name: "Lê Hoàng Cường",
            email: "lehoangcuong@gmail.com",
            phone: "0923456789",
            avatar: "https://randomuser.me/api/portraits/men/3.jpg",
            role: "admin",
            status: "active",
            totalBookings: 0,
            totalSpent: 0,
            joinDate: "2022-11-10",
            lastLogin: "2024-10-29",
        },
        {
            key: "4",
            id: "USR004",
            name: "Phạm Thu Dung",
            email: "phamthudung@gmail.com",
            phone: "0934567890",
            avatar: "https://randomuser.me/api/portraits/women/4.jpg",
            role: "guest",
            status: "inactive",
            totalBookings: 3,
            totalSpent: 1200000,
            joinDate: "2024-01-05",
            lastLogin: "2024-09-15",
        },
        {
            key: "5",
            id: "USR005",
            name: "Hoàng Minh Đức",
            email: "hoangminhduc@gmail.com",
            phone: "0945678901",
            avatar: "https://randomuser.me/api/portraits/men/5.jpg",
            role: "host",
            status: "blocked",
            totalBookings: 8,
            totalSpent: 3500000,
            joinDate: "2023-06-18",
            lastLogin: "2024-08-22",
        },
    ]);

    const getRoleTag = (role: string) => {
        const roleConfig: Record<string, { color: string; text: string }> = {
            admin: { color: "red", text: "Quản trị viên" },
            host: { color: "blue", text: "Chủ nhà" },
            guest: { color: "green", text: "Khách hàng" },
        };
        return (
            <Tag color={roleConfig[role].color} icon={<UserOutlined />}>
                {roleConfig[role].text}
            </Tag>
        );
    };

    const getStatusTag = (status: string) => {
        const statusConfig: Record<string, { color: string; text: string }> = {
            active: { color: "success", text: "Hoạt động" },
            inactive: { color: "default", text: "Không hoạt động" },
            blocked: { color: "error", text: "Bị khóa" },
        };
        return <Badge status={statusConfig[status].color as any} text={statusConfig[status].text} />;
    };

    const handleMenuClick = (key: string, record: User) => {
        setSelectedUser(record);
        switch (key) {
            case "edit":
                form.setFieldsValue(record);
                setIsModalVisible(true);
                break;
            case "view":
                setIsDetailModalVisible(true);
                break;
            case "block":
                Modal.confirm({
                    title: "Xác nhận khóa người dùng",
                    content: `Bạn có chắc muốn khóa người dùng ${record.name}?`,
                    okText: "Khóa",
                    cancelText: "Hủy",
                    okButtonProps: { danger: true },
                    onOk: () => {
                        message.success("Đã khóa người dùng thành công!");
                    },
                });
                break;
            case "delete":
                Modal.confirm({
                    title: "Xác nhận xóa người dùng",
                    content: `Bạn có chắc muốn xóa người dùng ${record.name}? Hành động này không thể hoàn tác!`,
                    okText: "Xóa",
                    cancelText: "Hủy",
                    okButtonProps: { danger: true },
                    onOk: () => {
                        setUsers(users.filter((u) => u.key !== record.key));
                        message.success("Đã xóa người dùng thành công!");
                    },
                });
                break;
        }
    };

    const actionMenuItems = (record: User): MenuProps["items"] => [
        {
            key: "view",
            icon: <EyeOutlined />,
            label: "Xem chi tiết",
        },
        {
            key: "edit",
            icon: <EditOutlined />,
            label: "Chỉnh sửa",
        },
        {
            type: "divider",
        },
        {
            key: "block",
            icon: record.status === "blocked" ? <UnlockOutlined /> : <LockOutlined />,
            label: record.status === "blocked" ? "Mở khóa" : "Khóa tài khoản",
        },
        {
            key: "delete",
            icon: <DeleteOutlined />,
            label: "Xóa người dùng",
            danger: true,
        },
    ];

    const columns: ColumnsType<User> = [
        {
            title: "Người dùng",
            dataIndex: "name",
            key: "name",
            fixed: "left",
            width: 250,
            render: (text: string, record: User) => (
                <Space>
                    <Avatar size={48} src={record.avatar} icon={<UserOutlined />} />
                    <div>
                        <div>
                            <Text strong>{text}</Text>
                        </div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.id}
                        </Text>
                    </div>
                </Space>
            ),
        },
        {
            title: "Liên hệ",
            key: "contact",
            width: 220,
            render: (_: any, record: User) => (
                <div>
                    <div style={{ marginBottom: 4 }}>
                        <MailOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                        <Text style={{ fontSize: 13 }}>{record.email}</Text>
                    </div>
                    <div>
                        <PhoneOutlined style={{ marginRight: 8, color: "#52c41a" }} />
                        <Text style={{ fontSize: 13 }}>{record.phone}</Text>
                    </div>
                </div>
            ),
        },
        {
            title: "Vai trò",
            dataIndex: "role",
            key: "role",
            width: 140,
            filters: [
                { text: "Quản trị viên", value: "admin" },
                { text: "Chủ nhà", value: "host" },
                { text: "Khách hàng", value: "guest" },
            ],
            onFilter: (value: any, record: User) => record.role === value,
            render: (role: string) => getRoleTag(role),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 150,
            filters: [
                { text: "Hoạt động", value: "active" },
                { text: "Không hoạt động", value: "inactive" },
                { text: "Bị khóa", value: "blocked" },
            ],
            onFilter: (value: any, record: User) => record.status === value,
            render: (status: string) => getStatusTag(status),
        },
        {
            title: "Số đơn đặt",
            dataIndex: "totalBookings",
            key: "totalBookings",
            width: 120,
            sorter: (a: User, b: User) => a.totalBookings - b.totalBookings,
            render: (value: number) => (
                <Text strong style={{ color: "#1890ff" }}>
                    {value}
                </Text>
            ),
        },
        {
            title: "Tổng chi tiêu",
            dataIndex: "totalSpent",
            key: "totalSpent",
            width: 150,
            sorter: (a: User, b: User) => a.totalSpent - b.totalSpent,
            render: (value: number) => (
                <Text strong style={{ color: "#52c41a" }}>
                    {value.toLocaleString("vi-VN")}đ
                </Text>
            ),
        },
        {
            title: "Ngày tham gia",
            dataIndex: "joinDate",
            key: "joinDate",
            width: 130,
            sorter: (a: User, b: User) => new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime(),
            render: (date: string) => (
                <Tooltip title={new Date(date).toLocaleDateString("vi-VN")}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        {new Date(date).toLocaleDateString("vi-VN")}
                    </Text>
                </Tooltip>
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            fixed: "right",
            width: 100,
            render: (_: any, record: User) => (
                <Dropdown
                    menu={{
                        items: actionMenuItems(record),
                        onClick: ({ key }) => handleMenuClick(key, record),
                    }}
                    trigger={["click"]}
                >
                    <Button type="text" icon={<MoreOutlined />} />
                </Dropdown>
            ),
        },
    ];

    const handleAddUser = () => {
        form.resetFields();
        setSelectedUser(null);
        setIsModalVisible(true);
    };

    const handleModalOk = () => {
        form.validateFields().then((values) => {
            if (selectedUser) {
                // Update existing user
                setUsers(
                    users.map((u) =>
                        u.key === selectedUser.key ? { ...u, ...values } : u
                    )
                );
                message.success("Cập nhật người dùng thành công!");
            } else {
                // Add new user
                const newUser: User = {
                    key: Date.now().toString(),
                    id: `USR${Date.now().toString().slice(-3)}`,
                    avatar: "https://randomuser.me/api/portraits/men/10.jpg",
                    totalBookings: 0,
                    totalSpent: 0,
                    joinDate: new Date().toISOString().split("T")[0],
                    lastLogin: new Date().toISOString().split("T")[0],
                    ...values,
                };
                setUsers([newUser, ...users]);
                message.success("Thêm người dùng thành công!");
            }
            setIsModalVisible(false);
            form.resetFields();
        });
    };

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchText.toLowerCase()) ||
            user.email.toLowerCase().includes(searchText.toLowerCase()) ||
            user.phone.includes(searchText)
    );

    return (
        <div>
            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng người dùng"
                            value={users.length}
                            prefix={<TeamOutlined style={{ color: "#1890ff" }} />}
                            valueStyle={{ color: "#1890ff" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Người dùng mới"
                            value={users.filter((u) => u.status === "active").length}
                            prefix={<UserAddOutlined style={{ color: "#52c41a" }} />}
                            valueStyle={{ color: "#52c41a" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Chủ nhà"
                            value={users.filter((u) => u.role === "host").length}
                            prefix={<UserOutlined style={{ color: "#722ed1" }} />}
                            valueStyle={{ color: "#722ed1" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Bị khóa"
                            value={users.filter((u) => u.status === "blocked").length}
                            prefix={<UserDeleteOutlined style={{ color: "#ff4d4f" }} />}
                            valueStyle={{ color: "#ff4d4f" }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Main Card */}
            <Card
                title={
                    <Space>
                        <TeamOutlined style={{ fontSize: 20, color: "#1890ff" }} />
                        <Title level={4} style={{ margin: 0 }}>
                            Quản lý Người dùng
                        </Title>
                    </Space>
                }
                extra={
                    <Space>
                        <Input
                            placeholder="Tìm kiếm người dùng..."
                            prefix={<SearchOutlined />}
                            style={{ width: 250 }}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAddUser}
                            style={{ borderRadius: 8 }}
                        >
                            Thêm người dùng
                        </Button>
                    </Space>
                }
            >
                <Table
                    columns={columns}
                    dataSource={filteredUsers}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} người dùng`,
                    }}
                    scroll={{ x: 1400 }}
                />
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                title={selectedUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                width={600}
                okText={selectedUser ? "Cập nhật" : "Thêm mới"}
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Họ và tên"
                                rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                            >
                                <Input placeholder="Nhập họ và tên" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="phone"
                                label="Số điện thoại"
                                rules={[{ required: true, message: "Vui lòng nhập SĐT!" }]}
                            >
                                <Input placeholder="Nhập số điện thoại" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: "Vui lòng nhập email!" },
                            { type: "email", message: "Email không hợp lệ!" },
                        ]}
                    >
                        <Input placeholder="Nhập địa chỉ email" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="role"
                                label="Vai trò"
                                rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
                            >
                                <Select placeholder="Chọn vai trò">
                                    <Option value="admin">Quản trị viên</Option>
                                    <Option value="host">Chủ nhà</Option>
                                    <Option value="guest">Khách hàng</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="status"
                                label="Trạng thái"
                                rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
                            >
                                <Select placeholder="Chọn trạng thái">
                                    <Option value="active">Hoạt động</Option>
                                    <Option value="inactive">Không hoạt động</Option>
                                    <Option value="blocked">Bị khóa</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            {/* Detail Modal */}
            <Modal
                title="Chi tiết người dùng"
                open={isDetailModalVisible}
                onCancel={() => setIsDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
                        Đóng
                    </Button>,
                ]}
                width={700}
            >
                {selectedUser && (
                    <div style={{ padding: "20px 0" }}>
                        <Space direction="vertical" size="large" style={{ width: "100%" }}>
                            <div style={{ textAlign: "center" }}>
                                <Avatar size={100} src={selectedUser.avatar} />
                                <Title level={4} style={{ marginTop: 16, marginBottom: 4 }}>
                                    {selectedUser.name}
                                </Title>
                                {getRoleTag(selectedUser.role)}
                            </div>

                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <Text type="secondary">Email:</Text>
                                    <div>
                                        <Text strong>{selectedUser.email}</Text>
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <Text type="secondary">Số điện thoại:</Text>
                                    <div>
                                        <Text strong>{selectedUser.phone}</Text>
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <Text type="secondary">Trạng thái:</Text>
                                    <div>{getStatusTag(selectedUser.status)}</div>
                                </Col>
                                <Col span={12}>
                                    <Text type="secondary">Mã người dùng:</Text>
                                    <div>
                                        <Text strong>{selectedUser.id}</Text>
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <Text type="secondary">Tổng đơn đặt:</Text>
                                    <div>
                                        <Text strong style={{ color: "#1890ff" }}>
                                            {selectedUser.totalBookings}
                                        </Text>
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <Text type="secondary">Tổng chi tiêu:</Text>
                                    <div>
                                        <Text strong style={{ color: "#52c41a" }}>
                                            {selectedUser.totalSpent.toLocaleString("vi-VN")}đ
                                        </Text>
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <Text type="secondary">Ngày tham gia:</Text>
                                    <div>
                                        <Text strong>
                                            {new Date(selectedUser.joinDate).toLocaleDateString("vi-VN")}
                                        </Text>
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <Text type="secondary">Đăng nhập gần nhất:</Text>
                                    <div>
                                        <Text strong>
                                            {new Date(selectedUser.lastLogin).toLocaleDateString("vi-VN")}
                                        </Text>
                                    </div>
                                </Col>
                            </Row>
                        </Space>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default UserManagement;