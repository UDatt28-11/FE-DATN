import React from "react";
import { Modal, Form, Input, Select, Button, message } from "antd";
import { User } from "../../../types/user/user";


interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (user: User) => void;
}

const AddUser: React.FC<Props> = ({ visible, onClose, onAdd }) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields().then(values => {
      const newUser: User = {
        key: Date.now().toString(),
        id: `USR${Date.now().toString().slice(-3)}`,
        avatar: "",
        totalBookings: 0,
        totalSpent: 0,
        joinDate: new Date().toISOString().split("T")[0],
        lastLogin: new Date().toISOString().split("T")[0],
        ...values,
      };
      onAdd(newUser);
      message.success("Thêm người dùng thành công!");
      form.resetFields();
      onClose();
    });
  };

  return (
    <Modal title="Thêm người dùng" visible={visible} onOk={handleOk} onCancel={onClose}>
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

export default AddUser;
