import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Input,
  Tooltip,
  Spin,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";

import type { Supply, SupplyStatusBackend } from "../../../types/supply/supplies";
import { statusMapToFrontend } from "../../../types/supply/supplies";
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
      const data = await supplyService.getAll();
      setData(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải danh sách vật tư!");
      setData([]);
    } finally {
      setLoading(false);
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
        try {
          await supplyService.remove(id);
          toast.success("Xóa vật tư thành công!");
          fetchSupplies();
        } catch (err: any) {
          console.error("Lỗi xóa vật tư:", err);
          toast.error(err?.response?.data?.message || "Không thể xóa vật tư!");
        }
      },
    });
  };

  const columns = [
    { title: "ID", dataIndex: "id", width: 70 },
    { title: "Tên vật tư", dataIndex: "name" },
    { title: "Loại", dataIndex: "category" },
    { title: "Đơn vị", dataIndex: "unit", width: 100 },
    {
      title: "Đơn giá (₫)",
      dataIndex: "unit_price",
      render: (v: number) => v?.toLocaleString(),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: Supply["status"]) => {
        const displayStatus = typeof status === "string" && 
          (status === "active" || status === "inactive" || status === "discontinued")
          ? statusMapToFrontend[status as SupplyStatusBackend]
          : status;
        return (
          <Tag color={displayStatus === "Hoạt động" ? "green" : "red"}>
            {displayStatus}
          </Tag>
        );
      },
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
        onAdd={(newSupply: Supply) => {
          fetchSupplies();
          // Tự động mở modal xem chi tiết sau khi thêm thành công
          setSelected(newSupply);
          setViewModal(true);
        }}
      />
      <EditSupply
        visible={editModal}
        supply={selected}
        onCancel={() => setEditModal(false)}
        onUpdate={fetchSupplies}
      />
      <ViewSupply
        visible={viewModal}
        onCancel={() => {
          setViewModal(false);
          setSelected(null);
        }}
        supplyId={selected?.id ?? null}
        supply={selected ?? null}
      />
    </div>
  );
};

export default ListSupplies;