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
  Modal,
  Form,
  InputNumber,
  Input,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  FilePdfOutlined,
  PlusOutlined,
  DeleteOutlined,
  ShoppingOutlined,
  WarningOutlined,
  SplitCellsOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import invoiceService from "../../../service/invoiceService";
import serviceService, { type Service } from "../../../service/serviceService";
import supplyService, { type Supply } from "../../../service/supplyService";
import type { Invoice, InvoiceItem } from "../../../types/invoice/invoice";

const { Title, Text } = Typography;

const ViewInvoice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [addServiceModalVisible, setAddServiceModalVisible] = useState(false);
  const [addDamageModalVisible, setAddDamageModalVisible] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingSupplies, setLoadingSupplies] = useState(false);
  const [serviceForm] = Form.useForm();
  const [damageForm] = Form.useForm();

  useEffect(() => {
    if (id) {
      fetchInvoice();
      fetchServices();
      fetchSupplies();
    }
  }, [id]);

  const fetchServices = async () => {
    try {
      setLoadingServices(true);
      // Chỉ fetch services cần thiết, không cần tất cả
      const data = await serviceService.getAll({ property_id: invoice?.property_id });
      setServices(Array.isArray(data) ? data : []);
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error("Error fetching services:", error);
      }
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchSupplies = async () => {
    try {
      setLoadingSupplies(true);
      // Chỉ fetch supplies cần thiết
      const data = await supplyService.getAll();
      setSupplies(Array.isArray(data) ? data : []);
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error("Error fetching supplies:", error);
      }
    } finally {
      setLoadingSupplies(false);
    }
  };

  const fetchInvoice = async () => {
    if (!id) return;
    setLoading(true);
    try {
      // Gọi API với include parameter để load invoiceItems
      const response: any = await invoiceService.getById(id, 'bookingOrder,bookingOrder.guest,invoiceItems');
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
      
      // Map invoice_items từ backend (snake_case) thành items cho frontend
      if ((invoiceData as any).invoice_items && !invoiceData.items) {
        invoiceData.items = (invoiceData as any).invoice_items;
      }
      // Hoặc nếu backend trả về invoiceItems (camelCase)
      if ((invoiceData as any).invoiceItems && !invoiceData.items) {
        invoiceData.items = (invoiceData as any).invoiceItems;
      }
      
      // Map status từ backend thành invoice_status và payment_status nếu chưa có
      if (!invoiceData.invoice_status && (invoiceData as any).status) {
        const status = (invoiceData as any).status;
        const statusMap: Record<string, { invoice_status: string; payment_status: string }> = {
          'pending': { invoice_status: 'sent', payment_status: 'pending' },
          'paid': { invoice_status: 'paid', payment_status: 'paid' },
          'overdue': { invoice_status: 'sent', payment_status: 'overdue' },
          'cancelled': { invoice_status: 'cancelled', payment_status: 'cancelled' },
        };
        const mapped = statusMap[status] || { invoice_status: 'sent', payment_status: 'pending' };
        invoiceData.invoice_status = mapped.invoice_status as any;
        invoiceData.payment_status = mapped.payment_status as any;
      }
      
      setInvoice(invoiceData);
    } catch (error: any) {
      console.error("Lỗi khi tải hóa đơn:", error);
      toast.error(error.response?.data?.message || "Không thể tải thông tin hóa đơn!");
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
      toast.error(error.response?.data?.message || "Không thể cập nhật trạng thái!");
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

  const handleAddService = async (values: any) => {
    if (!invoice || !id) return;
    try {
      await invoiceService.addService(id, {
        service_id: Number(values.service_id),
        quantity: Number(values.quantity),
        description: values.description || undefined,
      });
      message.success("Đã thêm dịch vụ vào hóa đơn!");
      setAddServiceModalVisible(false);
      serviceForm.resetFields();
      fetchInvoice();
    } catch (error: any) {
      console.error("Error adding service:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.service_id?.[0] ||
                          error.response?.data?.errors?.quantity?.[0] ||
                          "Không thể thêm dịch vụ!";
      message.error(errorMessage);
    }
  };

  const handleAddDamage = async (values: any) => {
    if (!invoice || !id) return;
    try {
      await invoiceService.addDamage(id, {
        supply_id: Number(values.supply_id),
        quantity: Number(values.quantity),
        description: values.description || undefined,
        notes: values.notes || undefined,
      });
      message.success("Đã thêm thiệt hại vào hóa đơn!");
      setAddDamageModalVisible(false);
      damageForm.resetFields();
      fetchInvoice();
    } catch (error: any) {
      console.error("Error adding damage:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.supply_id?.[0] ||
                          error.response?.data?.errors?.quantity?.[0] ||
                          "Không thể thêm thiệt hại!";
      message.error(errorMessage);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!invoice || !id) return;
    try {
      await invoiceService.removeItem(id, itemId);
      message.success("Đã xóa item khỏi hóa đơn!");
      fetchInvoice();
    } catch (error: any) {
      console.error("Error removing item:", error);
      message.error(error.response?.data?.message || "Không thể xóa item!");
    }
  };

  const handleSplitByRooms = async () => {
    if (!invoice || !id) return;
    
    Modal.confirm({
      title: 'Xác nhận tách hóa đơn',
      content: 'Bạn có chắc chắn muốn tách hóa đơn này theo phòng? Mỗi phòng sẽ có một hóa đơn riêng. Hóa đơn gốc sẽ bị hủy.',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setLoading(true);
          const result = await invoiceService.splitByRooms(id);
          message.success(`Đã tách hóa đơn thành ${result.total_split} hóa đơn theo phòng!`);
          // Chuyển về trang danh sách hóa đơn
          navigate('/admin/invoice');
        } catch (error: any) {
          console.error("Error splitting invoice:", error);
          message.error(error.response?.data?.message || "Không thể tách hóa đơn!");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Kiểm tra xem hóa đơn có thể tách được không (có nhiều hơn 1 phòng)
  const canSplitByRooms = () => {
    if (!invoice || !invoice.booking_order) return false;
    // Kiểm tra xem có nhiều hơn 1 phòng không
    const bookingOrder = invoice.booking_order as any;
    const details = bookingOrder.details || [];
    return details.length > 1 && invoice.invoice_status !== 'cancelled';
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
          service_charge: { color: "cyan", text: "Dịch vụ" },
          damage_fee: { color: "red", text: "Thiệt hại" },
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
      render: (price: number, record: InvoiceItem) => {
        const isPaid = record.description?.includes("[Đã thanh toán]");
        return (
          <Typography.Text
            style={{
              textDecoration: isPaid ? "line-through" : "none",
              color: isPaid ? "#8c8c8c" : "inherit",
              opacity: isPaid ? 0.6 : 1,
            }}
          >
            {(price || 0).toLocaleString("vi-VN")}₫
          </Typography.Text>
        );
      },
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
      render: (total: number, record: InvoiceItem) => {
        const amount = total || record.total_line || 0;
        const isPaid = record.description?.includes("[Đã thanh toán]");
        return (
          <Typography.Text
            strong
            style={{
              color: isPaid ? "#8c8c8c" : "#52c41a",
              textDecoration: isPaid ? "line-through" : "none",
              opacity: isPaid ? 0.6 : 1,
            }}
          >
            {amount.toLocaleString("vi-VN")}₫
            {isPaid && (
              <span style={{ marginLeft: 8, fontSize: 12, color: "#52c41a" }}>
                (Đã thanh toán)
              </span>
            )}
          </Typography.Text>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => {
        // Chỉ cho phép xóa nếu invoice chưa thanh toán và không phải room_charge
        if (invoice?.payment_status === "paid" || record.item_type === "room_charge") {
          return null;
        }
        return (
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa item này?"
            onConfirm={() => handleRemoveItem(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Xóa
            </Button>
          </Popconfirm>
        );
      },
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
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/admin/invoice")}>
            Quay lại
          </Button>
          <Button icon={<PrinterOutlined />} onClick={handlePrint}>
            In hóa đơn
          </Button>
          <Button icon={<FilePdfOutlined />}>Xuất PDF</Button>
          {canSplitByRooms() && (
            <Popconfirm
              title="Tách hóa đơn theo phòng"
              description="Mỗi phòng sẽ có một hóa đơn riêng. Hóa đơn gốc sẽ bị hủy. Bạn có chắc chắn?"
              onConfirm={handleSplitByRooms}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <Button 
                icon={<SplitCellsOutlined />} 
                type="default"
                danger
              >
                Tách hóa đơn theo phòng
              </Button>
            </Popconfirm>
          )}
          
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

          {/* Xác nhận sẵn sàng thanh toán (Admin/Staff) */}
          {invoice.payment_status !== "paid" && invoice.invoice_status !== "cancelled" && (
            <Button 
              type="primary" 
              icon={<CheckCircleOutlined />} 
              onClick={async () => {
                if (!invoice || !id) return;
                try {
                  await invoiceService.approveForPayment(id);
                  message.success("Đã xác nhận hóa đơn sẵn sàng thanh toán!");
                  fetchInvoice();
                } catch (error: any) {
                  message.error(error.response?.data?.message || "Không thể xác nhận!");
                }
              }}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              Xác nhận sẵn sàng thanh toán
            </Button>
          )}

          {/* Đánh dấu đã thanh toán (Admin/Staff) */}
          {invoice.payment_status !== "paid" && invoice.invoice_status !== "cancelled" && (
            <Button 
              type="primary" 
              icon={<CheckCircleOutlined />} 
              onClick={handleMarkAsPaid}
            >
              Đánh dấu đã thanh toán
            </Button>
          )}

          {/* Hủy hóa đơn */}
          {invoice.invoice_status !== "cancelled" && invoice.invoice_status !== "paid" && (
            <Popconfirm
              title="Xác nhận hủy hóa đơn"
              description="Bạn có chắc chắn muốn hủy hóa đơn này? Hành động này không thể hoàn tác."
              onConfirm={handleCancelInvoice}
              okText="Hủy"
              cancelText="Không"
              okType="danger"
            >
              <Button danger>
                Hủy hóa đơn
              </Button>
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
              <Text type="secondary" style={{ marginRight: 8 }}>Trạng thái:</Text>
              {getInvoiceStatusTag(invoice.invoice_status)}
            </div>
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary" style={{ marginRight: 8 }}>Thanh toán:</Text>
              {getPaymentStatusTag(invoice.payment_status)}
            </div>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">Ngày tạo:</Text>
              <br />
              <Text strong>{dayjs(invoice.issue_date).format("DD/MM/YYYY")}</Text>
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
              <Descriptions.Item label="Email">{invoice.customer_email || "-"}</Descriptions.Item>
              <Descriptions.Item label="Điện thoại">{invoice.customer_phone || "-"}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">{invoice.customer_address || "-"}</Descriptions.Item>
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>Chi tiết hóa đơn</Title>
          {invoice.payment_status !== "paid" && invoice.invoice_status !== "cancelled" && (
            <Space>
              <Button
                type="primary"
                icon={<ShoppingOutlined />}
                onClick={() => setAddServiceModalVisible(true)}
              >
                Thêm dịch vụ
              </Button>
              <Button
                type="primary"
                danger
                icon={<WarningOutlined />}
                onClick={() => setAddDamageModalVisible(true)}
              >
                Thêm thiệt hại
              </Button>
            </Space>
          )}
        </div>
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
        />

        <Divider />

        {/* Summary */}
        <Row justify="end">
          <Col span={8}>
            <div style={{ padding: 16, background: "#fafafa", borderRadius: 8 }}>
              <Space direction="vertical" style={{ width: "100%" }} size="small">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text>Tổng phụ:</Text>
                  <Text>{(invoice.subtotal || 0).toLocaleString("vi-VN")}₫</Text>
                </div>
                {(invoice.discount_amount || 0) > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#52c41a" }}>
                    <Text>Giảm giá:</Text>
                    <Text>-{(invoice.discount_amount || 0).toLocaleString("vi-VN")}₫</Text>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text>Thuế ({invoice.tax_rate || 0}%):</Text>
                  <Text>{(invoice.tax_amount || 0).toLocaleString("vi-VN")}₫</Text>
                </div>
                <Divider style={{ margin: "8px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text strong style={{ fontSize: 16 }}>
                    Tổng cộng:
                  </Text>
                  <Text strong style={{ fontSize: 18, color: "#1890ff" }}>
                    {(invoice.total_amount || 0).toLocaleString("vi-VN")}₫
                  </Text>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text>Đã thanh toán:</Text>
                  <Text style={{ color: "#52c41a" }}>
                    {(invoice.paid_amount || 0).toLocaleString("vi-VN")}₫
                  </Text>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text strong>Còn lại:</Text>
                  <Text strong style={{ color: (invoice.balance || 0) > 0 ? "#ff4d4f" : "#52c41a" }}>
                    {(invoice.balance || 0).toLocaleString("vi-VN")}₫
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
              <div style={{ marginTop: 8, padding: 12, background: "#f5f5f5", borderRadius: 4 }}>
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

      {/* Modal thêm dịch vụ */}
      <Modal
        title={
          <Space>
            <ShoppingOutlined />
            <span>Thêm dịch vụ vào hóa đơn</span>
          </Space>
        }
        open={addServiceModalVisible}
        onCancel={() => {
          setAddServiceModalVisible(false);
          serviceForm.resetFields();
        }}
        onOk={() => serviceForm.submit()}
        okText="Thêm"
        cancelText="Hủy"
        width={600}
      >
        <Form
          form={serviceForm}
          layout="vertical"
          onFinish={handleAddService}
        >
          <Form.Item
            name="service_id"
            label="Dịch vụ"
            rules={[{ required: true, message: "Vui lòng chọn dịch vụ" }]}
          >
            <Select
              placeholder="Chọn dịch vụ"
              loading={loadingServices}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
            >
              {services.map((service) => (
                <Select.Option key={service.id} value={service.id} label={service.name}>
                  {service.name} - {service.price.toLocaleString("vi-VN")}₫/{service.unit}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng" },
              { type: "number", min: 1, message: "Số lượng phải lớn hơn 0" },
            ]}
          >
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              placeholder="Nhập số lượng"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả (tùy chọn)"
          >
            <Input.TextArea rows={3} placeholder="Nhập mô tả nếu có" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal thêm thiệt hại */}
      <Modal
        title={
          <Space>
            <WarningOutlined />
            <span>Thêm thiệt hại vật tư vào hóa đơn</span>
          </Space>
        }
        open={addDamageModalVisible}
        onCancel={() => {
          setAddDamageModalVisible(false);
          damageForm.resetFields();
        }}
        onOk={() => damageForm.submit()}
        okText="Thêm"
        cancelText="Hủy"
        width={600}
      >
        <Form
          form={damageForm}
          layout="vertical"
          onFinish={handleAddDamage}
        >
          <Form.Item
            name="supply_id"
            label="Vật tư bị thiệt hại"
            rules={[{ required: true, message: "Vui lòng chọn vật tư" }]}
          >
            <Select
              placeholder="Chọn vật tư"
              loading={loadingSupplies}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
            >
              {supplies.map((supply) => (
                <Select.Option key={supply.id} value={supply.id} label={supply.name}>
                  {supply.name} - {supply.unit_price?.toLocaleString("vi-VN")}₫/{supply.unit || "cái"}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Số lượng thiệt hại"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng" },
              { type: "number", min: 1, message: "Số lượng phải lớn hơn 0" },
            ]}
          >
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              placeholder="Nhập số lượng thiệt hại"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả thiệt hại (tùy chọn)"
          >
            <Input.TextArea rows={2} placeholder="Mô tả chi tiết thiệt hại" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú (tùy chọn)"
          >
            <Input.TextArea rows={2} placeholder="Ghi chú thêm về thiệt hại" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ViewInvoice;



