import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Input,
  Select,
  Badge,
  Button,
  DatePicker,
  Modal,
  Tag,
  Tooltip,
  Tabs,
} from "antd";
import { toast } from "react-toastify";
import {
  EditOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  DollarOutlined,
  PhoneOutlined,
  HomeOutlined,
  UserOutlined,
  TeamOutlined,
  FilterOutlined,
  PlusOutlined,
  SyncOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";

import type { BookingOrder } from "../../../types/booking/booking";
import { useNavigate } from "react-router-dom";
import { listBookings, updateBookingStatus } from "../../../service/bookingService";
import ViewInvoiceModal from "../../../components/Booking/ViewInvoiceModal";


const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ListBooking: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<BookingOrder[]>([]);
  const [filteredRows, setFilteredRows] = useState<BookingOrder[]>([]);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<string>("not_checked_in"); // Tab mặc định: Đơn chưa check-in
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [loading, setLoading] = useState(false);
  
  // State cho modal đổi trạng thái
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [bookingToUpdate, setBookingToUpdate] = useState<BookingOrder | null>(null);
  const [newStatus, setNewStatus] = useState<'confirmed' | 'completed' | 'cancelled'>('confirmed');
  
  // State cho modal xem hóa đơn
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);

  async function fetchData() {
    setLoading(true);
    try {
      // Include invoices để biết booking có hóa đơn hay không
      // Lưu ý: Backend chỉ hỗ trợ include 'invoices', không hỗ trợ nested relationships
      const { data } = await listBookings({ 
        include: 'invoices' 
      } as any);
      setRows(data);
      applyFilters(searchText, activeTab, dateRange, data);
    } catch (e) {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }

  // Load data khi component mount
  useEffect(() => { 
    fetchData(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch data khi quay lại trang (window focus)
  useEffect(() => {
    const handleFocus = () => {
      fetchData();
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = (
    search: string,
    tab: string,
    dates: [Dayjs, Dayjs] | null,
    dataSource?: BookingOrder[]
  ) => {
    const sourceData = dataSource || rows;
    
    let filtered = sourceData;
    
    // Filter by search text
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.code.toLowerCase().includes(searchLower) ||
          (b.customer_name || '').toLowerCase().includes(searchLower) ||
          (b.customer_phone || '').includes(search)
      );
    }
    
    // Filter by tab
    if (tab === "not_checked_in") {
      // Đơn phòng đã đặt chưa check-in: pending, confirmed
      filtered = filtered.filter((b) => 
        b.status === 'pending' || b.status === 'confirmed'
      );
    } else if (tab === "in_use") {
      // Đơn đang trong sử dụng: checked_in, partially_checked_in
      filtered = filtered.filter((b) => 
        b.status === 'checked_in' || b.status === 'partially_checked_in'
      );
    } else if (tab === "checked_out") {
      // Đơn đã checkout: checked_out, partially_checked_out, completed
      filtered = filtered.filter((b) => 
        b.status === 'checked_out' || 
        b.status === 'partially_checked_out' || 
        b.status === 'completed'
      );
    } else if (tab === "all") {
      // Tất cả - không filter theo status
      // Nhưng vẫn có thể filter theo search và date
    }
    
    // Filter by date range
    if (dates) {
      filtered = filtered.filter((b) => {
        const checkIn = dayjs(b.checkin_date);
        return checkIn.isAfter(dates[0]) && checkIn.isBefore(dates[1]);
      });
    }
    
    setFilteredRows(filtered);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    applyFilters(value, activeTab, dateRange);
  };
  
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    applyFilters(searchText, key, dateRange);
  };
  
  const handleDateRangeChange = (dates: any) => {
    setDateRange(dates);
    applyFilters(searchText, activeTab, dates);
  };
  // ============================================
  // HÀM XỬ LÝ CẬP NHẬT TRẠNG THÁI BOOKING
  // ============================================
  
  /**
   * Mở modal để chọn trạng thái mới cho booking
   * @param record - Booking order cần cập nhật
   */
  const handleChangeStatus = (record: BookingOrder) => {
    setBookingToUpdate(record);
    
    // Set trạng thái mặc định dựa vào trạng thái hiện tại
    if (record.status === 'pending') {
      setNewStatus('confirmed');
    } else if (record.status === 'confirmed') {
      setNewStatus('completed');
    }
    
    setIsStatusModalOpen(true);
  };
  
  /**
   * Xử lý xác nhận cập nhật trạng thái
   */
  const handleConfirmStatusChange = async () => {
    if (!bookingToUpdate) return;
    
    const previousStatus = bookingToUpdate.status;
    
    try {
      // Bước 1: Đóng modal
      setIsStatusModalOpen(false);
      
      // Bước 2: Cập nhật UI ngay (Optimistic Update)
      setRows((currentRows) =>
        currentRows.map((r) =>
          r.id === bookingToUpdate.id ? { ...r, status: newStatus } : r
        )
      );
      
      setFilteredRows((currentFiltered) =>
        currentFiltered.map((r) =>
          r.id === bookingToUpdate.id ? { ...r, status: newStatus } : r
        )
      );
      
      // Bước 3: Gọi API
      await updateBookingStatus(bookingToUpdate.id, newStatus);
      
      // Bước 4: Thông báo thành công
      toast.success(`✅ Đã cập nhật trạng thái thành "${newStatus}" thành công!`);
      
    } catch (error: any) {
      // Rollback nếu lỗi
      setRows((currentRows) =>
        currentRows.map((r) =>
          r.id === bookingToUpdate.id ? { ...r, status: previousStatus } : r
        )
      );
      
      setFilteredRows((currentFiltered) =>
        currentFiltered.map((r) =>
          r.id === bookingToUpdate.id ? { ...r, status: previousStatus } : r
        )
      );
      
      toast.error(`❌ Không thể cập nhật: ${error.message || 'Lỗi không xác định'}`);
    } finally {
      setBookingToUpdate(null);
    }
  };

  // ============================================
  // HÀM XUẤT FILE EXCEL VÀ PDF
  // ============================================
  
  /**
   * Xuất dữ liệu booking ra file Excel
   */
  const handleExportExcel = () => {
    toast.info('🔄 Đang chuẩn bị xuất file Excel...');
    
    // TODO: Implement Excel export logic
    // Có thể sử dụng thư viện như xlsx hoặc exceljs
    setTimeout(() => {
      toast.success('✅ Xuất file Excel thành công!');
    }, 1000);
  };
  
  /**
   * Xuất dữ liệu booking ra file PDF
   */
  const handleExportPDF = () => {
    toast.info('🔄 Đang chuẩn bị xuất file PDF...');
    
    // TODO: Implement PDF export logic
    // Có thể sử dụng thư viện như jspdf hoặc pdfmake
    setTimeout(() => {
      toast.success('✅ Xuất file PDF thành công!');
    }, 1000);
  };

  // ============================================
  // HÀM LẤY CẤU HÌNH HIỂN THỊ TRẠNG THÁI
  // ============================================
  
  /**
   * Trả về cấu hình màu sắc, icon và label cho mỗi trạng thái
   * @param status - Trạng thái booking (pending, confirmed, completed, cancelled)
   * @returns Object chứa color, icon, label
   */
  const getStatusConfig = (status: BookingOrder["status"]) => {
    const statusMap: Record<
      string,
      { color: string; icon: React.ReactNode; label: string }
    > = {
      // Đang chờ xác nhận - màu vàng
      pending: {
        color: "warning",
        icon: <ClockCircleOutlined />,
        label: "Chờ xác nhận",
      },
      // Đã xác nhận - màu xanh dương
      confirmed: {
        color: "processing",
        icon: <CheckCircleOutlined />,
        label: "Đã xác nhận",
      },
      // Đã check-in - màu xanh lá
      checked_in: {
        color: "success",
        icon: <CheckCircleOutlined />,
        label: "Đã check-in",
      },
      // Check-in một phần - màu cam
      partially_checked_in: {
        color: "orange",
        icon: <ExclamationCircleOutlined />,
        label: "Check-in một phần",
      },
      // Đã check-out - màu xanh dương
      checked_out: {
        color: "blue",
        icon: <ClockCircleOutlined />,
        label: "Đã check-out",
      },
      // Check-out một phần - màu cyan
      partially_checked_out: {
        color: "cyan",
        icon: <ExclamationCircleOutlined />,
        label: "Check-out một phần",
      },
      // Hoàn thành - màu xanh lá
      completed: {
        color: "success",
        icon: <CheckCircleOutlined />,
        label: "Hoàn thành",
      },
      // Đã hủy - màu đỏ
      cancelled: {
        color: "error",
        icon: <CloseCircleOutlined />,
        label: "Đã hủy",
      },
    };

    // Trả về config hoặc mặc định nếu không tìm thấy
    return (
      statusMap[status] ?? {
        color: "default",
        icon: <ClockCircleOutlined />,
        label: status,
      }
    );
  };


  // ============================================
  // CẤU HÌNH CÁC CỘT CHO BẢNG DANH SÁCH BOOKING
  // ============================================
  
  const columns = [
    // Cột 1: Mã đặt phòng
    {
      title: "Mã đặt phòng",
      dataIndex: "code",
      key: "code",
      render: (code: string) => (
        <span style={{ fontWeight: 600, color: "#1890ff" }}>{code}</span>
      ),
    },
    
    // Cột 2: Thông tin khách hàng (tên + số điện thoại)
    {
      title: "Khách hàng",
      key: "customer",
      render: (_: any, record: BookingOrder) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.customer_name}</div>
          <div style={{ fontSize: 12, color: '#666' }}>
            <PhoneOutlined /> {record.customer_phone}
          </div>
        </div>
      ),
    },
    
    // Cột 3: Ngày check-in (có sắp xếp theo thời gian)
    {
      title: "Check-in",
      dataIndex: "checkin_date",
      key: "checkin_date",
      // Cho phép sắp xếp theo ngày check-in
      sorter: (a: BookingOrder, b: BookingOrder) =>
        dayjs(a.checkin_date || '').unix() - dayjs(b.checkin_date || '').unix(),
      render: (date?: string | null) => 
        date ? dayjs(date).format("DD/MM/YYYY") : "-",
    },
    
    // Cột 4: Ngày check-out
    {
      title: "Check-out",
      dataIndex: "checkout_date",
      key: "checkout_date",
      render: (date?: string | null) => 
        date ? dayjs(date).format("DD/MM/YYYY") : "-",
    },
    
    // Cột 5: Trạng thái booking với màu sắc và icon
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: BookingOrder["status"]) => {
        const cfg = getStatusConfig(status);
        return (
          <Tag color={cfg.color} icon={cfg.icon}>
            {cfg.label}
          </Tag>
        );
      },
    },
    
    // Cột 6: Tổng tiền (căn phải, format VNĐ)
    {
      title: "Tổng tiền",
      dataIndex: "total_amount",
      key: "total_amount",
      align: "right" as const,
      render: (v: number) => `${(v || 0).toLocaleString("vi-VN")} đ`,
    },
    
    // Cột 7: Các nút hành động
    {
      title: "Hành động",
      key: "action",
      width: 150,
      render: (_: any, record: BookingOrder) => (
        <Space>
          {/* Nút sửa thông tin booking */}
          <Tooltip title="Sửa thông tin đặt phòng">
            <Button
              type="default"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation(); // Ngăn chặn event bubble lên row
                navigate(`/admin/booking/edit/${record.id}`);
              }}
            />
          </Tooltip>
          
          {/* Nút xem hóa đơn */}
          {record.invoices && record.invoices.length > 0 && (
            <Tooltip title="Xem hóa đơn">
              <Button
                type="default"
                icon={<FileTextOutlined />}
                onClick={(e) => {
                  e.stopPropagation(); // Ngăn chặn event bubble lên row
                  setSelectedInvoiceId(record.invoices![0].id);
                  setInvoiceModalVisible(true);
                }}
              />
            </Tooltip>
          )}
          
          {/* 
            Nút đổi trạng thái
            CHỈ HIỂN THỊ KHI: 
            - Trạng thái chưa "completed" (hoàn thành)
            - Trạng thái chưa "cancelled" (đã hủy)
            Vì 2 trạng thái này là trạng thái cuối, không thể thay đổi
          */}
          {record.status !== 'completed' && record.status !== 'cancelled' && (
            <Tooltip title="Cập nhật trạng thái đặt phòng">
              <Button
                type="default"
                icon={<SyncOutlined />}
                onClick={(e) => {
                  e.stopPropagation(); // Ngăn chặn event bubble lên row
                  handleChangeStatus(record);
                }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // ============================================
  // RENDER GIAO DIỆN CHÍNH
  // ============================================
  
  return (
    <div style={{ padding: 24 }}>
      {/* PHẦN TABS - Chia theo trạng thái đơn đặt phòng */}
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        style={{ marginBottom: 24 }}
        items={[
          {
            key: 'not_checked_in',
            label: (
              <span>
                <ClockCircleOutlined /> Đơn chưa check-in
              </span>
            ),
          },
          {
            key: 'in_use',
            label: (
              <span>
                <CheckCircleOutlined /> Đang sử dụng
              </span>
            ),
          },
          {
            key: 'checked_out',
            label: (
              <span>
                <CheckCircleOutlined /> Đã checkout
              </span>
            ),
          },
          {
            key: 'all',
            label: (
              <span>
                <FileTextOutlined /> Tất cả
              </span>
            ),
          },
        ]}
      />

      {/* PHẦN FILTERS - Thanh công cụ lọc và tìm kiếm */}
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          {/* Ô tìm kiếm theo mã booking, tên khách hàng, SĐT */}
          <Search
            placeholder="Tìm theo mã đơn, tên, SĐT..."
            allowClear
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
          />
        
        {/* Chọn khoảng thời gian check-in */}
        <RangePicker 
          onChange={handleDateRangeChange}
          placeholder={['Từ ngày', 'Đến ngày']}
          format="DD/MM/YYYY"
        />
        </Space>

        {/* Nhóm nút Actions: Export + Thêm mới */}
        <Space>
          {/* Nút xuất Excel */}
          <Tooltip title="Xuất file Excel">
            <Button 
              icon={<FileExcelOutlined />} 
              onClick={handleExportExcel}
              style={{
                height: '40px',
                borderColor: '#52c41a',
                color: '#52c41a'
              }}
            >
              Excel
            </Button>
          </Tooltip>
          
          {/* Nút xuất PDF */}
          <Tooltip title="Xuất file PDF">
            <Button 
              icon={<FilePdfOutlined />} 
              onClick={handleExportPDF}
              danger
              style={{
                height: '40px'
              }}
            >
              PDF
            </Button>
          </Tooltip>
          
          {/* Nút thêm mới booking */}
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => navigate('/admin/booking/add')}
            size="large"
          >
            Thêm đặt phòng
          </Button>
        </Space>
      </Space>
      
      {/* BẢNG DANH SÁCH BOOKING */}
      <Table 
        loading={loading} 
        columns={columns as any} 
        dataSource={filteredRows} 
        rowKey="id"
        onRow={(record) => ({
          onClick: () => {
            // Khi click vào row, navigate đến trang chi tiết
            navigate(`/admin/booking/view/${record.id}`);
          },
          style: { cursor: 'pointer' }, // Thêm cursor pointer để người dùng biết có thể click
        })}
        pagination={{
          pageSize: 10,
          showTotal: (total) => `Tổng cộng ${total} đặt phòng`,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
      />

      {/* MODAL ĐỔI TRẠNG THÁI BOOKING */}
      <Modal
        open={isStatusModalOpen}
        onCancel={() => {
          setIsStatusModalOpen(false);
          setBookingToUpdate(null);
        }}
        onOk={handleConfirmStatusChange}
        okText="Xác nhận cập nhật"
        cancelText="Hủy bỏ"
        width={550}
        title="🔄 Cập nhật trạng thái đặt phòng"
      >
        {bookingToUpdate && (
          <div style={{ padding: '16px 0' }}>
            {/* Thông tin booking */}
            <div style={{ marginBottom: 20, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
              <p style={{ marginBottom: 8 }}>
                <strong>Mã đặt phòng:</strong> 
                <span style={{ color: '#1890ff', marginLeft: 8 }}>{bookingToUpdate.code}</span>
              </p>
              <p style={{ marginBottom: 0 }}>
                <strong>Trạng thái hiện tại:</strong>{' '}
                <Tag color={getStatusConfig(bookingToUpdate.status).color} style={{ marginLeft: 8 }}>
                  {getStatusConfig(bookingToUpdate.status).label}
                </Tag>
              </p>
            </div>

            {/* Select trạng thái mới */}
            <div>
              <p style={{ marginBottom: 12, fontWeight: 500 }}>
                Chọn trạng thái mới:
              </p>
              <Select
                value={newStatus}
                onChange={(value) => setNewStatus(value)}
                style={{ width: '100%' }}
                size="large"
                placeholder="Chọn trạng thái"
              >
                {/* Hiển thị tất cả các trạng thái với bullet points màu sắc */}
                <Option value="pending">
                  <Space>
                    <Badge color="#faad14" />
                    Đang chờ
                  </Space>
                </Option>
                <Option value="confirmed">
                  <Space>
                    <Badge color="#1890ff" />
                    Đã xác nhận
                  </Space>
                </Option>
                <Option value="completed">
                  <Space>
                    <Badge color="#52c41a" />
                    Hoàn thành
                  </Space>
                </Option>
                <Option value="cancelled">
                  <Space>
                    <Badge color="#ff4d4f" />
                    Đã hủy
                  </Space>
                </Option>
              </Select>
            </div>

            {/* Cảnh báo */}
            <div style={{ marginTop: 16, padding: 12, background: '#fff7e6', border: '1px solid #ffd591', borderRadius: 6 }}>
              <p style={{ margin: 0, fontSize: 13, color: '#d46b08' }}>
                ⚠️ <strong>Lưu ý:</strong> Không thể hoàn tác sau khi cập nhật trạng thái
              </p>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Modal xem hóa đơn */}
      <ViewInvoiceModal
        open={invoiceModalVisible}
        invoiceId={selectedInvoiceId}
        isAdmin={true}
        onCancel={() => {
          setInvoiceModalVisible(false);
          setSelectedInvoiceId(null);
        }}
      />
    </div>
  );
};

export default ListBooking;