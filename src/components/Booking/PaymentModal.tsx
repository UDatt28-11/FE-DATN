import React, { useState, useEffect } from "react";
import {

    Modal,
    Button,
    Space,
    Typography,
    Descriptions,
    Divider,
    Spin,
    Table,
    Tag,
    Row,
    Col,
    Select,
    Radio,
    Image as AntImage,
} from 'antd';
import {
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  BankOutlined,
  QrcodeOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  getUserInvoice,
  createPayOSInvoicePaymentLink,
  createVNPayInvoicePaymentLink,
  getVNPayBanks,
} from "../../service/bookingService";
import type { Invoice, InvoiceItem } from "../../types/invoice/invoice";
import { formatVND } from "../../utils/currency";
import { App } from "antd";

const { Text, Title } = Typography;

interface PaymentModalProps {
  open?: boolean;
  visible?: boolean; // Deprecated, use open instead
  invoiceId: number | null;
  totalAmount: number;
  onCancel: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  visible, // Deprecated, use open instead
  invoiceId,
  totalAmount,
  onCancel,
  onSuccess,
}) => {
  const isOpen = open !== undefined ? open : visible; // Support both for backward compatibility
  const { message } = App.useApp();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"payos" | "vnpay">(
    "payos"
  );
  const [vnpayBanks, setVnpayBanks] = useState<Record<string, string>>({});
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [damageImagesModal, setDamageImagesModal] = useState<{
    visible: boolean;
    images: string[];
    title: string;
  }>({
    visible: false,
    images: [],
    title: "",
  });

  useEffect(() => {
    console.log(
      "PaymentModal useEffect - isOpen:",
      isOpen,
      "invoiceId:",
      invoiceId
    );
    if (isOpen && invoiceId) {
      console.log("Fetching invoice for ID:", invoiceId);
      fetchInvoice();
      fetchVNPayBanks();
    } else {
      setInvoice(null);
    }
  }, [isOpen, invoiceId]);

  const fetchVNPayBanks = async () => {
    setLoadingBanks(true);
    try {
      const banks = await getVNPayBanks();
      setVnpayBanks(banks);
    } catch (error) {
      console.error("Error fetching VNPay banks:", error);
    } finally {
      setLoadingBanks(false);
    }
  };

  const fetchInvoice = async () => {
    if (!invoiceId) {
      console.warn("PaymentModal: No invoiceId provided");
      return;
    }
    setLoading(true);
    try {
      console.log("PaymentModal: Fetching invoice with ID:", invoiceId);
      const invoiceData = await getUserInvoice(invoiceId);
      console.log("PaymentModal: Invoice data received:", invoiceData);

      // Xử lý response có thể có nhiều dạng
      let invoice: Invoice;
      if (invoiceData?.data?.data) {
        invoice = invoiceData.data.data;
      } else if (invoiceData?.data) {
        invoice = invoiceData.data;
      } else if (invoiceData) {
        invoice = invoiceData as Invoice;
      } else {
        throw new Error("Không nhận được dữ liệu từ server");
      }

      console.log("PaymentModal: Processed invoice:", invoice);

      // Map invoice_items từ backend (snake_case) thành items cho frontend
      if ((invoice as any).invoice_items && !invoice.items) {
        invoice.items = (invoice as any).invoice_items;
      }
      // Hoặc nếu backend trả về invoiceItems (camelCase)
      if ((invoice as any).invoiceItems && !invoice.items) {
        invoice.items = (invoice as any).invoiceItems;
      }

      console.log(
        "PaymentModal: Setting invoice with items:",
        invoice.items?.length || 0
      );
      setInvoice(invoice);
    } catch (error: any) {
      console.error("PaymentModal: Error fetching invoice:", error);
      console.error("PaymentModal: Error details:", error.response?.data);
      message.error(
        error.response?.data?.message || "Không thể tải thông tin hóa đơn"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePayOSPayment = async () => {
    if (!invoiceId || !invoice) return;

    try {
      setPaying(true);
      const response = await createPayOSInvoicePaymentLink(
        invoiceId,
        invoice.total_amount,
        `Thanh toán hóa đơn #${invoice.invoice_number || invoiceId}`
      );

      if (response.checkoutUrl) {
        // Redirect đến PayOS checkout
        window.location.href = response.checkoutUrl;
      } else {
        message.error("Không thể tạo link thanh toán PayOS");
      }
    } catch (error: any) {
      console.error("Error creating PayOS payment link:", error);
      message.error(
        error.response?.data?.message || "Không thể tạo link thanh toán"
      );
    } finally {
      setPaying(false);
    }
  };

  const handleVNPayPayment = async () => {
    if (!invoiceId || !invoice) return;

    try {
      setPaying(true);
      const response = await createVNPayInvoicePaymentLink(
        invoiceId,
        invoice.total_amount,
        `Thanh toan hoa don #${invoice.invoice_number || invoiceId}`,
        selectedBank || undefined
      );

      if (response.payment_url) {
        // Redirect đến VNPAY checkout
        window.location.href = response.payment_url;
      } else {
        message.error("Không thể tạo link thanh toán VNPAY");
      }
    } catch (error: any) {
      console.error("Error creating VNPay payment link:", error);
      message.error(
        error.response?.data?.message || "Không thể tạo link thanh toán VNPAY"
      );
    } finally {
      setPaying(false);
    }
  };

  const handlePayment = () => {
    if (paymentMethod === "payos") {
      handlePayOSPayment();
    } else {
      handleVNPayPayment();
    }
  };

  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN");
    } catch {
      return dateString;
    }
  };

  const itemColumns: ColumnsType<InvoiceItem> = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Loại",
      dataIndex: "item_type",
      key: "item_type",
      width: 120,
      render: (type: string) => {
        const typeMap: Record<string, { label: string; color: string }> = {
          room_charge: { label: "Phí phòng", color: "" },
          service_charge: { label: "Dịch vụ", color: "blue" },
          damage_fee: { label: "Thiệt hại", color: "red" },
          penalty: { label: "Phạt", color: "red" },
          deposit: { label: "Tiền cọc", color: "orange" },
          voucher_discount: { label: "Giảm giá", color: "green" },
          other: { label: "Khác", color: "" },
        };
        const config = typeMap[type] || { label: type, color: "" };
        return <Tag color={config.color || undefined}>{config.label}</Tag>;
      },
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      align: "right",
    },
    {
      title: "Đơn giá",
      dataIndex: "unit_price",
      key: "unit_price",
      width: 120,
      align: "right",
      render: (price: number, record: InvoiceItem) => {
        const isPaid = record.description?.includes("[Đã thanh toán]");
        return (
          <Text
            style={{
              textDecoration: isPaid ? "line-through" : "none",
              color: isPaid ? "#8c8c8c" : "inherit",
              opacity: isPaid ? 0.6 : 1,
            }}
          >
            {formatVND(price)}
          </Text>
        );
      },
    },
    {
      title: "Thành tiền",
      key: "total",
      width: 150,
      align: "right",
      render: (_: any, record: InvoiceItem) => {
        const total =
          record.total ||
          record.total_line ||
          record.unit_price * record.quantity;
        const isNegative = total < 0;
        const isPaid = record.description?.includes("[Đã thanh toán]");
        return (
          <Text
            strong
            style={{
              color: isPaid ? "#8c8c8c" : isNegative ? "#ff4d4f" : undefined,
              textDecoration: isPaid ? "line-through" : "none",
              opacity: isPaid ? 0.6 : 1,
            }}
          >
            {isNegative ? "-" : ""}
            {formatVND(Math.abs(total))}
            {isPaid && (
              <span style={{ marginLeft: 8, fontSize: 12, color: "#52c41a" }}>
                (Đã thanh toán)
              </span>
            )}
          </Text>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      align: "center",
      render: (_: any, record: InvoiceItem) => {
        if (
          record.item_type === "damage_fee" &&
          record.damage_images &&
          record.damage_images.length > 0
        ) {
          return (
            <Button
              type="link"
              icon={<PictureOutlined />}
              onClick={() => {
                setDamageImagesModal({
                  visible: true,
                  images: record.damage_images!.map((img) => img.image_url),
                  title: record.description || "Ảnh minh chứng thiệt hại",
                });
              }}
            >
              Xem ảnh
            </Button>
          );
        }
        return null;
      },
    },
  ];

  const getDisplayPaymentMethod = (invoice: Invoice | null): string => {
    if (!invoice) return "N/A";

    const rawMethod =
      (invoice as any).payment_method || invoice.booking_order?.payment_method;
    const normalize = (method?: string | null): string | undefined => {
      if (!method) return undefined;
      const lower = method.toLowerCase();
      if (lower === "payos" || lower === "pay_os") return "PayOS";
      if (lower === "cash") return "Tiền mặt";
      if (lower === "bank_transfer") return "Chuyển khoản";
      if (lower === "credit_card") return "Thẻ tín dụng";
      if (lower === "e_wallet") return "Ví điện tử";
      return method;
    };

    const normalizedFromField = normalize(rawMethod);
    if (normalizedFromField) return normalizedFromField;

    const items: any[] =
      (invoice as any).items ||
      (invoice as any).invoice_items ||
      (invoice as any).invoiceItems ||
      [];

    const hasPayOSDeposit = items.some(
      (item) =>
        item?.item_type === "deposit" &&
        typeof item.description === "string" &&
        item.description.toLowerCase().includes("payos")
    );

    if (hasPayOSDeposit) return "PayOS";

    return "N/A";
  };

  if (!invoiceId) return null;

  return (
    <>
      <Modal
        title={
          <Space>
            <DollarOutlined />
            <span>Thanh toán hóa đơn</span>
          </Space>
        }
        open={isOpen}
        onCancel={onCancel}
        width={900}
        footer={[
          <Button key="cancel" onClick={onCancel}>
            Hủy
          </Button>,
          <Button
            key="pay"
            type="primary"
            loading={paying}
            onClick={handlePayment}
            icon={
              paymentMethod === "payos" ? <QrcodeOutlined /> : <BankOutlined />
            }
            style={{
              backgroundColor:
                paymentMethod === "payos" ? "#52c41a" : "#1890ff",
              borderColor: paymentMethod === "payos" ? "#52c41a" : "#1890ff",
            }}
            disabled={
              !invoice ||
              loading ||
              (paymentMethod === "vnpay" && (invoice?.balance || 0) < 10000)
            }
          >
            {paymentMethod === "payos"
              ? "Thanh toán PayOS"
              : "Thanh toán VNPAY"}
          </Button>,
        ]}
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" />
          </div>
        ) : invoice ? (
          <div style={{ padding: "20px 0" }}>
            {/* Header */}
            <Row
              justify="space-between"
              align="top"
              style={{ marginBottom: 24 }}
            >
              <Col>
                <Title level={3} style={{ margin: 0, color: "#cb8670" }}>
                  HÓA ĐƠN
                </Title>
                <Text type="secondary">
                  Số hóa đơn: {invoice.invoice_number || `#${invoice.id}`}
                </Text>
              </Col>
            </Row>

            <Divider />

            {/* Chọn phương thức thanh toán */}
            <div
              style={{
                marginBottom: 24,
                padding: "16px",
                backgroundColor: "#fafafa",
                borderRadius: "8px",
              }}
            >
              <Title level={5} style={{ marginBottom: 16 }}>
                <BankOutlined style={{ marginRight: 8 }} />
                Chọn phương thức thanh toán
              </Title>
              <Radio.Group
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: "100%" }}
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Radio
                    value="payos"
                    style={{
                      padding: "12px 16px",
                      border:
                        paymentMethod === "payos"
                          ? "2px solid #52c41a"
                          : "1px solid #d9d9d9",
                      borderRadius: "8px",
                      width: "100%",
                      backgroundColor:
                        paymentMethod === "payos" ? "#f6ffed" : "white",
                    }}
                  >
                    <Space>
                      <QrcodeOutlined
                        style={{ fontSize: 20, color: "#52c41a" }}
                      />
                      <div>
                        <Text strong>PayOS</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Thanh toán qua QR Code, chuyển khoản nhanh
                        </Text>
                      </div>
                    </Space>
                  </Radio>
                  <Radio
                    value="vnpay"
                    style={{
                      padding: "12px 16px",
                      border:
                        paymentMethod === "vnpay"
                          ? "2px solid #1890ff"
                          : "1px solid #d9d9d9",
                      borderRadius: "8px",
                      width: "100%",
                      backgroundColor:
                        paymentMethod === "vnpay" ? "#e6f7ff" : "white",
                    }}
                  >
                    <Space>
                      <BankOutlined
                        style={{ fontSize: 20, color: "#1890ff" }}
                      />
                      <div>
                        <Text strong>VNPAY</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Thẻ ATM, Internet Banking, Visa/Mastercard
                        </Text>
                      </div>
                    </Space>
                  </Radio>
                </Space>
              </Radio.Group>

              {/* Chọn ngân hàng cho VNPAY */}
              {paymentMethod === "vnpay" && (
                <div style={{ marginTop: 16 }}>
                  <Text
                    type="secondary"
                    style={{ display: "block", marginBottom: 8 }}
                  >
                    Chọn ngân hàng (không bắt buộc):
                  </Text>
                  <Select
                    style={{ width: "100%" }}
                    placeholder="-- Để trống để hiển thị danh sách ngân hàng --"
                    allowClear
                    value={selectedBank || undefined}
                    onChange={(value) => setSelectedBank(value || "")}
                    loading={loadingBanks}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label?.toString() ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={[
                      { value: "", label: "-- Hiển thị tất cả ngân hàng --" },
                      ...Object.entries(vnpayBanks).map(([code, name]) => ({
                        value: code,
                        label: name,
                      })),
                    ]}
                  />
                  {(invoice?.balance || 0) < 10000 && (
                    <div
                      style={{
                        padding: 12,
                        background: "#fff2f0",
                        borderRadius: 8,
                        border: "1px solid #ffccc7",
                        marginTop: 12,
                      }}
                    >
                      <Text type="danger" style={{ fontSize: 13 }}>
                        ⚠️ VNPAY yêu cầu số tiền thanh toán tối thiểu là 10.000
                        VNĐ. Vui lòng chọn PayOS để thanh toán đơn này.
                      </Text>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Thông tin khách hàng */}
            <Descriptions
              title="Thông tin khách hàng"
              bordered
              column={2}
              size="small"
              style={{ marginBottom: 24 }}
            >
              <Descriptions.Item label="Tên khách hàng">
                {invoice.customer_name ||
                  invoice.booking_order?.customer_name ||
                  "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {invoice.customer_email ||
                  invoice.booking_order?.customer_email ||
                  "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {invoice.customer_phone ||
                  invoice.booking_order?.customer_phone ||
                  "N/A"}
              </Descriptions.Item>
              {/* <Descriptions.Item label="Địa chỉ">
                            {invoice.customer_address ||
                                (invoice.booking_order?.guest?.address as string | undefined) ||
                                'N/A'}
                        </Descriptions.Item> */}
            </Descriptions>

            {/* Thông tin hóa đơn */}
            <Descriptions
              bordered
              column={2}
              size="small"
              style={{ marginBottom: 24 }}
            >
              <Descriptions.Item label="Ngày phát hành">
                {formatDate(invoice.issue_date)}
              </Descriptions.Item>
              <Descriptions.Item label="Hạn thanh toán">
                {formatDate(invoice.due_date)}
              </Descriptions.Item>
              {invoice.booking_order && (
                <>
                  <Descriptions.Item label="Mã đặt phòng">
                    <Text strong>
                      #
                      {invoice.booking_order.order_code ||
                        invoice.booking_order.code}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Phương thức thanh toán">
                    {getDisplayPaymentMethod(invoice)}
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>

            {/* Chi tiết hóa đơn */}
            <div style={{ marginBottom: 24 }}>
              <Title level={5}>Chi tiết hóa đơn</Title>
              <Table
                columns={itemColumns}
                dataSource={
                  invoice.items ||
                  (invoice as any).invoice_items ||
                  (invoice as any).invoiceItems ||
                  []
                }
                rowKey="id"
                pagination={false}
                size="small"
                bordered
              />
            </div>

            {/* Tổng tiền */}
            <Row justify="end" style={{ marginBottom: 24 }}>
              <Col span={12}>
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  <Row justify="space-between">
                    <Col>
                      <Text>Tạm tính:</Text>
                    </Col>
                    <Col>
                      <Text>
                        {formatVND(invoice.subtotal || invoice.total_amount)}
                      </Text>
                    </Col>
                  </Row>
                  {invoice.discount_amount > 0 && (
                    <Row justify="space-between">
                      <Col>
                        <Text type="secondary">Giảm giá:</Text>
                      </Col>
                      <Col>
                        <Text type="secondary">
                          -{formatVND(invoice.discount_amount)}
                        </Text>
                      </Col>
                    </Row>
                  )}
                  {invoice.tax_amount > 0 && (
                    <Row justify="space-between">
                      <Col>
                        <Text type="secondary">
                          Thuế ({invoice.tax_rate}%):
                        </Text>
                      </Col>
                      <Col>
                        <Text type="secondary">
                          {formatVND(invoice.tax_amount)}
                        </Text>
                      </Col>
                    </Row>
                  )}
                  <Divider style={{ margin: "8px 0" }} />
                  <Row justify="space-between">
                    <Col>
                      <Text strong style={{ fontSize: 16 }}>
                        Tổng cộng:
                      </Text>
                    </Col>
                    <Col>
                      <Text strong style={{ fontSize: 18, color: "#cb8670" }}>
                        {formatVND(invoice.total_amount)}
                      </Text>
                    </Col>
                  </Row>
                  {invoice.paid_amount > 0 && (
                    <Row justify="space-between">
                      <Col>
                        <Text type="secondary">Đã thanh toán:</Text>
                      </Col>
                      <Col>
                        <Text type="success">
                          {formatVND(invoice.paid_amount)}
                        </Text>
                      </Col>
                    </Row>
                  )}
                  {invoice.balance > 0 && (
                    <Row justify="space-between">
                      <Col>
                        <Text strong>Còn lại:</Text>
                      </Col>
                      <Col>
                        <Text strong style={{ color: "#ff4d4f" }}>
                          {formatVND(invoice.balance)}
                        </Text>
                      </Col>
                    </Row>
                  )}
                </Space>
              </Col>
            </Row>

            {/* Ghi chú */}
            {invoice.notes && (
              <div style={{ marginTop: 24 }}>
                <Text type="secondary">Ghi chú: </Text>
                <Text>{invoice.notes}</Text>
              </div>
            )}

        </Modal>

        {/* Modal hiển thị ảnh thiệt hại */}
        <Modal
            title={damageImagesModal.title}
            open={damageImagesModal.visible}
            onCancel={() => setDamageImagesModal({ visible: false, images: [], title: '' })}
            footer={null}
            width={800}
        >
            <AntImage.PreviewGroup>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                    {damageImagesModal.images.map((url, index) => (
                        <Image
                            key={index}
                            src={url}
                            width={200}
                            style={{ borderRadius: 4 }}
                            alt={`Ảnh minh chứng ${index + 1}`}
                        />
                    ))}
                </div>
            </AntImage.PreviewGroup>
        </Modal>
        </>
    );
};

export default PaymentModal;
