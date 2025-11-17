import React, { useEffect } from "react";
import { Modal, Form, Input, Select } from "antd";
import { toast } from "react-toastify";
import type { Amenity } from "../../../types/amenity/amenity";

interface Props {
  visible: boolean;
  onCancel: () => void;
  amenity: Amenity | null;
  onUpdate: (data: Amenity) => void;
}

const EditAmenity: React.FC<Props> = ({
  visible,
  onCancel,
  amenity,
  onUpdate,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (amenity) form.setFieldsValue(amenity);
  }, [amenity]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (amenity) {
        const updated = {
          ...amenity,
          ...values,
          updatedAt: new Date().toISOString().split("T")[0],
        };
        onUpdate(updated);
        toast.success("Cập nhật tiện ích thành công!");
        form.resetFields();
        onCancel();
      }
    });
  };

  return (
    <Modal
      title="Chỉnh sửa tiện ích"
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText="Lưu"
      cancelText="Hủy"
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          name="name"
          label="Tên tiện ích"
          rules={[{ required: true, message: "Vui lòng nhập tên tiện ích" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="icon" label="Biểu tượng">
          <Input placeholder="Ví dụ: 🏊, 🍳, 📶..." />
        </Form.Item>
        <Form.Item name="type" label="Loại" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="Cơ bản">Cơ bản</Select.Option>
            <Select.Option value="Nâng cao">Nâng cao</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="status" label="Trạng thái">
          <Select>
            <Select.Option value="Hoạt động">Hoạt động</Select.Option>
            <Select.Option value="Ẩn">Ẩn</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditAmenity;
