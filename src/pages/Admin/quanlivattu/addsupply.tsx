import React, { useState } from "react";
import { Modal, Form, Input, InputNumber, Select, message, Spin } from "antd";
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

      // gọi API tạo vật tư
      const newSupply: any = await supplyService.create(values);

      // truyền lên parent
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
        <Form.Item label="Mức tồn kho tối thiểu" name="min_stock_level">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Mức tồn kho tối đa" name="max_stock_level">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label="Giá nhập (₫)"
          name="unit_price"
          rules={[{ required: true }]}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Nhà cung cấp" name="supplier">
          <Input />
        </Form.Item>
        <Form.Item label="Liên hệ NCC" name="supplier_contact">
          <Input />
        </Form.Item>
        <Form.Item
          label="Trạng thái"
          name="status"
          initialValue="Hoạt động"
        >
          <Select>
            <Select.Option value="Hoạt động">Hoạt động</Select.Option>
            <Select.Option value="Ngưng hoạt động">Ngưng hoạt động</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddSupply;
