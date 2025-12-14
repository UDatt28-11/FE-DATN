import React, { useState } from "react";
import { Modal, Form, Input, Select, message } from "antd";
import userService from "../../../service/userService";

const { Option } = Select;

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: () => void;
}

const AddUser: React.FC<Props> = ({ visible, onClose, onAdd }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Map form values to backend format
      const userData = {
        full_name: values.full_name,
        email: values.email,
        password: values.password,
        phone_number: values.phone_number || undefined,
        date_of_birth: values.date_of_birth || undefined,
        gender: values.gender || undefined,
        address: values.address || undefined,
        status: values.status || "active",
        role: values.role || "user",
      };

      const result = await userService.createUser(userData);

      if (result.success) {
        message.success(result.message || "Thêm người dùng thành công!");
        form.resetFields();
        onClose();
        onAdd();
      } else {
        message.error(result.message || "Thêm người dùng thất bại!");
      }
    } catch (error: any) {
      if (error.errorFields) {
        // Validation errors from form
        message.error("Vui lòng điền đầy đủ thông tin!");
      } else {
        // API errors
        const errorMessage = error.response?.data?.message || "Thêm người dùng thất bại!";
        const errors = error.response?.data?.errors;
        if (errors) {
          const errorMessages = Object.values(errors).flat().join(", ");
          message.error(errorMessages);
        } else {
          message.error(errorMessage);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Thêm người dùng"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Thêm"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="full_name"
          label="Họ và tên"
          rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
        >
          <Input placeholder="Nhập họ và tên" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Vui lòng nhập email!" },
            { type: "email", message: "Email không hợp lệ!" },
          ]}
        >
          <Input placeholder="Nhập email" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu!" },
            { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
          ]}
        >
          <Input.Password placeholder="Nhập mật khẩu" />
        </Form.Item>
        <Form.Item
          name="phone_number"
          label="Số điện thoại"
          rules={[
            { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ!" },
          ]}
        >
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>
        <Form.Item name="role" label="Vai trò" rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}>
          <Select placeholder="Chọn vai trò">
            <Option value="admin">Quản trị viên</Option>
            <Option value="staff">Nhân viên</Option>
            <Option value="user">Người dùng</Option>
          </Select>
        </Form.Item>
        <Form.Item name="status" label="Trạng thái" initialValue="active">
          <Select>
            <Option value="active">Hoạt động</Option>
            <Option value="locked">Bị khóa</Option>
          </Select>
        </Form.Item>
        <Form.Item name="gender" label="Giới tính">
          <Select placeholder="Chọn giới tính">
            <Option value="male">Nam</Option>
            <Option value="female">Nữ</Option>
            <Option value="other">Khác</Option>
          </Select>
        </Form.Item>
        <Form.Item name="date_of_birth" label="Ngày sinh">
          <Input type="date" />
        </Form.Item>
        <Form.Item name="address" label="Địa chỉ">
          <Input.TextArea rows={2} placeholder="Nhập địa chỉ" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddUser;
