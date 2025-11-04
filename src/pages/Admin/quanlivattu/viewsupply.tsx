import React, { useEffect, useState } from "react";
import { Modal, Descriptions, Tag, Spin, message } from "antd";
import { Supply } from "../../../types/supply/supplies";
import supplyService from "../../../service/supplyService";

interface ViewSupplyProps {
  visible: boolean;
  onCancel: () => void;
  supplyId: number | null; // Chỉ truyền ID, gọi API lấy chi tiết
}

const ViewSupply: React.FC<ViewSupplyProps> = ({ visible, onCancel, supplyId }) => {
  const [supply, setSupply] = useState<Supply | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Gọi API lấy chi tiết vật tư
  const fetchSupply = async (id: number) => {
    setLoading(true);
    try {
      const res: any = await supplyService.getById(id); // giả sử service có getById
      if (res && typeof res === "object") {
        setSupply(res);
      } else if (res?.data && typeof res.data === "object") {
        setSupply(res.data);
      } else {
        setSupply(null);
        message.warning("Không lấy được thông tin vật tư!");
      }
    } catch (err) {
      console.error(err);
      message.error("Không thể tải chi tiết vật tư!");
      setSupply(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && supplyId !== null) {
      fetchSupply(supplyId);
    }
  }, [visible, supplyId]);

  if (!supply) return <Spin spinning={loading} style={{ width: "100%", marginTop: 50 }} />;

  return (
    <Modal
      title={`Chi tiết vật tư: ${supply.name}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
    >
      <Descriptions bordered column={1} size="middle">
        <Descriptions.Item label="Mã vật tư">{supply.id}</Descriptions.Item>
        <Descriptions.Item label="Tên vật tư">{supply.name}</Descriptions.Item>
        <Descriptions.Item label="Mô tả">{supply.description || "Không có"}</Descriptions.Item>
        <Descriptions.Item label="Loại">{supply.category}</Descriptions.Item>
        <Descriptions.Item label="Đơn vị">{supply.unit}</Descriptions.Item>
        <Descriptions.Item label="Tồn kho hiện tại">{supply.current_stock}</Descriptions.Item>
        <Descriptions.Item label="Mức tồn kho tối thiểu">{supply.min_stock_level}</Descriptions.Item>
        <Descriptions.Item label="Mức tồn kho tối đa">{supply.max_stock_level}</Descriptions.Item>
        <Descriptions.Item label="Giá nhập (₫)">
          {supply.unit_price.toLocaleString("vi-VN")} ₫
        </Descriptions.Item>
        <Descriptions.Item label="Nhà cung cấp">{supply.supplier || "Không có"}</Descriptions.Item>
        <Descriptions.Item label="Liên hệ NCC">{supply.supplier_contact || "Không có"}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={supply.status === "Hoạt động" ? "green" : "red"}>{supply.status}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">
          {supply.created_at ? new Date(supply.created_at).toLocaleString("vi-VN") : "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Cập nhật gần nhất">
          {supply.updated_at ? new Date(supply.updated_at).toLocaleString("vi-VN") : "-"}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default ViewSupply;
