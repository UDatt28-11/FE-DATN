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
import promotionService from "../../service/promotionService";

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [invoiceStats, setInvoiceStats] = useState<any>(null);
  const [supplyStats, setSupplyStats] = useState<any>(null);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [promotionStats, setPromotionStats] = useState<any>(null);
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [lowStockSupplies, setLowStockSupplies] = useState<any[]>([]);

  // Fetch all statistics
  const fetchAllStatistics = async () => {
    setLoading(true);
    try {
      const [invoiceData, supplyData, reviewData, promotionData, invoicesResponse, lowStockResponse] =
        await Promise.all([
          invoiceService.getStatistics().catch(() => null),
          supplyService.getStatistics().catch(() => null),
          reviewService.getStatistics().catch(() => null),
          promotionService.getStatistics().catch(() => null),
          invoiceService.getAll({ limit: 5 }).catch(() => []),
          supplyService.getLowStock().catch(() => []),
        ]);

      setInvoiceStats(invoiceData);
      setSupplyStats(supplyData);
      setReviewStats(reviewData);
      setPromotionStats(promotionData);
      
      // Handle invoices response
      let invoices: any[] = [];
      const invRes: any = invoicesResponse;
      if (Array.isArray(invRes)) {
        invoices = invRes;
      } else if (invRes?.data && Array.isArray(invRes.data)) {
        invoices = invRes.data;
      }
      setRecentInvoices(invoices.slice(0, 5));
      
      // Handle lowStock response
      let lowStock: any[] = [];
      const stockRes: any = lowStockResponse;
      if (Array.isArray(stockRes)) {
        lowStock = stockRes;
      } else if (stockRes?.data && Array.isArray(stockRes.data)) {
        lowStock = stockRes.data;
      }
      setLowStockSupplies(lowStock);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast.error("Không thể tải dữ liệu thống kê!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStatistics();
  }, []);

  // Recent invoices columns
  const invoiceColumns: ColumnsType<any> = [
    {
      title: "Số HĐ",
      dataIndex: "invoice_number",
      key: "invoice_number",
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: "Khách hàng",
      dataIndex: "customer_name",
      key: "customer_name",
    },
    {
      title: "Tổng tiền",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (amount) => `${(amount || 0).toLocaleString("vi-VN")}₫`,
    },
    {
      title: "Trạng thái",
      dataIndex: "payment_status",
      key: "payment_status",
      render: (status) => {
        const colors: Record<string, string> = {
          pending: "warning",
          paid: "success",
          overdue: "error",
        };
        return <Tag color={colors[status] || "default"}>{status}</Tag>;
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
      title: "Tồn kho",
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
                <ArrowUpOutlined style={{ color: "#3f8600" }} /> +12.5% so với tháng trước
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
                {invoiceStats?.pending_invoices || 0} chờ thanh toán
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Đơn đặt phòng"
                value={245}
                valueStyle={{ color: "#722ed1" }}
                prefix={<ShoppingOutlined />}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
                <ArrowUpOutlined style={{ color: "#3f8600" }} /> +8.3% so với tuần trước
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Khách hàng"
                value={1523}
                valueStyle={{ color: "#eb2f96" }}
                prefix={<UserOutlined />}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
                42 khách hàng mới tuần này
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
                value={promotionStats?.active_promotions || 0}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Vật tư sắp hết"
                value={lowStockSupplies.length}
                valueStyle={{ color: "#ff4d4f" }}
                prefix={<WarningOutlined />}
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
            </Card>
          </Col>
        </Row>

        {/* Tables */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card
              title="Hóa đơn gần đây"
              extra={<a href="/admin/invoice">Xem tất cả</a>}
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
              title="Vật tư sắp hết"
              extra={<a href="/admin/supply">Xem tất cả</a>}
            >
              <Table
                columns={supplyColumns}
                dataSource={lowStockSupplies}
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
                    <CheckCircleOutlined style={{ fontSize: 32, color: "#52c41a" }} />
                    <div style={{ marginTop: 8, fontSize: 24, fontWeight: 600 }}>
                      {invoiceStats?.paid_invoices || 0}
                    </div>
                    <div style={{ color: "#888" }}>Đã thanh toán</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: "center", padding: "16px 0" }}>
                    <ClockCircleOutlined style={{ fontSize: 32, color: "#faad14" }} />
                    <div style={{ marginTop: 8, fontSize: 24, fontWeight: 600 }}>
                      {invoiceStats?.pending_invoices || 0}
                    </div>
                    <div style={{ color: "#888" }}>Chờ thanh toán</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: "center", padding: "16px 0" }}>
                    <WarningOutlined style={{ fontSize: 32, color: "#ff4d4f" }} />
                    <div style={{ marginTop: 8, fontSize: 24, fontWeight: 600 }}>
                      {invoiceStats?.overdue_invoices || 0}
                    </div>
                    <div style={{ color: "#888" }}>Quá hạn</div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Hoạt động hệ thống">
              <div style={{ padding: "8px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <span>Hóa đơn được tạo hôm nay</span>
                  <span style={{ fontWeight: 600 }}>12</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <span>Đặt phòng mới</span>
                  <span style={{ fontWeight: 600 }}>8</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <span>Đánh giá mới</span>
                  <span style={{ fontWeight: 600 }}>15</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
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

