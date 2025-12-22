import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Tag,
  Modal,
  Dropdown,
  Select,
  Spin,
  Image,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { toast } from "react-toastify";
import type { Amenity } from "../../../types/amenity/amenity";
import amenityService from "../../../service/amenityService";
import AddAmenity from "./addamenity";
import EditAmenity from "./editamenity";

const { Search } = Input;

const ListAmenity: React.FC = () => {
  const [data, setData] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const [pageSize, setPageSize] = useState<number>(15);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    pageSize: 15,
  });
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);

  // Load amenities
  const loadAmenities = async (page = 1, searchText = "", type?: string) => {
    setLoading(true);
    try {
      const response = await amenityService.getAmenities({
        page,
        per_page: pageSize,
        search: searchText || undefined,
        type: type as any,
      });
      if (response.success) {
        setData(Array.isArray(response.data) ? response.data : []);
        if (response.meta?.pagination) {
          setPagination({
            current: response.meta.pagination.current_page,
            total: response.meta.pagination.total,
            pageSize: response.meta.pagination.per_page,
          });
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi tải danh sách tiện ích");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAmenities(1, search, filterType);
  }, [search, filterType, pageSize]);

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: "Xóa tiện ích này?",
      content: "Thao tác này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      async onOk() {
        try {
          const response = await amenityService.deleteAmenity(id);
          if (response.success) {
            toast.success("Đã xóa tiện ích!");
            loadAmenities(pagination.current, search, filterType);
          } else {
            toast.error(response.message || "Có lỗi xảy ra khi xóa");
          }
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Có lỗi xảy ra khi xóa");
        }
      },
    });
  };

  const typeMap: Record<string, { color: string; text: string }> = {
    basic: { color: "blue", text: "Cơ bản" },
    advanced: { color: "purple", text: "Nâng cao" },
    safety: { color: "red", text: "An toàn" },
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const response = await amenityService.toggleStatus(id);
      if (response.success) {
        toast.success(response.message || "Đã cập nhật trạng thái tiện ích!");
        loadAmenities(pagination.current, search, filterType);
      } else {
        toast.error(response.message || "Có lỗi xảy ra khi cập nhật trạng thái");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

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
      loadAmenities(page, search, filterType);
    },
    showTotal: (total) => `Tổng ${total} tiện ích`,
  };

  const columns: ColumnsType<Amenity> = [
    {
      title: "ID",
      dataIndex: "id",
      width: 70,
    },
    {
      title: "Biểu tượng",
      dataIndex: "icon_url",
      width: 100,
      render: (iconUrl?: string) => {
        if (iconUrl) {
          return (
            <Image
              src={iconUrl}
              alt="icon"
              width={40}
              height={40}
              style={{ objectFit: "cover", borderRadius: 4 }}
              preview={false}
            />
          );
        }
        return <span style={{ fontSize: 20 }}>📦</span>;
      },
    },
    {
      title: "Tên tiện ích",
      dataIndex: "name",
    },
    {
      title: "Property",
      dataIndex: "property",
      render: (property: Amenity["property"]) => property?.name || "-",
    },
    {
      title: "Loại",
      dataIndex: "type",
      render: (type: Amenity["type"]) => {
        const typeInfo = typeMap[type] || { color: "default", text: type };
        return <Tag color={typeInfo.color}>{typeInfo.text}</Tag>;
      },
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      render: (category?: string) => category || "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 130,
      render: (status: string, record: Amenity) => (
        <Tag
          color={status === "active" ? "success" : "default"}
          style={{ cursor: "pointer", minWidth: 100, textAlign: "center" }}
          onClick={() => handleToggleStatus(record.id)}
        >
          {status === "active" ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updated_at",
      render: (date?: string) => date ? new Date(date).toLocaleDateString("vi-VN") : "-",
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      render: (_: any, record: Amenity) => {
        const menuItems = [
          {
            key: "edit",
            label: "Chỉnh sửa",
            icon: <EditOutlined />,
            onClick: () => {
              setSelectedAmenity(record);
              setEditModal(true);
            },
          },
          {
            key: "toggle-status",
            label: record.status === "active" ? "Tắt hoạt động" : "Bật hoạt động",
            icon: record.status === "active" ? <StopOutlined /> : <CheckCircleOutlined />,
            onClick: () => handleToggleStatus(record.id),
          },
          {
            key: "delete",
            label: "Xóa",
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => handleDelete(record.id),
          },
        ];
        return (
          <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16, flexWrap: "wrap" }}>
        <Search
          placeholder="Tìm kiếm tiện ích..."
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={(value) => loadAmenities(1, value, filterType)}
          style={{ width: 260 }}
        />
        <Select
          placeholder="Lọc theo loại"
          allowClear
          style={{ width: 160 }}
          value={filterType}
          onChange={setFilterType}
        >
          <Select.Option value="basic">Cơ bản</Select.Option>
          <Select.Option value="advanced">Nâng cao</Select.Option>
          <Select.Option value="safety">An toàn</Select.Option>
        </Select>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setAddModal(true)}
        >
          Thêm tiện ích
        </Button>
      </Space>

      <Spin spinning={loading}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          pagination={tablePagination}
          bordered
        />
      </Spin>

      <AddAmenity
        visible={addModal}
        onCancel={() => setAddModal(false)}
        onAdd={() => {
          setAddModal(false);
          loadAmenities(pagination.current, search, filterType);
        }}
      />
      <EditAmenity
        visible={editModal}
        amenity={selectedAmenity}
        onCancel={() => setEditModal(false)}
        onUpdate={() => {
          setEditModal(false);
          loadAmenities(pagination.current, search, filterType);
        }}
      />
    </div>
  );
};

export default ListAmenity;
