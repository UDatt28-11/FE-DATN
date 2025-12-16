import React, { useState } from "react";
import { Modal, Form, Input, InputNumber, Select } from "antd";
import { toast } from "react-toastify";
import type { Supply } from "../../../types/supply/supplies";
import supplyService from "../../../service/supplyService";

interface AddSupplyProps {
  visible: boolean;
  onCancel: () => void;
  onAdd: (supply: Supply) => void; // callback khi thêm thành công
  /** Nếu truyền roomId, vật tư sẽ được gán trực tiếp cho phòng đó */
  roomId?: number;
}

const AddSupply: React.FC<AddSupplyProps> = ({ visible, onCancel, onAdd, roomId }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // đảm bảo các giá trị số có mặc định
      const payload = {
        ...values,
        // Nếu có roomId (đang mở từ context phòng), gán vật tư trực tiếp cho phòng đó
        room_id: roomId ?? values.room_id,
        current_stock: values.current_stock ?? 0,
        min_stock_level: values.min_stock_level ?? 0,
        max_stock_level: values.max_stock_level ?? values.current_stock ?? 0,

        status: values.status ?? "active", // mặc định active
      };

      // gọi API tạo vật tư (service đã xử lý response)
      let newSupply: Supply = await supplyService.create(payload);

      // Nếu có ID, gọi lại API để lấy đầy đủ thông tin (bao gồm created_at, updated_at, etc.)
      if (newSupply?.id) {
        try {
          const fullSupply = await supplyService.getById(newSupply.id);
          newSupply = fullSupply;
        } catch (err) {
          console.warn("Không thể lấy đầy đủ thông tin, sử dụng dữ liệu từ response tạo mới");
        }
      }

      toast.success("Thêm vật tư thành công!");
      form.resetFields();
      onCancel();
      
      // Truyền lên parent để cập nhật table và mở modal xem chi tiết
      onAdd(newSupply);
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.message) {
        toast.error(`Lỗi: ${err.response.data.message}`);
      } else {
        toast.error("Không thể thêm vật tư!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Thêm vật tư mới"
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText="Lưu"
      cancelText="Hủy"
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        {/* Nếu dùng trong context phòng cụ thể, room_id sẽ được truyền sẵn và ẩn */}
        {!roomId && (
          <Form.Item label="ID phòng (tuỳ chọn)" name="room_id">
            <InputNumber min={1} style={{ width: "100%" }} placeholder="Nhập ID phòng nếu là vật tư trong phòng" />
          </Form.Item>
        )}
        <Form.Item label="Tên vật tư" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Mô tả" name="description">
          <Input.TextArea rows={2} />
        </Form.Item>

        <Form.Item label="Loại" name="category" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Đơn vị" name="unit" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item
          label="Số lượng"
          name="current_stock"
          rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
          initialValue={0}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Giá nhập (₫)"
          name="unit_price"
          rules={[{ required: true }]}
          initialValue={0}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Nhà cung cấp" name="supplier">
          <Input />
        </Form.Item>

        <Form.Item label="Liên hệ NCC" name="supplier_contact">
          <Input />
        </Form.Item>

        <Form.Item label="Trạng thái" name="status" initialValue="active">
          <Select>
            <Select.Option value="active">Hoạt động</Select.Option>
            <Select.Option value="inactive">Ngưng hoạt động</Select.Option>
            <Select.Option value="discontinued">Ngưng sản xuất</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddSupply;
