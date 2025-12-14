import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Tag,
  Avatar,
  Dropdown,
  Modal,
  Spin,
  Select,
  Row,
  Col,
  Statistic,
  message,
} from "antd";
import {
  SearchOutlined,
  MoreOutlined,
  LockOutlined,
  UnlockOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  ReloadOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import userService from "../../../service/userService";
import type { User, BackendUser } from "../../../types/user/user";
import AddUser from "./AddUser";
import EditUser from "./EditUser";

const { Option } = Select;

// Helper function để map BackendUser sang User
const mapBackendUserToUser = (backendUser: BackendUser): User => {
  return {
    key: backendUser.id.toString(),
    id: backendUser.id,
    name: backendUser.full_name,
    email: backendUser.email,
    phone: backendUser.phone_number || "",
    avatar: backendUser.avatar_url || "",
    role: backendUser.role,
    status: backendUser.status,
    // Giữ lại các field từ backend
    full_name: backendUser.full_name,
    phone_number: backendUser.phone_number,
    avatar_url: backendUser.avatar_url,
    date_of_birth: backendUser.date_of_birth,
    gender: backendUser.gender,
    address: backendUser.address,
    identity_verified: backendUser.identity_verified,
    created_at: backendUser.created_at,
    updated_at: backendUser.updated_at,
    joinDate: backendUser.created_at,
  };
};

const ListUser: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [statistics, setStatistics] = useState<any>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 15,
    total: 0,
  });

  // Fetch users from API
  const fetchUsers = async (page: number = 1, pageSize: number = 15) => {
    setLoading(true);
    try {
      const result = await userService.getAll({
        search: searchText || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        page,
        per_page: pageSize,
      });

      if (result.success && result.data) {
        // Map backend users to frontend format
        const mappedUsers = (result.data as BackendUser[]).map(mapBackendUserToUser);
        setUsers(mappedUsers);

        // Update pagination from meta
        if (result.meta?.pagination) {
          setPagination({
            current: result.meta.pagination.current_page,
            pageSize: result.meta.pagination.per_page,
            total: result.meta.pagination.total,
          });
        }
      } else {
        setUsers([]);
      }
    } catch (error: any) {
      console.error("Lỗi khi tải danh sách:", error);
      const errorMessage = error.response?.data?.message || "Không thể tải danh sách người dùng!";
      message.error(errorMessage);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const stats = await userService.getStatistics();
      if (stats.success && stats.data) {
        setStatistics(stats.data);
      } else {
        // Fallback values
        setStatistics({
          total_users: 0,
          active_users: 0,
          locked_users: 0,
          new_users_this_month: 0,
        });
      }
    } catch (error: any) {
      console.error("Lỗi khi tải thống kê:", error);
      const errorMessage = error.response?.data?.message || "Không thể tải thống kê";
      message.warning(errorMessage);
      setStatistics({
        total_users: 0,
        active_users: 0,
        locked_users: 0,
        new_users_this_month: 0,
      });
    }
  };

  useEffect(() => {
    fetchUsers(pagination.current, pagination.pageSize);
    fetchStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, statusFilter]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1, pagination.pageSize);
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddVisible, setIsAddVisible] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);

  const handleMenuClick = async (key: string, record: User) => {
    setSelectedUser(record);
    switch (key) {
      case "edit":
        setIsEditVisible(true);
        break;
      case "block":
        const newStatus = record.status === "active" ? "locked" : "active";
        const action = newStatus === "locked" ? "khóa" : "mở khóa";
        Modal.confirm({
          title: `${action === "khóa" ? "Khóa" : "Mở khóa"} người dùng`,
          content: `Bạn có chắc muốn ${action} ${record.name}?`,
          okButtonProps: { danger: newStatus === "locked" },
          onOk: async () => {
            try {
              await userService.updateStatus(record.id, newStatus);
              message.success(`Đã ${action} người dùng`);
              fetchUsers(pagination.current, pagination.pageSize);
              fetchStatistics();
            } catch (error: any) {
              const errorMessage = error.response?.data?.message || `Không thể ${action} người dùng!`;
              message.error(errorMessage);
            }
          },
        });
        break;
      case "delete":
        Modal.confirm({
          title: "Xóa người dùng",
          content: `Xóa ${record.name}? Không thể hoàn tác!`,
          okButtonProps: { danger: true },
          onOk: async () => {
            try {
              await userService.deleteUser(record.id);
              message.success("Đã xóa người dùng");
              fetchUsers(pagination.current, pagination.pageSize);
              fetchStatistics();
            } catch (error: any) {
              const errorMessage = error.response?.data?.message || "Không thể xóa người dùng!";
              message.error(errorMessage);
            }
          },
        });
        break;
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleTableChange = (newPagination: any) => {
    fetchUsers(newPagination.current, newPagination.pageSize);
  };

  const columns: ColumnsType<User> = [
    {
      title: "Người dùng",
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar || record.avatar_url} icon={<UserOutlined />} />
          <div>
            <div>{record.name || record.full_name}</div>
            <div style={{ fontSize: 12, color: "#888" }}>ID: {record.id}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role: "admin" | "staff" | "user") => {
        const colors: Record<"admin" | "staff" | "user", string> = {
          admin: "red",
          staff: "blue",
          user: "green",
        };
        const labels: Record<"admin" | "staff" | "user", string> = {
          admin: "Quản trị viên",
          staff: "Nhân viên",
          user: "Người dùng",
        };
        return <Tag color={colors[role]}>{labels[role]}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: "active" | "locked") => {
        const statusConfig: Record<"active" | "locked", { color: string; label: string }> = {
          active: { color: "green", label: "Hoạt động" },
          locked: { color: "red", label: "Bị khóa" },
        };
        const config = statusConfig[status] || { color: "default", label: status };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => {
        const menuItems = [
          { key: "edit", label: "Chỉnh sửa", icon: <EditOutlined /> },
          {
            key: "block",
            label: record.status === "active" ? "Khóa" : "Mở khóa",
            icon: record.status === "active" ? <LockOutlined /> : <UnlockOutlined />,
          },
          {
            key: "delete",
            label: "Xóa",
            icon: <DeleteOutlined />,
            danger: true,
          },
        ];

        return (
          <Dropdown
            menu={{
              items: menuItems,
              onClick: ({ key }) => handleMenuClick(key, record),
            }}
            trigger={["click"]}
          >
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng người dùng"
              value={statistics?.total_users || 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={statistics?.active_users || 0}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Bị khóa"
              value={statistics?.locked_users || 0}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Mới tháng này"
              value={statistics?.new_users_this_month || 0}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Danh sách người dùng"
        extra={
          <Space>
            <Input
              placeholder="Tìm kiếm..."
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              value={roleFilter}
              onChange={setRoleFilter}
              style={{ width: 150 }}
            >
              <Option value="all">Tất cả vai trò</Option>
              <Option value="admin">Quản trị viên</Option>
              <Option value="staff">Nhân viên</Option>
              <Option value="user">Người dùng</Option>
            </Select>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="active">Hoạt động</Option>
              <Option value="locked">Bị khóa</Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={() => fetchUsers(pagination.current, pagination.pageSize)} loading={loading}>
              Làm mới
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddVisible(true)}>
              Thêm người dùng
            </Button>
          </Space>
        }
      >
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={users}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              pageSizeOptions: ["15", "30", "45"],
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} người dùng`,
            }}
            onChange={handleTableChange}
          />
        </Spin>
      </Card>

      <AddUser
        visible={isAddVisible}
        onClose={() => setIsAddVisible(false)}
        onAdd={() => {
          fetchUsers(pagination.current, pagination.pageSize);
          fetchStatistics();
        }}
      />
      {selectedUser && (
        <EditUser
          visible={isEditVisible}
          user={selectedUser}
          onClose={() => {
            setIsEditVisible(false);
            setSelectedUser(null);
          }}
          onUpdate={() => {
            fetchUsers(pagination.current, pagination.pageSize);
            fetchStatistics();
            setIsEditVisible(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

export default ListUser;
