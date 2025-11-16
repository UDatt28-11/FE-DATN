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
  Alert,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { ArrowLeftOutlined, SaveOutlined, PlusOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import invoiceService from "../../../service/invoiceService";
import { listBookings, getBooking, type BookingOrder } from "../../../service/bookingService";
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
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingOrder | null>(null);
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
        const bookingItems: InvoiceItemForm[] = booking.details.map((detail, index) => {
          const checkIn = dayjs(detail.check_in_date);
          const checkOut = dayjs(detail.check_out_date);
          const nights = Math.max(1, checkOut.diff(checkIn, "day"));
          const roomName = detail.room?.name || detail.room_name || `Phòng ${detail.room_id}`;
          const unitPrice = nights > 0 ? detail.sub_total / nights : detail.sub_total;

          return {
            key: `booking-${detail.id}-${index}`,
            item_type: "room_charge",
            description: `${roomName} - ${nights} đêm (${checkIn.format("DD/MM/YYYY")} - ${checkOut.format("DD/MM/YYYY")})`,
            quantity: nights,
            unit_price: unitPrice,
            tax_rate: 10,
          };
        });

        setItems(bookingItems.length > 0 ? bookingItems : items);
      } else if (booking.total_amount > 0) {
        // If no details, use total amount as single item
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

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        key: Date.now().toString(),
        item_type: "room_charge",
        description: "",
        quantity: 1,
        unit_price: 0,
        tax_rate: 10,
      },
    ]);
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
    const subtotal = item.quantity * item.unit_price;
    const tax = (subtotal * item.tax_rate) / 100;
    return subtotal + tax;
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const taxAmount = items.reduce(
      (sum, item) => sum + (item.quantity * item.unit_price * item.tax_rate) / 100,
      0
    );
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
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
        const response: any = await invoiceService.createFromBooking(selectedBookingId);
        toast.success("Tạo hóa đơn từ đặt phòng thành công!");
        const newInvoiceId = response?.id || response?.data?.id || response?.data?.data?.id;
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
      const newInvoiceId = response?.id || response?.data?.id || response?.data?.data?.id;
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
      render: (value, record) => (
        <Select
          value={value}
          onChange={(val) => handleItemChange(record.key, "item_type", val)}
          style={{ width: "100%" }}
        >
          <Option value="room_charge">Phí phòng</Option>
          <Option value="service_charge">Dịch vụ</Option>
          <Option value="penalty">Phạt</Option>
          <Option value="other">Khác</Option>
        </Select>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      render: (value, record) => (
        <Input
          value={value}
          onChange={(e) => handleItemChange(record.key, "description", e.target.value)}
          placeholder="Mô tả..."
        />
      ),
    },
    {
      title: "SL",
      dataIndex: "quantity",
      width: 80,
      render: (value, record) => (
        <InputNumber
          value={value}
          onChange={(val) => handleItemChange(record.key, "quantity", val || 1)}
          min={1}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "unit_price",
      width: 130,
      render: (value, record) => (
        <InputNumber
          value={value}
          onChange={(val) => handleItemChange(record.key, "unit_price", val || 0)}
          min={0}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          style={{ width: "100%" }}
        />
      ),
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
        <Text strong>{calculateItemTotal(record).toLocaleString("vi-VN")}₫</Text>
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
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/admin/invoice")}>
          Quay lại
        </Button>
      </Space>

      <Card title={<Title level={3}>Tạo hóa đơn mới</Title>}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            {/* Select Booking Order */}
            <Col span={24}>
              <Divider orientation="left">Chọn đặt phòng (tùy chọn)</Divider>
              <Form.Item
                label="Chọn đặt phòng để tạo hóa đơn"
                help="Chọn một đặt phòng để tự động điền thông tin khách hàng và chi tiết hóa đơn"
              >
                <Select
                  placeholder="Chọn đặt phòng..."
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  loading={fetchingBookings}
                  value={selectedBookingId}
                  onChange={handleBookingSelect}
                  style={{ width: "100%" }}
                  filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                  notFoundContent={fetchingBookings ? <Spin size="small" /> : "Không tìm thấy đặt phòng"}
                >
                  {bookings.map((booking) => (
                    <Select.Option
                      key={booking.id}
                      value={booking.id}
                      label={`${booking.code || booking.id} - ${booking.customer_name || "N/A"} - ${(booking.total_amount || 0).toLocaleString("vi-VN")}₫`}
                    >
                      <div>
                        <div style={{ fontWeight: 500 }}>
                          {booking.code || `#${booking.id}`} - {booking.customer_name || "N/A"}
                        </div>
                        <div style={{ fontSize: 12, color: "#888" }}>
                          {booking.customer_phone || ""} | Tổng: {(booking.total_amount || 0).toLocaleString("vi-VN")}₫ | {booking.status || "N/A"}
                        </div>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              {selectedBooking && (
                <Alert
                  message={`Đã chọn đặt phòng: ${selectedBooking.code}`}
                  description={`Khách hàng: ${selectedBooking.customer_name || "N/A"} | Tổng tiền: ${(selectedBooking.total_amount || 0).toLocaleString("vi-VN")}₫`}
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                  action={
                    <Button
                      size="small"
                      icon={<ReloadOutlined />}
                      onClick={() => handleBookingSelect(null)}
                    >
                      Bỏ chọn
                    </Button>
                  }
                />
              )}
            </Col>

            {/* Customer Information */}
            <Col span={24}>
              <Divider orientation="left">Thông tin khách hàng</Divider>
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
              <Form.Item name="customer_email" label="Email" rules={[{ type: "email" }]}>
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
              <Divider orientation="left">Thông tin hóa đơn</Divider>
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
              <Divider orientation="left">Chi tiết hóa đơn</Divider>
              <Table
                columns={itemColumns}
                dataSource={items}
                pagination={false}
                size="small"
                style={{ marginBottom: 16 }}
              />
              <Button type="dashed" onClick={handleAddItem} icon={<PlusOutlined />} block>
                Thêm mục
              </Button>
            </Col>

            {/* Summary */}
            <Col span={24}>
              <Row justify="end" style={{ marginTop: 24 }}>
                <Col span={8}>
                  <Card size="small" style={{ background: "#fafafa" }}>
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Text>Tổng phụ:</Text>
                        <Text strong>{totals.subtotal.toLocaleString("vi-VN")}₫</Text>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Text>Thuế:</Text>
                        <Text strong>{totals.taxAmount.toLocaleString("vi-VN")}₫</Text>
                      </div>
                      <Divider style={{ margin: "8px 0" }} />
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Text strong style={{ fontSize: 16 }}>
                          Tổng cộng:
                        </Text>
                        <Text strong style={{ fontSize: 18, color: "#1890ff" }}>
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
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
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



