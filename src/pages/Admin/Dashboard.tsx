import React, { useState, useEffect } from "react";
import { Row, Col, Card, Statistic, Table, Tag, Spin, Progress } from "antd";
import {
  DollarOutlined,
  ShoppingOutlined,
  UserOutlined,
  FileTextOutlined,
  ArrowUpOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { toast } from "react-toastify";
import invoiceService from "../../service/invoiceService";
import supplyService from "../../service/supplyService";
import reviewService from "../../service/reviewService";
import userService from "../../service/userService";
import amenityService from "../../service/amenityService";
import { getVouchers } from "../../service/admin/voucherService";
import {
  getBookingStatistics,
  type BookingStatistics,
} from "../../service/bookingService";
import type { Supply } from "../../types/supply/supplies";

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [invoiceStats, setInvoiceStats] = useState<any>(null);
  const [supplyStats, setSupplyStats] = useState<any>(null);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [activeVouchersCount, setActiveVouchersCount] = useState<number>(0);
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [lowStockSupplies, setLowStockSupplies] = useState<any[]>([]);
  const [amenities, setAmenities] = useState<any[]>([]);
  const [totalAmenities, setTotalAmenities] = useState<number>(0);
  const [bookingStats, setBookingStats] = useState<BookingStatistics | null>(
    null
  );
  const [userStats, setUserStats] = useState<{
    total_users: number;
    active_users: number;
    locked_users: number;
    new_users_this_month: number;
  } | null>(null);

  // Fetch critical statistics first (for cards)
  const fetchCriticalStats = async () => {
    try {
      const [
        invoiceData,
        supplyData,
        reviewData,
        vouchersResponse,
        bookingStatistics,
        userStatistics,
        amenitiesResponse,
      ] = await Promise.all([
        invoiceService.getStatistics().catch(() => null),
        supplyService.getStatistics().catch(() => null),
        reviewService.getStatistics().catch(() => null),
        getVouchers({ is_active: 1, per_page: 1 }).catch((err) => {
          if (import.meta.env.DEV) {
            console.error("Error fetching vouchers from /admin/vouchers:", err);
          }
          return {
            vouchers: [],
            pagination: {
              total: 0,
              current_page: 1,
              per_page: 1,
              last_page: 0,
            },
          };
        }),
        getBookingStatistics().catch(() => null),
        userService.getStatistics().catch(() => null),
        amenityService.getAmenities({ per_page: 1 }).catch(() => ({
          success: true,
          data: [],
          meta: {
            pagination: {
              total: 0,
              current_page: 1,
              per_page: 1,
              last_page: 0,
            },
          },
        })),
      ]);

      // Set critical stats immediately
      // invoiceService.getStatistics() trả về: res.data.data || res.data
      let stats = invoiceData;
      if (invoiceData?.data) {
        stats = invoiceData.data;
      } else if (invoiceData?.success && invoiceData?.data) {
        stats = invoiceData.data;
      }

      if (import.meta.env.DEV) {
        console.log("🔍 Invoice Statistics Raw:", invoiceData);
        console.log("🔍 Invoice Statistics Processed:", stats);
        console.log("🔍 Cancelled Invoices:", stats?.cancelled_invoices);
      }
      setInvoiceStats(stats);
      setSupplyStats(supplyData?.data || supplyData);
      setReviewStats(reviewData);
      setBookingStats(bookingStatistics);

      // userService.getStatistics() trả về: { success: true, data: {...} }
      if (userStatistics?.success && userStatistics.data) {
        setUserStats(userStatistics.data);
      } else if (userStatistics?.data) {
        // Fallback: nếu không có success field
        setUserStats(userStatistics.data);
      }

      // Handle vouchers response from /admin/vouchers API
      // getVouchers trả về: { vouchers: Voucher[], pagination: { total, current_page, per_page, last_page } }
      const vouchersData = vouchersResponse as any;

      // Debug log để kiểm tra response (chỉ trong dev mode)
      if (import.meta.env.DEV) {
        console.log("🔍 Vouchers API response:", {
          vouchersData,
          pagination: vouchersData?.pagination,
          vouchers: vouchersData?.vouchers,
          vouchersLength: vouchersData?.vouchers?.length,
        });
      }

      // Lấy số lượng voucher đang hoạt động từ pagination.total
      // Backend filter is_active=true nên pagination.total sẽ là số voucher active
      let activeCount = 0;
      if (
        vouchersData?.pagination?.total !== undefined &&
        vouchersData.pagination.total !== null
      ) {
        activeCount = Number(vouchersData.pagination.total);
      } else if (
        vouchersData?.vouchers &&
        Array.isArray(vouchersData.vouchers)
      ) {
        // Fallback: đếm số lượng voucher có is_active = true
        activeCount = vouchersData.vouchers.filter(
          (v: any) => v.is_active === true || v.is_active === 1
        ).length;
      }
      setActiveVouchersCount(activeCount);

      // Handle amenities
      const amenRes: any = amenitiesResponse;
      let totalAmenitiesCount = 0;
      if (amenRes?.success && amenRes?.data && Array.isArray(amenRes.data)) {
        totalAmenitiesCount =
          amenRes.meta?.pagination?.total || amenRes.data.length;
      } else if (amenRes?.data && Array.isArray(amenRes.data)) {
        totalAmenitiesCount =
          amenRes.meta?.pagination?.total || amenRes.data.length;
      } else if (amenRes?.data?.data && Array.isArray(amenRes.data.data)) {
        totalAmenitiesCount =
          amenRes.data.meta?.pagination?.total || amenRes.data.data.length;
      }
      setTotalAmenities(totalAmenitiesCount);
    } catch (error) {
      console.error("Error fetching critical stats:", error);
    }
  };

  // Fetch table data (less critical, can load after)
  const fetchTableData = async () => {
    try {
      const [invoicesResponse, lowStockResponse, amenitiesResponse] =
        await Promise.all([
          invoiceService.getAll({ per_page: 5 }).catch(() => []),
          supplyService.getLowStock().catch(() => []),
          amenityService.getAmenities({ per_page: 5 }).catch(() => ({
            success: true,
            data: [],
            meta: { pagination: { total: 0 } },
          })),
        ]);

      // Handle invoices
      let invoices: any[] = [];
      const invRes: any = invoicesResponse;
      if (Array.isArray(invRes)) {
        invoices = invRes;
      } else if (invRes?.data && Array.isArray(invRes.data)) {
        invoices = invRes.data;
      }

      // Debug log để kiểm tra invoice data
      if (import.meta.env.DEV) {
        console.log("🔍 Invoice API response:", {
          invoicesResponse,
          invoices,
          firstInvoice: invoices[0],
          bookingOrder: invoices[0]?.bookingOrder,
        });
      }

      setRecentInvoices(invoices.slice(0, 5));

      // Handle lowStock
      let lowStock: Supply[] = [];
      const stockRes: any = lowStockResponse;
      if (Array.isArray(stockRes)) {
        lowStock = stockRes;
      } else if (stockRes?.data && Array.isArray(stockRes.data)) {
        lowStock = stockRes.data;
      }

      // Fallback: get top 5 low stock if no low stock items
      if (
        lowStock.length === 0 &&
        (supplyStats?.total_supplies || supplyStats?.data?.total_supplies) > 0
      ) {
        try {
          const allSupplies = await supplyService.getAll();
          lowStock = [...allSupplies]
            .sort((a, b) => a.current_stock - b.current_stock)
            .slice(0, 5);
        } catch (e) {
          // Silent fail
        }
      }
      setLowStockSupplies(lowStock);

      // Handle amenities for table
      const amenRes: any = amenitiesResponse;
      let amenitiesList: any[] = [];
      if (amenRes?.success && amenRes?.data && Array.isArray(amenRes.data)) {
        amenitiesList = amenRes.data;
      } else if (amenRes?.data && Array.isArray(amenRes.data)) {
        amenitiesList = amenRes.data;
      } else if (amenRes?.data?.data && Array.isArray(amenRes.data.data)) {
        amenitiesList = amenRes.data.data;
      } else if (Array.isArray(amenRes)) {
        amenitiesList = amenRes;
      }
      setAmenities(amenitiesList);
    } catch (error) {
      console.error("Error fetching table data:", error);
    }
  };

  // Fetch all statistics
  const fetchAllStatistics = async () => {
    setLoading(true);
    try {
      // Fetch critical stats first (cards) - these show immediately
      await fetchCriticalStats();

      // Hide loading spinner after critical stats are loaded
      setLoading(false);

      // Then fetch table data in background (non-blocking)
      fetchTableData().catch((err) => {
        console.error("Error loading table data:", err);
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast.error("Không thể tải dữ liệu thống kê!");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStatistics();
  }, []);

  // Recent invoices columns
  const invoiceColumns: ColumnsType<any> = [
    {
      title: "ID hóa đơn",
      dataIndex: "id",
      key: "id",
      render: (id) => <span style={{ fontWeight: 600 }}>#{id}</span>,
    },
    {
      title: "Tên khách hàng",
      dataIndex: "customer_name",
      key: "customer_name",
      render: (text, record) => {
        // Lấy từ bookingOrder nếu không có customer_name trực tiếp
        const customerName =
          text ||
          record.bookingOrder?.customer_name ||
          record.booking_order?.customer_name ||
          record.bookingOrder?.guest?.full_name ||
          record.booking_order?.guest?.full_name ||
          "N/A";
        return customerName;
      },
    },
    {
      title: "Tổng tiền",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (amount) => `${(amount || 0).toLocaleString("vi-VN")}₫`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          paid: { text: "Đã thanh toán", color: "success" },
          pending: { text: "Chờ thanh toán", color: "warning" },
          overdue: { text: "Quá hạn", color: "error" },
          cancelled: { text: "Đã hủy", color: "default" },
        };
        const statusInfo = statusMap[status] || {
          text: status || "N/A",
          color: "default",
        };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
  ];

  // Low stock supplies columns
  const supplyColumns: ColumnsType<any> = [
    {
      title: "Vật tư",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Số lượng",
      dataIndex: "current_stock",
      key: "current_stock",
      render: (stock, record) => (
        <div>
          <Progress
            percent={Math.round((stock / record.max_stock_level) * 100)}
            size="small"
            status={stock < record.min_stock_level ? "exception" : "normal"}
          />
          <span>
            {stock} / {record.max_stock_level}
          </span>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => {
        const isLow = record.current_stock < record.min_stock_level;
        return (
          <Tag color={isLow ? "error" : "warning"} icon={<WarningOutlined />}>
            {isLow ? "Sắp hết" : "Thấp"}
          </Tag>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Spin spinning={loading}>
        {/* Main Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng doanh thu"
                value={invoiceStats?.total_revenue || 0}
                precision={0}
                valueStyle={{ color: "#3f8600" }}
                prefix={<DollarOutlined />}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
                <ArrowUpOutlined style={{ color: "#3f8600" }} /> +12.5% so với
                tháng trước
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Hóa đơn"
                value={invoiceStats?.total_invoices || 0}
                valueStyle={{ color: "#1890ff" }}
                prefix={<FileTextOutlined />}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
                {invoiceStats?.unpaid_invoices ||
                  invoiceStats?.pending_invoices ||
                  0}{" "}
                chờ thanh toán
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Đơn đặt phòng"
                value={bookingStats?.total || 0}
                valueStyle={{ color: "#722ed1" }}
                prefix={<ShoppingOutlined />}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
                Hủy: {bookingStats?.by_status.cancelled ?? 0} (
                {bookingStats ? `${bookingStats.cancellation_rate}%` : "0%"})
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Người dùng"
                value={userStats?.total_users ?? 0}
                valueStyle={{ color: "#eb2f96" }}
                prefix={<UserOutlined />}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
                {userStats
                  ? `${userStats.new_users_this_month} Người dùng mới tháng này`
                  : "Người dùng đang hoạt động trong hệ thống"}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Secondary Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Đánh giá trung bình"
                value={reviewStats?.average_rating || 4.5}
                precision={1}
                valueStyle={{ color: "#faad14" }}
                suffix="/ 5.0"
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Mã giảm giá đang hoạt động"
                value={activeVouchersCount}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tiện ích"
                value={totalAmenities || 0}
                valueStyle={{ color: "#1890ff" }}
                prefix={<ShoppingOutlined />}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng vật tư"
                value={supplyStats?.total_supplies || 0}
                valueStyle={{ color: "#13c2c2" }}
              />
              {supplyStats && (
                <div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
                  Hết hàng: {supplyStats.out_of_stock_count || 0}
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Tables */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card
              title="Hóa đơn gần đây"
              extra={<a href="/admin/invoice">Xem chi tiết</a>}
            >
              <Table
                columns={invoiceColumns}
                dataSource={recentInvoices}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title="Tiện ích"
              extra={<a href="/admin/amenities">Xem chi tiết</a>}
            >
              <Table
                columns={[
                  {
                    title: "Tên tiện ích",
                    dataIndex: "name",
                    key: "name",
                  },
                  {
                    title: "Loại",
                    dataIndex: "type",
                    key: "type",
                    render: (type) => {
                      const typeMap: Record<string, string> = {
                        basic: "Cơ bản",
                        advanced: "Nâng cao",
                        safety: "An toàn",
                      };
                      return typeMap[type] || type;
                    },
                  },
                  {
                    title: "Danh mục",
                    dataIndex: "category",
                    key: "category",
                  },
                ]}
                dataSource={amenities.slice(0, 5)}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>

        {/* Status Overview */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={12}>
            <Card title="Trạng thái hóa đơn">
              <Row gutter={16}>
                <Col span={8}>
                  <div style={{ textAlign: "center", padding: "16px 0" }}>
                    <CheckCircleOutlined
                      style={{ fontSize: 32, color: "#52c41a" }}
                    />
                    <div
                      style={{ marginTop: 8, fontSize: 24, fontWeight: 600 }}
                    >
                      {invoiceStats?.paid_invoices || 0}
                    </div>
                    <div style={{ color: "#888" }}>Đã thanh toán</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: "center", padding: "16px 0" }}>
                    <ClockCircleOutlined
                      style={{ fontSize: 32, color: "#faad14" }}
                    />
                    <div
                      style={{ marginTop: 8, fontSize: 24, fontWeight: 600 }}
                    >
                      {invoiceStats?.unpaid_invoices ||
                        invoiceStats?.pending_invoices ||
                        0}
                    </div>
                    <div style={{ color: "#888" }}>Chờ thanh toán</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: "center", padding: "16px 0" }}>
                    <WarningOutlined
                      style={{ fontSize: 32, color: "#ff4d4f" }}
                    />
                    <div
                      style={{ marginTop: 8, fontSize: 24, fontWeight: 600 }}
                    >
                      {invoiceStats?.cancelled_invoices || 0}
                    </div>
                    <div style={{ color: "#888" }}>Đã hủy</div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Hoạt động hệ thống">
              <div style={{ padding: "8px 0" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <span>Hóa đơn được tạo hôm nay</span>
                  <span style={{ fontWeight: 600 }}>12</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <span>Đặt phòng mới</span>
                  <span style={{ fontWeight: 600 }}>8</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <span>Đánh giá mới</span>
                  <span style={{ fontWeight: 600 }}>15</span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Khách hàng đăng ký mới</span>
                  <span style={{ fontWeight: 600 }}>5</span>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default Dashboard;
