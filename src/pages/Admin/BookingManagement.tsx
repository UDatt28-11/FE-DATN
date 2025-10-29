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
    Descriptions,
    Timeline,
    Progress,
    Tabs,
    Radio,
} from "antd";
import {
    CalendarOutlined,
    UserOutlined,
    SearchOutlined,
    DollarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    EyeOutlined,
    EditOutlined,
    FileExcelOutlined,
    FilePdfOutlined,
    HomeOutlined,
    PhoneOutlined,
    MailOutlined,
    TeamOutlined,
    RiseOutlined,
    FallOutlined,
    FilterOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";

const { Search, TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;


type BookingStatus = "Đang chờ" | "Đã xác nhận" | "Đã thanh toán" | "Đã hủy" | "Hoàn thành";

interface Booking {
    id: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    homestayName: string;
    homestayId: number;
    checkIn: string;
    checkOut: string;
    nights: number;
    guests: number;
    totalPrice: number;
    status: BookingStatus;
    createdAt: string;
    staff: string;
    paymentMethod: string;
    notes?: string;
    cancellationReason?: string;
}

const mockBookings: Booking[] = [
    {
        id: "BK001",
        customerName: "Nguyễn Văn A",
        customerPhone: "0901234567",
        customerEmail: "nguyenvana@email.com",
        homestayName: "Homestay Đà Lạt View Núi",
        homestayId: 1,
        checkIn: "2025-11-05",
        checkOut: "2025-11-08",
        nights: 3,
        guests: 2,
        totalPrice: 3600000,
        status: "Đã xác nhận",
        createdAt: "2025-10-25",
        staff: "Phạm Thị B",
        paymentMethod: "Chuyển khoản",
    },
    {
        id: "BK002",
        customerName: "Trần Thị C",
        customerPhone: "0912345678",
        customerEmail: "tranthic@email.com",
        homestayName: "Villa Biển Nha Trang",
        homestayId: 2,
        checkIn: "2025-11-10",
        checkOut: "2025-11-15",
        nights: 5,
        guests: 6,
        totalPrice: 17500000,
        status: "Đã thanh toán",
        createdAt: "2025-10-26",
        staff: "Lê Văn D",
        paymentMethod: "Thẻ tín dụng",
    },
    {
        id: "BK003",
        customerName: "Lê Văn E",
        customerPhone: "0923456789",
        customerEmail: "levane@email.com",
        homestayName: "Căn hộ Hồ Tây",
        homestayId: 3,
        checkIn: "2025-11-01",
        checkOut: "2025-11-03",
        nights: 2,
        guests: 4,
        totalPrice: 3600000,
        status: "Đang chờ",
        createdAt: "2025-10-28",
        staff: "Nguyễn Thị F",
        paymentMethod: "Tiền mặt",
    },
    {
        id: "BK004",
        customerName: "Phạm Thị G",
        customerPhone: "0934567890",
        customerEmail: "phamthig@email.com",
        homestayName: "Phòng Studio Quận 1",
        homestayId: 4,
        checkIn: "2025-10-20",
        checkOut: "2025-10-22",
        nights: 2,
        guests: 2,
        totalPrice: 1800000,
        status: "Hoàn thành",
        createdAt: "2025-10-15",
        staff: "Hoàng Văn H",
        paymentMethod: "Chuyển khoản",
    },
    {
        id: "BK005",
        customerName: "Hoàng Văn I",
        customerPhone: "0945678901",
        customerEmail: "hoangvani@email.com",
        homestayName: "Homestay Hội An Cổ Kính",
        homestayId: 5,
        checkIn: "2025-11-20",
        checkOut: "2025-11-23",
        nights: 3,
        guests: 5,
        totalPrice: 4500000,
        status: "Đã hủy",
        createdAt: "2025-10-22",
        staff: "Trần Văn J",
        paymentMethod: "Chuyển khoản",
        cancellationReason: "Khách thay đổi lịch trình",
    },
];

const BookingManagement: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>(mockBookings);
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>(mockBookings);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
    const [form] = Form.useForm();
    const [statsDateRange, setStatsDateRange] = useState<"day" | "week" | "month">("month");

    // Tính toán thống kê
    const calculateStats = () => {
        const total = bookings.length;
        const pending = bookings.filter(b => b.status === "Đang chờ").length;
        const confirmed = bookings.filter(b => b.status === "Đã xác nhận").length;
        const paid = bookings.filter(b => b.status === "Đã thanh toán").length;
        const cancelled = bookings.filter(b => b.status === "Đã hủy").length;
        const completed = bookings.filter(b => b.status === "Hoàn thành").length;

        const totalRevenue = bookings
            .filter(b => b.status !== "Đã hủy")
            .reduce((sum, b) => sum + b.totalPrice, 0);

        const actualRevenue = bookings
            .filter(b => b.status === "Đã thanh toán" || b.status === "Hoàn thành")
            .reduce((sum, b) => sum + b.totalPrice, 0);

        const cancellationRate = total > 0 ? ((cancelled / total) * 100).toFixed(1) : "0";

        return {
            total,
            pending,
            confirmed,
            paid,
            cancelled,
            completed,
            totalRevenue,
            actualRevenue,
            cancellationRate,
        };
    };

    const stats = calculateStats();

    // Áp dụng bộ lọc
    const applyFilters = (search: string, status: string, dates: [Dayjs, Dayjs] | null) => {
        let filtered = bookings;

        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(
                (b) =>
                    b.id.toLowerCase().includes(searchLower) ||
                    b.customerName.toLowerCase().includes(searchLower) ||
                    b.customerPhone.includes(search) ||
                    b.homestayName.toLowerCase().includes(searchLower)
            );
        }

        if (status !== "all") {
            filtered = filtered.filter((b) => b.status === status);
        }

        if (dates) {
            filtered = filtered.filter((b) => {
                const checkIn = dayjs(b.checkIn);
                return checkIn.isAfter(dates[0]) && checkIn.isBefore(dates[1]);
            });
        }

        setFilteredBookings(filtered);
    };

    const handleSearch = (value: string) => {
        setSearchText(value);
        applyFilters(value, statusFilter, dateRange);
    };

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value);
        applyFilters(searchText, value, dateRange);
    };

    const handleDateRangeChange = (dates: any) => {
        setDateRange(dates);
        applyFilters(searchText, statusFilter, dates);
    };

    const handleViewDetail = (booking: Booking) => {
        setSelectedBooking(booking);
        setIsDetailModalOpen(true);
    };

    const handleChangeStatus = (booking: Booking) => {
        setSelectedBooking(booking);
        setIsStatusModalOpen(true);
        form.setFieldsValue({ status: booking.status });
    };

    const handleStatusUpdate = (values: any) => {
        if (!selectedBooking) return;

        const updatedBookings = bookings.map((b) =>
            b.id === selectedBooking.id
                ? { ...b, status: values.status, notes: values.notes }
                : b
        );

        setBookings(updatedBookings);
        applyFilters(searchText, statusFilter, dateRange);
        message.success("Cập nhật trạng thái thành công!");
        setIsStatusModalOpen(false);
        form.resetFields();
    };

    const handleExportExcel = () => {
        message.success("Đang xuất file Excel...");
    };

    const handleExportPDF = () => {
        message.success("Đang xuất file PDF...");
    };

    const getStatusConfig = (status: BookingStatus) => {
        const configs: Record<BookingStatus, { color: string; icon: any }> = {
            "Đang chờ": { color: "default", icon: <ClockCircleOutlined /> },
            "Đã xác nhận": { color: "processing", icon: <ExclamationCircleOutlined /> },
            "Đã thanh toán": { color: "success", icon: <CheckCircleOutlined /> },
            "Đã hủy": { color: "error", icon: <CloseCircleOutlined /> },
            "Hoàn thành": { color: "success", icon: <CheckCircleOutlined /> },
        };
        return configs[status];
    };

    const columns: ColumnsType<Booking> = [
        {
            title: "Mã đặt phòng",
            dataIndex: "id",
            key: "id",
            width: 120,
            fixed: "left",
            render: (id) => <span style={{ fontWeight: 600, color: "#1890ff" }}>{id}</span>,
        },
        {
            title: "Khách hàng",
            key: "customer",
            width: 200,
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{record.customerName}</div>
                    <div style={{ fontSize: 12, color: "#999" }}>
                        <PhoneOutlined /> {record.customerPhone}
                    </div>
                </div>
            ),
        },
        {
            title: "Homestay",
            dataIndex: "homestayName",
            key: "homestayName",
            width: 200,
            render: (name) => (
                <Space>
                    <HomeOutlined style={{ color: "#1890ff" }} />
                    <span>{name}</span>
                </Space>
            ),
        },
        {
            title: "Check-in",
            dataIndex: "checkIn",
            key: "checkIn",
            width: 120,
            sorter: (a, b) => dayjs(a.checkIn).unix() - dayjs(b.checkIn).unix(),
            render: (date) => (
                <div>
                    <CalendarOutlined style={{ marginRight: 4, color: "#52c41a" }} />
                    {dayjs(date).format("DD/MM/YYYY")}
                </div>
            ),
        },
        {
            title: "Check-out",
            dataIndex: "checkOut",
            key: "checkOut",
            width: 120,
            render: (date) => (
                <div>
                    <CalendarOutlined style={{ marginRight: 4, color: "#f5222d" }} />
                    {dayjs(date).format("DD/MM/YYYY")}
                </div>
            ),
        },
        {
            title: "Số đêm",
            dataIndex: "nights",
            key: "nights",
            width: 80,
            render: (nights) => <Tag color="blue">{nights} đêm</Tag>,
        },
        {
            title: "Số khách",
            dataIndex: "guests",
            key: "guests",
            width: 100,
            render: (guests) => (
                <Space>
                    <TeamOutlined />
                    {guests}
                </Space>
            ),
        },
        {
            title: "Tổng tiền",
            dataIndex: "totalPrice",
            key: "totalPrice",
            width: 130,
            sorter: (a, b) => a.totalPrice - b.totalPrice,
            render: (price) => (
                <span style={{ fontWeight: 600, color: "#f5222d" }}>
                    {price.toLocaleString("vi-VN")}₫
                </span>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 140,
            filters: [
                { text: "Đang chờ", value: "Đang chờ" },
                { text: "Đã xác nhận", value: "Đã xác nhận" },
                { text: "Đã thanh toán", value: "Đã thanh toán" },
                { text: "Đã hủy", value: "Đã hủy" },
                { text: "Hoàn thành", value: "Hoàn thành" },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status: BookingStatus) => {
                const config = getStatusConfig(status);
                return (
                    <Tag color={config.color} icon={config.icon}>
                        {status}
                    </Tag>
                );
            },
        },
        {
            title: "Nhân viên",
            dataIndex: "staff",
            key: "staff",
            width: 150,
            render: (staff) => (
                <Space>
                    <UserOutlined />
                    {staff}
                </Space>
            ),
        },
        {
            title: "Ngày đặt",
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
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetail(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Thay đổi trạng thái">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleChangeStatus(record)}
                            disabled={record.status === "Hoàn thành" || record.status === "Đã hủy"}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <Space size="large" style={{ marginBottom: 16 }}>
                    <CalendarOutlined style={{ fontSize: 28, color: "#1890ff" }} />
                    <span style={{ fontSize: 24, fontWeight: 600 }}>Quản lý Đặt phòng</span>
                </Space>
            </div>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng đặt phòng"
                            value={stats.total}
                            prefix={<CalendarOutlined />}
                            valueStyle={{ color: "#1890ff" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Đang chờ xử lý"
                            value={stats.pending}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: "#faad14" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Đã xác nhận"
                            value={stats.confirmed}
                            prefix={<ExclamationCircleOutlined />}
                            valueStyle={{ color: "#1890ff" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Đã thanh toán"
                            value={stats.paid}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: "#52c41a" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Hoàn thành"
                            value={stats.completed}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: "#52c41a" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Đã hủy"
                            value={stats.cancelled}
                            prefix={<CloseCircleOutlined />}
                            suffix={`(${stats.cancellationRate}%)`}
                            valueStyle={{ color: "#f5222d" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Doanh thu dự kiến"
                            value={stats.totalRevenue}
                            prefix={<DollarOutlined />}
                            suffix="₫"
                            valueStyle={{ color: "#722ed1" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Doanh thu thực tế"
                            value={stats.actualRevenue}
                            prefix={<DollarOutlined />}
                            suffix="₫"
                            valueStyle={{ color: "#52c41a" }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters and Table */}
            <Card
                style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
            >
                <Space
                    style={{ marginBottom: 16, width: "100%", flexWrap: "wrap" }}
                    size="middle"
                >
                    <Search
                        placeholder="Tìm mã đặt phòng, tên khách, SĐT, homestay..."
                        allowClear
                        enterButton={<SearchOutlined />}
                        size="large"
                        style={{ width: 400 }}
                        onSearch={handleSearch}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    <Select
                        value={statusFilter}
                        size="large"
                        style={{ width: 180 }}
                        onChange={handleStatusFilterChange}
                        suffixIcon={<FilterOutlined />}
                    >
                        <Option value="all">
                            <Badge status="default" text="Tất cả trạng thái" />
                        </Option>
                        <Option value="Đang chờ">
                            <Badge status="warning" text="Đang chờ" />
                        </Option>
                        <Option value="Đã xác nhận">
                            <Badge status="processing" text="Đã xác nhận" />
                        </Option>
                        <Option value="Đã thanh toán">
                            <Badge status="success" text="Đã thanh toán" />
                        </Option>
                        <Option value="Hoàn thành">
                            <Badge status="success" text="Hoàn thành" />
                        </Option>
                        <Option value="Đã hủy">
                            <Badge status="error" text="Đã hủy" />
                        </Option>
                    </Select>
                    <RangePicker
                        size="large"
                        placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
                        format="DD/MM/YYYY"
                        onChange={handleDateRangeChange}
                    />
                    <Button
                        size="large"
                        icon={<FileExcelOutlined />}
                        onClick={handleExportExcel}
                    >
                        Xuất Excel
                    </Button>
                    <Button
                        size="large"
                        icon={<FilePdfOutlined />}
                        onClick={handleExportPDF}
                    >
                        Xuất PDF
                    </Button>
                </Space>

                <Table
                    columns={columns}
                    dataSource={filteredBookings}
                    rowKey="id"
                    scroll={{ x: 1800 }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} đặt phòng`,
                        pageSizeOptions: [10, 20, 50, 100],
                    }}
                />
            </Card>

            {/* Detail Modal */}
            <Modal
                title={
                    <Space>
                        <EyeOutlined />
                        <span>Chi tiết đặt phòng</span>
                    </Space>
                }
                open={isDetailModalOpen}
                onCancel={() => setIsDetailModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
                        Đóng
                    </Button>,
                    selectedBooking?.status !== "Hoàn thành" && selectedBooking?.status !== "Đã hủy" && (
                        <Button
                            key="edit"
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => {
                                setIsDetailModalOpen(false);
                                if (selectedBooking) {
                                    handleChangeStatus(selectedBooking);
                                }
                            }}
                        >
                            Thay đổi trạng thái
                        </Button>

                    ),
                ]}
                width={800}
            >
                {selectedBooking && (
                    <div>
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Mã đặt phòng" span={1}>
                                <span style={{ fontWeight: 600, color: "#1890ff" }}>
                                    {selectedBooking.id}
                                </span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái" span={1}>
                                <Tag
                                    color={getStatusConfig(selectedBooking.status).color}
                                    icon={getStatusConfig(selectedBooking.status).icon}
                                >
                                    {selectedBooking.status}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Khách hàng" span={2}>
                                <div>
                                    <div style={{ fontWeight: 500, marginBottom: 4 }}>
                                        {selectedBooking.customerName}
                                    </div>
                                    <div style={{ fontSize: 14, color: "#666" }}>
                                        <PhoneOutlined /> {selectedBooking.customerPhone}
                                    </div>
                                    <div style={{ fontSize: 14, color: "#666" }}>
                                        <MailOutlined /> {selectedBooking.customerEmail}
                                    </div>
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Homestay" span={2}>
                                <Space>
                                    <HomeOutlined style={{ color: "#1890ff" }} />
                                    <span style={{ fontWeight: 500 }}>
                                        {selectedBooking.homestayName}
                                    </span>
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Check-in" span={1}>
                                <Space>
                                    <CalendarOutlined style={{ color: "#52c41a" }} />
                                    {dayjs(selectedBooking.checkIn).format("DD/MM/YYYY")}
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Check-out" span={1}>
                                <Space>
                                    <CalendarOutlined style={{ color: "#f5222d" }} />
                                    {dayjs(selectedBooking.checkOut).format("DD/MM/YYYY")}
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Số đêm" span={1}>
                                <Tag color="blue">{selectedBooking.nights} đêm</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Số khách" span={1}>
                                <Space>
                                    <TeamOutlined />
                                    {selectedBooking.guests} người
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng tiền" span={2}>
                                <span
                                    style={{
                                        fontSize: 18,
                                        fontWeight: 600,
                                        color: "#f5222d",
                                    }}
                                >
                                    {selectedBooking.totalPrice.toLocaleString("vi-VN")}₫
                                </span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Phương thức thanh toán" span={1}>
                                {selectedBooking.paymentMethod}
                            </Descriptions.Item>
                            <Descriptions.Item label="Nhân viên xử lý" span={1}>
                                <Space>
                                    <UserOutlined />
                                    {selectedBooking.staff}
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày đặt" span={1}>
                                {dayjs(selectedBooking.createdAt).format("DD/MM/YYYY HH:mm")}
                            </Descriptions.Item>
                            {selectedBooking.cancellationReason && (
                                <Descriptions.Item label="Lý do hủy" span={2}>
                                    <span style={{ color: "#f5222d" }}>
                                        {selectedBooking.cancellationReason}
                                    </span>
                                </Descriptions.Item>
                            )}
                            {selectedBooking.notes && (
                                <Descriptions.Item label="Ghi chú" span={2}>
                                    {selectedBooking.notes}
                                </Descriptions.Item>
                            )}
                        </Descriptions>

                        <div style={{ marginTop: 24 }}>
                            <h4 style={{ marginBottom: 16 }}>Lịch sử trạng thái</h4>
                            <Timeline>
                                <Timeline.Item color="green">
                                    <p style={{ margin: 0 }}>Đặt phòng được tạo</p>
                                    <p style={{ margin: 0, fontSize: 12, color: "#999" }}>
                                        {dayjs(selectedBooking.createdAt).format("DD/MM/YYYY HH:mm")}
                                    </p>
                                </Timeline.Item>
                                {selectedBooking.status !== "Đang chờ" && (
                                    <Timeline.Item color="blue">
                                        <p style={{ margin: 0 }}>Đã xác nhận</p>
                                        <p style={{ margin: 0, fontSize: 12, color: "#999" }}>
                                            {dayjs(selectedBooking.createdAt)
                                                .add(1, "hour")
                                                .format("DD/MM/YYYY HH:mm")}
                                        </p>
                                    </Timeline.Item>
                                )}
                                {(selectedBooking.status === "Đã thanh toán" ||
                                    selectedBooking.status === "Hoàn thành") && (
                                        <Timeline.Item color="green">
                                            <p style={{ margin: 0 }}>Đã thanh toán</p>
                                            <p style={{ margin: 0, fontSize: 12, color: "#999" }}>
                                                {dayjs(selectedBooking.createdAt)
                                                    .add(2, "hour")
                                                    .format("DD/MM/YYYY HH:mm")}
                                            </p>
                                        </Timeline.Item>
                                    )}
                                {selectedBooking.status === "Hoàn thành" && (
                                    <Timeline.Item color="green">
                                        <p style={{ margin: 0 }}>Hoàn thành</p>
                                        <p style={{ margin: 0, fontSize: 12, color: "#999" }}>
                                            {dayjs(selectedBooking.checkOut).format("DD/MM/YYYY HH:mm")}
                                        </p>
                                    </Timeline.Item>
                                )}
                                {selectedBooking.status === "Đã hủy" && (
                                    <Timeline.Item color="red">
                                        <p style={{ margin: 0 }}>Đã hủy</p>
                                        <p style={{ margin: 0, fontSize: 12, color: "#999" }}>
                                            {dayjs(selectedBooking.createdAt)
                                                .add(1, "day")
                                                .format("DD/MM/YYYY HH:mm")}
                                        </p>
                                    </Timeline.Item>
                                )}
                            </Timeline>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal thay đổi trạng thái */}
            <Modal
                title={
                    <Space>
                        <EditOutlined />
                        <span>Cập nhật trạng thái đặt phòng</span>
                    </Space>
                }
                open={isStatusModalOpen}
                onCancel={() => setIsStatusModalOpen(false)}
                onOk={() => form.submit()}
                okText="Cập nhật"
                cancelText="Hủy"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleStatusUpdate}
                    initialValues={{
                        status: selectedBooking?.status || "Đang chờ",
                    }}
                >
                    <Form.Item
                        label="Trạng thái mới"
                        name="status"
                        rules={[{ required: true, message: "Vui lòng chọn trạng thái mới!" }]}
                    >
                        <Select>
                            <Option value="Đang chờ">Đang chờ</Option>
                            <Option value="Đã xác nhận">Đã xác nhận</Option>
                            <Option value="Đã thanh toán">Đã thanh toán</Option>
                            <Option value="Hoàn thành">Hoàn thành</Option>
                            <Option value="Đã hủy">Đã hủy</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="Ghi chú" name="notes">
                        <Input.TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default BookingManagement;
