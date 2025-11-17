import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Space,
  Input,
  Select,
  Tag,
  Button,
  DatePicker,
  Row,
  Col,
  Statistic,
  Spin,
  Timeline,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SyncOutlined,
  WarningOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import supplyLogService from "../../../service/supplyLogService";
import type { SupplyLog, SupplyLogActivity } from "../../../types/supply/supplyLog";

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const SupplyLogs: React.FC = () => {
  const [logs, setLogs] = useState<SupplyLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SupplyLog[]>([]);
  const [recentActivities, setRecentActivities] = useState<SupplyLogActivity[]>([]);
  const [searchText, setSearchText] = useState("");
  const [actionTypeFilter, setActionTypeFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  // Fetch logs
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await supplyLogService.getAll();
      setLogs(data);
      setFilteredLogs(data);
    } catch (error: any) {
      console.error("Lỗi khi tải logs:", error);
      toast.error("Không thể tải lịch sử vật tư!");
    } finally {
      setLoading(false);
    }
  };

  // Fetch recent activities
  const fetchRecentActivities = async () => {
    try {
      const activities = await supplyLogService.getRecentActivities(10);
      setRecentActivities(activities);
    } catch (error) {
      console.error("Lỗi khi tải hoạt động:", error);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchRecentActivities();
  }, []);

  // Apply filters
  const applyFilters = (search: string, actionType: string, dates: [dayjs.Dayjs, dayjs.Dayjs] | null) => {
    let filtered = logs;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.supply?.name?.toLowerCase().includes(searchLower) ||
          log.notes?.toLowerCase().includes(searchLower) ||
          log.performed_by?.toLowerCase().includes(searchLower)
      );
    }

    if (actionType !== "all") {
      filtered = filtered.filter((log) => log.action_type === actionType);
    }

    if (dates) {
      filtered = filtered.filter((log) => {
        const logDate = dayjs(log.created_at);
        return logDate.isAfter(dates[0]) && logDate.isBefore(dates[1]);
      });
    }

    setFilteredLogs(filtered);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    applyFilters(value, actionTypeFilter, dateRange);
  };

  const handleActionTypeChange = (value: string) => {
    setActionTypeFilter(value);
    applyFilters(searchText, value, dateRange);
  };

  const handleDateRangeChange = (dates: any) => {
    setDateRange(dates);
    applyFilters(searchText, actionTypeFilter, dates);
  };

  // Get action type tag
  const getActionTypeTag = (type: SupplyLog["action_type"]) => {
    const config = {
      in: { color: "success", icon: <ArrowDownOutlined />, text: "Nhập kho" },
      out: { color: "error", icon: <ArrowUpOutlined />, text: "Xuất kho" },
      adjust: { color: "processing", icon: <SyncOutlined />, text: "Điều chỉnh" },
      return: { color: "blue", icon: <ArrowDownOutlined />, text: "Trả lại" },
      damage: { color: "warning", icon: <WarningOutlined />, text: "Hư hỏng" },
      expired: { color: "default", icon: <ClockCircleOutlined />, text: "Hết hạn" },
    };

    const actionConfig = config[type] || config.adjust;
    return (
      <Tag color={actionConfig.color} icon={actionConfig.icon}>
        {actionConfig.text}
      </Tag>
    );
  };

  const columns: ColumnsType<SupplyLog> = [
    {
      title: "Thời gian",
      dataIndex: "created_at",
      key: "created_at",
      width: 160,
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
      sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
    },
    {
      title: "Vật tư",
      dataIndex: ["supply", "name"],
      key: "supply_name",
      width: 200,
      render: (text) => <span style={{ fontWeight: 500 }}>{text || "N/A"}</span>,
    },
    {
      title: "Hành động",
      dataIndex: "action_type",
      key: "action_type",
      width: 130,
      render: (type) => getActionTypeTag(type),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      align: "center",
      render: (qty, record) => {
        const isIncrease = ["in", "return"].includes(record.action_type);
        return (
          <span style={{ fontWeight: 600, color: isIncrease ? "#52c41a" : "#ff4d4f" }}>
            {isIncrease ? "+" : "-"}
            {qty}
          </span>
        );
      },
    },
    {
      title: "Tồn kho",
      key: "stock",
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: 12, color: "#888" }}>
            Trước: {record.stock_before}
          </div>
          <div style={{ fontSize: 12, fontWeight: 500 }}>
            Sau: {record.stock_after}
          </div>
        </div>
      ),
    },
    {
      title: "Giá trị",
      dataIndex: "total_value",
      key: "total_value",
      width: 120,
      align: "right",
      render: (value) =>
        value ? `${value.toLocaleString("vi-VN")}₫` : "-",
    },
    {
      title: "Phòng",
      dataIndex: ["room", "name"],
      key: "room_name",
      width: 120,
      render: (text) => text || "-",
    },
    {
      title: "Người thực hiện",
      dataIndex: "performed_by",
      key: "performed_by",
      width: 150,
      render: (text) => text || "Hệ thống",
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      ellipsis: true,
      render: (text) => text || "-",
    },
  ];

  // Statistics
  const totalIn = filteredLogs
    .filter((log) => ["in", "return"].includes(log.action_type))
    .reduce((sum, log) => sum + log.quantity, 0);

  const totalOut = filteredLogs
    .filter((log) => ["out", "damage", "expired"].includes(log.action_type))
    .reduce((sum, log) => sum + log.quantity, 0);

  const totalValue = filteredLogs
    .filter((log) => log.total_value)
    .reduce((sum, log) => sum + (log.total_value || 0), 0);

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={18}>
          {/* Statistics Cards */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Tổng nhập kho"
                  value={totalIn}
                  prefix={<ArrowDownOutlined />}
                  valueStyle={{ color: "#3f8600" }}
                  suffix="đơn vị"
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Tổng xuất kho"
                  value={totalOut}
                  prefix={<ArrowUpOutlined />}
                  valueStyle={{ color: "#cf1322" }}
                  suffix="đơn vị"
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Tổng giá trị"
                  value={totalValue}
                  prefix="₫"
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
          </Row>

          {/* Filters */}
          <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
            <Space>
              <Search
                placeholder="Tìm vật tư, ghi chú..."
                enterButton={<SearchOutlined />}
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: 250 }}
              />
              <Select
                value={actionTypeFilter}
                onChange={handleActionTypeChange}
                style={{ width: 150 }}
              >
                <Option value="all">Tất cả hành động</Option>
                <Option value="in">Nhập kho</Option>
                <Option value="out">Xuất kho</Option>
                <Option value="adjust">Điều chỉnh</Option>
                <Option value="return">Trả lại</Option>
                <Option value="damage">Hư hỏng</Option>
                <Option value="expired">Hết hạn</Option>
              </Select>
              <RangePicker
                onChange={handleDateRangeChange}
                format="DD/MM/YYYY"
                style={{ width: 250 }}
              />
            </Space>
            <Button icon={<ReloadOutlined />} onClick={fetchLogs} loading={loading}>
              Làm mới
            </Button>
          </Row>

          {/* Table */}
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={filteredLogs}
              rowKey="id"
              scroll={{ x: 1200 }}
              pagination={{
                pageSize: 15,
                showSizeChanger: true,
                pageSizeOptions: [15, 30, 50],
                showTotal: (total) => `Tổng ${total} bản ghi`,
              }}
            />
          </Spin>
        </Col>

        <Col span={6}>
          {/* Recent Activities */}
          <Card title="Hoạt động gần đây" style={{ height: "100%" }}>
            <Timeline
              items={recentActivities.map((activity) => ({
                color: ["in", "return"].includes(activity.action_type) ? "green" : "red",
                children: (
                  <div>
                    <div style={{ fontWeight: 500 }}>{activity.supply_name}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>
                      {getActionTypeTag(activity.action_type as any)} {activity.quantity} đơn vị
                    </div>
                    <div style={{ fontSize: 11, color: "#bbb" }}>
                      {dayjs(activity.timestamp).format("HH:mm DD/MM")}
                    </div>
                    {activity.notes && (
                      <div style={{ fontSize: 12, marginTop: 4 }}>{activity.notes}</div>
                    )}
                  </div>
                ),
              }))}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SupplyLogs;



