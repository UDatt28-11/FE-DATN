import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Row,
  Col,
  Card,
  Statistic,
  Tooltip,
  Popconfirm,
  Spin,
  Dropdown,
  Menu,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import invoiceService from "../../../service/invoiceService";
import type { Invoice } from "../../../types/invoice/invoice";

const { Search } = Input;
const { Option } = Select;

const ListInvoice: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);

  // Fetch invoices
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response: any = await invoiceService.getAll();
      console.log("Invoice API Response:", response);

      // Xử lý response có thể có nhiều dạng
      let data: Invoice[] = [];
      if (Array.isArray(response)) {
        data = response;
      } else if (response?.data && Array.isArray(response.data)) {
        data = response.data;
      } else if (response?.invoices && Array.isArray(response.invoices)) {
        data = response.invoices;
      } else {
        console.warn("Unexpected response format:", response);
        data = [];
      }

      setInvoices(data);
      setFilteredInvoices(data);
    } catch (error: any) {
      console.error("Lỗi khi tải danh sách:", error);
      toast.error(
        error.response?.data?.message || "Không thể tải danh sách hóa đơn!"
      );
      setInvoices([]);
      setFilteredInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response: any = await invoiceService.getStatistics();
      // Xử lý response có thể có nhiều dạng
      let stats: any;
      if (response?.data?.data) {
        stats = response.data.data;
      } else if (response?.data) {
        stats = response.data;
      } else if (response) {
        stats = response;
      } else {
        stats = {
          total_invoices: 0,
          total_revenue: 0,
          paid_invoices: 0,
          pending_invoices: 0,
          overdue_invoices: 0,
        };
      }
      setStatistics(stats);
    } catch (error) {
      console.error("Lỗi khi tải thống kê:", error);
      // Set default stats nếu lỗi
      setStatistics({
        total_invoices: 0,
        total_revenue: 0,
        paid_invoices: 0,
        pending_invoices: 0,
        overdue_invoices: 0,
      });
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchStatistics();
  }, []);

  // Apply filters
  const applyFilters = (
    search: string,
    status: string,
    paymentStatus: string
  ) => {
    let filtered = invoices;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.invoice_number.toLowerCase().includes(searchLower) ||
          inv.customer_name.toLowerCase().includes(searchLower) ||
          inv.customer_email?.toLowerCase().includes(searchLower)
      );
    }

    if (status !== "all") {
      filtered = filtered.filter((inv) => inv.invoice_status === status);
    }

    if (paymentStatus !== "all") {
      filtered = filtered.filter((inv) => inv.payment_status === paymentStatus);
    }

    setFilteredInvoices(filtered);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    applyFilters(value, statusFilter, paymentStatusFilter);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    applyFilters(searchText, value, paymentStatusFilter);
  };

  const handlePaymentStatusFilterChange = (value: string) => {
    setPaymentStatusFilter(value);
    applyFilters(searchText, statusFilter, value);
  };

  // Delete invoice
  const handleDelete = async (id: number) => {
    try {
      await invoiceService.remove(id);
      toast.success("Xóa hóa đơn thành công!");
      fetchInvoices();
      fetchStatistics();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể xóa hóa đơn!");
    }
  };

  // Mark as paid
  const handleMarkAsPaid = async (id: number) => {
    try {
      await invoiceService.markAsPaid(id, {
        payment_date: dayjs().format("YYYY-MM-DD"),
        payment_method: "cash",
      });
      toast.success("Đã đánh dấu thanh toán!");
      fetchInvoices();
      fetchStatistics();
    } catch (error: any) {
      console.error("Lỗi khi đánh dấu thanh toán:", error);
      toast.error(error.response?.data?.message || "Không thể cập nhật!");
    }
  };

  // Cancel invoice
  const handleCancelInvoice = async (id: number) => {
    try {
      await invoiceService.updateStatus(id, "cancelled");
      toast.success("Đã hủy hóa đơn!");
      fetchInvoices();
      fetchStatistics();
    } catch (error: any) {
      console.error("Lỗi khi hủy hóa đơn:", error);
      toast.error(error.response?.data?.message || "Không thể hủy hóa đơn!");
    }
  };

  // Update invoice status
  const handleStatusChange = async (
    id: number,
    newStatus: Invoice["invoice_status"]
  ) => {
    try {
      await invoiceService.updateStatus(id, newStatus);
      toast.success("Đã cập nhật trạng thái!");
      fetchInvoices();
      fetchStatistics();
    } catch (error: any) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      toast.error(
        error.response?.data?.message || "Không thể cập nhật trạng thái!"
      );
    }
  };

  // Get status tag
  const getInvoiceStatusTag = (status: Invoice["invoice_status"]) => {
    const statusConfig = {
      draft: { color: "default", icon: <FileTextOutlined />, text: "Nháp" },
      sent: {
        color: "processing",
        icon: <ClockCircleOutlined />,
        text: "Đã gửi",
      },
      viewed: { color: "blue", icon: <EyeOutlined />, text: "Đã xem" },
      paid: {
        color: "success",
        icon: <CheckCircleOutlined />,
        text: "Đã thanh toán",
      },
      cancelled: {
        color: "error",
        icon: <CloseCircleOutlined />,
        text: "Đã hủy",
      },
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const getPaymentStatusTag = (status: Invoice["payment_status"]) => {
    const statusConfig = {
      pending: { color: "warning", text: "Chờ thanh toán" },
      partially_paid: { color: "processing", text: "Thanh toán 1 phần" },
      paid: { color: "success", text: "Đã thanh toán" },
      overdue: { color: "error", text: "Quá hạn" },
      cancelled: { color: "default", text: "Đã hủy" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns: ColumnsType<Invoice> = [
    {
      title: "Số HĐ",
      dataIndex: "invoice_number",
      key: "invoice_number",
      fixed: "left",
      width: 130,
      render: (text) => (
        <span style={{ fontWeight: 600, color: "#1890ff" }}>
          {text || "N/A"}
        </span>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: "customer_name",
      key: "customer_name",
      width: 180,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text || "N/A"}</div>
          <div style={{ fontSize: 12, color: "#888" }}>
            {record.customer_email || ""}
          </div>
        </div>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "issue_date",
      key: "issue_date",
      width: 110,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Hạn thanh toán",
      dataIndex: "due_date",
      key: "due_date",
      width: 120,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "total_amount",
      key: "total_amount",
      width: 130,
      align: "right",
      render: (amount) => (
        <span style={{ fontWeight: 600, color: "#52c41a" }}>
          {(amount || 0).toLocaleString("vi-VN")}₫
        </span>
      ),
    },
    {
      title: "Đã thanh toán",
      dataIndex: "paid_amount",
      key: "paid_amount",
      width: 130,
      align: "right",
      render: (amount) => `${(amount || 0).toLocaleString("vi-VN")}₫`,
    },
    {
      title: "Còn lại",
      dataIndex: "balance",
      key: "balance",
      width: 120,
      align: "right",
      render: (balance) => (
        <span
          style={{
            fontWeight: 500,
            color: (balance || 0) > 0 ? "#ff4d4f" : "#52c41a",
          }}
        >
          {(balance || 0).toLocaleString("vi-VN")}₫
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "invoice_status",
      key: "invoice_status",
      width: 180,
      render: (status, record) => (
        <Select
          value={status}
          onChange={(value) => handleStatusChange(record.id, value)}
          style={{ width: "100%" }}
          disabled={status === "cancelled"}
        >
          <Option value="draft">Nháp</Option>
          <Option value="sent">Đã gửi</Option>
          <Option value="viewed">Đã xem</Option>
          <Option value="paid">Đã thanh toán</Option>
          <Option value="cancelled">Đã hủy</Option>
        </Select>
      ),
    },
    {
      title: "Thanh toán",
      dataIndex: "payment_status",
      key: "payment_status",
      width: 150,
      render: (status) => getPaymentStatusTag(status),
    },
    {
      title: "Hành động",
      key: "action",
      fixed: "right",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              ghost
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/admin/invoice/view/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/invoice/edit/${record.id}`)}
            />
          </Tooltip>
          {record.payment_status !== "paid" &&
            record.invoice_status !== "cancelled" && (
              <Tooltip title="Đánh dấu đã thanh toán">
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleMarkAsPaid(record.id)}
                />
              </Tooltip>
            )}
          {record.invoice_status !== "cancelled" &&
            record.invoice_status !== "paid" && (
              <Popconfirm
                title="Xác nhận hủy hóa đơn"
                description={`Bạn có chắc chắn muốn hủy hóa đơn "${record.invoice_number}"?`}
                onConfirm={() => handleCancelInvoice(record.id)}
                okText="Hủy"
                cancelText="Không"
                okType="danger"
              >
                <Tooltip title="Hủy hóa đơn">
                  <Button danger size="small" icon={<CloseCircleOutlined />} />
                </Tooltip>
              </Popconfirm>
            )}
          <Popconfirm
            title="Xác nhận xóa hóa đơn"
            description={`Bạn có chắc chắn muốn xóa hóa đơn "${record.invoice_number}"?`}
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Tooltip title="Xóa hóa đơn">
              <Button danger size="small" icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng hóa đơn"
              value={statistics?.total_invoices || 0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={statistics?.total_revenue || 0}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Chờ thanh toán"
              value={statistics?.pending_invoices || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Quá hạn"
              value={statistics?.overdue_invoices || 0}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Space>
          <Search
            placeholder="Tìm số HĐ, khách hàng..."
            enterButton={<SearchOutlined />}
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            style={{ width: 150 }}
          >
            <Option value="all">Tất cả trạng thái</Option>
            <Option value="draft">Nháp</Option>
            <Option value="sent">Đã gửi</Option>
            <Option value="viewed">Đã xem</Option>
            <Option value="paid">Đã thanh toán</Option>
            <Option value="cancelled">Đã hủy</Option>
          </Select>
          <Select
            value={paymentStatusFilter}
            onChange={handlePaymentStatusFilterChange}
            style={{ width: 160 }}
          >
            <Option value="all">Tất cả thanh toán</Option>
            <Option value="pending">Chờ thanh toán</Option>
            <Option value="partially_paid">Thanh toán 1 phần</Option>
            <Option value="paid">Đã thanh toán</Option>
            <Option value="overdue">Quá hạn</Option>
            <Option value="cancelled">Đã hủy</Option>
          </Select>
        </Space>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchInvoices}
            loading={loading}
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/admin/invoice/add")}
          >
            Tạo hóa đơn
          </Button>
        </Space>
      </Row>

      {/* Table */}
      <Spin spinning={loading}>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredInvoices}
          rowKey="id"
          scroll={{ x: 1500 }}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            pageSizeOptions: [15, 30, 50],
            showTotal: (total) => `Tổng ${total} hóa đơn`,
          }}
        />
      </Spin>
    </div>
  );
};

export default ListInvoice;
