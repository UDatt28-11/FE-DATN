import React, { useEffect } from "react";
import { Modal, Form, Input, Select } from "antd";
import { toast } from "react-toastify";
import type { User } from "../../../types/user/user";


interface Props {
  visible: boolean;
  user: User;
  onClose: () => void;
  onUpdate: (user: User) => void;
}

const EditUser: React.FC<Props> = ({ visible, user, onClose, onUpdate }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(user);
  }, [user]);

  const handleOk = () => {
    form.validateFields().then(values => {
      onUpdate({ ...user, ...values });
      toast.success("Cập nhật người dùng thành công!");
      onClose();
    });
  };

  return (
    <Modal title="Chỉnh sửa người dùng" visible={visible} onOk={handleOk} onCancel={onClose}>
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Họ và tên" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="admin">Quản trị viên</Select.Option>
            <Select.Option value="host">Chủ nhà</Select.Option>
            <Select.Option value="guest">Khách hàng</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="active">Hoạt động</Select.Option>
            <Select.Option value="inactive">Không hoạt động</Select.Option>
            <Select.Option value="blocked">Bị khóa</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditUser;
