// src/pages/quanlihoadon/listInvoice.tsx

import React, { useEffect, useState } from "react";
import {
  Table,
  Space,
  Button,
  Input,
  Select,
  Tag,
  Popconfirm,
  message,
  Spin,
  Row,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import type { ColumnsType } from "antd/es/table";
import { Invoice } from "../../../types/invoices/invoice";
import invoiceService from "../../../service/invoiceService";

const { Search } = Input;
const { Option } = Select;

const ListInvoice: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const data = await invoiceService.getAll();
      setInvoices(data);
      setFilteredInvoices(data);
    } catch (error: any) {
      console.error(error);
      message.error("Không thể tải danh sách hóa đơn!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleSearch = (value: string) => {
    const searchLower = value.toLowerCase();
    const filtered = invoices.filter(
      (i) =>
        String(i.id).includes(searchLower) ||
        String(i.booking_order_id).includes(searchLower)
    );
    setFilteredInvoices(filtered);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    if (value === "all") {
      setFilteredInvoices(invoices);
    } else {
      setFilteredInvoices(invoices.filter((i) => i.status === value));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      // Kiểm tra status trước khi xóa
      const invoice = invoices.find((i) => i.id === id);
      if (invoice && !["pending", "cancelled"].includes(invoice.status)) {
        message.error(
          `Chỉ có thể xóa hóa đơn chưa thanh toán. Status hiện tại: ${invoice.status}`
        );
        return;
      }

      await invoiceService.remove(id);
      setInvoices(invoices.filter((i) => i.id !== id));
      setFilteredInvoices(filteredInvoices.filter((i) => i.id !== id));
      message.success("Xóa hóa đơn thành công!");
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message || "Xóa hóa đơn thất bại!";
      message.error(errorMsg);
      console.error("Delete error:", error);
    }
  };

  const columns: ColumnsType<Invoice> = [
    { title: "ID", dataIndex: "id" },
    { title: "Booking", dataIndex: "booking_order_id" },
    {
      title: "Ngày xuất",
      dataIndex: "issue_date",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Ngày hết hạn",
      dataIndex: "due_date",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "total_amount",
      render: (val) => val.toLocaleString("vi-VN") + "₫",
    },
    {
      title: "Giảm giá",
      dataIndex: "discount_amount",
      render: (val) => val.toLocaleString("vi-VN") + "₫",
    },
    {
      title: "Hoàn tiền",
      dataIndex: "refund_amount",
      render: (val) => val.toLocaleString("vi-VN") + "₫",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "paid" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Hành động",
      render: (_, record) => {
        const canDelete = ["pending", "cancelled"].includes(record.status);
        return (
          <Space>
            <Button
              type="default"
              onClick={() => navigate(`/admin/invoice/view/${record.id}`)}
            >
              Xem
            </Button>
            <Popconfirm
              title="Xóa hóa đơn?"
              description={
                canDelete
                  ? "Hóa đơn sẽ bị xóa vĩnh viễn khỏi database"
                  : "Chỉ có thể xóa hóa đơn chưa thanh toán hoặc đã hủy"
              }
              onConfirm={() => handleDelete(record.id)}
              disabled={!canDelete}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={!canDelete}
                title={!canDelete ? "Không thể xóa hóa đơn đã thanh toán" : ""}
              />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Space>
          <Search
            placeholder="Tìm theo ID hoặc Booking ID..."
            enterButton={<SearchOutlined />}
            onSearch={handleSearch}
            style={{ width: 260 }}
          />
          <Select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            style={{ width: 160 }}
          >
            <Option value="all">Tất cả</Option>
            <Option value="pending">Chờ thanh toán</Option>
            <Option value="paid">Đã thanh toán</Option>
            <Option value="cancelled">Đã hủy</Option>
          </Select>
        </Space>

        <Button
          icon={<ReloadOutlined />}
          onClick={fetchInvoices}
          loading={loading}
        >
          Làm mới
        </Button>
      </Row>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredInvoices}
          rowKey="id"
          pagination={{ pageSize: 15 }}
        />
      </Spin>
    </div>
  );
};

export default ListInvoice;
