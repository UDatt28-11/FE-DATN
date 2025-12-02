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
  Select,
  Divider,
  Table,
  Typography,
  Spin,
  Tag,
  Alert,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import invoiceService from "../../../service/invoiceService";
import type {
  UpdateInvoiceData,
  Invoice,
  InvoiceItem,
} from "../../../types/invoice/invoice";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface InvoiceItemForm {
  key: string;
  id?: number;
  item_type: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
}

const EditInvoice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [items, setItems] = useState<InvoiceItemForm[]>([]);

  useEffect(() => {
    if (id) {
      fetchInvoice();
    }
  }, [id]);

  const fetchInvoice = async () => {
    if (!id) return;
    setFetching(true);
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

      // Set form values
      form.setFieldsValue({
        customer_name: invoiceData.customer_name,
        customer_email: invoiceData.customer_email,
        customer_phone: invoiceData.customer_phone,
        customer_address: invoiceData.customer_address,
        issue_date: invoiceData.issue_date
          ? dayjs(invoiceData.issue_date)
          : dayjs(),
        due_date: invoiceData.due_date
          ? dayjs(invoiceData.due_date)
          : dayjs().add(7, "day"),
        payment_method: invoiceData.payment_method,
        notes: invoiceData.notes,
        terms_conditions: invoiceData.terms_conditions,
      });

      // Set items
      if (invoiceData.items && Array.isArray(invoiceData.items)) {
        setItems(
          invoiceData.items.map((item: InvoiceItem, index: number) => ({
            key: item.id?.toString() || `item-${index}`,
            id: item.id,
            item_type: item.item_type || "room_charge",
            description: item.description || "",
            quantity: item.quantity || 1,
            unit_price: item.unit_price || 0,
            tax_rate: item.tax_rate || 10,
          }))
        );
      } else {
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
      }
    } catch (error: any) {
      console.error("Lỗi khi tải hóa đơn:", error);
      toast.error(
        error.response?.data?.message || "Không thể tải thông tin hóa đơn!"
      );
      navigate("/admin/invoice");
    } finally {
      setFetching(false);
    }
  };

  const calculateItemTotal = (item: InvoiceItemForm) => {
    const subtotal = item.quantity * item.unit_price;
    const tax = (subtotal * item.tax_rate) / 100;
    return subtotal + tax;
  };

  const calculateTotals = () => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
    const taxAmount = items.reduce(
      (sum, item) =>
        sum + (item.quantity * item.unit_price * item.tax_rate) / 100,
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

    if (!id) {
      toast.error("Không tìm thấy ID hóa đơn!");
      return;
    }

    setLoading(true);
    try {
      const invoiceData: UpdateInvoiceData = {
        customer_name: values.customer_name,
        customer_email: values.customer_email,
        customer_phone: values.customer_phone,
        customer_address: values.customer_address,
        due_date: values.due_date.format("YYYY-MM-DD"),
        payment_method: values.payment_method,
        notes: values.notes,
        terms_conditions: values.terms_conditions,
      };

      await invoiceService.update(id, invoiceData);
      toast.success("Cập nhật hóa đơn thành công!");
      navigate(`/admin/invoice/view/${id}`);
    } catch (error: any) {
      console.error("Lỗi khi cập nhật hóa đơn:", error);
      toast.error(
        error.response?.data?.message || "Không thể cập nhật hóa đơn!"
      );
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
          service_charge: { color: "cyan", text: "Dịch vụ" },
          penalty: { color: "red", text: "Phạt" },
          other: { color: "default", text: "Khác" },
        };
        const conf = typeMap[value] || typeMap.other;
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
      align: "center",
      render: (value) => <Text>{value || 0}%</Text>,
    },
    {
      title: "Tổng",
      key: "total",
      width: 120,
      align: "right",
      render: (_, record) => (
        <Text strong style={{ color: "#52c41a" }}>
          {calculateItemTotal(record).toLocaleString("vi-VN")}₫
        </Text>
      ),
    },
  ];

  const totals = calculateTotals();

  if (fetching) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

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

      <Card title={<Title level={3}>Chỉnh sửa hóa đơn</Title>}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
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
              <Divider orientation="left">Thông tin hóa đơn</Divider>
            </Col>
            <Col span={8}>
              <Form.Item
                name="issue_date"
                label="Ngày tạo"
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="due_date"
                label="Hạn thanh toán"
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
              <Alert
                message="Chi tiết hóa đơn không thể chỉnh sửa"
                description="Các mục trong chi tiết hóa đơn chỉ có thể xem, không thể chỉnh sửa hoặc xóa."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Table
                columns={itemColumns}
                dataSource={items}
                pagination={false}
                size="small"
                style={{ marginBottom: 16 }}
                bordered
              />
            </Col>

            {/* Summary */}
            <Col span={24}>
              <Row justify="end" style={{ marginTop: 24 }}>
                <Col span={8}>
                  <Card size="small" style={{ background: "#fafafa" }}>
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text>Tổng phụ:</Text>
                        <Text strong>
                          {totals.subtotal.toLocaleString("vi-VN")}₫
                        </Text>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text>Thuế:</Text>
                        <Text strong>
                          {totals.taxAmount.toLocaleString("vi-VN")}₫
                        </Text>
                      </div>
                      <Divider style={{ margin: "8px 0" }} />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
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
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                >
                  Cập nhật hóa đơn
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default EditInvoice;
