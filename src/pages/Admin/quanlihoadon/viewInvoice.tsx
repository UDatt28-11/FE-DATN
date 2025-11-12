import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Descriptions, Table, Button, Tag, Space, Spin } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Invoice } from "../../../types/invoices/invoice";
import invoiceService from "../../../service/invoiceService";


const ViewInvoice: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const data = await invoiceService.getById(id!);
      setInvoice(data);
    } catch (error) {
      console.error("Lỗi tải dữ liệu hóa đơn", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const columns = [
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Đơn giá",
      dataIndex: "unit_price",
      key: "unit_price",
      render: (val: string) => Number(val).toLocaleString("vi-VN") + "₫",
    },
    {
      title: "Thành tiền",
      dataIndex: "total_line",
      key: "total_line",
      render: (val: string) => Number(val).toLocaleString("vi-VN") + "₫",
    },
  ];

  if (loading || !invoice) {
    return <Spin size="large" style={{ display: "block", margin: "80px auto" }} />;
  }

  return (
    <div style={{ padding: 24 }}>
      <Button
        icon={<ArrowLeftOutlined />}
        style={{ marginBottom: 16 }}
        onClick={() => navigate("/admin/invoice")}
      >
        Quay lại danh sách
      </Button>

      <Card title={`Hóa đơn #${invoice.id}`} bordered style={{ marginBottom: 24 }}>
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="Mã đặt phòng">
            {invoice.booking_order?.order_code}
          </Descriptions.Item>
          <Descriptions.Item label="Khách hàng">
            {invoice.booking_order?.guest?.full_name}
          </Descriptions.Item>

          <Descriptions.Item label="Số điện thoại">
            {invoice.booking_order?.guest?.phone_number}
          </Descriptions.Item>

          <Descriptions.Item label="Email">
            {invoice.booking_order?.guest?.email}
          </Descriptions.Item>

          <Descriptions.Item label="Ngày xuất hóa đơn">
            {new Date(invoice.issue_date).toLocaleDateString("vi-VN")}
          </Descriptions.Item>

          <Descriptions.Item label="Hạn thanh toán">
            {new Date(invoice.due_date).toLocaleDateString("vi-VN")}
          </Descriptions.Item>

          <Descriptions.Item label="Tổng tiền">
            {Number(invoice.total_amount).toLocaleString("vi-VN")}₫
          </Descriptions.Item>

          <Descriptions.Item label="Giảm giá">
            {Number(invoice.discount_amount).toLocaleString("vi-VN")}₫
          </Descriptions.Item>

          <Descriptions.Item label="Hoàn tiền">
            {Number(invoice.refund_amount).toLocaleString("vi-VN")}₫
          </Descriptions.Item>

          <Descriptions.Item label="Trạng thái">
            <Tag color={invoice.status === "paid" ? "green" : "red"}>
              {invoice.status.toUpperCase()}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Chi tiết các khoản tính tiền" bordered>
        <Table
          columns={columns}
          dataSource={invoice.invoice_items}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <Card
        bordered
        style={{ marginTop: 24, textAlign: "right", fontSize: 18, fontWeight: "bold" }}
      >
        Thành tiền cuối:{" "}
        {(
          Number(invoice.total_amount) -
          Number(invoice.discount_amount) +
          Number(invoice.refund_amount)
        ).toLocaleString("vi-VN")}
        ₫
      </Card>
    </div>
  );
};

export default ViewInvoice;
