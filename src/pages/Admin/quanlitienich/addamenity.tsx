import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Upload, Image } from "antd";
import { toast } from "react-toastify";
import { PlusOutlined, PictureOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import amenityService from "../../../service/amenityService";
import axios from "../../../service/axiosConfig";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface Props {
    visible: boolean;
    onCancel: () => void;
    onAdd: () => void;
}

interface Property {
    id: number;
    name: string;
}

const AddAmenity: React.FC<Props> = ({ visible, onCancel, onAdd }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);

    useEffect(() => {
        if (visible) {
            loadProperties();
        } else {
            form.resetFields();
            setFileList([]);
        }
    }, [visible]);

    const loadProperties = async () => {
        try {
            const response = await axios.get(`${API_URL}/admin/properties`);
            if (response.data.success) {
                setProperties(Array.isArray(response.data.data) ? response.data.data : []);
            }
        } catch (error) {
            console.error("Error loading properties:", error);
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("type", values.type);
            if (values.property_id) {
                formData.append("property_id", values.property_id);
            }
            if (values.category) {
                formData.append("category", values.category);
            }
            if (fileList[0]?.originFileObj) {
                formData.append("icon_file", fileList[0].originFileObj);
            }

            const response = await amenityService.createAmenity(formData);
            if (response.success) {
                toast.success("Thêm tiện ích thành công!");
                form.resetFields();
                setFileList([]);
                onAdd();
            } else {
                toast.error(response.message || "Có lỗi xảy ra khi thêm tiện ích");
            }
        } catch (error: any) {
            if (error.errorFields) {
                // Validation errors
                return;
            }
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi thêm tiện ích");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Thêm tiện ích mới"
            open={visible}
            onOk={handleOk}
            onCancel={onCancel}
            okText="Lưu"
            cancelText="Hủy"
            confirmLoading={loading}
            width={600}
        >
            <Form layout="vertical" form={form}>
                <Form.Item
                    name="name"
                    label="Tên tiện ích"
                    rules={[{ required: true, message: "Vui lòng nhập tên tiện ích" }]}
                >
                    <Input placeholder="VD: Wi-Fi miễn phí, Bếp riêng..." />
                </Form.Item>

                <Form.Item
                    name="type"
                    label="Loại"
                    rules={[{ required: true, message: "Vui lòng chọn loại" }]}
                >
                    <Select placeholder="Chọn loại tiện ích">
                        <Select.Option value="basic">Cơ bản</Select.Option>
                        <Select.Option value="advanced">Nâng cao</Select.Option>
                        <Select.Option value="safety">An toàn</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="category"
                    label="Danh mục (Tùy chọn)"
                >
                    <Select placeholder="Chọn danh mục" allowClear>
                        <Select.Option value="facility">Vật tư</Select.Option>
                        <Select.Option value="service">Dịch vụ</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="property_id"
                    label="Property"
                    rules={[{ required: true, message: "Vui lòng chọn property!" }]}
                >
                    <Select placeholder="Chọn property" showSearch optionFilterProp="children">
                        {properties.map((prop) => (
                            <Select.Option key={prop.id} value={prop.id}>
                                {prop.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item label="Biểu tượng (Icon)">
                    <Upload
                        listType="picture-card"
                        fileList={fileList}
                        beforeUpload={() => false}
                        onChange={({ fileList }) => setFileList(fileList)}
                        maxCount={1}
                        accept="image/*"
                    >
                        {fileList.length === 0 && (
                            <div>
                                <PictureOutlined />
                                <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                        )}
                    </Upload>
                    <div style={{ marginTop: 8, fontSize: 12, color: "#999" }}>
                        Tải lên file hình ảnh cho biểu tượng tiện ích
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddAmenity;
