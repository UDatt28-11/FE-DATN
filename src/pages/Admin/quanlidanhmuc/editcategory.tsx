import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Upload, Space, Switch, Select } from "antd";
import { PictureOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import type { RoomType } from "../../../types/roomtype/roomtype";

interface EditCategoryProps {
  visible: boolean;
  roomType: RoomType | null;
  onCancel: () => void;
  onUpdate: (
    values: any,
    fileList: UploadFile[],
    selectedAmenities: number[]
  ) => void;
}

const EditCategory: React.FC<EditCategoryProps> = ({
  visible,
  roomType,
  onCancel,
  onUpdate,
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [status, setStatus] = useState<"active" | "inactive">("active");

  useEffect(() => {
    if (roomType) {
      form.setFieldsValue({
        name: roomType.name,
        description: roomType.description,
        property_id: roomType.property_id,
      });
      if (roomType.image_url) {
        setFileList([
          {
            uid: "-1",
            name: "image.png",
            status: "done",
            url: roomType.image_url,
          },
        ]);
      }
      setStatus(roomType.status);
    }
  }, [roomType, form]);

  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setFileList([]);
    }
  }, [visible, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      const updatedValues = {
        ...values,
        status, // thêm trạng thái vào dữ liệu gửi ra ngoài
      };
      onUpdate(updatedValues, fileList, []);
    });
  };

  return (
    <Modal
      title="Chỉnh sửa loại phòng"
      open={visible}
      onOk={handleOk}
      onCancel={() => {
        onCancel();
        form.resetFields();
      }}
      okText="Cập nhật"
      width={700}
    >
      <Form form={form} layout="vertical">
        {/* --- Tên loại phòng --- */}
        <Form.Item
          name="name"
          label="Tên loại phòng"
          rules={[{ required: true, message: "Vui lòng nhập tên loại phòng!" }]}
        >
          <Input placeholder="VD: Phòng Standard, Phòng Deluxe..." size="large" />
        </Form.Item>

        {/* --- Mô tả --- */}
        <Form.Item
          name="description"
          label="Mô tả"
        >
          <Input.TextArea rows={4} placeholder="Nhập mô tả chi tiết..." />
        </Form.Item>

        {/* --- Property --- */}
        <Form.Item
          name="property_id"
          label="Property (Tùy chọn)"
        >
          <Select
            placeholder="Chọn property (không bắt buộc)"
            allowClear
          >
            {/* Có thể thêm danh sách properties nếu cần */}
          </Select>
        </Form.Item>

        {/* --- Hình ảnh --- */}
        <Form.Item label="Hình ảnh">
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            maxCount={1}
            beforeUpload={() => false}
          >
            {fileList.length === 0 && (
              <div>
                <PictureOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        {/* --- Trạng thái --- */}
        <Form.Item label="Trạng thái">
          <Space>
            <Switch
              checked={status === "active"}
              onChange={(checked) => setStatus(checked ? "active" : "inactive")}
              checkedChildren="Kích hoạt"
              unCheckedChildren="Khóa"
            />
            <span>{status === "active" ? "Đang kích hoạt" : "Đang khóa"}</span>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditCategory;
