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
  Checkbox,
  Upload,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
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
  SplitCellsOutlined,
} from "@ant-design/icons";
import { Alert } from "antd";
import dayjs from "dayjs";

import type {
  BookingOrder,
  BookingDetail,
} from "../../../types/booking/booking";
import { getBooking, requestServiceForGuest, completeServiceRequest, approveServiceRequest } from "../../../service/bookingService";
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
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [addServiceModalVisible, setAddServiceModalVisible] = useState(false);
  const [addDamageModalVisible, setAddDamageModalVisible] = useState(false);
  const [completeServiceModalVisible, setCompleteServiceModalVisible] = useState(false);
  const [approveServiceModalVisible, setApproveServiceModalVisible] = useState(false);
  const [selectedServiceToComplete, setSelectedServiceToComplete] = useState<any>(null);
  const [selectedServiceToApprove, setSelectedServiceToApprove] = useState<any>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingSupplies, setLoadingSupplies] = useState(false);
  const [serviceForm] = Form.useForm();
  const [damageForm] = Form.useForm();
  const [completeServiceForm] = Form.useForm();
  const [approveServiceForm] = Form.useForm();
  const [damageImageList, setDamageImageList] = useState<UploadFile[]>([]);

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
        "details,details.room,details.room.roomType,details.guests,details.bookingServices,details.bookingServices.service"
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
      // LƯU Ý: Hiển thị tất cả invoices (bao gồm cả hóa đơn gốc và hóa đơn đã tách)
      const allInvoices = await invoiceService.getAll();
      const filtered = allInvoices.filter(
        (inv: Invoice) => 
          inv.booking_order_id === bookingId && 
          inv.invoice_status !== 'cancelled' && 
          (inv as any).status !== 'cancelled'
      );
      
      // Fetch chi tiết cho TẤT CẢ invoices (không chỉ invoice đầu tiên)
      if (filtered.length > 0) {
        const invoiceDetails = await Promise.all(
          filtered.map(async (inv) => {
            try {
              const invoiceDetail = await invoiceService.getById(inv.id, 'bookingOrder,bookingOrder.guest,invoiceItems,invoiceItems.damageImages,payments,splitFrom,splitInvoices');

              // Map invoice_items từ backend thành items
              if ((invoiceDetail as any).invoice_items && !invoiceDetail.items) {
                invoiceDetail.items = (invoiceDetail as any).invoice_items;
              }
              if ((invoiceDetail as any).invoiceItems && !invoiceDetail.items) {
                invoiceDetail.items = (invoiceDetail as any).invoiceItems;
              }
              return invoiceDetail;
            } catch (error) {
              console.error(`Error fetching invoice ${inv.id}:`, error);
              return inv; // Trả về invoice cơ bản nếu không fetch được chi tiết
            }
          })
        );
        setInvoices(invoiceDetails);
        // Tự động chọn invoice đầu tiên nếu chưa có invoice nào được chọn
        if (invoiceDetails.length > 0 && !selectedInvoiceId) {
          setSelectedInvoiceId(invoiceDetails[0].id);
        }
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
  
  // Fetch services theo room_type_id
  const fetchServicesByRoomType = async (roomTypeId?: number) => {
    try {
      setLoadingServices(true);
      const params: any = {};
      if (roomTypeId) {
        params.room_type_id = roomTypeId;
      } else if (booking?.property_id) {
        params.property_id = booking.property_id;
      }
      const servicesData = await serviceService.getAll(params);
      setServices(Array.isArray(servicesData) ? servicesData : []);
    } catch (error: any) {
      console.error("Error fetching services:", error);
    } finally {
      setLoadingServices(false);
    }
  };
  
  // Fetch services và supplies
  const fetchServicesAndSupplies = async () => {
    await fetchServicesByRoomType();
    
    // Load tất cả supplies ban đầu (sẽ được filter khi chọn phòng)
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

  // Load supplies theo phòng
  const fetchSuppliesByRoom = async (roomId: number) => {
    try {
      setLoadingSupplies(true);
      const suppliesData = await supplyService.getByRoom(roomId);
      setSupplies(Array.isArray(suppliesData) ? suppliesData : []);
    } catch (error: any) {
      console.error("Error fetching supplies by room:", error);
      // Fallback: load tất cả supplies nếu không lấy được theo phòng
      try {
        const allSupplies = await supplyService.getAll();
        setSupplies(Array.isArray(allSupplies) ? allSupplies : []);
      } catch (fallbackError) {
        console.error("Error fetching all supplies:", fallbackError);
        setSupplies([]);
      }
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

  
  // Thêm dịch vụ trực tiếp vào hóa đơn
  const handleAddService = async (values: any) => {
    if (!booking?.id) {
      message.error("Không tìm thấy thông tin booking");
      return;
    }
    
    if (!values.booking_detail_id) {
      message.error("Vui lòng chọn phòng");
      return;
    }

    if (!values.service_id) {
      message.error("Vui lòng chọn dịch vụ");
      return;
    }

    if (!values.quantity || values.quantity < 1) {
      message.error("Vui lòng nhập số lượng hợp lệ");
      return;
    }

    // Kiểm tra có invoice chưa
    if (!invoices || invoices.length === 0) {
      message.error("Chưa có hóa đơn. Vui lòng tạo hóa đơn trước!");
      return;
    }

    // Sử dụng invoice được chọn hoặc invoice đầu tiên
    const invoiceId = selectedInvoiceId || invoices[0].id;

    const serviceData = {
      service_id: Number(values.service_id),
      quantity: Number(values.quantity),
      description: values.description || undefined,
      is_paid: values.is_paid === true || values.is_paid === 'true' || false, // Đảm bảo boolean
      booking_detail_id: Number(values.booking_detail_id),
    };

    console.log('Adding service to invoice:', {
      invoiceId,
      serviceData,
      is_paid_value: values.is_paid,
      is_paid_type: typeof values.is_paid,
    });

    try {
      await invoiceService.addService(invoiceId, serviceData);
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

  // Complete service request (kết thúc dịch vụ và cập nhật hóa đơn)
  const handleCompleteService = async (values: any) => {
    if (!selectedServiceToComplete) {
      message.error("Không tìm thấy dịch vụ cần kết thúc");
      return;
    }

    try {
      await completeServiceRequest(selectedServiceToComplete.id, {
        actual_quantity: Number(values.actual_quantity),
        actual_price: Number(values.actual_price),
        notes: values.notes || undefined,
      });
      message.success("Đã kết thúc dịch vụ và cập nhật hóa đơn!");
      setCompleteServiceModalVisible(false);
      setSelectedServiceToComplete(null);
      completeServiceForm.resetFields();
      if (booking?.id) {
        fetchBookingDetail(booking.id);
        fetchInvoices(booking.id);
      }
    } catch (error: any) {
      console.error("Error completing service:", error);
      message.error(error.response?.data?.message || "Không thể kết thúc dịch vụ!");
    }
  };
  
  // Add damage to invoice
  const handleAddDamage = async (values: any) => {
    if (!invoices || invoices.length === 0) return;
    
    if (!values.booking_detail_id) {
      message.error("Vui lòng chọn phòng");
      return;
    }
    
    // Sử dụng invoice được chọn hoặc invoice đầu tiên
    const invoiceId = selectedInvoiceId || invoices[0].id;
    

    try {
      // Tạo FormData để gửi ảnh
      const formData = new FormData();
      formData.append('supply_id', String(values.supply_id));
      formData.append('quantity', String(values.quantity));
      formData.append('booking_detail_id', String(values.booking_detail_id));
      if (values.description) {
        formData.append('description', values.description);
      }
      if (values.notes) {
        formData.append('notes', values.notes);
      }
      if (values.is_paid) {
        formData.append('is_paid', '1');
      }
      
      // Thêm ảnh vào FormData
      damageImageList.forEach((file) => {
        if (file.originFileObj) {
          formData.append('damage_images[]', file.originFileObj);
        }
      });
      
      await invoiceService.addDamageWithImages(invoiceId, formData);
      message.success("Đã thêm thiệt hại vào hóa đơn!");
      setAddDamageModalVisible(false);
      damageForm.resetFields();
      setDamageImageList([]);
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

  // Tách hóa đơn theo phòng
  const handleSplitInvoiceByRooms = async (invoiceId: number) => {
    Modal.confirm({
      title: 'Xác nhận tách hóa đơn',
      content: 'Bạn có chắc chắn muốn tách hóa đơn này theo phòng? Mỗi phòng sẽ có một hóa đơn riêng. Hóa đơn gốc sẽ bị hủy.',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setLoadingInvoices(true);
          const result = await invoiceService.splitByRooms(invoiceId);
          message.success(`Đã tách hóa đơn thành ${result.total_split} hóa đơn theo phòng!`);
          // Reload invoices
          if (booking?.id) {
            fetchInvoices(booking.id);
          }
        } catch (error: any) {
          console.error("Error splitting invoice:", error);
          message.error(error.response?.data?.message || "Không thể tách hóa đơn!");
        } finally {
          setLoadingInvoices(false);
        }
      },
    });
  };

  // Kiểm tra xem có thể tách hóa đơn không (có nhiều hơn 1 phòng)
  const canSplitInvoice = (invoice: Invoice) => {
    if (!booking || !booking.details) return false;
    const details = booking.details || (booking as any).bookingDetails || [];
    return details.length > 1 && invoice.invoice_status !== 'cancelled';
  };
  
  // Approve service request (xác nhận dịch vụ)
  const handleApproveService = async (values: any) => {
    if (!selectedServiceToApprove) {
      message.error("Không tìm thấy dịch vụ cần xác nhận");
      return;
    }

    try {
      await approveServiceRequest(selectedServiceToApprove.id, {
        quantity: values.quantity ? Number(values.quantity) : undefined,
        admin_notes: values.admin_notes || undefined,
      });
      message.success("Đã xác nhận dịch vụ và thêm vào hóa đơn!");
      setApproveServiceModalVisible(false);
      setSelectedServiceToApprove(null);
      approveServiceForm.resetFields();
      if (booking?.id) {
        fetchBookingDetail(booking.id);
        fetchInvoices(booking.id);
      }
    } catch (error: any) {
      console.error("Error approving service:", error);
      message.error(error.response?.data?.message || "Không thể xác nhận dịch vụ!");
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
  
  // Chỉ cho phép chỉnh sửa (thêm dịch vụ / thiệt hại) khi hóa đơn còn ở trạng thái nháp
  // hoặc trước khi checkout hoàn tất. Sau khi duyệt checkout và hóa đơn chuyển sang chờ thanh toán,
  // không được phép thêm gì nữa.
  const canEditInvoice = (invoice: Invoice) => {
    if (!invoice) return false;
    
    // Khi đơn đã checkout (hoặc hoàn thành) và payment_status vẫn là pending (chờ thanh toán),
    // thì KHÔNG cho phép chỉnh sửa hóa đơn nữa.
    const isWaitingPaymentAfterCheckout =
      invoice.payment_status === "pending" &&
      (booking?.status === "checked_out" ||
        booking?.status === "partially_checked_out" ||
        booking?.status === "completed");

    if (isWaitingPaymentAfterCheckout) return false;

    // Không cho sửa nếu đã thanh toán hoặc đã hủy
    if (invoice.payment_status === "paid") return false;
    if (invoice.invoice_status === "cancelled") return false;

    return true;
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

          {/* Hiển thị danh sách dịch vụ chờ xác nhận */}
          {(() => {
            const rawDetails = booking.details || (booking as any).bookingDetails;
            const details = Array.isArray(rawDetails) ? rawDetails : [];
            const pendingServices: any[] = [];
            
            details.forEach((detail: any) => {
              // Backend trả về booking_services (snake_case)
              const services = detail.booking_services || detail.bookingServices;
              if (services && Array.isArray(services)) {
                services.forEach((bs: any) => {
                  if (bs.status === 'pending') {
                    pendingServices.push({
                      ...bs,
                      roomName: detail.room?.name || detail.room_name || `Phòng #${detail.id}`,
                    });
                  }
                });
              }
            });

            if (pendingServices.length === 0) return null;

            return (
              <>
                <Divider orientation="left">
                  <Space>
                    <ClockCircleOutlined style={{ color: "#faad14" }} />
                    <span style={{ fontSize: 16, fontWeight: 500 }}>
                      Dịch vụ chờ xác nhận ({pendingServices.length})
                    </span>
                  </Space>
                </Divider>
                <Card>
                  <Table
                    columns={[
                      {
                        title: "Phòng",
                        dataIndex: "roomName",
                        key: "roomName",
                      },
                      {
                        title: "Dịch vụ",
                        key: "service",
                        render: (_: any, record: any) => (
                          <Space>
                            <span>{record.service?.name || "N/A"}</span>
                            <Tag color="orange">{record.service?.price?.toLocaleString("vi-VN")}₫/{record.service?.unit}</Tag>
                          </Space>
                        ),
                      },
                      {
                        title: "Trạng thái",
                        dataIndex: "status",
                        key: "status",
                        render: (status: string) => (
                          <Tag color="orange">Chờ xác nhận</Tag>
                        ),
                      },
                      {
                        title: "Ngày yêu cầu",
                        dataIndex: "created_at",
                        key: "created_at",
                        render: (date: string) => date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-",
                      },
                      {
                        title: "Ghi chú",
                        dataIndex: "notes",
                        key: "notes",
                        render: (notes: string) => notes || "-",
                      },
                      {
                        title: "Hành động",
                        key: "action",
                        render: (_: any, record: any) => (
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => {
                              setSelectedServiceToApprove(record);
                              approveServiceForm.setFieldsValue({
                                quantity: undefined,
                                admin_notes: undefined,
                              });
                              setApproveServiceModalVisible(true);
                            }}
                          >
                            Xác nhận dịch vụ
                          </Button>
                        ),
                      },
                    ]}
                    dataSource={pendingServices}
                    rowKey="id"
                    pagination={false}
                    size="middle"
                  />
                </Card>
              </>
            );
          })()}

          {/* Hiển thị danh sách dịch vụ đang sử dụng */}
          {(() => {
            const rawDetails = booking.details || (booking as any).bookingDetails;
            const details = Array.isArray(rawDetails) ? rawDetails : [];
            const allServices: any[] = [];
            
            details.forEach((detail: any) => {
              // Backend trả về booking_services (snake_case)
              const services = detail.booking_services || detail.bookingServices;
              if (services && Array.isArray(services)) {
                services.forEach((bs: any) => {
                  if (bs.status === 'in_use') {
                    allServices.push({
                      ...bs,
                      roomName: detail.room?.name || detail.room_name || `Phòng #${detail.id}`,
                    });
                  }
                });
              }
            });

            if (allServices.length === 0) return null;

            return (
              <>
                <Divider orientation="left">
                  <Space>
                    <ShoppingOutlined style={{ color: "#1890ff" }} />
                    <span style={{ fontSize: 16, fontWeight: 500 }}>
                      Dịch vụ đang sử dụng ({allServices.length})
                    </span>
                  </Space>
                </Divider>
                <Card>
                  <Table
                    columns={[
                      {
                        title: "Phòng",
                        dataIndex: "roomName",
                        key: "roomName",
                      },
                      {
                        title: "Dịch vụ",
                        key: "service",
                        render: (_: any, record: any) => (
                          <Space>
                            <span>{record.service?.name || "N/A"}</span>
                            <Tag color="blue">{record.service?.price?.toLocaleString("vi-VN")}₫/{record.service?.unit}</Tag>
                          </Space>
                        ),
                      },
                      {
                        title: "Trạng thái",
                        dataIndex: "status",
                        key: "status",
                        render: (status: string) => (
                          <Tag color="processing">Đang sử dụng</Tag>
                        ),
                      },
                      {
                        title: "Bắt đầu",
                        dataIndex: "started_at",
                        key: "started_at",
                        render: (date: string) => date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-",
                      },
                      {
                        title: "Ghi chú",
                        dataIndex: "notes",
                        key: "notes",
                        render: (notes: string) => notes || "-",
                      },
                      {
                        title: "Hành động",
                        key: "action",
                        render: (_: any, record: any) => (
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => {
                              setSelectedServiceToComplete(record);
                              completeServiceForm.setFieldsValue({
                                actual_quantity: record.quantity || 1,
                                actual_price: record.service?.price || 0,
                              });
                              setCompleteServiceModalVisible(true);
                            }}
                          >
                            Kết thúc dịch vụ
                          </Button>
                        ),
                      },
                    ]}
                    dataSource={allServices}
                    rowKey="id"
                    pagination={false}
                    size="middle"
                  />
                </Card>
              </>
            );
          })()}
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
                      // Helper function để render một invoice
                      const renderInvoice = (invoiceRaw: any) => {
                        const invoice: Invoice & { items?: InvoiceItem[] } = {
                          ...(invoiceRaw as Invoice),
                          items:
                            invoiceRaw.items ||
                            invoiceRaw.invoice_items ||
                            invoiceRaw.invoiceItems ||
                            [],
                        };

                        const remainingAmount =
                          (invoice.total_amount || 0) -
                          (invoice.paid_amount || 0);

                        // Lấy thông tin phòng từ invoice items hoặc booking details
                        const rawDetails = booking?.details || (booking as any)?.bookingDetails;
                        const details = Array.isArray(rawDetails) ? rawDetails : [];
                        
                        // Tìm phòng liên quan đến invoice này (từ invoice items có booking_detail_id)
                        let relatedRoom: any = null;
                        if (invoice.items && invoice.items.length > 0) {
                          const firstItem = invoice.items.find(item => item.booking_detail_id);
                          if (firstItem?.booking_detail_id) {
                            relatedRoom = details.find((d: any) => d.id === firstItem.booking_detail_id);
                          }
                        }

                        const roomName = relatedRoom?.room?.name || relatedRoom?.room_name || 'Tất cả phòng';

                        // Lấy danh sách dịch vụ chờ xác nhận cho booking này
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
                            const isPaid = record.description?.includes("[Đã thanh toán]");
                            return (
                              <Typography.Text
                                strong
                                style={{
                                  color: isPaid ? "#8c8c8c" : isNegative ? "#ff4d4f" : "#52c41a",
                                  textDecoration: isPaid ? "line-through" : "none",
                                  opacity: isPaid ? 0.6 : 1,
                                }}
                              >
                                {isNegative ? "-" : ""}
                                {Math.abs(amount).toLocaleString("vi-VN")}₫
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
                              
                              {/* Button tách hóa đơn theo phòng */}
                              {canSplitInvoice(invoice) && (
                                <Popconfirm
                                  title="Tách hóa đơn theo phòng"
                                  description="Mỗi phòng sẽ có một hóa đơn riêng. Hóa đơn gốc sẽ bị hủy. Bạn có chắc chắn?"
                                  onConfirm={() => handleSplitInvoiceByRooms(invoice.id)}
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

                            {/* Dịch vụ chờ xác nhận */}
                            {(() => {
                              const rawDetails = booking?.details || (booking as any)?.bookingDetails;
                              const details = Array.isArray(rawDetails) ? rawDetails : [];
                              const pendingServices: any[] = [];
                              
                              details.forEach((detail: any) => {
                                // Backend trả về booking_services (snake_case)
                                const services = detail.booking_services || detail.bookingServices;
                                if (services && Array.isArray(services)) {
                                  services.forEach((bs: any) => {
                                    if (bs.status === 'pending') {
                                      pendingServices.push({
                                        ...bs,
                                        roomName: detail.room?.name || detail.room_name || `Phòng #${detail.id}`,
                                        bookingDetailId: detail.id,
                                      });
                                    }
                                  });
                                }
                              });

                              if (pendingServices.length === 0) return null;

                              return (
                                <>
                                  <Divider orientation="left">
                                    <Space>
                                      <ClockCircleOutlined style={{ color: "#faad14" }} />
                                      <span style={{ fontSize: 16, fontWeight: 500 }}>
                                        Dịch vụ chờ xác nhận ({pendingServices.length})
                                      </span>
                                    </Space>
                                  </Divider>
                                  <Card style={{ marginBottom: 24, border: "2px solid #faad14", background: "#fffbe6" }}>
                                    <Table
                                      columns={[
                                        {
                                          title: "Phòng",
                                          dataIndex: "roomName",
                                          key: "roomName",
                                          render: (text: string) => (
                                            <Space>
                                              <HomeOutlined style={{ color: "#1890ff", fontSize: 16 }} />
                                              <strong style={{ color: "#1890ff", fontSize: 15 }}>{text}</strong>
                                            </Space>
                                          ),
                                        },
                                        {
                                          title: "Dịch vụ",
                                          key: "service",
                                          render: (_: any, record: any) => (
                                            <Space direction="vertical" size="small">
                                              <span style={{ fontWeight: 500, fontSize: 15 }}>{record.service?.name || "N/A"}</span>
                                              <Tag color="orange" style={{ fontSize: 12 }}>
                                                {record.service?.price?.toLocaleString("vi-VN")}₫/{record.service?.unit}
                                              </Tag>
                                            </Space>
                                          ),
                                        },
                                        {
                                          title: "Ngày yêu cầu",
                                          dataIndex: "created_at",
                                          key: "created_at",
                                          render: (date: string) => date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-",
                                        },
                                        {
                                          title: "Ghi chú",
                                          dataIndex: "notes",
                                          key: "notes",
                                          render: (notes: string) => (
                                            <Typography.Text ellipsis style={{ maxWidth: 200 }}>
                                              {notes || "-"}
                                            </Typography.Text>
                                          ),
                                        },
                                        {
                                          title: "Hành động",
                                          key: "action",
                                          width: 150,
                                          render: (_: any, record: any) => (
                                            <Button
                                              type="primary"
                                              icon={<CheckCircleOutlined />}
                                              onClick={() => {
                                                setSelectedServiceToApprove(record);
                                                approveServiceForm.setFieldsValue({
                                                  quantity: undefined,
                                                  admin_notes: undefined,
                                                });
                                                setApproveServiceModalVisible(true);
                                              }}
                                            >
                                              Xác nhận
                                            </Button>
                                          ),
                                        },
                                      ]}
                                      dataSource={pendingServices}
                                      rowKey="id"
                                      pagination={false}
                                      size="middle"
                                    />
                                  </Card>
                                </>
                              );
                            })()}

                            {/* Invoice Items */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                              <Typography.Title level={4} style={{ margin: 0 }}>Chi tiết hóa đơn</Typography.Title>
                              {canEditInvoice(invoice) && (
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
                      };

                      // Nếu chỉ có 1 invoice, hiển thị trực tiếp
                      if (invoices.length === 1) {
                        return renderInvoice(invoices[0]);
                      }

                      // Nếu có nhiều invoices, dùng Tabs
                      const invoiceTabs = invoices.map((inv, index) => {
                        const raw = inv as any;
                        // Tìm phòng liên quan từ invoice items
                        const rawDetails = booking?.details || (booking as any)?.bookingDetails;
                        const details = Array.isArray(rawDetails) ? rawDetails : [];
                        let relatedRoom: any = null;
                        const items = raw.items || raw.invoice_items || raw.invoiceItems || [];
                        if (items.length > 0) {
                          const firstItem = items.find((item: any) => item.booking_detail_id);
                          if (firstItem?.booking_detail_id) {
                            relatedRoom = details.find((d: any) => d.id === firstItem.booking_detail_id);
                          }
                        }
                        const roomName = relatedRoom?.room?.name || relatedRoom?.room_name || 'Tất cả phòng';
                        // Kiểm tra xem invoice này có phải là invoice đã tách không
                        // - Nếu invoice có splitFrom relationship hoặc chỉ có items của 1 phòng (booking_detail_id giống nhau) và có nhiều invoices
                        const uniqueRoomIds = new Set(items.filter((item: any) => item.booking_detail_id).map((item: any) => item.booking_detail_id));
                        const isSplit = (raw.splitFrom || uniqueRoomIds.size === 1) && invoices.length > 1;
                        // Kiểm tra xem có phải hóa đơn gốc không (có splitInvoices relationship)
                        const isOriginal = raw.splitInvoices && raw.splitInvoices.length > 0;

                        
                        return {
                          key: String(inv.id),
                          label: (
                            <Space>
                              {isOriginal && <Tag color="orange">Hóa đơn gốc</Tag>}
                              {isSplit && !isOriginal && <Tag color="blue">Đã tách</Tag>}

                              <span>{roomName}</span>
                              <span style={{ color: '#8c8c8c', fontSize: '12px' }}>
                                ({inv.invoice_number || `INV-${String(inv.id).padStart(6, "0")}`})
                              </span>
                            </Space>
                          ),
                          children: renderInvoice(inv),
                        };
                      });

                      return (
                        <Tabs
                          defaultActiveKey={String(invoices[0]?.id)}
                          activeKey={selectedInvoiceId ? String(selectedInvoiceId) : undefined}
                          onChange={(key) => setSelectedInvoiceId(Number(key))}
                          items={invoiceTabs}
                          type="card"
                        />
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
            name="booking_detail_id"
            label="Phòng"
            rules={[{ required: true, message: "Vui lòng chọn phòng" }]}
          >
            <Select
              placeholder="Chọn phòng"
              showSearch
              optionFilterProp="children"
              onChange={(value) => {
                // Khi chọn phòng, lấy room_type_id và load lại services
                const selectedDetail = booking?.details?.find((d: BookingDetail) => d.id === value);
                if (selectedDetail?.room?.roomType?.id) {
                  fetchServicesByRoomType(selectedDetail.room.roomType.id);
                }
              }}
            >
              {booking?.details?.map((detail: BookingDetail) => (
                <Select.Option key={detail.id} value={detail.id}>
                  {detail.room?.name || `Phòng ${detail.id}`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

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
            name="is_paid"
            valuePropName="checked"
          >
            <Checkbox>Đã thanh toán</Checkbox>
          </Form.Item>

          <Form.Item
            name="description"
            label="Ghi chú (tùy chọn)"
          >
            <Input.TextArea rows={3} placeholder="Nhập ghi chú nếu có" />
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
          setDamageImageList([]);
          // Reset supplies về danh sách tất cả khi đóng modal
          fetchServicesAndSupplies();
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
            name="booking_detail_id"
            label="Phòng"
            rules={[{ required: true, message: "Vui lòng chọn phòng" }]}
          >
            <Select
              placeholder="Chọn phòng"
              showSearch
              optionFilterProp="children"
              onChange={(value) => {
                // Khi chọn phòng, load supplies của phòng đó
                const selectedDetail = booking?.details?.find((d: BookingDetail) => d.id === value);
                if (selectedDetail?.room?.id) {
                  fetchSuppliesByRoom(selectedDetail.room.id);
                } else {
                  // Nếu không có room_id, load tất cả supplies
                  fetchServicesAndSupplies();
                }
                // Reset supply_id khi đổi phòng
                damageForm.setFieldsValue({ supply_id: undefined });
              }}
            >
              {booking?.details?.map((detail: BookingDetail) => (
                <Select.Option key={detail.id} value={detail.id}>
                  {detail.room?.name || `Phòng ${detail.id}`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

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
            name="is_paid"
            valuePropName="checked"
          >
            <Checkbox>Đã thanh toán</Checkbox>
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

          <Form.Item
            label="Ảnh minh chứng thiệt hại (tùy chọn)"
            extra="Tải lên ảnh để minh chứng thiệt hại vật tư"
          >
            <Upload
              listType="picture-card"
              fileList={damageImageList}
              onChange={({ fileList }) => setDamageImageList(fileList)}
              beforeUpload={() => false}
              accept="image/*"
              multiple
            >
              {damageImageList.length >= 5 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
            <div style={{ marginTop: 8, fontSize: 12, color: "#999" }}>
              Tải lên tối đa 5 ảnh minh chứng thiệt hại
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal kết thúc dịch vụ */}
      <Modal
        title={
          <Space>
            <CheckCircleOutlined />
            <span>Kết thúc dịch vụ</span>
          </Space>
        }
        open={completeServiceModalVisible}
        onCancel={() => {
          setCompleteServiceModalVisible(false);
          setSelectedServiceToComplete(null);
          completeServiceForm.resetFields();
        }}
        onOk={() => completeServiceForm.submit()}
        okText="Xác nhận kết thúc"
        cancelText="Hủy"
        width={600}
      >
        {selectedServiceToComplete && (
          <div style={{ marginBottom: 16, padding: 12, background: "#f5f5f5", borderRadius: 4 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div><strong>Dịch vụ:</strong> {selectedServiceToComplete.service?.name}</div>
              <div><strong>Phòng:</strong> {selectedServiceToComplete.roomName}</div>
              <div><strong>Đơn giá tham khảo:</strong> {selectedServiceToComplete.service?.price?.toLocaleString("vi-VN")}₫/{selectedServiceToComplete.service?.unit}</div>
            </Space>
          </div>
        )}
        <Form
          form={completeServiceForm}
          layout="vertical"
          onFinish={handleCompleteService}
        >
          <Form.Item
            name="actual_quantity"
            label="Số lượng thực tế"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng" },
              { type: "number", min: 1, message: "Số lượng phải lớn hơn 0" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={1}
              placeholder="Nhập số lượng thực tế"
            />
          </Form.Item>

          <Form.Item
            name="actual_price"
            label="Đơn giá thực tế (VNĐ)"
            rules={[
              { required: true, message: "Vui lòng nhập đơn giá" },
              { type: "number", min: 0, message: "Đơn giá phải lớn hơn hoặc bằng 0" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
              placeholder="Nhập đơn giá thực tế"
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú (tùy chọn)"
          >
            <Input.TextArea
              rows={3}
              placeholder="Ghi chú về dịch vụ đã sử dụng"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xác nhận dịch vụ */}
      <Modal
        title={
          <Space>
            <CheckCircleOutlined />
            <span>Xác nhận dịch vụ</span>
          </Space>
        }
        open={approveServiceModalVisible}
        onCancel={() => {
          setApproveServiceModalVisible(false);
          setSelectedServiceToApprove(null);
          approveServiceForm.resetFields();
        }}
        onOk={() => approveServiceForm.submit()}
        okText="Xác nhận"
        cancelText="Hủy"
        width={600}
      >
        {selectedServiceToApprove && (
          <div style={{ marginBottom: 16, padding: 16, background: "#e6f7ff", borderRadius: 8, border: "2px solid #1890ff" }}>
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <HomeOutlined style={{ fontSize: 20, color: "#1890ff" }} />
                <div>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Phòng sử dụng dịch vụ:</div>
                  <div style={{ fontSize: 18, fontWeight: "bold", color: "#1890ff" }}>
                    {selectedServiceToApprove.roomName}
                  </div>
                </div>
              </div>
              <Divider style={{ margin: "8px 0" }} />
              <div>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Tên dịch vụ:</div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>{selectedServiceToApprove.service?.name}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Đơn giá tham khảo:</div>
                <div style={{ fontSize: 16, color: "#52c41a", fontWeight: 500 }}>
                  {selectedServiceToApprove.service?.price?.toLocaleString("vi-VN")}₫/{selectedServiceToApprove.service?.unit}
                </div>
              </div>
              {selectedServiceToApprove.notes && (
                <div>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Ghi chú từ khách:</div>
                  <div style={{ fontSize: 14, fontStyle: "italic", color: "#888" }}>
                    {selectedServiceToApprove.notes}
                  </div>
                </div>
              )}
              <Alert
                message="Dịch vụ sẽ được đưa vào sử dụng và thêm vào hóa đơn với số lượng bạn nhập. Vui lòng kiểm tra kỹ thông tin phòng trước khi xác nhận."
                type="warning"
                showIcon
                style={{ marginTop: 8 }}
              />
            </Space>
          </div>
        )}
        <Form
          form={approveServiceForm}
          layout="vertical"
          onFinish={handleApproveService}
        >
          <Form.Item
            name="quantity"
            label="Số lượng (tùy chọn)"
            help="Nếu không nhập, dịch vụ sẽ được thêm vào hóa đơn với số lượng 1"
          >
            <InputNumber
              style={{ width: "100%" }}
              min={1}
              placeholder="Nhập số lượng (tùy chọn)"
            />
          </Form.Item>

          <Form.Item
            name="admin_notes"
            label="Ghi chú (tùy chọn)"
          >
            <Input.TextArea
              rows={3}
              placeholder="Ghi chú về việc xác nhận dịch vụ"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ViewBooking;
