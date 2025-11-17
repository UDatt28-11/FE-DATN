import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Descriptions,
  Table,
  Button,
  Space,
  Tag,
  Divider,
  Row,
  Col,
  Typography,
  Spin,
  Select,
  Popconfirm,
} from "antd";
import {
  ArrowLeftOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import invoiceService from "../../../service/invoiceService";
import type { Invoice, InvoiceItem } from "../../../types/invoice/invoice";

const { Title, Text } = Typography;

const ViewInvoice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchInvoice();
    }
  }, [id]);

  const fetchInvoice = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response: any = await invoiceService.getById(id);
      // Xử lý response có thể có nhiều dạng
      let invoiceData: Invoice;
      if (response?.data?.data) {
        invoiceData = response.data.data;
      } else if (response?.data) {
        invoiceData = response.data;
      } else if (response) {
        invoiceData = response;
      } else {
        throw new Error("Không nhận được dữ liệu từ server");
      }

      // Xử lý items: backend có thể trả về `invoice_items`, `invoiceItems` hoặc `items`
      if (!invoiceData.items) {
        if ((invoiceData as any).invoice_items) {
          invoiceData.items = (invoiceData as any).invoice_items;
        } else if ((invoiceData as any).invoiceItems) {
          invoiceData.items = (invoiceData as any).invoiceItems;
        } else {
          invoiceData.items = [];
        }
      }

      // Đảm bảo items là mảng và có dữ liệu hợp lệ
      if (!Array.isArray(invoiceData.items)) {
        invoiceData.items = [];
      }

      setInvoice(invoiceData);
    } catch (error: any) {
      console.error("Lỗi khi tải hóa đơn:", error);
      toast.error(
        error.response?.data?.message || "Không thể tải thông tin hóa đơn!"
      );
      navigate("/admin/invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!invoice) return;
    try {
      await invoiceService.markAsPaid(invoice.id, {
        payment_date: dayjs().format("YYYY-MM-DD"),
        payment_method: invoice.payment_method || "cash",
      });
      toast.success("Đã đánh dấu thanh toán!");
      fetchInvoice();
    } catch (error: any) {
      console.error("Lỗi khi đánh dấu thanh toán:", error);
      toast.error(error.response?.data?.message || "Không thể cập nhật!");
    }
  };

  const handleCancelInvoice = async () => {
    if (!invoice) return;
    try {
      await invoiceService.updateStatus(invoice.id, "cancelled");
      toast.success("Đã hủy hóa đơn!");
      fetchInvoice();
    } catch (error: any) {
      console.error("Lỗi khi hủy hóa đơn:", error);
      toast.error(error.response?.data?.message || "Không thể hủy hóa đơn!");
    }
  };

  const handleStatusChange = async (newStatus: Invoice["invoice_status"]) => {
    if (!invoice) return;
    try {
      await invoiceService.updateStatus(invoice.id, newStatus);
      toast.success("Đã cập nhật trạng thái!");
      fetchInvoice();
    } catch (error: any) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      toast.error(
        error.response?.data?.message || "Không thể cập nhật trạng thái!"
      );
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getPaymentStatusTag = (status: Invoice["payment_status"]) => {
    const config = {
      pending: { color: "warning", text: "Chờ thanh toán" },
      partially_paid: { color: "processing", text: "Thanh toán 1 phần" },
      paid: { color: "success", text: "Đã thanh toán" },
      overdue: { color: "error", text: "Quá hạn" },
      cancelled: { color: "default", text: "Đã hủy" },
    };
    const conf = config[status] || config.pending;
    return <Tag color={conf.color}>{conf.text}</Tag>;
  };

  const getInvoiceStatusTag = (status: Invoice["invoice_status"]) => {
    const statusConfig = {
      draft: { color: "default", text: "Nháp" },
      sent: { color: "processing", text: "Đã gửi" },
      viewed: { color: "blue", text: "Đã xem" },
      paid: { color: "success", text: "Đã thanh toán" },
      cancelled: { color: "error", text: "Đã hủy" },
    };
    const config = statusConfig[status] || statusConfig.draft;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const itemColumns: ColumnsType<InvoiceItem> = [
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Loại",
      dataIndex: "item_type",
      key: "item_type",
      render: (type) => {
        const typeMap: Record<string, { color: string; text: string }> = {
          room_charge: { color: "blue", text: "Phí phòng" },
          service_charge: { color: "cyan", text: "Phí dịch vụ" },
          supply_charge: { color: "green", text: "Phí vật tư" },
          penalty: { color: "red", text: "Phạt" },
          other: { color: "default", text: "Khác" },
        };
        const conf = typeMap[type] || typeMap.other;
        return <Tag color={conf.color}>{conf.text}</Tag>;
      },
    },
    {
      title: "SL",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
    },
    {
      title: "Đơn giá",
      dataIndex: "unit_price",
      key: "unit_price",
      align: "right",
      render: (price) => `${(price || 0).toLocaleString("vi-VN")}₫`,
    },
    {
      title: "Thuế",
      dataIndex: "tax_amount",
      key: "tax_amount",
      align: "right",
      render: (tax) => (tax ? `${tax.toLocaleString("vi-VN")}₫` : "-"),
    },
    {
      title: "Tổng",
      dataIndex: "total",
      key: "total",
      align: "right",
      render: (total) => (
        <Text strong style={{ color: "#52c41a" }}>
          {(total || 0).toLocaleString("vi-VN")}₫
        </Text>
      ),
    },
  ];

  if (loading || !invoice) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header Actions */}
      <div style={{ marginBottom: 24 }}>
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/admin/invoice")}
          >
            Quay lại
          </Button>
          <Button icon={<PrinterOutlined />} onClick={handlePrint}>
            In hóa đơn
          </Button>
          <Button icon={<FilePdfOutlined />}>Xuất PDF</Button>

          {/* Trạng thái hóa đơn */}
          <Select
            value={invoice.invoice_status}
            onChange={handleStatusChange}
            style={{ width: 180 }}
            disabled={invoice.invoice_status === "cancelled"}
          >
            <Select.Option value="draft">Nháp</Select.Option>
            <Select.Option value="sent">Đã gửi</Select.Option>
            <Select.Option value="viewed">Đã xem</Select.Option>
            <Select.Option value="paid">Đã thanh toán</Select.Option>
            <Select.Option value="cancelled">Đã hủy</Select.Option>
          </Select>

          {/* Đánh dấu đã thanh toán */}
          {invoice.payment_status !== "paid" &&
            invoice.invoice_status !== "cancelled" && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleMarkAsPaid}
              >
                Đánh dấu đã thanh toán
              </Button>
            )}

          {/* Hủy hóa đơn */}
          {invoice.invoice_status !== "cancelled" &&
            invoice.invoice_status !== "paid" && (
              <Popconfirm
                title="Xác nhận hủy hóa đơn"
                description="Bạn có chắc chắn muốn hủy hóa đơn này? Hành động này không thể hoàn tác."
                onConfirm={handleCancelInvoice}
                okText="Hủy"
                cancelText="Không"
                okType="danger"
              >
                <Button danger>Hủy hóa đơn</Button>
              </Popconfirm>
            )}
        </Space>
      </div>

      {/* Invoice Header */}
      <Card>
        <Row justify="space-between" align="top">
          <Col>
            <Title level={2}>HÓA ĐƠN</Title>
            <Text strong style={{ fontSize: 18 }}>
              {invoice.invoice_number}
            </Text>
          </Col>
          <Col style={{ textAlign: "right" }}>
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary" style={{ marginRight: 8 }}>
                Trạng thái:
              </Text>
              {getInvoiceStatusTag(invoice.invoice_status)}
            </div>
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary" style={{ marginRight: 8 }}>
                Thanh toán:
              </Text>
              {getPaymentStatusTag(invoice.payment_status)}
            </div>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">Ngày tạo:</Text>
              <br />
              <Text strong>
                {dayjs(invoice.issue_date).format("DD/MM/YYYY")}
              </Text>
            </div>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">Hạn thanh toán:</Text>
              <br />
              <Text strong>{dayjs(invoice.due_date).format("DD/MM/YYYY")}</Text>
            </div>
          </Col>
        </Row>

        <Divider />

        {/* Customer & Property Info */}
        <Row gutter={24}>
          <Col span={12}>
            <Descriptions title="Thông tin khách hàng" column={1} size="small">
              <Descriptions.Item label="Tên">
                <Text strong>{invoice.customer_name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {invoice.customer_email || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Điện thoại">
                {invoice.customer_phone || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {invoice.customer_address || "-"}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={12}>
            <Descriptions title="Thông tin thanh toán" column={1} size="small">
              <Descriptions.Item label="Phương thức">
                {invoice.payment_method || "Chưa xác định"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày thanh toán">
                {invoice.payment_date
                  ? dayjs(invoice.payment_date).format("DD/MM/YYYY")
                  : "Chưa thanh toán"}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú thanh toán">
                {invoice.payment_notes || "-"}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>

        <Divider />

        {/* Invoice Items */}
        <Title level={4} style={{ marginBottom: 16 }}>
          Chi tiết hóa đơn
        </Title>
        {invoice.items && invoice.items.length > 0 ? (
          <Table
            columns={itemColumns}
            dataSource={invoice.items}
            rowKey="id"
            pagination={false}
            size="middle"
            bordered
          />
        ) : (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              background: "#fafafa",
              borderRadius: 8,
              border: "1px dashed #d9d9d9",
            }}
          >
            <Text type="secondary" style={{ fontSize: 16 }}>
              Không có chi tiết hóa đơn
            </Text>
          </div>
        )}

        <Divider />

        {/* Summary */}
        <Row justify="end" style={{ marginTop: 24 }}>
          <Col span={10}>
            <div
              style={{
                padding: 20,
                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                borderRadius: 8,
                border: "1px solid #e8e8e8",
              }}
            >
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="middle"
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 15 }}>Tổng phụ:</Text>
                  <Text strong style={{ fontSize: 15 }}>
                    {(invoice.subtotal || 0).toLocaleString("vi-VN")} ₫
                  </Text>
                </div>
                {(invoice.discount_amount || 0) > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      color: "#52c41a",
                    }}
                  >
                    <Text style={{ fontSize: 15 }}>Giảm giá:</Text>
                    <Text strong style={{ fontSize: 15 }}>
                      -{(invoice.discount_amount || 0).toLocaleString("vi-VN")}{" "}
                      ₫
                    </Text>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 15 }}>
                    Thuế ({Number(invoice.tax_rate || 0).toFixed(2)}%):
                  </Text>
                  <Text strong style={{ fontSize: 15 }}>
                    {(invoice.tax_amount || 0).toLocaleString("vi-VN")} ₫
                  </Text>
                </div>
                <Divider style={{ margin: "12px 0", borderColor: "#d9d9d9" }} />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px",
                    background: "#fff",
                    borderRadius: 6,
                    border: "2px solid #1890ff",
                  }}
                >
                  <Text strong style={{ fontSize: 17 }}>
                    Tổng cộng:
                  </Text>
                  <Text strong style={{ fontSize: 20, color: "#1890ff" }}>
                    {(invoice.total_amount || 0).toLocaleString("vi-VN")} ₫
                  </Text>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 15 }}>Đã thanh toán:</Text>
                  <Text strong style={{ fontSize: 15, color: "#52c41a" }}>
                    {(invoice.paid_amount || 0).toLocaleString("vi-VN")} ₫
                  </Text>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px",
                    background:
                      (invoice.balance || 0) > 0 ? "#fff1f0" : "#f6ffed",
                    borderRadius: 6,
                    border:
                      (invoice.balance || 0) > 0
                        ? "1px solid #ffccc7"
                        : "1px solid #b7eb8f",
                  }}
                >
                  <Text strong style={{ fontSize: 16 }}>
                    Còn lại:
                  </Text>
                  <Text
                    strong
                    style={{
                      fontSize: 18,
                      color: (invoice.balance || 0) > 0 ? "#ff4d4f" : "#52c41a",
                    }}
                  >
                    {(invoice.balance || 0).toLocaleString("vi-VN")} ₫
                  </Text>
                </div>
              </Space>
            </div>
          </Col>
        </Row>

        {/* Notes */}
        {invoice.notes && (
          <>
            <Divider />
            <div>
              <Text strong>Ghi chú:</Text>
              <div
                style={{
                  marginTop: 8,
                  padding: 12,
                  background: "#f5f5f5",
                  borderRadius: 4,
                }}
              >
                {invoice.notes}
              </div>
            </div>
          </>
        )}

        {/* Terms & Conditions */}
        {invoice.terms_conditions && (
          <>
            <Divider />
            <div>
              <Text strong>Điều khoản:</Text>
              <div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
                {invoice.terms_conditions}
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default ViewInvoice;
