import React, { useState } from "react";
import { Modal, Form, Input, InputNumber, Select, message } from "antd";
import { Supply } from "../../../types/supply/supplies";
import supplyService from "../../../service/supplyService";

interface AddSupplyProps {
  visible: boolean;
  onCancel: () => void;
  onAdd: (supply: Supply) => void; // callback khi thêm thành công
}

const AddSupply: React.FC<AddSupplyProps> = ({ visible, onCancel, onAdd }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // đảm bảo các giá trị số có mặc định
      const payload = {
        ...values,
        current_stock: values.current_stock ?? 0,
        min_stock_level: values.min_stock_level ?? 0,
        max_stock_level: values.max_stock_level ?? values.current_stock ?? 0,
        status: values.status ?? "active", // mặc định active
      };

      // gọi API tạo vật tư
      const res: any = await supplyService.create(payload);
      const newSupply: Supply = res.data || res;

      // truyền lên parent để cập nhật table
      onAdd(newSupply);

      message.success("Thêm vật tư thành công!");
      form.resetFields();
      onCancel();
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.message) {
        message.error(`Lỗi: ${err.response.data.message}`);
      } else {
        message.error("Không thể thêm vật tư!");
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
          label="Tồn kho hiện tại"
          name="current_stock"
          initialValue={0}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Mức tồn kho tối thiểu"
          name="min_stock_level"
          initialValue={0}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Mức tồn kho tối đa" name="max_stock_level">
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
