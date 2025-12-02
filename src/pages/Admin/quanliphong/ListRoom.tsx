import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Space,
  Input,
  Button,
  Switch,
  message,
  Modal,
  Tooltip,
  Image,
  Tag,
  Spin,
  Select,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import type { Room } from "../../../types/room/room";
import roomService from "../../../service/roomService";

import AddRoom from "./addroom";
import EditRoom from "./editroom";

const ListRoom: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");
  const [pageSize, setPageSize] = useState<number>(15);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    pageSize: 15,
  });
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [verificationFilter, setVerificationFilter] = useState<string | undefined>(undefined);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Load rooms
  const loadRooms = async (page = 1, search = "", status?: string, verification?: string) => {
    setLoading(true);
    try {
      const response = await roomService.getRooms({
        page,
        per_page: pageSize,
        search: search || undefined,
        status: status as any,
        verification_status: verification as any,
      });
      if (response.success) {
        setRooms(Array.isArray(response.data) ? response.data : []);
        if (response.meta?.pagination) {
          setPagination({
            current: response.meta.pagination.current_page,
            total: response.meta.pagination.total,
            pageSize: response.meta.pagination.per_page,
          });
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi tải danh sách phòng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms(1, searchText, statusFilter, verificationFilter);
  }, [searchText, statusFilter, verificationFilter, pageSize]);


  // Xóa room
  const handleDeleteRoom = async (room: Room) => {
    Modal.confirm({
      title: "Xóa phòng",
      content: `Bạn có chắc muốn xóa "${room.name}"?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      async onOk() {
        try {
          const response = await roomService.deleteRoom(room.id);
          if (response.success) {
            toast.success(`Đã xóa phòng "${room.name}"`);
            loadRooms(pagination.current, searchText, statusFilter, verificationFilter);
          } else {
            toast.error(response.message || "Có lỗi xảy ra khi xóa");
          }
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Có lỗi xảy ra khi xóa");
        }
      },
    });
  };

  // Cập nhật trạng thái
  const handleStatusChange = async (room: Room, checked: boolean) => {
    try {
      const newStatus = checked ? 'available' : 'maintenance';
      const response = await roomService.updateStatus(room.id, newStatus);
      if (response.success) {
        toast.success(`Đã cập nhật trạng thái phòng`);
        loadRooms(pagination.current, searchText, statusFilter, verificationFilter);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi cập nhật");
    }
  };

  // Cấu hình phân trang
  const tablePagination: TablePaginationConfig = {
    current: pagination.current,
    pageSize: pagination.pageSize,
    total: pagination.total,
    showSizeChanger: true,
    pageSizeOptions: ["15", "30", "45"],
    onShowSizeChange: (_, size) => {
      setPageSize(size);
      setPagination({ ...pagination, pageSize: size });
    },
    onChange: (page) => {
      loadRooms(page, searchText, statusFilter, verificationFilter);
    },
    showTotal: (total) => `Tổng ${total} phòng`,
  };

  // Cột Table
  const columns: ColumnsType<Room> = [
    { title: "ID", dataIndex: "id", key: "id", width: 80, render: (id) => <>#{id}</> },
    {
      title: "Hình ảnh",
      dataIndex: "images",
      key: "images",
      width: 100,
      render: (images: Room["images"]) => (
        <Image
          src={images?.[0]?.image_url || "https://via.placeholder.com/70"}
          alt="Room"
          width={70}
          height={70}
          style={{ borderRadius: 8, objectFit: "cover" }}
          preview={false}
        />
      ),
    },
    { title: "Tên phòng", dataIndex: "name", key: "name" },
    {
      title: "Property",
      dataIndex: "property",
      key: "property",
      render: (property: Room["property"]) => property?.name || "-",
    },
    {
      title: "Loại phòng",
      dataIndex: "roomType",
      key: "roomType",
      render: (roomType: Room["roomType"]) => roomType?.name || "-",
    },
    {
      title: "Giá/đêm (VNĐ)",
      dataIndex: "price_per_night",
      key: "price_per_night",
      render: (price: number) => price?.toLocaleString('vi-VN') || "0",
    },
    {
      title: "Sức chứa",
      key: "capacity",
      render: (_, record) => (
        <span>{record.max_adults} người lớn, {record.max_children} trẻ em</span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: Room) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          available: { color: "success", text: "Có sẵn" },
          maintenance: { color: "warning", text: "Bảo trì" },
          occupied: { color: "error", text: "Đã thuê" },
        };
        const statusInfo = statusMap[status] || { color: "default", text: status };
        return (
          <Space>
            <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
            <Switch
              checked={status === "available"}
              onChange={(checked) => handleStatusChange(record, checked)}
              size="small"
            />
          </Space>
        );
      },
    },
    {
      title: "Xác minh",
      dataIndex: "verification_status",
      key: "verification_status",
      render: (status?: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          verified: { color: "success", text: "Đã xác minh" },
          pending: { color: "warning", text: "Chờ xác minh" },
          rejected: { color: "error", text: "Từ chối" },
        };
        const statusInfo = status ? statusMap[status] : { color: "default", text: "N/A" };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              onClick={() => navigate(`/admin/listing/view/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              onClick={async () => {
                try {
                  // Fetch room với images để đảm bảo có đầy đủ thông tin
                  const roomResponse = await roomService.getRoomById(record.id, 'property,roomType,amenities,images');
                  if (roomResponse.success && roomResponse.data) {
                    setSelectedRoom(roomResponse.data);
                    setModalMode("edit");
                    setIsModalVisible(true);
                  } else {
                    toast.error("Không thể tải thông tin phòng");
                  }
                } catch (error: any) {
                  console.error("Error loading room:", error);
                  toast.error("Không thể tải thông tin phòng");
                }
              }}
              icon={<EditOutlined />}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              danger
              onClick={() => handleDeleteRoom(record)}
              icon={<DeleteOutlined />}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <HomeOutlined /> Quản lý phòng
        </Space>
      }
      extra={
        <Space>
          <Input
            placeholder="Tìm kiếm..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 250 }}
          />
          <Select
            placeholder="Trạng thái"
            allowClear
            style={{ width: 150 }}
            value={statusFilter}
            onChange={setStatusFilter}
          >
            <Select.Option value="available">Có sẵn</Select.Option>
            <Select.Option value="maintenance">Bảo trì</Select.Option>
            <Select.Option value="occupied">Đã thuê</Select.Option>
          </Select>
          <Select
            placeholder="Xác minh"
            allowClear
            style={{ width: 150 }}
            value={verificationFilter}
            onChange={setVerificationFilter}
          >
            <Select.Option value="verified">Đã xác minh</Select.Option>
            <Select.Option value="pending">Chờ xác minh</Select.Option>
            <Select.Option value="rejected">Từ chối</Select.Option>
          </Select>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setModalMode("add");
              setIsModalVisible(true);
            }}
          >
            Thêm phòng
          </Button>
        </Space>
      }
    >
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={rooms}
          pagination={tablePagination}
          rowKey="id"
          scroll={{ x: 1500 }}
        />
      </Spin>

      {/* Modal thêm / sửa */}
      {modalMode === "add" && (
        <AddRoom
          visible={isModalVisible}
          onClose={() => {
            setIsModalVisible(false);
            loadRooms(pagination.current, searchText, statusFilter, verificationFilter);
          }}
        />
      )}
      {modalMode === "edit" && selectedRoom && (
        <EditRoom
          visible={isModalVisible}
          room={selectedRoom}
          onClose={() => {
            setIsModalVisible(false);
            loadRooms(pagination.current, searchText, statusFilter, verificationFilter);
          }}
        />
      )}
    </Card>
  );
};

export default ListRoom;
