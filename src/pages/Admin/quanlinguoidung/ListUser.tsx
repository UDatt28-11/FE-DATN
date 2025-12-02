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
} from "antd";
import { toast } from "react-toastify";
import {
  SearchOutlined,
  MoreOutlined,
  LockOutlined,
  UnlockOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  EyeOutlined,
  ReloadOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import userService from "../../../service/userService";
import type { User } from "../../../service/authService";
import AddUser from "./AddUser";
import EditUser from "./EditUser";

const { Option } = Select;

const ListUser: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [statistics, setStatistics] = useState<any>(null);
  
  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await userService.getAll({
        search: searchText || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      // Xử lý response có thể có nhiều dạng
      if (result.success && result.data) {
        setUsers(Array.isArray(result.data) ? result.data : []);
      } else if (Array.isArray(result)) {
        setUsers(result);
      } else if (result.data && Array.isArray(result.data)) {
        setUsers(result.data);
      } else {
        setUsers([]);
      }
    } catch (error: any) {
      console.error("Lỗi khi tải danh sách:", error);
      toast.error("Không thể tải danh sách người dùng!");
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const stats = await userService.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error("Lỗi khi tải thống kê:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, statusFilter]);

  // Mock data as fallback (remove this in production)
  useEffect(() => {
    if (users.length === 0 && !loading) {
      setUsers([
          {
              key: "1",
              id: "USR001",
              name: "Nguyễn Văn An",
              email: "nguyenvanan@gmail.com",
              phone: "0901234567",
              avatar: "https://randomuser.me/api/portraits/men/1.jpg",
              role: "host",
              status: "active",
              totalBookings: 45,
              totalSpent: 25000000,
              joinDate: "2023-01-15",
              lastLogin: "2024-10-28",
          },
          {
              key: "2",
              id: "USR002",
              name: "Trần Thị Bình",
              email: "tranthibinh@gmail.com",
              phone: "0912345678",
              avatar: "https://randomuser.me/api/portraits/women/2.jpg",
              role: "guest",
              status: "active",
              totalBookings: 12,
              totalSpent: 8500000,
              joinDate: "2023-03-20",
              lastLogin: "2024-10-29",
          },
          {
              key: "3",
              id: "USR003",
              name: "Lê Hoàng Cường",
              email: "lehoangcuong@gmail.com",
              phone: "0923456789",
              avatar: "https://randomuser.me/api/portraits/men/3.jpg",
              role: "admin",
              status: "active",
              totalBookings: 0,
              totalSpent: 0,
              joinDate: "2022-11-10",
              lastLogin: "2024-10-29",
          },
          {
              key: "4",
              id: "USR004",
              name: "Phạm Thu Dung",
              email: "phamthudung@gmail.com",
              phone: "0934567890",
              avatar: "https://randomuser.me/api/portraits/women/4.jpg",
              role: "guest",
              status: "inactive",
              totalBookings: 3,
              totalSpent: 1200000,
              joinDate: "2024-01-05",
              lastLogin: "2024-09-15",
          },
          {
              key: "5",
              id: "USR005",
              name: "Hoàng Minh Đức",
              email: "hoangminhduc@gmail.com",
              phone: "0945678901",
              avatar: "https://randomuser.me/api/portraits/men/5.jpg",
              role: "host",
              status: "blocked",
              totalBookings: 8,
              totalSpent: 3500000,
              joinDate: "2023-06-18",
              lastLogin: "2024-08-22",
          },
      ]);
    }
  }, [users, loading]);

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
        Modal.confirm({
          title: "Khóa người dùng",
          content: `Bạn có chắc muốn khóa ${record.name}?`,
          okButtonProps: { danger: true },
          onOk: async () => {
            try {
              await userService.block(record.id, "Vi phạm quy định");
              toast.success("Đã khóa người dùng");
              fetchUsers();
            } catch (error) {
              toast.error("Không thể khóa người dùng!");
            }
          },
        });
        break;
      case "unblock":
        try {
          await userService.unblock(record.id);
          toast.success("Đã mở khóa người dùng");
          fetchUsers();
        } catch (error) {
          toast.error("Không thể mở khóa!");
        }
        break;
      case "delete":
        Modal.confirm({
          title: "Xóa người dùng",
          content: `Xóa ${record.name}? Không thể hoàn tác!`,
          okButtonProps: { danger: true },
          onOk: async () => {
            try {
              await userService.remove(record.id);
              toast.success("Đã xóa người dùng");
              fetchUsers();
              fetchStatistics();
            } catch (error) {
              toast.error("Không thể xóa người dùng!");
            }
          },
        });
        break;
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };
  
  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText !== "") {
        fetchUsers();
      }
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const columns: ColumnsType<User> = [
    {
      title: "Người dùng",
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <div>
            <div>{record.name}</div>
            <div style={{ fontSize: 12, color: "#888" }}>{record.id}</div>
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
      render: (role: "admin" | "host" | "guest") => {
        const colors: Record<"admin" | "host" | "guest", string> = {
          admin: "red",
          host: "blue",
          guest: "green",
        };
        const labels: Record<"admin" | "host" | "guest", string> = {
          admin: "Quản trị viên",
          host: "Chủ nhà",
          guest: "Khách hàng",
        };
        return <Tag color={colors[role]}>{labels[role]}</Tag>;
      },
      filters: [
        { text: "Quản trị viên", value: "admin" },
        { text: "Chủ nhà", value: "host" },
        { text: "Khách hàng", value: "guest" },
      ],
      onFilter: (value, record) => record.role === value,
    },

    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "active"
              ? "green"
              : status === "inactive"
              ? "default"
              : "red"
          }
        >
          {status}
        </Tag>
      ),
      filters: [
        { text: "Hoạt động", value: "active" },
        { text: "Không hoạt động", value: "inactive" },
        { text: "Bị khóa", value: "blocked" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: "edit", label: "Chỉnh sửa", icon: <EditOutlined /> },
              { key: "block", label: "Khóa/Mở khóa", icon: <LockOutlined /> },
              {
                key: "delete",
                label: "Xóa",
                icon: <DeleteOutlined />,
                danger: true,
              },
            ],
            onClick: ({ key }) => handleMenuClick(key, record),
          }}
          trigger={["click"]}
        >
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const filteredUsers = Array.isArray(users) ? users.filter(
    (u) =>
      (u.name || "").toLowerCase().includes(searchText.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchText.toLowerCase()) ||
      (u.phone || "").includes(searchText)
  ) : [];

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
              value={statistics?.blocked_users || 0}
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
            />
            <Select
              value={roleFilter}
              onChange={setRoleFilter}
              style={{ width: 150 }}
            >
              <Option value="all">Tất cả vai trò</Option>
              <Option value="admin">Quản trị viên</Option>
              <Option value="staff">Nhân viên</Option>
              <Option value="host">Chủ nhà</Option>
              <Option value="guest">Khách hàng</Option>
            </Select>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Không hoạt động</Option>
              <Option value="blocked">Bị khóa</Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={fetchUsers} loading={loading}>
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
            dataSource={filteredUsers}
            pagination={{
              pageSize: 15,
              pageSizeOptions: ["15", "30", "45"],
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} người dùng`,
            }}
          />
        </Spin>
      </Card>
      
      <AddUser
        visible={isAddVisible}
        onClose={() => setIsAddVisible(false)}
        onAdd={() => {
          fetchUsers();
          fetchStatistics();
        }}
      />
      {selectedUser && (
        <EditUser
          visible={isEditVisible}
          user={selectedUser}
          onClose={() => setIsEditVisible(false)}
          onUpdate={() => {
            fetchUsers();
            setIsEditVisible(false);
          }}
        />
      )}
    </div>
  );
};

export default ListUser;
