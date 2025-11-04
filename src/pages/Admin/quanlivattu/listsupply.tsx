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

  /** 🔹 Gọi API lấy danh sách vật tư */
  const fetchSupplies = async () => {
    setLoading(true);
    try {
      const res: any = await supplyService.getAll(); // dùng any tạm thời
      if (Array.isArray(res)) {
        setData(res);
      } else if (Array.isArray(res.data)) {
        setData(res.data); // ✅ Lấy mảng từ res.data nếu API trả object
      } else {
        setData([]); // fallback an toàn
        message.warning("API không trả về danh sách hợp lệ!");
      }
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách vật tư!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplies();
  }, []);

  /** 🔹 Tìm kiếm */
  const filteredData = data.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase())
  );

  /** 🔹 Xóa vật tư */
  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "Xóa vật tư này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      async onOk() {
        try {
          await supplyService.remove(id);
          setData((prev) => prev.filter((d) => d.id !== id));
          message.success("Đã xóa vật tư thành công!");
        } catch (err) {
          message.error("Không thể xóa vật tư!");
        }
      },
    });
  };

  /** 🔹 Khi thêm vật tư mới */
  const handleAdd = async (s: Supply) => {
    try {
      const newItem = await supplyService.create(s);
      setData((prev) => [...prev, newItem]);
      message.success("Thêm vật tư thành công!");
    } catch (err) {
      message.error("Không thể thêm vật tư!");
    }
  };

  /** 🔹 Khi cập nhật vật tư */
  const handleUpdate = async (s: Supply) => {
    try {
      const updated = await supplyService.update(s.id, s);
      setData((prev) => prev.map((d) => (d.id === s.id ? updated : d)));
      message.success("Cập nhật vật tư thành công!");
    } catch (err) {
      message.error("Không thể cập nhật vật tư!");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      sorter: (a: Supply, b: Supply) => a.id - b.id,
      width: 70,
    },
    {
      title: "Tên vật tư",
      dataIndex: "name",
      sorter: (a: Supply, b: Supply) => a.name.localeCompare(b.name),
    },
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
      render: (v: number) => v.toLocaleString(),
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
      width: 150,
      render: (_: any, record: Supply) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              onClick={() => {
                setSelected(record); // lưu toàn bộ object để dùng cho các thao tác khác
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
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
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

      {/* Modal thêm vật tư */}
      <AddSupply
        visible={addModal}
        onCancel={() => setAddModal(false)}
        onAdd={handleAdd}
      />

      {/* Modal sửa vật tư */}
      <EditSupply
        visible={editModal}
        supply={selected}
        onCancel={() => setEditModal(false)}
        onUpdate={handleUpdate}
      />

      {/* Modal xem chi tiết vật tư */}
      <ViewSupply
        visible={viewModal}
        onCancel={() => setViewModal(false)}
        supplyId={selected ? selected.id : null}
      />
    </div>
  );
};

export default ListSupplies;
