import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Upload, Image } from "antd";
import { toast } from "react-toastify";
import { PictureOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import type { Amenity } from "../../../types/amenity/amenity";
import amenityService from "../../../service/amenityService";
import axios from "../../../service/axiosConfig";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface Props {
    visible: boolean;
    onCancel: () => void;
    amenity: Amenity | null;
    onUpdate: () => void;
}

interface Property {
    id: number;
    name: string;
}

const EditAmenity: React.FC<Props> = ({ visible, onCancel, amenity, onUpdate }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);

    useEffect(() => {
        if (visible && amenity) {
            loadProperties();
            setFormValues();
        } else if (!visible) {
            form.resetFields();
            setFileList([]);
        }
    }, [visible, amenity]);

    const setFormValues = () => {
        if (amenity) {
            form.setFieldsValue({
                name: amenity.name,
                type: amenity.type,
                category: amenity.category,
                property_id: amenity.property_id,
            });
            if (amenity.icon_url) {
                setFileList([
                    {
                        uid: "-1",
                        name: "icon.png",
                        status: "done",
                        url: amenity.icon_url,
                    },
                ]);
            }
        }
    };

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
        if (!amenity) return;
        try {
            const values = await form.validateFields();
            setLoading(true);

            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("type", values.type);
            if (values.property_id) {
                formData.append("property_id", values.property_id);
            } else {
                formData.append("property_id", "");
            }
            if (values.category) {
                formData.append("category", values.category);
            }
            if (fileList[0]?.originFileObj) {
                formData.append("icon_file", fileList[0].originFileObj);
            }
            formData.append("_method", "PUT");

            const response = await amenityService.updateAmenity(amenity.id, formData);
            if (response.success) {
                toast.success("Cập nhật tiện ích thành công!");
                onUpdate();
            } else {
                toast.error(response.message || "Có lỗi xảy ra khi cập nhật");
            }
        } catch (error: any) {
            if (error.errorFields) {
                // Validation errors
                return;
            }
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi cập nhật");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Chỉnh sửa tiện ích"
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
                    label="Property (Tùy chọn)"
                >
                    <Select placeholder="Chọn property" allowClear showSearch optionFilterProp="children">
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
                    {amenity?.icon_url && (
                        <div style={{ marginTop: 8 }}>
                            <span style={{ fontSize: 12, color: "#999" }}>Icon hiện tại: </span>
                            <Image
                                src={amenity.icon_url}
                                alt="icon"
                                width={40}
                                height={40}
                                style={{ borderRadius: 4 }}
                                preview={false}
                            />
                        </div>
                    )}
                    <div style={{ marginTop: 8, fontSize: 12, color: "#999" }}>
                        Tải lên file hình ảnh mới để thay thế icon hiện tại
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditAmenity;
