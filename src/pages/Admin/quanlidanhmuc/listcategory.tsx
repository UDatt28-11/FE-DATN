import React, { useState } from "react";
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
  Modal, // 🟢 THÊM MỚI
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
  DeleteOutlined, // 🟢 THÊM MỚI
  ExclamationCircleOutlined, // 🟢 THÊM MỚI
} from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";

import AddCategory from "./addcategory";
import EditCategory from "./editcategory";
import DetailCategory from "./detailcategory";
import type { Amenity, Category } from "../../../types/category/category";

const { confirm } = Modal; // 🟢 THÊM MỚI

const ListCategory: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([
    {
      key: "1",
      id: 1,
      name: "Nhà gỗ",
      description:
        "Homestay kiểu nhà gỗ truyền thống, gần gũi với thiên nhiên, phù hợp cho du khách yêu thích sự yên tĩnh.",
      image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233",
      status: "active",
      amenityCount: 12,
      homestayCount: 45,
      createdAt: "2023-01-15",
      updatedAt: "2024-10-20",
    },
    {
      key: "2",
      id: 2,
      name: "Căn hộ",
      description:
        "Căn hộ hiện đại, đầy đủ tiện nghi, nằm ở trung tâm thành phố, thuận tiện đi lại.",
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
      status: "active",
      amenityCount: 18,
      homestayCount: 67,
      createdAt: "2023-02-10",
      updatedAt: "2024-10-25",
    },
    {
      key: "3",
      id: 3,
      name: "Villa",
      description:
        "Biệt thự sang trọng với hồ bơi riêng, phù hợp cho gia đình hoặc nhóm bạn.",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
      status: "active",
      amenityCount: 25,
      homestayCount: 23,
      createdAt: "2023-03-05",
      updatedAt: "2024-10-28",
    },
    {
      key: "4",
      id: 4,
      name: "Nhà vườn",
      description:
        "Nhà vườn rộng rãi, không gian xanh mát, thích hợp nghỉ dưỡng cuối tuần.",
      image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
      status: "inactive",
      amenityCount: 10,
      homestayCount: 15,
      createdAt: "2023-04-12",
      updatedAt: "2024-09-30",
    },
    {
      key: "5",
      id: 5,
      name: "Nhà container",
      description:
        "Homestay độc đáo từ container, phong cách hiện đại, sáng tạo.",
      image: "https://images.unsplash.com/photo-1449844908441-8829872d2607",
      status: "active",
      amenityCount: 8,
      homestayCount: 12,
      createdAt: "2023-05-20",
      updatedAt: "2024-10-15",
    },
  ]);

  const [historyCategories, setHistoryCategories] = useState<Category[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(15);
  const [activeTab, setActiveTab] = useState<string>("list");

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  const allAmenities: Amenity[] = [
    { id: 1, name: "WiFi miễn phí", icon: "📶" },
    { id: 2, name: "Điều hòa", icon: "❄️" },
    { id: 3, name: "Bếp", icon: "🍳" },
    { id: 4, name: "Máy giặt", icon: "🧺" },
  ];

  // 🟢 THÊM HÀM XÓA DANH MỤC
  const handleDeleteCategory = (record: Category) => {
    confirm({
      title: `Bạn có chắc muốn xóa danh mục "${record.name}"?`,
      icon: <ExclamationCircleOutlined />,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk() {
        setCategories((prev) => prev.filter((cat) => cat.id !== record.id));
        setHistoryCategories((prev) => [...prev, record]);
        toast.success(`Đã xóa danh mục "${record.name}"`);
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

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const pagination: TablePaginationConfig = {
    pageSize,
    showSizeChanger: true,
    pageSizeOptions: ["15", "30", "45"],
    onShowSizeChange: (_, size) => setPageSize(size),
    showTotal: (total) => `Tổng ${total} danh mục`,
  };

  const columns: ColumnsType<Category> = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      width: 100,
      render: (image: string) => (
        <Image
          src={image}
          alt="category"
          width={60}
          height={60}
          style={{ objectFit: "cover", borderRadius: 8 }}
        />
      ),
    },
    { title: "Tên danh mục", dataIndex: "name", key: "name" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: getStatusTag,
    },
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
                setSelectedCategory(record);
                setDetailModalVisible(true);
              }}
            />
          </Tooltip>

          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              type="primary"
              onClick={() => {
                setSelectedCategory(record);
                setEditModalVisible(true);
              }}
            />
          </Tooltip>

          {/* 🟢 NÚT XÓA DANH MỤC */}
          <Tooltip title="Xóa danh mục">
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDeleteCategory(record)}
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
          <HomeOutlined /> Danh sách danh mục
        </span>
      ),
      children: (
        <Card
          title={
            <Space>
              <HomeOutlined style={{ fontSize: 20, color: "#1890ff" }} />
              Quản lý Danh mục Homestay
            </Space>
          }
          extra={
            <Space>
              <Input
                placeholder="Tìm kiếm..."
                prefix={<SearchOutlined />}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setAddModalVisible(true)}
              >
                Thêm danh mục
              </Button>
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={filteredCategories}
            pagination={pagination}
            rowKey={(record) => record.key || record.id}
            scroll={{ x: 1200 }}
          />
        </Card>
      ),
    },
    {
      key: "history",
      label: (
        <span>
          <HistoryOutlined /> Lịch sử ({historyCategories.length})
        </span>
      ),
      children: (
        <Card
          title={
            <Space>
              <HistoryOutlined style={{ fontSize: 20, color: "#ff4d4f" }} />
              Lịch sử Danh mục
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={historyCategories}
            pagination={pagination}
            rowKey={(record) => record.key || record.id}
          />
        </Card>
      ),
    },
  ];

  const handleAddCategory = (
    values: any,
    fileList: any[],
    selectedAmenities: number[]
  ) => {
    const newCategory: Category = {
      key: Date.now().toString(),
      id: categories.length + 1,
      name: values.name,
      description: values.description,
      image: fileList[0]?.thumbUrl || "https://via.placeholder.com/150",
      status: "active",
      amenityCount: selectedAmenities.length,
      homestayCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };
    setCategories([...categories, newCategory]);
    setAddModalVisible(false);
    toast.success("Đã thêm danh mục mới!");
  };

  return (
    <>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabsItems} />

      {/* --- MODALS --- */}
      <AddCategory
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onAdd={handleAddCategory}
        amenities={allAmenities}
      />

      <EditCategory
        visible={editModalVisible}
        category={selectedCategory}
        onCancel={() => setEditModalVisible(false)}
        onUpdate={() => {}}
        amenities={allAmenities}
      />

      <DetailCategory
        visible={detailModalVisible}
        category={selectedCategory}
        onClose={() => setDetailModalVisible(false)}
        onEdit={(cat) => {
          setSelectedCategory(cat);
          setEditModalVisible(true);
        }}
        amenities={allAmenities}
      />
    </>
  );
};

export default ListCategory;
