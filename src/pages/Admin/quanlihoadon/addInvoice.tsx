import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Space,
  Row,
  Col,
  DatePicker,
  InputNumber,
  Select,
  Divider,
  Table,
  Typography,
  Spin,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import invoiceService from "../../../service/invoiceService";
import {
  listBookings,
  getBooking,
  type BookingOrder,
} from "../../../service/bookingService";
import type { CreateInvoiceData } from "../../../types/invoice/invoice";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface InvoiceItemForm {
  key: string;
  item_type: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
}

const AddInvoice: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchingBookings, setFetchingBookings] = useState(false);
  const [bookings, setBookings] = useState<BookingOrder[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
    null
  );
  const [selectedBooking, setSelectedBooking] = useState<BookingOrder | null>(
    null
  );
  const [items, setItems] = useState<InvoiceItemForm[]>([
    {
      key: "1",
      item_type: "room_charge",
      description: "",
      quantity: 1,
      unit_price: 0,
      tax_rate: 10,
    },
  ]);

  // Fetch bookings
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setFetchingBookings(true);
    try {
      const response = await listBookings({
        status: ["confirmed", "completed"],
        per_page: 100,
      });
      setBookings(response.data || []);
    } catch (error: any) {
      console.error("Lỗi khi tải danh sách booking:", error);
      toast.error("Không thể tải danh sách đặt phòng!");
    } finally {
      setFetchingBookings(false);
    }
  };

  // Handle booking selection
  const handleBookingSelect = async (bookingId: number | null) => {
    setSelectedBookingId(bookingId);
    if (!bookingId) {
      setSelectedBooking(null);
      // Reset form
      form.resetFields();
      setItems([
        {
          key: "1",
          item_type: "room_charge",
          description: "",
          quantity: 1,
          unit_price: 0,
          tax_rate: 10,
        },
      ]);
      return;
    }

    try {
      const booking = await getBooking(bookingId, "details,details.room");
      setSelectedBooking(booking);

      // Auto-fill customer information
      form.setFieldsValue({
        customer_name: booking.customer_name || "",
        customer_email: booking.customer_email || "",
        customer_phone: booking.customer_phone || "",
        payment_method: booking.payment_method || "cash",
        notes: booking.notes || "",
      });

      // Auto-fill invoice items from booking details
      if (booking.details && booking.details.length > 0) {
        const bookingItems: InvoiceItemForm[] = booking.details.map(
          (detail, index) => {
            const checkIn = dayjs(detail.check_in_date);
            const checkOut = dayjs(detail.check_out_date);
            const nights = Math.max(1, checkOut.diff(checkIn, "day"));
            const roomName =
              detail.room?.name ||
              detail.room_name ||
              `Phòng ${detail.room_id}`;

            // sub_total là tổng giá cho cả đợt đặt phòng (đã bao gồm số đêm)
            // Tính unit_price (giá mỗi đêm) = sub_total / nights
            // Giả định sub_total là giá chưa bao gồm thuế (giá gốc)
            const unitPrice =
              nights > 0 ? detail.sub_total / nights : detail.sub_total;

            return {
              key: `booking-${detail.id}-${index}`,
              item_type: "room_charge",
              description: `${roomName} - ${nights} đêm (${checkIn.format(
                "DD/MM/YYYY"
              )} - ${checkOut.format("DD/MM/YYYY")})`,
              quantity: nights,
              unit_price: Math.round(unitPrice * 100) / 100, // Làm tròn 2 chữ số thập phân
              tax_rate: 10,
            };
          }
        );

        setItems(bookingItems.length > 0 ? bookingItems : items);
      } else if (booking.total_amount > 0) {
        // If no details, use total amount as single item
        // Giả định total_amount là giá chưa bao gồm thuế (giá gốc)
        setItems([
          {
            key: "booking-total",
            item_type: "room_charge",
            description: `Đặt phòng - Mã: ${booking.code}`,
            quantity: 1,
            unit_price: booking.total_amount,
            tax_rate: 10,
          },
        ]);
      }
    } catch (error: any) {
      console.error("Lỗi khi tải thông tin booking:", error);
      toast.error("Không thể tải thông tin đặt phòng!");
    }
  };

  const handleAddService = () => {
    setItems([
      ...items,
      {
        key: Date.now().toString(),
        item_type: "service_charge",
        description: "",
        quantity: 1,
        unit_price: 0,
        tax_rate: 10,
      },
    ]);
  };

  const handleCheckSupplies = () => {
    // TODO: Mở modal/dialog để kiểm tra vật tư
    toast.info("Chức năng kiểm tra vật tư đang được phát triển");
  };

  const handleRemoveItem = (key: string) => {
    setItems(items.filter((item) => item.key !== key));
  };

  const handleItemChange = (key: string, field: string, value: any) => {
    setItems(
      items.map((item) =>
        item.key === key ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateItemTotal = (item: InvoiceItemForm) => {
    // Tính tổng phụ (chưa bao gồm thuế)
    const subtotal = item.quantity * item.unit_price;
    // Tính thuế = tổng phụ * (thuế % / 100)
    const tax = Math.round((subtotal * item.tax_rate) / 100);
    // Tổng cộng = tổng phụ + thuế
    return Math.round(subtotal + tax);
  };

  const calculateTotals = () => {
    // Tính tổng phụ (chưa bao gồm thuế) cho tất cả items
    const subtotal = items.reduce((sum, item) => {
      return sum + item.quantity * item.unit_price;
    }, 0);

    // Tính tổng thuế cho tất cả items
    const taxAmount = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unit_price;
      const itemTax = (itemSubtotal * item.tax_rate) / 100;
      return sum + itemTax;
    }, 0);

    // Tổng cộng = tổng phụ + tổng thuế
    const total = subtotal + taxAmount;

    // Làm tròn để tránh lỗi số thập phân
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  };

  const handleSubmit = async (values: any) => {
    if (items.length === 0) {
      toast.error("Vui lòng thêm ít nhất một mục hóa đơn!");
      return;
    }

    setLoading(true);
    try {
      // If booking is selected, use createFromBooking API
      if (selectedBookingId) {
        const response: any = await invoiceService.createFromBooking(
          selectedBookingId
        );
        toast.success("Tạo hóa đơn từ đặt phòng thành công!");
        const newInvoiceId =
          response?.id || response?.data?.id || response?.data?.data?.id;
        if (newInvoiceId) {
          navigate(`/admin/invoice/view/${newInvoiceId}`);
        } else {
          navigate("/admin/invoice");
        }
        return;
      }

      // Otherwise, create invoice manually
      const invoiceData: CreateInvoiceData = {
        property_id: 1, // TODO: Get from context or form
        booking_order_id: selectedBookingId || undefined,
        customer_name: values.customer_name,
        customer_email: values.customer_email,
        customer_phone: values.customer_phone,
        customer_address: values.customer_address,
        issue_date: values.issue_date.format("YYYY-MM-DD"),
        due_date: values.due_date.format("YYYY-MM-DD"),
        payment_method: values.payment_method,
        notes: values.notes,
        terms_conditions: values.terms_conditions,
        items: items.map((item) => ({
          item_type: item.item_type,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_rate: item.tax_rate,
        })),
      };

      const response: any = await invoiceService.create(invoiceData);
      toast.success("Tạo hóa đơn thành công!");
      // Tự động chuyển đến trang xem chi tiết hóa đơn vừa tạo
      const newInvoiceId =
        response?.id || response?.data?.id || response?.data?.data?.id;
      if (newInvoiceId) {
        navigate(`/admin/invoice/view/${newInvoiceId}`);
      } else {
        navigate("/admin/invoice");
      }
    } catch (error: any) {
      console.error("Lỗi khi tạo hóa đơn:", error);
      toast.error(error.response?.data?.message || "Không thể tạo hóa đơn!");
    } finally {
      setLoading(false);
    }
  };

  const itemColumns: ColumnsType<InvoiceItemForm> = [
    {
      title: "Loại",
      dataIndex: "item_type",
      width: 150,
      render: (value) => {
        const typeMap: Record<string, { color: string; text: string }> = {
          room_charge: { color: "blue", text: "Phí phòng" },
          service_charge: { color: "cyan", text: "Phí dịch vụ" },
          penalty: { color: "red", text: "Phạt" },
          other: { color: "default", text: "Khác" },
        };
        const conf = typeMap[value] || typeMap.room_charge;
        return <Tag color={conf.color}>{conf.text}</Tag>;
      },
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      render: (value) => <Text>{value || "-"}</Text>,
    },
    {
      title: "SL",
      dataIndex: "quantity",
      width: 80,
      align: "center",
      render: (value) => <Text>{value || 0}</Text>,
    },
    {
      title: "Đơn giá",
      dataIndex: "unit_price",
      width: 130,
      align: "right",
      render: (value) => <Text>{(value || 0).toLocaleString("vi-VN")}₫</Text>,
    },
    {
      title: "Thuế (%)",
      dataIndex: "tax_rate",
      width: 80,
      render: (value, record) => (
        <InputNumber
          value={value}
          onChange={(val) => handleItemChange(record.key, "tax_rate", val || 0)}
          min={0}
          max={100}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Tổng",
      key: "total",
      width: 120,
      align: "right",
      render: (_, record) => (
        <Text strong>
          {calculateItemTotal(record).toLocaleString("vi-VN")}₫
        </Text>
      ),
    },
    {
      title: "",
      key: "action",
      width: 50,
      render: (_, record) => (
        <Button
          danger
          type="text"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.key)}
          disabled={items.length === 1}
        />
      ),
    },
  ];

  const totals = calculateTotals();

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/admin/invoice")}
        >
          Quay lại
        </Button>
      </Space>

      <Card title={<Title level={3}>Tạo hóa đơn mới</Title>}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            {/* Select Booking Order */}
            <Col span={24}>
              <Divider orientation="left" style={{ marginTop: 8 }}>
                <Text strong style={{ fontSize: 16 }}>
                  🔍 Chọn đặt phòng (tùy chọn)
                </Text>
              </Divider>
              <Form.Item
                label={
                  <Text strong style={{ fontSize: 14 }}>
                    Chọn đặt phòng để tạo hóa đơn
                  </Text>
                }
                help={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Chọn một đặt phòng để tự động điền thông tin khách hàng và
                    chi tiết hóa đơn
                  </Text>
                }
              >
                <Select
                  placeholder="Chọn đặt phòng..."
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  loading={fetchingBookings}
                  value={selectedBookingId}
                  onChange={handleBookingSelect}
                  style={{ width: "100%" }}
                  size="large"
                  filterOption={(input, option: any) => {
                    const label = option?.label || "";
                    return label.toLowerCase().includes(input.toLowerCase());
                  }}
                  notFoundContent={
                    fetchingBookings ? (
                      <Spin size="small" />
                    ) : (
                      "Không tìm thấy đặt phòng"
                    )
                  }
                  optionLabelProp="label"
                  dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                >
                  {bookings.map((booking) => {
                    const displayLabel = `${
                      booking.code || `#${booking.id}`
                    } - ${booking.customer_name || "N/A"}`;
                    const shortLabel =
                      displayLabel.length > 50
                        ? displayLabel.substring(0, 50) + "..."
                        : displayLabel;
                    return (
                      <Select.Option
                        key={booking.id}
                        value={booking.id}
                        label={shortLabel}
                      >
                        <div style={{ padding: "4px 0", minHeight: 50 }}>
                          <div
                            style={{
                              fontWeight: 500,
                              marginBottom: 4,
                              fontSize: 14,
                            }}
                          >
                            {booking.code || `#${booking.id}`} -{" "}
                            {booking.customer_name || "N/A"}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#888",
                              lineHeight: 1.5,
                            }}
                          >
                            {booking.customer_phone &&
                              `${booking.customer_phone} | `}
                            Tổng:{" "}
                            {(booking.total_amount || 0).toLocaleString(
                              "vi-VN"
                            )}
                            ₫{booking.status && ` | ${booking.status}`}
                          </div>
                        </div>
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
              {selectedBooking && (
                <Card
                  style={{
                    marginBottom: 24,
                    background:
                      "linear-gradient(135deg, #f0f7ff 0%, #e6f4ff 100%)",
                    border: "1px solid #91caff",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(24, 144, 255, 0.1)",
                  }}
                  title={
                    <Space
                      style={{ width: "100%", justifyContent: "space-between" }}
                    >
                      <Space>
                        <Text strong style={{ color: "#1890ff", fontSize: 16 }}>
                          📋 Thông tin đặt phòng đã chọn
                        </Text>
                        <Tag
                          color={
                            selectedBooking.status === "confirmed"
                              ? "green"
                              : selectedBooking.status === "completed"
                              ? "blue"
                              : selectedBooking.status === "cancelled"
                              ? "red"
                              : "orange"
                          }
                        >
                          {selectedBooking.status === "confirmed"
                            ? "Đã xác nhận"
                            : selectedBooking.status === "completed"
                            ? "Hoàn thành"
                            : selectedBooking.status === "cancelled"
                            ? "Đã hủy"
                            : "Đang chờ"}
                        </Tag>
                      </Space>
                      <Button
                        size="small"
                        icon={<ReloadOutlined />}
                        onClick={() => handleBookingSelect(null)}
                      >
                        Bỏ chọn
                      </Button>
                    </Space>
                  }
                >
                  <Row gutter={[24, 16]}>
                    <Col span={24}>
                      <Space size="large" wrap>
                        <div>
                          <Text
                            type="secondary"
                            style={{ fontSize: 12, display: "block" }}
                          >
                            Mã đặt phòng
                          </Text>
                          <Text strong style={{ fontSize: 16 }}>
                            {selectedBooking.code || `#${selectedBooking.id}`}
                          </Text>
                        </div>
                        <div>
                          <Text
                            type="secondary"
                            style={{ fontSize: 12, display: "block" }}
                          >
                            Tổng tiền
                          </Text>
                          <Text
                            strong
                            style={{ color: "#1890ff", fontSize: 18 }}
                          >
                            {(selectedBooking.total_amount || 0).toLocaleString(
                              "vi-VN"
                            )}
                            ₫
                          </Text>
                        </div>
                        {selectedBooking.checkin_date &&
                          selectedBooking.checkout_date && (
                            <div>
                              <Text
                                type="secondary"
                                style={{ fontSize: 12, display: "block" }}
                              >
                                Thời gian lưu trú
                              </Text>
                              <Text>
                                {dayjs(selectedBooking.checkin_date).format(
                                  "DD/MM/YYYY"
                                )}{" "}
                                -{" "}
                                {dayjs(selectedBooking.checkout_date).format(
                                  "DD/MM/YYYY"
                                )}
                              </Text>
                            </div>
                          )}
                      </Space>
                    </Col>

                    <Col span={24}>
                      <Divider style={{ margin: "12px 0" }} />
                      <Text
                        strong
                        style={{
                          fontSize: 14,
                          display: "block",
                          marginBottom: 12,
                        }}
                      >
                        👤 Thông tin khách hàng
                      </Text>
                      <Row gutter={[16, 12]}>
                        <Col span={8}>
                          <Text
                            type="secondary"
                            style={{ fontSize: 12, display: "block" }}
                          >
                            Tên khách hàng
                          </Text>
                          <Text>{selectedBooking.customer_name || "N/A"}</Text>
                        </Col>
                        <Col span={8}>
                          <Text
                            type="secondary"
                            style={{ fontSize: 12, display: "block" }}
                          >
                            Điện thoại
                          </Text>
                          <Text>{selectedBooking.customer_phone || "N/A"}</Text>
                        </Col>
                        <Col span={8}>
                          <Text
                            type="secondary"
                            style={{ fontSize: 12, display: "block" }}
                          >
                            Email
                          </Text>
                          <Text>{selectedBooking.customer_email || "N/A"}</Text>
                        </Col>
                        {selectedBooking.payment_method && (
                          <Col span={8}>
                            <Text
                              type="secondary"
                              style={{ fontSize: 12, display: "block" }}
                            >
                              Phương thức thanh toán
                            </Text>
                            <Text>
                              {selectedBooking.payment_method === "cash"
                                ? "Tiền mặt"
                                : selectedBooking.payment_method ===
                                  "bank_transfer"
                                ? "Chuyển khoản"
                                : selectedBooking.payment_method ===
                                  "credit_card"
                                ? "Thẻ tín dụng"
                                : selectedBooking.payment_method === "e_wallet"
                                ? "Ví điện tử"
                                : selectedBooking.payment_method}
                            </Text>
                          </Col>
                        )}
                      </Row>
                    </Col>

                    {selectedBooking.details &&
                      selectedBooking.details.length > 0 && (
                        <Col span={24}>
                          <Divider style={{ margin: "12px 0" }} />
                          <Text
                            strong
                            style={{
                              fontSize: 14,
                              display: "block",
                              marginBottom: 12,
                            }}
                          >
                            🏠 Chi tiết phòng ({selectedBooking.details.length})
                          </Text>
                          <Row gutter={[12, 12]}>
                            {selectedBooking.details.map((detail, index) => {
                              const checkIn = dayjs(detail.check_in_date);
                              const checkOut = dayjs(detail.check_out_date);
                              const nights = Math.max(
                                1,
                                checkOut.diff(checkIn, "day")
                              );

                              return (
                                <Col span={24} key={detail.id || index}>
                                  <Card
                                    size="small"
                                    style={{
                                      background: "#fff",
                                      border: "1px solid #d9d9d9",
                                      borderRadius: 6,
                                    }}
                                  >
                                    <Row gutter={16} align="middle">
                                      <Col flex="auto">
                                        <Space
                                          direction="vertical"
                                          size={6}
                                          style={{ width: "100%" }}
                                        >
                                          <div>
                                            <Text
                                              strong
                                              style={{ fontSize: 15 }}
                                            >
                                              {detail.room?.name ||
                                                detail.room_name ||
                                                `Phòng ${detail.room_id}`}
                                            </Text>
                                          </div>
                                          <Space size="middle" wrap>
                                            <Text
                                              type="secondary"
                                              style={{ fontSize: 12 }}
                                            >
                                              📅 {checkIn.format("DD/MM/YYYY")}{" "}
                                              → {checkOut.format("DD/MM/YYYY")}
                                            </Text>
                                            <Text
                                              type="secondary"
                                              style={{ fontSize: 12 }}
                                            >
                                              🌙 {nights} đêm
                                            </Text>
                                            <Text
                                              type="secondary"
                                              style={{ fontSize: 12 }}
                                            >
                                              👥 {detail.num_adults} người lớn
                                              {detail.num_children > 0 &&
                                                `, ${detail.num_children} trẻ em`}
                                            </Text>
                                          </Space>
                                        </Space>
                                      </Col>
                                      <Col>
                                        <div style={{ textAlign: "right" }}>
                                          <Text
                                            strong
                                            style={{
                                              color: "#1890ff",
                                              fontSize: 16,
                                              whiteSpace: "nowrap",
                                            }}
                                          >
                                            {Number(
                                              detail.sub_total || 0
                                            ).toLocaleString("vi-VN")}{" "}
                                            ₫
                                          </Text>
                                        </div>
                                      </Col>
                                    </Row>
                                  </Card>
                                </Col>
                              );
                            })}
                          </Row>
                        </Col>
                      )}

                    {selectedBooking.notes && (
                      <Col span={24}>
                        <Divider style={{ margin: "12px 0" }} />
                        <Text
                          strong
                          style={{
                            fontSize: 14,
                            display: "block",
                            marginBottom: 8,
                          }}
                        >
                          📝 Ghi chú
                        </Text>
                        <Text style={{ color: "#595959" }}>
                          {selectedBooking.notes}
                        </Text>
                      </Col>
                    )}
                  </Row>
                </Card>
              )}
            </Col>

            {/* Customer Information */}
            <Col span={24}>
              <Divider orientation="left" style={{ marginTop: 8 }}>
                <Text strong style={{ fontSize: 16 }}>
                  👤 Thông tin khách hàng
                </Text>
              </Divider>
            </Col>
            <Col span={12}>
              <Form.Item
                name="customer_name"
                label="Tên khách hàng"
                rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
              >
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="customer_email"
                label="Email"
                rules={[{ type: "email" }]}
              >
                <Input placeholder="email@example.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="customer_phone" label="Điện thoại">
                <Input placeholder="0123456789" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="customer_address" label="Địa chỉ">
                <Input placeholder="Địa chỉ khách hàng" />
              </Form.Item>
            </Col>

            {/* Invoice Details */}
            <Col span={24}>
              <Divider orientation="left" style={{ marginTop: 8 }}>
                <Text strong style={{ fontSize: 16 }}>
                  📄 Thông tin hóa đơn
                </Text>
              </Divider>
            </Col>
            <Col span={8}>
              <Form.Item
                name="issue_date"
                label="Ngày tạo"
                initialValue={dayjs()}
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="due_date"
                label="Hạn thanh toán"
                initialValue={dayjs().add(7, "day")}
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="payment_method" label="Phương thức thanh toán">
                <Select placeholder="Chọn phương thức">
                  <Option value="cash">Tiền mặt</Option>
                  <Option value="bank_transfer">Chuyển khoản</Option>
                  <Option value="credit_card">Thẻ tín dụng</Option>
                  <Option value="e_wallet">Ví điện tử</Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Invoice Items */}
            <Col span={24}>
              <Divider orientation="left" style={{ marginTop: 8 }}>
                <Text strong style={{ fontSize: 16 }}>
                  💰 Chi tiết hóa đơn
                </Text>
              </Divider>
              <Table
                columns={itemColumns}
                dataSource={items}
                pagination={false}
                size="small"
                style={{ marginBottom: 16, marginTop: 16 }}
                bordered
              />
              <Space
                direction="vertical"
                style={{ width: "100%", marginTop: 8 }}
                size="middle"
              >
                <Button
                  type="dashed"
                  onClick={handleAddService}
                  icon={<ShoppingOutlined />}
                  block
                >
                  Thêm phí dịch vụ
                </Button>
                <Button
                  type="default"
                  onClick={handleCheckSupplies}
                  icon={<CheckCircleOutlined />}
                  block
                >
                  Kiểm tra vật tư
                </Button>
              </Space>
            </Col>

            {/* Summary */}
            <Col span={24}>
              <Row justify="end" style={{ marginTop: 24 }}>
                <Col span={8}>
                  <Card
                    size="small"
                    style={{
                      background:
                        "linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)",
                      border: "1px solid #d9d9d9",
                      borderRadius: 8,
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
                        <Text type="secondary">Tổng phụ:</Text>
                        <Text strong>
                          {totals.subtotal.toLocaleString("vi-VN")}₫
                        </Text>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text type="secondary">Thuế:</Text>
                        <Text strong>
                          {totals.taxAmount.toLocaleString("vi-VN")}₫
                        </Text>
                      </div>
                      <Divider style={{ margin: "4px 0" }} />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          paddingTop: 8,
                          borderTop: "2px solid #1890ff",
                        }}
                      >
                        <Text strong style={{ fontSize: 16 }}>
                          Tổng cộng:
                        </Text>
                        <Text strong style={{ fontSize: 20, color: "#1890ff" }}>
                          {totals.total.toLocaleString("vi-VN")}₫
                        </Text>
                      </div>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </Col>

            {/* Notes & Terms */}
            <Col span={12}>
              <Form.Item name="notes" label="Ghi chú">
                <TextArea rows={3} placeholder="Ghi chú thêm..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="terms_conditions" label="Điều khoản">
                <TextArea rows={3} placeholder="Điều khoản và điều kiện..." />
              </Form.Item>
            </Col>

            {/* Submit */}
            <Col span={24}>
              <Divider />
              <Space>
                <Button onClick={() => navigate("/admin/invoice")}>Hủy</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                >
                  Tạo hóa đơn
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default AddInvoice;
