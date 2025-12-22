import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Input,
  Button,
  Space,
  Tag,
  Tooltip,
  Modal,
  Spin,
  Select,
  Dropdown,
} from "antd";
import { toast } from "react-toastify";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ShoppingOutlined,
  MoreOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import axios from "../../../service/axiosConfig";
import type { Service } from "../../../types/service/service";
import serviceService from "../../../service/serviceService";
import AddService from "./AddService";
import EditService from "./EditService";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface Property {
  id: number;
  name: string;
}

const ListService: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(15);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    pageSize: 15,
  });
  const [propertyFilter, setPropertyFilter] = useState<number | undefined>(undefined);
  const [properties, setProperties] = useState<Property[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Load properties
  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/properties`);
      if (response.data.success) {
        setProperties(Array.isArray(response.data.data) ? response.data.data : []);
      }
    } catch (error) {
      console.error("Error loading properties:", error);
    }
  };

  // Load services
  const loadServices = async (page = 1, search = "", propertyId?: number) => {
    setLoading(true);
    try {
      const response = await serviceService.getServices({
        page,
        per_page: pageSize,
        search: search || undefined,
        property_id: propertyId,
      });
      if (response.success) {
        setServices(Array.isArray(response.data) ? response.data : []);
        if (response.meta?.pagination) {
          setPagination({
            current: response.meta.pagination.current_page,
            total: response.meta.pagination.total,
            pageSize: response.meta.pagination.per_page,
          });
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi tải danh sách dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices(1, searchText, propertyFilter);
  }, [searchText, propertyFilter, pageSize]);

  // Cập nhật trạng thái
  const handleToggleStatus = async (service: Service) => {
    try {
      const newStatus = service.status === 'active' ? 'disabled' : 'active';
      const response = await serviceService.updateStatus(service.id, newStatus);
      if (response.success) {
        toast.success(`Đã cập nhật trạng thái dịch vụ "${service.name}"`);
        loadServices(pagination.current, searchText, propertyFilter);
      } else {
        toast.error(response.message || "Có lỗi xảy ra khi cập nhật trạng thái");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi cập nhật trạng thái");
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
      loadServices(page, searchText, propertyFilter);
    },
    showTotal: (total) => `Tổng ${total} dịch vụ`,
  };

  // Cột Table
  const columns: ColumnsType<Service> = [
    { title: "ID", dataIndex: "id", key: "id", width: 80, render: (id) => <>#{id}</> },
    { title: "Tên dịch vụ", dataIndex: "name", key: "name" },
    {
      title: "Property",
      dataIndex: "property",
      key: "property",
      render: (property: Service["property"]) => property?.name || "-",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      align: "right",
      render: (price: number) => `${price?.toLocaleString('vi-VN')} VNĐ`,
    },
    {
      title: "Đơn vị",
      dataIndex: "unit",
      key: "unit",
      render: (unit: string) => <Tag>{unit}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status: string, record: Service) => (
        <Tag
          color={status === "active" ? "success" : "default"}
          style={{ cursor: "pointer", minWidth: 100, textAlign: "center" }}
          onClick={() => handleToggleStatus(record)}
        >
          {status === "active" ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (date?: string) => date ? new Date(date).toLocaleDateString("vi-VN") : "-",
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      render: (_, record) => {
        const menuItems = [
          {
            key: "edit",
            label: "Chỉnh sửa",
            icon: <EditOutlined />,
            onClick: () => {
              setSelectedService(record);
              setEditModalVisible(true);
            },
          },
          {
            key: "toggle-status",
            label: record.status === "active" ? "Ngưng hoạt động" : "Kích hoạt",
            icon: record.status === "active" ? <StopOutlined /> : <CheckCircleOutlined />,
            onClick: () => handleToggleStatus(record),
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
    <Card
      title={
        <Space>
          <ShoppingOutlined /> Quản lý dịch vụ
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
            placeholder="Lọc theo property"
            allowClear
            style={{ width: 200 }}
            value={propertyFilter}
            onChange={setPropertyFilter}
            showSearch
            optionFilterProp="children"
          >
            {properties.map((prop) => (
              <Select.Option key={prop.id} value={prop.id}>
                {prop.name}
              </Select.Option>
            ))}
          </Select>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAddModalVisible(true)}
          >
            Thêm dịch vụ
          </Button>
        </Space>
      }
    >
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={services}
          pagination={tablePagination}
          rowKey="id"
          scroll={{ x: 1000 }}
        />
      </Spin>

      {/* Modal thêm / sửa */}
      <AddService
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onAdd={() => {
          setAddModalVisible(false);
          loadServices(pagination.current, searchText, propertyFilter);
        }}
      />
      {selectedService && (
        <EditService
          visible={editModalVisible}
          service={selectedService}
          onCancel={() => {
            setEditModalVisible(false);
            setSelectedService(null);
          }}
          onUpdate={() => {
            setEditModalVisible(false);
            setSelectedService(null);
            loadServices(pagination.current, searchText, propertyFilter);
          }}
        />
      )}
    </Card>
  );
};

export default ListService;

