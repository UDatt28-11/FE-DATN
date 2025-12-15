import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Input,
  Button,
  Space,
  Tag,
  Tooltip,
  Tabs,
  Image,
  Modal,
  Spin,
} from "antd";
import { toast } from "react-toastify";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  EyeOutlined,
  HistoryOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";

import AddCategory from "./addcategory";
import EditCategory from "./editcategory";
import DetailCategory from "./detailcategory";
import type { RoomType } from "../../../types/roomtype/roomtype";
import roomtypeService from "../../../service/roomtypeService";

const { confirm } = Modal;

const ListCategory: React.FC = () => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [historyRoomTypes, setHistoryRoomTypes] = useState<RoomType[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(15);
  const [activeTab, setActiveTab] = useState<string>("list");
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    pageSize: 15,
  });

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null);

  // Load room types
  const loadRoomTypes = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const response = await roomtypeService.getRoomTypes({
        page,
        per_page: pageSize,
        search: search || undefined,
      });
      if (response.success) {
        setRoomTypes(Array.isArray(response.data) ? response.data : []);
        if (response.meta?.pagination) {
          setPagination({
            current: response.meta.pagination.current_page,
            total: response.meta.pagination.total,
            pageSize: response.meta.pagination.per_page,
          });
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi tải danh sách loại phòng");
    } finally {
      setLoading(false);
    }
  };

  // Load history
  const loadHistory = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const response = await roomtypeService.getHistory({
        page,
        per_page: pageSize,
        search: search || undefined,
      });
      if (response.success) {
        setHistoryRoomTypes(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi tải lịch sử");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "list") {
      loadRoomTypes(1, searchText);
    } else {
      loadHistory(1, searchText);
    }
  }, [activeTab, searchText, pageSize]);

  // Xóa room type
  const handleDeleteRoomType = async (record: RoomType) => {
    confirm({
      title: `Bạn có chắc muốn xóa loại phòng "${record.name}"?`,
      icon: <ExclamationCircleOutlined />,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      async onOk() {
        try {
          const response = await roomtypeService.deleteRoomType(record.id);
          if (response.success) {
            toast.success(`Đã xóa loại phòng "${record.name}"`);
            loadRoomTypes(pagination.current, searchText);
          } else {
            toast.error(response.message || "Có lỗi xảy ra khi xóa");
          }
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Có lỗi xảy ra khi xóa");
        }
      },
    });
  };

  const getStatusTag = (status: string) =>
    status === "active" ? (
      <Tag icon={<CheckCircleOutlined />} color="success">
        Kích hoạt
      </Tag>
    ) : (
      <Tag icon={<CloseCircleOutlined />} color="default">
        Khóa
      </Tag>
    );

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
      if (activeTab === "list") {
        loadRoomTypes(page, searchText);
      } else {
        loadHistory(page, searchText);
      }
    },
    showTotal: (total) => `Tổng ${total} loại phòng`,
  };

  const columns: ColumnsType<RoomType> = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    {
      title: "Hình ảnh",
      dataIndex: "image_url",
      key: "image_url",
      width: 100,
      render: (image: string) => (
        <Image
          src={image || "https://via.placeholder.com/60"}
          alt="roomtype"
          width={60}
          height={60}
          style={{ objectFit: "cover", borderRadius: 8 }}
        />
      ),
    },
    { title: "Tên loại phòng", dataIndex: "name", key: "name" },
    {
      title: "Property",
      dataIndex: "property",
      key: "property",
      render: (property: RoomType["property"]) => property?.name || "-",
    },
    { title: "Trạng thái", dataIndex: "status", key: "status", render: getStatusTag },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              type="default"
              onClick={() => {
                setSelectedRoomType(record);
                setDetailModalVisible(true);
              }}
            />
          </Tooltip>

          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              type="primary"
              onClick={() => {
                setSelectedRoomType(record);
                setEditModalVisible(true);
              }}
            />
          </Tooltip>

          <Tooltip title="Xóa loại phòng">
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDeleteRoomType(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const tabsItems = [
    {
      key: "list",
      label: (
        <span>
          <HomeOutlined /> Danh sách loại phòng
        </span>
      ),
      children: (
        <Card
          title={
            <Space>
              <HomeOutlined style={{ fontSize: 20, color: "#1890ff" }} />
              Quản lý Loại Phòng
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
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setAddModalVisible(true)}
              >
                Thêm loại phòng
              </Button>
            </Space>
          }
        >
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={roomTypes}
              pagination={tablePagination}
              rowKey={(record) => record.id}
              scroll={{ x: 1200 }}
            />
          </Spin>
        </Card>
      ),
    },
    {
      key: "history",
      label: (
        <span>
          <HistoryOutlined /> Lịch sử ({historyRoomTypes.length})
        </span>
      ),
      children: (
        <Card
          title={
            <Space>
              <HistoryOutlined style={{ fontSize: 20, color: "#ff4d4f" }} />
              Lịch sử Loại Phòng
            </Space>
          }
        >
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={historyRoomTypes}
              pagination={tablePagination}
              rowKey={(record) => record.id}
            />
          </Spin>
        </Card>
      ),
    },
  ];

  const handleAddRoomType = async (
    values: any,
    fileList: any[],
    selectedAmenities: number[]
  ) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description || "");

      // property_id là required, phải có giá trị
      if (!values.property_id) {
        toast.error("Vui lòng chọn cơ sở lưu trú!");
        return;
      }
      formData.append("property_id", values.property_id.toString());

      if (fileList[0]?.originFileObj) {
        formData.append("image_file", fileList[0].originFileObj);
      }

      const response = await roomtypeService.createRoomType(formData);
      if (response.success) {
        toast.success("Đã thêm loại phòng mới!");
        setAddModalVisible(false);
        loadRoomTypes(pagination.current, searchText);
      } else {
        toast.error(response.message || "Có lỗi xảy ra khi thêm");
      }
    } catch (error: any) {
      console.error('Error creating room type:', error);
      // Hiển thị lỗi validation chi tiết nếu có
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        toast.error(errorMessages.join(', '));
      } else {
        toast.error(error.response?.data?.message || "Có lỗi xảy ra khi thêm");
      }
    }
  };

  const handleUpdateRoomType = async (
    values: any,
    fileList: any[],
    selectedAmenities: number[]
  ) => {
    if (!selectedRoomType) return;
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description || "");
      formData.append("status", values.status || "active");

      // property_id là required
      if (!values.property_id) {
        toast.error("Vui lòng chọn cơ sở lưu trú!");
        return;
      }
      formData.append("property_id", values.property_id.toString());

      // Images are now handled directly in EditCategory component
      // No need to append image_file here anymore
      formData.append("_method", "PUT");

      const response = await roomtypeService.updateRoomType(selectedRoomType.id, formData);
      if (response.success) {
        // Success message is already shown in EditCategory
        setEditModalVisible(false);
        loadRoomTypes(pagination.current, searchText);
      } else {
        toast.error(response.message || "Có lỗi xảy ra khi cập nhật");
      }
    } catch (error: any) {
      console.error('Error updating room type:', error);
      // Hiển thị lỗi validation chi tiết nếu có
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        toast.error(errorMessages.join(', '));
      } else {
        toast.error(error.response?.data?.message || "Có lỗi xảy ra khi cập nhật");
      }
    }
  };

  return (
    <>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabsItems} />

      {/* --- MODALS --- */}
      <AddCategory
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onAdd={handleAddRoomType}
      />

      <EditCategory
        visible={editModalVisible}
        roomType={selectedRoomType}
        onCancel={() => setEditModalVisible(false)}
        onUpdate={handleUpdateRoomType}
      />

      <DetailCategory
        visible={detailModalVisible}
        roomType={selectedRoomType}
        onClose={() => setDetailModalVisible(false)}
        onEdit={(rt) => {
          setSelectedRoomType(rt);
          setEditModalVisible(true);
        }}
      />
    </>
  );
};

export default ListCategory;
