import React, { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, Select, message } from "antd";
import { Supply, SupplyStatus } from "../../../types/supply/supplies";
import supplyService from "../../../service/supplyService";

// Map frontend <-> backend status
const statusMapToBackend: Record<SupplyStatus, "active" | "inactive"> = {
  "Hoạt động": "active",
  "Ngưng hoạt động": "inactive",
};
const statusMapToFrontend: Record<"active" | "inactive", SupplyStatus> = {
  active: "Hoạt động",
  inactive: "Ngưng hoạt động",
};

interface EditSupplyProps {
  visible: boolean;
  onCancel: () => void;
  supply: Supply | null;
  onUpdate: (supply: Supply) => void;
}

const EditSupply: React.FC<EditSupplyProps> = ({
  visible,
  onCancel,
  supply,
  onUpdate,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (supply) {
      form.setFieldsValue({
        ...supply,
        status: supply.status,
      });
    } else {
      form.resetFields();
    }
  }, [supply, form]);

  const handleOk = async () => {
    if (!supply) return;

    try {
      const values = await form.validateFields();
      setLoading(true);

      // Tách status ra và map sang backend
      const payload: any = {
        ...values,
        status: statusMapToBackend[values.status as SupplyStatus],
      };

      // Gọi API
      const res: any = await supplyService.update(supply.id, payload);

      // Map status backend về frontend
      const updatedSupply: Supply = {
        ...res.data.data,
        status: statusMapToFrontend[res.data.status as "active" | "inactive"],
      };

      onUpdate(updatedSupply);
      message.success("Cập nhật vật tư thành công!");
      onCancel();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || "Không thể cập nhật vật tư!";
      message.error(msg);
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
        <Form.Item label="Trạng thái" name="status" rules={[{ required: true }]}>
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
