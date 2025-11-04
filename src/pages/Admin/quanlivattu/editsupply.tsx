import React, { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, Select, message } from "antd";
import { Supply } from "../../../types/supply/supplies";
import supplyService from "../../../service/supplyService";

interface EditSupplyProps {
  visible: boolean;
  onCancel: () => void;
  supply: Supply | null; // object vật tư cần sửa
  onUpdate: (supply: Supply) => void; // callback khi cập nhật thành công
}

const EditSupply: React.FC<EditSupplyProps> = ({ visible, onCancel, supply, onUpdate }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (supply) {
      form.setFieldsValue(supply);
    } else {
      form.resetFields();
    }
  }, [supply]);

  const handleOk = async () => {
    try {
      if (!supply) return;
      const values = await form.validateFields();
      setLoading(true);

      // gọi API cập nhật
      const updated: any = await supplyService.update(supply.id, {
        ...supply,
        ...values,
        updated_at: new Date().toISOString(),
      });

      // thông báo và truyền lên parent
      onUpdate(updated);
      message.success("Cập nhật vật tư thành công!");
      onCancel();
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.message) {
        message.error(`Lỗi: ${err.response.data.message}`);
      } else {
        message.error("Không thể cập nhật vật tư!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Chỉnh sửa vật tư"
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText="Cập nhật"
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
        <Form.Item label="Tồn kho hiện tại" name="current_stock">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Mức tồn kho tối thiểu" name="min_stock_level">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Mức tồn kho tối đa" name="max_stock_level">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Giá nhập (₫)" name="unit_price">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Nhà cung cấp" name="supplier">
          <Input />
        </Form.Item>
        <Form.Item label="Liên hệ NCC" name="supplier_contact">
          <Input />
        </Form.Item>
        <Form.Item label="Trạng thái" name="status">
          <Select>
            <Select.Option value="Hoạt động">Hoạt động</Select.Option>
            <Select.Option value="Ngưng hoạt động">Ngưng hoạt động</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditSupply;
