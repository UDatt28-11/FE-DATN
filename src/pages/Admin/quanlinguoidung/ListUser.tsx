import React, { useState } from "react";
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Tag,
  Avatar,
  Dropdown,
  message,
  Modal,
} from "antd";
import {
  SearchOutlined,
  MoreOutlined,
  LockOutlined,
  UnlockOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { User } from "../../../types/user/user";
import AddUser from "./AddUser";
import EditUser from "./EditUser";

const ListUser: React.FC = () => {
  // const [users, setUsers] = useState<User[]>([]); // TODO: load từ API
      const [users, setUsers] = useState<User[]>([
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
  const [searchText, setSearchText] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddVisible, setIsAddVisible] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);

  const handleMenuClick = (key: string, record: User) => {
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
          onOk: () => message.success("Đã khóa người dùng"),
        });
        break;
      case "delete":
        Modal.confirm({
          title: "Xóa người dùng",
          content: `Xóa ${record.name}? Không thể hoàn tác!`,
          okButtonProps: { danger: true },
          onOk: () => setUsers(users.filter((u) => u.key !== record.key)),
        });
        break;
    }
  };

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

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchText.toLowerCase()) ||
      u.email.toLowerCase().includes(searchText.toLowerCase()) ||
      u.phone.includes(searchText)
  );

  return (
    <Card
      title="Danh sách người dùng"
      extra={
        <Space>
          <Input
            placeholder="Tìm kiếm..."
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button type="primary" onClick={() => setIsAddVisible(true)}>
            Thêm người dùng
          </Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={filteredUsers}
        pagination={{
          pageSizeOptions: ["15", "30", "45"],
          showSizeChanger: true,
        }}
      />
      <AddUser
        visible={isAddVisible}
        onClose={() => setIsAddVisible(false)}
        onAdd={(newUser) => setUsers([newUser, ...users])}
      />
      {selectedUser && (
        <EditUser
          visible={isEditVisible}
          user={selectedUser}
          onClose={() => setIsEditVisible(false)}
          onUpdate={(updatedUser) =>
            setUsers(
              users.map((u) => (u.key === updatedUser.key ? updatedUser : u))
            )
          }
        />
      )}
    </Card>
  );
};

export default ListUser;
