import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Input,
  Tooltip,
  message,
  Spin,
  notification,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import { Supply } from "../../../types/supply/supplies";
import AddSupply from "./addsupply";
import EditSupply from "./editsupply";
import ViewSupply from "./viewsupply";
import supplyService from "../../../service/supplyService";

const { Search } = Input;

const ListSupplies: React.FC = () => {
  const [data, setData] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selected, setSelected] = useState<Supply | null>(null);

  // ✅ Modal context (bắt buộc với AntD v5)
  const [modal, contextHolder] = Modal.useModal();

  /** 🔹 Gọi API lấy danh sách vật tư */
  const fetchSupplies = async () => {
    setLoading(true);
    try {
      const res: any = await supplyService.getAll();
      setData(res.data ?? res ?? []);
    } catch {
      notification.error({
        message: "Lỗi tải dữ liệu",
        description: "Không thể tải danh sách vật tư. Vui lòng thử lại!",
        placement: "topRight",
      });
    } finally {
      setLoading(false); // ✅ Quan trọng
    }
  };

  useEffect(() => {
    fetchSupplies();
  }, []);

  /** 🔹 Lọc theo tìm kiếm */
  const filteredData = data.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase())
  );

  /** 🔹 Xóa vật tư */
  const handleDelete = (id: number | string) => {
    modal.confirm({
      title: "Xóa vật tư?",
      content: "Bạn có chắc chắn muốn xóa? Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
  return supplyService
    .remove(id)
    .then(() => {
      fetchSupplies();
      notification.success({
        message: "Xóa thành công",
        description: "Vật tư đã được xóa khỏi hệ thống.",
        placement: "topRight",
        duration: 2,
      });
    })
    .catch((err: any) => {
      notification.error({
        message: "Xóa thất bại",
        description: err?.response?.data?.message || "Không thể xóa vật tư!",
        placement: "topRight",
        duration: 3,
      });
    });
},

    });
  };

  const columns = [
    { title: "ID", dataIndex: "id", width: 70 },
    { title: "Tên vật tư", dataIndex: "name" },
    { title: "Loại", dataIndex: "category" },
    { title: "Đơn vị", dataIndex: "unit", width: 100 },
    {
      title: "Tồn kho",
      dataIndex: "current_stock",
      sorter: (a: Supply, b: Supply) => a.current_stock - b.current_stock,
    },
    {
      title: "Đơn giá (₫)",
      dataIndex: "unit_price",
      render: (v: number) => v?.toLocaleString(),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: Supply["status"]) => (
        <Tag color={status === "Hoạt động" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 160,
      render: (_: any, record: Supply) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              onClick={() => {
                setSelected(record);
                setViewModal(true);
              }}
            />
          </Tooltip>

          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setSelected(record);
                setEditModal(true);
              }}
            />
          </Tooltip>

          <Tooltip title="Xóa">
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {contextHolder} {/* ✅ Quan trọng: phải có dòng này */}
      <Space style={{ marginBottom: 16 }}>
        <Search
          placeholder="Tìm vật tư..."
          allowClear
          onSearch={setSearch}
          style={{ width: 300 }}
        />

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setAddModal(true)}
        >
          Thêm vật tư
        </Button>

        <Button
          icon={<ReloadOutlined />}
          onClick={fetchSupplies}
          loading={loading}
        >
          Làm mới
        </Button>
      </Space>
      <Spin spinning={loading}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredData}
          pagination={{ pageSize: 10 }}
          bordered
        />
      </Spin>
      <AddSupply
        visible={addModal}
        onCancel={() => setAddModal(false)}
        onAdd={fetchSupplies}
      />
      <EditSupply
        visible={editModal}
        supply={selected}
        onCancel={() => setEditModal(false)}
        onUpdate={fetchSupplies}
      />
      <ViewSupply
        visible={viewModal}
        onCancel={() => setViewModal(false)}
        supplyId={selected?.id ?? null}
      />
    </div>
  );
};

export default ListSupplies;
