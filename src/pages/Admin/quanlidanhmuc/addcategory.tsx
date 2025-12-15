import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Upload, Space, Button, Select, message } from "antd";
import { PictureOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { getProperties } from "../../../service/propertyService";

interface Property {
    id: number;
    name: string;
}

interface AddCategoryProps {
    visible: boolean;
    onCancel: () => void;
    onAdd: (values: any, fileList: UploadFile[], selectedAmenities: number[]) => void;
}

const AddCategory: React.FC<AddCategoryProps> = ({ visible, onCancel, onAdd }) => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loadingProperties, setLoadingProperties] = useState(false);

    // Load danh sách properties
    useEffect(() => {
        const loadProperties = async () => {
            setLoadingProperties(true);
            try {
                const { properties: propertiesList } = await getProperties({ per_page: 100 });
                if (propertiesList) {
                    setProperties(propertiesList);

                    // Nếu chỉ có 1 property, tự động chọn
                    if (propertiesList.length === 1) {
                        form.setFieldValue('property_id', propertiesList[0].id);
                    }
                }
            } catch (error: any) {
                console.error('Error loading properties:', error);
                message.error('Không thể tải danh sách cơ sở lưu trú');
            } finally {
                setLoadingProperties(false);
            }
        };

        if (visible) {
            loadProperties();
        }
    }, [visible, form]);

    const handleOk = () => {
        form.validateFields().then((values) => {
            onAdd(values, fileList, []);
            form.resetFields();
            setFileList([]);
        });
    };

    useEffect(() => {
        if (!visible) {
            form.resetFields();
            setFileList([]);
        }
    }, [visible, form]);

    return (
        <Modal
            title="Thêm loại phòng mới"
            open={visible}
            onOk={handleOk}
            onCancel={() => {
                onCancel();
                form.resetFields();
            }}
            okText="Thêm mới"
            width={700}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="name"
                    label="Tên loại phòng"
                    rules={[
                        { required: true, message: "Vui lòng nhập tên loại phòng!" },
                        { min: 2, message: "Tên loại phòng phải có ít nhất 2 ký tự!" },
                        { max: 255, message: "Tên loại phòng không được vượt quá 255 ký tự!" },
                        {
                            pattern: /^[^\d].*$/,
                            message: "Tên loại phòng không được bắt đầu bằng chữ số!"
                        },
                    ]}
                >
                    <Input placeholder="VD: Phòng Standard, Phòng Deluxe..." size="large" />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Mô tả"
                >
                    <Input.TextArea rows={4} placeholder="Nhập mô tả chi tiết..." />
                </Form.Item>

                <Form.Item
                    name="property_id"
                    label="Cơ sở lưu trú"
                    rules={[{ required: true, message: "Vui lòng chọn cơ sở lưu trú!" }]}
                >
                    <Select
                        placeholder="Chọn cơ sở lưu trú"
                        loading={loadingProperties}
                        disabled={loadingProperties || properties.length === 0}
                    >
                        {properties.map((property) => (
                            <Select.Option key={property.id} value={property.id}>
                                {property.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

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
            </Form>
        </Modal>
    );
};

export default AddCategory;
