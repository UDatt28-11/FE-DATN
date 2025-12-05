import React, { useEffect, useState } from "react";
import { Modal, Descriptions, Tag, Spin } from "antd";
import { toast } from "react-toastify";
import type { Supply, SupplyStatusBackend } from "../../../types/supply/supplies";
import { statusMapToFrontend } from "../../../types/supply/supplies";
import supplyService from "../../../service/supplyService";

interface ViewSupplyProps {
  visible: boolean;
  onCancel: () => void;
  supplyId?: number | null; // ID để gọi API
  supply?: Supply | null; // Object trực tiếp (khi vừa thêm mới)
}

const ViewSupply: React.FC<ViewSupplyProps> = ({ visible, onCancel, supplyId, supply: supplyProp }) => {
  const [supply, setSupply] = useState<Supply | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Gọi API lấy chi tiết vật tư
  const fetchSupply = async (id: number) => {
    setLoading(true);
    try {
      const res: any = await supplyService.getById(id);
      // Xử lý response có thể có nhiều dạng
      if (res?.data?.data) {
        setSupply(res.data.data);
      } else if (res?.data && typeof res.data === "object") {
        setSupply(res.data);
      } else if (res && typeof res === "object") {
        setSupply(res);
      } else {
        setSupply(null);
        toast.warning("Không lấy được thông tin vật tư!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải chi tiết vật tư!");
      setSupply(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      // Nếu có supply object trực tiếp, dùng luôn
      if (supplyProp) {
        setSupply(supplyProp);
      } 
      // Nếu có supplyId, gọi API
      else if (supplyId !== null && supplyId !== undefined) {
        fetchSupply(supplyId);
      }
      // Reset khi đóng modal
      else {
        setSupply(null);
      }
    }
  }, [visible, supplyId, supplyProp]);

  if (!supply && loading) {
    return (
      <Modal open={visible} onCancel={onCancel} footer={null} width={700}>
        <Spin spinning={loading} style={{ width: "100%", marginTop: 50 }} />
      </Modal>
    );
  }

  if (!supply) {
    return (
      <Modal open={visible} onCancel={onCancel} footer={null} width={700}>
        <div style={{ padding: 20, textAlign: "center" }}>
          Không tìm thấy thông tin vật tư
        </div>
      </Modal>
    );
  }

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
          {(() => {
            const displayStatus = typeof supply.status === "string" && 
              (supply.status === "active" || supply.status === "inactive" || supply.status === "discontinued")
              ? statusMapToFrontend[supply.status as SupplyStatusBackend]
              : supply.status;
            return (
              <Tag color={displayStatus === "Hoạt động" ? "green" : "red"}>
                {displayStatus}
              </Tag>
            );
          })()}
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
