import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Descriptions,
  Tag,
  Space,
  Button,
  Spin,
  Table,
  Divider,
  Tabs,
  Modal,
  Form,
  InputNumber,
  Select,
  Input,
  Popconfirm,
  message,
  Row,
  Col,
  Typography,
} from "antd";
import { toast } from "react-toastify";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  PhoneOutlined,
  CalendarOutlined,
  DollarOutlined,
  HomeOutlined,
  UserOutlined,
  MailOutlined,
  LoginOutlined,
  FileTextOutlined,
  PlusOutlined,
  DeleteOutlined,
  ShoppingOutlined,
  WarningOutlined,
  PrinterOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import { Alert } from "antd";
import dayjs from "dayjs";

import type {
  BookingOrder,
  BookingDetail,
} from "../../../types/booking/booking";
import { getBooking } from "../../../service/bookingService";
import AdminCheckInModal from "../../../components/Booking/AdminCheckInModal";
import AdminCheckoutModal from "../../../components/Booking/AdminCheckoutModal";
import invoiceService from "../../../service/invoiceService";
import serviceService, { type Service } from "../../../service/serviceService";
import supplyService, { type Supply } from "../../../service/supplyService";
import type { Invoice, InvoiceItem } from "../../../types/invoice/invoice";

const ViewBooking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkInModalVisible, setCheckInModalVisible] = useState(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);

  // State cho quản lý invoices của booking hiện tại
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [addServiceModalVisible, setAddServiceModalVisible] = useState(false);
  const [addDamageModalVisible, setAddDamageModalVisible] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingSupplies, setLoadingSupplies] = useState(false);
  const [serviceForm] = Form.useForm();
  const [damageForm] = Form.useForm();

  // Load dữ liệu booking khi component mount hoặc id thay đổi
  useEffect(() => {
    if (id) {
      fetchBookingDetail(parseInt(id));
    }
  }, [id]); // Dependency array: re-run khi id thay đổi

  const fetchBookingDetail = async (bookingId: number) => {
    try {
      setLoading(true);
      // Include thêm room, roomType
      // Lưu ý: Không include 'invoices' vì BookingOrderResource có thể gây lỗi khi truy cập invoiceItems/payments chưa được load
      // ViewInvoiceModal sẽ tự fetch invoice khi mở modal
      const data = await getBooking(
        bookingId,
        "details,details.room,details.room.roomType,details.guests"
      );
      
      // Đảm bảo details được set đúng
      if (data.bookingDetails && !data.details) {
        data.details = data.bookingDetails;
      }
      
      setBooking(data);
      
      // Fetch invoices của booking này
      if (data.id) {
        fetchInvoices(data.id);
      }
    } catch (error: any) {
      console.error("Error fetching booking:", error);
      toast.error("Không thể tải thông tin đặt phòng");
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch invoices của booking
  const fetchInvoices = async (bookingId: number) => {
    setLoadingInvoices(true);
    try {
      // Backend hiện chưa hỗ trợ filter booking_order_id trực tiếp,
      // nên lấy toàn bộ rồi lọc theo booking_order_id ở FE
      const allInvoices = await invoiceService.getAll();
      const filtered = allInvoices.filter(
        (inv: Invoice) => inv.booking_order_id === bookingId
      );
      
      // Nếu có invoice, fetch chi tiết với invoiceItems
      if (filtered.length > 0) {
        const invoiceDetail = await invoiceService.getById(filtered[0].id, 'bookingOrder,bookingOrder.guest,invoiceItems,payments');
        // Map invoice_items từ backend thành items
        if ((invoiceDetail as any).invoice_items && !invoiceDetail.items) {
          invoiceDetail.items = (invoiceDetail as any).invoice_items;
        }
        if ((invoiceDetail as any).invoiceItems && !invoiceDetail.items) {
          invoiceDetail.items = (invoiceDetail as any).invoiceItems;
        }
        setInvoices([invoiceDetail]);
      } else {
        setInvoices([]);
      }
    } catch (error: any) {
      console.error("Error fetching invoices:", error);
      toast.error("Không thể tải danh sách hóa đơn");
    } finally {
      setLoadingInvoices(false);
    }
  };
  
  // Fetch services và supplies
  const fetchServicesAndSupplies = async () => {
    try {
      setLoadingServices(true);
      const servicesData = await serviceService.getAll({ property_id: booking?.property_id });
      setServices(Array.isArray(servicesData) ? servicesData : []);
    } catch (error: any) {
      console.error("Error fetching services:", error);
    } finally {
      setLoadingServices(false);
    }
    
    try {
      setLoadingSupplies(true);
      const suppliesData = await supplyService.getAll();
      setSupplies(Array.isArray(suppliesData) ? suppliesData : []);
    } catch (error: any) {
      console.error("Error fetching supplies:", error);
    } finally {
      setLoadingSupplies(false);
    }
  };
  
  // Tạo invoice mới từ booking
  const handleCreateInvoice = async () => {
    if (!booking?.id) return;
    try {
      await invoiceService.createFromBooking(booking.id);
      toast.success("Đã tạo hóa đơn mới!");
      if (booking.id) {
        fetchInvoices(booking.id);
      }
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      toast.error(error.response?.data?.message || "Không thể tạo hóa đơn!");
    }
  };

  // Xóa invoice
  const handleDeleteInvoice = async (invoiceId: number) => {
    try {
      await invoiceService.remove(invoiceId);
      toast.success("Đã xóa hóa đơn!");
      if (booking?.id) {
        fetchInvoices(booking.id);
      }
    } catch (error: any) {
      console.error("Error deleting invoice:", error);
      toast.error(error.response?.data?.message || "Không thể xóa hóa đơn!");
    }
  };

  // Mark invoice as paid
  const handleMarkAsPaid = async (invoiceId: number) => {
    try {
      await invoiceService.markAsPaid(invoiceId, {
        payment_date: dayjs().format("YYYY-MM-DD"),
        payment_method: invoices[0]?.payment_method || "cash",
      });
      message.success("Đã đánh dấu thanh toán!");
      if (booking?.id) {
        fetchInvoices(booking.id);
      }
    } catch (error: any) {
      console.error("Error marking as paid:", error);
      message.error(error.response?.data?.message || "Không thể cập nhật!");
    }
  };
  
  // Add service to invoice
  const handleAddService = async (values: any) => {
    if (!invoices || invoices.length === 0) return;
    const invoiceId = invoices[0].id;
    try {
      await invoiceService.addService(invoiceId, {
        service_id: Number(values.service_id),
        quantity: Number(values.quantity),
        description: values.description || undefined,
      });
      message.success("Đã thêm dịch vụ vào hóa đơn!");
      setAddServiceModalVisible(false);
      serviceForm.resetFields();
      if (booking?.id) {
        fetchInvoices(booking.id);
      }
    } catch (error: any) {
      console.error("Error adding service:", error);
      message.error(error.response?.data?.message || "Không thể thêm dịch vụ!");
    }
  };
  
  // Add damage to invoice
  const handleAddDamage = async (values: any) => {
    if (!invoices || invoices.length === 0) return;
    const invoiceId = invoices[0].id;
    try {
      await invoiceService.addDamage(invoiceId, {
        supply_id: Number(values.supply_id),
        quantity: Number(values.quantity),
        description: values.description || undefined,
        notes: values.notes || undefined,
      });
      message.success("Đã thêm thiệt hại vào hóa đơn!");
      setAddDamageModalVisible(false);
      damageForm.resetFields();
      if (booking?.id) {
        fetchInvoices(booking.id);
      }
    } catch (error: any) {
      console.error("Error adding damage:", error);
      message.error(error.response?.data?.message || "Không thể thêm thiệt hại!");
    }
  };
  
  // Remove item from invoice
  const handleRemoveItem = async (invoiceId: number, itemId: number) => {
    try {
      await invoiceService.removeItem(invoiceId, itemId);
      message.success("Đã xóa item khỏi hóa đơn!");
      if (booking?.id) {
        fetchInvoices(booking.id);
      }
    } catch (error: any) {
      console.error("Error removing item:", error);
      message.error(error.response?.data?.message || "Không thể xóa item!");
    }
  };
  
  // Update invoice status
  const handleUpdateInvoiceStatus = async (invoiceId: number, status: Invoice["invoice_status"]) => {
    try {
      await invoiceService.updateStatus(invoiceId, status);
      toast.success("Đã cập nhật trạng thái!");
      if (booking?.id) {
        fetchInvoices(booking.id);
      }
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error(error.response?.data?.message || "Không thể cập nhật trạng thái!");
    }
  };
  
  // Cancel invoice
  const handleCancelInvoice = async (invoiceId: number) => {
    try {
      await invoiceService.updateStatus(invoiceId, "cancelled");
      toast.success("Đã hủy hóa đơn!");
      if (booking?.id) {
        fetchInvoices(booking.id);
      }
    } catch (error: any) {
      console.error("Error cancelling invoice:", error);
      toast.error(error.response?.data?.message || "Không thể hủy hóa đơn!");
    }
  };
  
  // Approve for payment
  const handleApproveForPayment = async (invoiceId: number) => {
    try {
      await invoiceService.approveForPayment(invoiceId);
      message.success("Đã xác nhận hóa đơn sẵn sàng thanh toán!");
      if (booking?.id) {
        fetchInvoices(booking.id);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể xác nhận!");
    }
  };
  
  // Helper functions cho status tags
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
  
  // Load services và supplies khi mở modal add service/damage
  useEffect(() => {
    if (addServiceModalVisible || addDamageModalVisible) {
      fetchServicesAndSupplies();
    }
  }, [addServiceModalVisible, addDamageModalVisible, booking?.property_id]);

  // Hàm lấy màu sắc và icon cho trạng thái
  const getStatusConfig = (status: BookingOrder["status"]) => {
    const configs: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
      pending: {
        color: "warning",
        icon: <ClockCircleOutlined />,
        text: "Chờ xác nhận",
      },
      confirmed: {
        color: "processing",
        icon: <CheckCircleOutlined />,
        text: "Đã xác nhận",
      },
      checked_in: {
        color: "success",
        icon: <CheckCircleOutlined />,
        text: "Đã check-in",
      },
      partially_checked_in: {
        color: "orange",
        icon: <ExclamationCircleOutlined />,
        text: "Check-in một phần",
      },
      checked_out: {
        color: "blue",
        icon: <ClockCircleOutlined />,
        text: "Đã check-out",
      },
      partially_checked_out: {
        color: "cyan",
        icon: <ExclamationCircleOutlined />,
        text: "Check-out một phần",
      },
      completed: {
        color: "success",
        icon: <CheckCircleOutlined />,
        text: "Hoàn thành",
      },
      cancelled: {
        color: "error",
        icon: <CloseCircleOutlined />,
        text: "Đã hủy",
      },
    };
    return configs[status] || {
      color: "default",
      icon: <ClockCircleOutlined />,
      text: status || "Không xác định",
    };
  };

  // Columns cho bảng chi tiết phòng
  const detailColumns = [
    {
      title: "Tên phòng",
      key: "room_name",
      render: (_: any, record: BookingDetail) => (
        <Space direction="vertical" size={0}>
          <Space>
            <HomeOutlined style={{ color: "#1890ff" }} />
            <strong>{record.room?.name || record.room_name || "N/A"}</strong>
          </Space>
          {record.room?.description && (
            <span style={{ fontSize: 12, color: "#8c8c8c", marginLeft: 20 }}>
              {record.room.description}
            </span>
          )}
        </Space>
      ),
    },
    {
      title: "Loại phòng",
      key: "room_type",
      render: (_: any, record: BookingDetail) => (
        <Space direction="vertical" size={0}>
          <Tag color="blue">{record.room?.roomType?.name || "N/A"}</Tag>
          {record.room?.price_per_night && (
            <span style={{ fontSize: 12, color: "#52c41a" }}>
              {record.room.price_per_night.toLocaleString("vi-VN")} đ/đêm
            </span>
          )}
        </Space>
      ),
    },
    {
      title: "Check-in",
      dataIndex: "check_in_date",
      key: "check_in_date",
      render: (date: string) => (
        <Space>
          <CalendarOutlined style={{ color: "#1890ff" }} />
          <strong>{dayjs(date).format("DD/MM/YYYY")}</strong>
        </Space>
      ),
    },
    {
      title: "Check-out",
      dataIndex: "check_out_date",
      key: "check_out_date",
      render: (date: string) => (
        <Space>
          <CalendarOutlined style={{ color: "#ff4d4f" }} />
          <strong>{dayjs(date).format("DD/MM/YYYY")}</strong>
        </Space>
      ),
    },
    {
      title: "Số đêm",
      key: "nights",
      align: "center" as const,
      render: (_: any, record: BookingDetail) => {
        const checkIn = dayjs(record.check_in_date);
        const checkOut = dayjs(record.check_out_date);
        const nights = checkOut.diff(checkIn, "day");
        return (
          <Tag color="orange" style={{ fontSize: 14, padding: "4px 12px" }}>
            {nights} đêm
          </Tag>
        );
      },
    },
    {
      title: "Số khách",
      key: "guests",
      render: (_: any, record: BookingDetail) => (
        <Space direction="vertical" size={0}>
          <Space>
            <UserOutlined style={{ color: "#1890ff" }} />
            <span><strong>{record.num_adults}</strong> người lớn</span>
          </Space>
          {record.num_children > 0 && (
            <Space style={{ marginLeft: 20 }}>
              <span><strong>{record.num_children}</strong> trẻ em</span>
            </Space>
          )}
          {record.room?.max_adults && (
            <span style={{ fontSize: 11, color: "#8c8c8c" }}>
              Tối đa: {record.room.max_adults} người lớn, {record.room.max_children || 0} trẻ em
            </span>
          )}
        </Space>
      ),
    },
    {
      title: "Giá phòng",
      dataIndex: "sub_total",
      key: "sub_total",
      align: "right" as const,
      render: (amount: number) => (
        <Space direction="vertical" size={0} align="end">
          <span style={{ fontSize: 16, fontWeight: "bold", color: "#52c41a" }}>
            {(amount || 0).toLocaleString("vi-VN")} đ
          </span>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusMap: any = {
          active: { color: "success", text: "Đang hoạt động" },
          cancelled: { color: "error", text: "Đã hủy" },
          checked_in: { color: "processing", text: "Đã check-in" },
          checked_out: { color: "default", text: "Đã check-out" },
        };
        const config = statusMap[status] || { color: "default", text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          padding: 24,
          textAlign: "center",
          minHeight: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" tip="Đang tải thông tin đặt phòng...">
          <div style={{ padding: "50px" }} />
        </Spin>
      </div>
    );
  }

  if (!booking) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <p>Không tìm thấy thông tin đặt phòng</p>
        <Button onClick={() => navigate("/admin/booking")}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const statusConfig = getStatusConfig(booking.status);

  return (
    <div style={{ padding: 24 }}>
      {/* Nút quay lại */}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/admin/booking")}
        style={{ marginBottom: 16 }}
      >
        Quay lại danh sách
      </Button>

      {/* Card thông tin chính */}
      <Card
        title={
          <Space>
            <CalendarOutlined style={{ fontSize: 20, color: "#1890ff" }} />
            <span>Chi tiết đặt phòng #{booking.code}</span>
          </Space>
        }
        extra={
          <Space>
            {(booking.status === 'confirmed' || booking.status === 'pending' || booking.status === 'partially_checked_in') && (
              <Button
                type="primary"
                icon={<LoginOutlined />}
                onClick={() => setCheckInModalVisible(true)}
                style={{
                  backgroundColor: '#52c41a',
                  borderColor: '#52c41a',
                }}
              >
                Check-in trực tiếp
              </Button>
            )}
            {(booking.status === 'checked_in' || booking.status === 'partially_checked_in' || booking.status === 'partially_checked_out') && (
              <Button
                type="primary"
                icon={<FileTextOutlined />}
                onClick={() => setCheckoutModalVisible(true)}
                style={{
                  backgroundColor: '#ff4d4f',
                  borderColor: '#ff4d4f',
                }}
              >
                Checkout & Tạo hóa đơn
              </Button>
            )}
            <Tag
              icon={statusConfig.icon}
              color={statusConfig.color}
              style={{ fontSize: 14, padding: "4px 12px" }}
            >
              {statusConfig.text}
            </Tag>
          </Space>
        }
      >
        <Tabs
          defaultActiveKey="booking-info"
          items={[
            {
              key: "booking-info",
              label: "Thông tin đặt phòng",
              children: (
                <>
                  <Descriptions bordered column={2}>
          {/* Row 1: Mã đơn và Ngày tạo */}
          <Descriptions.Item label="Mã đơn" span={1}>
            <strong style={{ fontSize: 15 }}>{booking.code}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo" span={1}>
            {dayjs(booking.created_at).format("DD/MM/YYYY HH:mm")}
          </Descriptions.Item>

          {/* Row 2: Tên khách hàng và SĐT */}
          <Descriptions.Item label="Tên khách hàng" span={1}>
            <Space>
              <UserOutlined style={{ color: "#1890ff" }} />
              <strong>{booking.customer_name || "N/A"}</strong>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại" span={1}>
            <Space>
              <PhoneOutlined style={{ color: "#52c41a" }} />
              {booking.customer_phone || "N/A"}
            </Space>
          </Descriptions.Item>

          {/* Row 3: Email (full width) */}
          <Descriptions.Item label="Email" span={2}>
            <Space>
              <MailOutlined style={{ color: "#fa8c16" }} />
              {booking.customer_email || "N/A"}
            </Space>
          </Descriptions.Item>

          {/* Row 4: Check-in và Check-out */}
          <Descriptions.Item label="Check-in" span={1}>
            <Space>
              <CalendarOutlined style={{ color: "#1890ff" }} />
              <strong>
                {booking.checkin_date
                  ? dayjs(booking.checkin_date).format("DD/MM/YYYY")
                  : "N/A"}
              </strong>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Check-out" span={1}>
            <Space>
              <CalendarOutlined style={{ color: "#ff4d4f" }} />
              <strong>
                {booking.checkout_date
                  ? dayjs(booking.checkout_date).format("DD/MM/YYYY")
                  : "N/A"}
              </strong>
            </Space>
          </Descriptions.Item>

          {/* Row 5: Tổng tiền (full width, nổi bật) */}
          <Descriptions.Item label="Tổng tiền" span={1}>
            <Space>
              <DollarOutlined style={{ color: "#52c41a", fontSize: 20 }} />
              <span
                style={{ fontSize: 20, fontWeight: "bold", color: "#52c41a" }}
              >
                {booking.total_amount.toLocaleString("vi-VN")} đ
              </span>
            </Space>
          </Descriptions.Item>

          {/* Row 6: Số phòng đặt */}
          <Descriptions.Item label="Số phòng đặt" span={1}>
            <Space>
              <HomeOutlined style={{ color: "#1890ff" }} />
              <strong>{booking.details_count} phòng</strong>
            </Space>
          </Descriptions.Item>
        </Descriptions>
        
        {/* Bảng chi tiết phòng */}
        {(() => {
        const rawDetails = booking.details || (booking as any).bookingDetails;
        const details = Array.isArray(rawDetails) ? rawDetails : [];
        console.log("Details to render:", details);
        
        if (details.length === 0) {
          return (
            <Card>
              <div style={{ textAlign: "center", padding: "40px" }}>
                <HomeOutlined style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }} />
                <p style={{ color: "#8c8c8c" }}>Chưa có thông tin phòng đặt</p>
              </div>
            </Card>
          );
        }
        
        return (
          <>
            <Divider orientation="left">
              <Space>
                <HomeOutlined style={{ color: "#1890ff" }} />
                <span style={{ fontSize: 16, fontWeight: 500 }}>
                  Chi tiết phòng đặt ({details.length} phòng)
                </span>
              </Space>
            </Divider>
            <Card>
              <Table
                columns={detailColumns}
                dataSource={details}
                rowKey="id"
                pagination={false}
                bordered
                size="middle"
              />
            </Card>
          </>
        );
      })()}

          {/* Hiển thị thông tin khách đã check-in nếu có */}
          {(() => {
            const rawDetails = booking.details || (booking as any).bookingDetails;
            const details = Array.isArray(rawDetails) ? rawDetails : [];
            return details.some((detail: BookingDetail) => 
              detail.guests && detail.guests.length > 0
            );
          })() && (
            <>
              <Divider orientation="left">
                <Space>
                  <UserOutlined style={{ color: "#1890ff" }} />
                  <span style={{ fontSize: 16, fontWeight: 500 }}>
                    Danh sách khách đã check-in
                  </span>
                </Space>
              </Divider>
              <Card>
                {((booking.details || (booking as any).bookingDetails) || []).map((detail: BookingDetail) => {
                  if (!detail.guests || detail.guests.length === 0) return null;
                  
                  return (
                    <Card
                      key={detail.id}
                      type="inner"
                      title={
                        <Space>
                          <HomeOutlined />
                          <span>{detail.room?.name || detail.room_name || `Phòng #${detail.id}`}</span>
                        </Space>
                      }
                      style={{ marginBottom: 16 }}
                    >
                      <Table
                        columns={[
                          {
                            title: "Họ tên",
                            dataIndex: "full_name",
                            key: "full_name",
                          },
                          {
                            title: "Ngày sinh",
                            dataIndex: "date_of_birth",
                            key: "date_of_birth",
                            render: (date: string) => date ? dayjs(date).format("DD/MM/YYYY") : "N/A",
                          },
                          {
                            title: "Loại giấy tờ",
                            dataIndex: "identity_type",
                            key: "identity_type",
                            render: (type: string) => {
                              const typeMap: any = {
                                cccd: "CCCD",
                                passport: "Hộ chiếu",
                              };
                              return typeMap[type] || type || "N/A";
                            },
                          },
                          {
                            title: "Số giấy tờ",
                            dataIndex: "identity_number",
                            key: "identity_number",
                          },
                          {
                            title: "Thời gian check-in",
                            dataIndex: "check_in_time",
                            key: "check_in_time",
                            render: (time: string) => time ? dayjs(time).format("DD/MM/YYYY HH:mm") : "N/A",
                          },
                        ]}
                        dataSource={Array.isArray(detail.guests) ? detail.guests : []}
                        rowKey="id"
                        pagination={false}
                        size="small"
                      />
                    </Card>
                  );
                })}
              </Card>
            </>
          )}
                </>
              ),
            },
            {
              key: "invoices",
              label: "Hóa đơn",
              children: (
                <div>
                  {loadingInvoices ? (
                    <Spin tip="Đang tải danh sách hóa đơn..." />
                  ) : invoices.length === 0 ? (
                    <Card>
                      <div
                        style={{
                          textAlign: "center",
                          padding: "40px",
                        }}
                      >
                        <FileTextOutlined
                          style={{
                            fontSize: 48,
                            color: "#d9d9d9",
                            marginBottom: 16,
                          }}
                        />
                        <p style={{ color: "#8c8c8c" }}>Chưa có hóa đơn nào</p>
                      </div>
                    </Card>
                  ) : (
                    (() => {
                      const raw = invoices[0] as any;
                      const invoice: Invoice & { items?: InvoiceItem[] } = {
                        ...(raw as Invoice),
                        items:
                          raw.items ||
                          raw.invoice_items ||
                          raw.invoiceItems ||
                          [],
                      };

                      const remainingAmount =
                        (invoice.total_amount || 0) -
                        (invoice.paid_amount || 0);

                      const itemColumns: any[] = [
                        {
                          title: "Mô tả",
                          dataIndex: "description",
                          key: "description",
                        },
                        {
                          title: "Loại",
                          dataIndex: "item_type",
                          key: "item_type",
                          render: (type: string) => {
                            const typeMap: Record<
                              string,
                              { color: string; text: string }
                            > = {
                              room_charge: { color: "blue", text: "Phí phòng" },
                              service_charge: {
                                color: "cyan",
                                text: "Dịch vụ",
                              },
                              damage_fee: {
                                color: "red",
                                text: "Thiệt hại",
                              },
                              penalty: { color: "red", text: "Phạt" },
                              deposit: { color: "orange", text: "Đặt cọc" },
                              voucher_discount: { color: "green", text: "Giảm giá" },
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
                          align: "center" as const,
                        },
                        {
                          title: "Đơn giá",
                          dataIndex: "unit_price",
                          key: "unit_price",
                          align: "right" as const,
                          render: (price: number) => `${(price || 0).toLocaleString("vi-VN")}₫`,
                        },
                        {
                          title: "Thuế",
                          dataIndex: "tax_amount",
                          key: "tax_amount",
                          align: "right" as const,
                          render: (tax: number) => (tax ? `${tax.toLocaleString("vi-VN")}₫` : "-"),
                        },
                        {
                          title: "Tổng",
                          dataIndex: "total",
                          key: "total",
                          align: "right" as const,
                          render: (total: number, record: InvoiceItem) => {
                            const amount = total || record.total_line || 0;
                            const isNegative = amount < 0;
                            return (
                              <Typography.Text strong style={{ color: isNegative ? "#ff4d4f" : "#52c41a" }}>
                                {isNegative ? "-" : ""}
                                {Math.abs(amount).toLocaleString("vi-VN")}₫
                              </Typography.Text>
                            );
                          },
                        },
                        {
                          title: "Thao tác",
                          key: "action",
                          align: "center" as const,
                          render: (_: any, record: InvoiceItem) => {
                            // Chỉ cho phép xóa nếu invoice chưa thanh toán và không phải room_charge
                            if (invoice.payment_status === "paid" || record.item_type === "room_charge") {
                              return null;
                            }
                            return (
                              <Popconfirm
                                title="Xác nhận xóa"
                                description="Bạn có chắc chắn muốn xóa item này?"
                                onConfirm={() => handleRemoveItem(invoice.id, record.id)}
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

                      return (
                        <div style={{ padding: 0 }}>
                          {/* Header Actions */}
                          <div style={{ marginBottom: 24 }}>
                            <Space>
                              <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
                                In hóa đơn
                              </Button>
                              <Button icon={<FilePdfOutlined />}>Xuất PDF</Button>
                              
                              {/* Trạng thái hóa đơn */}
                              <Select
                                value={invoice.invoice_status}
                                onChange={(status) => handleUpdateInvoiceStatus(invoice.id, status)}
                                style={{ width: 180 }}
                                disabled={invoice.invoice_status === "cancelled"}
                              >
                                <Select.Option value="draft">Nháp</Select.Option>
                                <Select.Option value="sent">Đã gửi</Select.Option>
                                <Select.Option value="viewed">Đã xem</Select.Option>
                                <Select.Option value="paid">Đã thanh toán</Select.Option>
                                <Select.Option value="cancelled">Đã hủy</Select.Option>
                              </Select>

                              {/* Xác nhận sẵn sàng thanh toán */}
                              {invoice.payment_status !== "paid" && invoice.invoice_status !== "cancelled" && (
                                <Button 
                                  type="primary" 
                                  icon={<CheckCircleOutlined />} 
                                  onClick={() => handleApproveForPayment(invoice.id)}
                                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                                >
                                  Xác nhận sẵn sàng thanh toán
                                </Button>
                              )}

                              {/* Đánh dấu đã thanh toán */}
                              {invoice.payment_status !== "paid" && invoice.invoice_status !== "cancelled" && (
                                <Button 
                                  type="primary" 
                                  icon={<CheckCircleOutlined />} 
                                  onClick={() => handleMarkAsPaid(invoice.id)}
                                >
                                  Đánh dấu đã thanh toán
                                </Button>
                              )}

                              {/* Hủy hóa đơn */}
                              {invoice.invoice_status !== "cancelled" && invoice.invoice_status !== "paid" && (
                                <Popconfirm
                                  title="Xác nhận hủy hóa đơn"
                                  description="Bạn có chắc chắn muốn hủy hóa đơn này? Hành động này không thể hoàn tác."
                                  onConfirm={() => handleCancelInvoice(invoice.id)}
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
                                <Typography.Title level={2}>HÓA ĐƠN</Typography.Title>
                                <Typography.Text strong style={{ fontSize: 18 }}>
                                  {invoice.invoice_number || `INV-${String(invoice.id).padStart(6, "0")}`}
                                </Typography.Text>
                              </Col>
                              <Col style={{ textAlign: "right" }}>
                                <div style={{ marginBottom: 8 }}>
                                  <Typography.Text type="secondary" style={{ marginRight: 8 }}>Trạng thái:</Typography.Text>
                                  {getInvoiceStatusTag(invoice.invoice_status)}
                                </div>
                                <div style={{ marginBottom: 8 }}>
                                  <Typography.Text type="secondary" style={{ marginRight: 8 }}>Thanh toán:</Typography.Text>
                                  {getPaymentStatusTag(invoice.payment_status)}
                                </div>
                                <div style={{ marginTop: 8 }}>
                                  <Typography.Text type="secondary">Ngày tạo:</Typography.Text>
                                  <br />
                                  <Typography.Text strong>{dayjs(invoice.issue_date).format("DD/MM/YYYY")}</Typography.Text>
                                </div>
                                <div style={{ marginTop: 8 }}>
                                  <Typography.Text type="secondary">Hạn thanh toán:</Typography.Text>
                                  <br />
                                  <Typography.Text strong>{dayjs(invoice.due_date).format("DD/MM/YYYY")}</Typography.Text>
                                </div>
                              </Col>
                            </Row>

                            <Divider />

                            {/* Customer & Property Info */}
                            <Row gutter={24}>
                              <Col span={12}>
                                <Descriptions title="Thông tin khách hàng" column={1} size="small">
                                  <Descriptions.Item label="Tên">
                                    <Typography.Text strong>{invoice.customer_name}</Typography.Text>
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
                              <Typography.Title level={4} style={{ margin: 0 }}>Chi tiết hóa đơn</Typography.Title>
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
                              dataSource={invoice.items || []}
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
                                      <Typography.Text>Tổng phụ:</Typography.Text>
                                      <Typography.Text>{(invoice.subtotal || 0).toLocaleString("vi-VN")}₫</Typography.Text>
                                    </div>
                                    {(invoice.discount_amount || 0) > 0 && (
                                      <div style={{ display: "flex", justifyContent: "space-between", color: "#52c41a" }}>
                                        <Typography.Text>Giảm giá:</Typography.Text>
                                        <Typography.Text>-{(invoice.discount_amount || 0).toLocaleString("vi-VN")}₫</Typography.Text>
                                      </div>
                                    )}
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                      <Typography.Text>Thuế ({invoice.tax_rate || 0}%):</Typography.Text>
                                      <Typography.Text>{(invoice.tax_amount || 0).toLocaleString("vi-VN")}₫</Typography.Text>
                                    </div>
                                    <Divider style={{ margin: "8px 0" }} />
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                      <Typography.Text strong style={{ fontSize: 16 }}>
                                        Tổng cộng:
                                      </Typography.Text>
                                      <Typography.Text strong style={{ fontSize: 18, color: "#1890ff" }}>
                                        {(invoice.total_amount || 0).toLocaleString("vi-VN")}₫
                                      </Typography.Text>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                      <Typography.Text>Đã thanh toán:</Typography.Text>
                                      <Typography.Text style={{ color: "#52c41a" }}>
                                        {(invoice.paid_amount || 0).toLocaleString("vi-VN")}₫
                                      </Typography.Text>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                      <Typography.Text strong>Còn lại:</Typography.Text>
                                      <Typography.Text strong style={{ color: (invoice.remaining_amount || remainingAmount) > 0 ? "#ff4d4f" : "#52c41a" }}>
                                        {(invoice.remaining_amount || remainingAmount).toLocaleString("vi-VN")}₫
                                      </Typography.Text>
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
                                  <Typography.Text strong>Ghi chú:</Typography.Text>
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
                                  <Typography.Text strong>Điều khoản:</Typography.Text>
                                  <div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
                                    {invoice.terms_conditions}
                                  </div>
                                </div>
                              </>
                            )}
                          </Card>
                        </div>
                      );
                    })()
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Modal check-in trực tiếp */}
      <AdminCheckInModal
        open={checkInModalVisible}
        booking={booking}
        onCancel={() => {
          setCheckInModalVisible(false);
        }}
        onSuccess={() => {
          // Refresh booking data
          if (id) {
            fetchBookingDetail(parseInt(id));
          }
          setCheckInModalVisible(false);
        }}
      />

      {/* Modal checkout với thiệt hại vật tư */}
      <AdminCheckoutModal
        open={checkoutModalVisible}
        booking={booking}
        onCancel={() => {
          setCheckoutModalVisible(false);
        }}
        onSuccess={() => {
          // Refresh booking data
          if (id) {
            fetchBookingDetail(parseInt(id));
            fetchInvoices(parseInt(id));
          }
          setCheckoutModalVisible(false);
        }}
      />
      
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

export default ViewBooking;
