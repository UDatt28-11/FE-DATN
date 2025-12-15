import React, { useState } from "react";
import { Modal, Form, Input, Upload, Select, Row, Col, InputNumber } from "antd";
import { PictureOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";

interface AddCategoryProps {
    visible: boolean;
    onCancel: () => void;
    onAdd: (values: any, fileList: UploadFile[], selectedAmenities: number[]) => void;
}

const AddCategory: React.FC<AddCategoryProps> = ({ visible, onCancel, onAdd }) => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const handleOk = () => {
        form.validateFields().then((values) => {
            onAdd(values, fileList, []);
            form.resetFields();
            setFileList([]);
        });
    };

    const handleCancel = () => {
        form.resetFields();
        setFileList([]);
        onCancel();
    };

    return (
        <Modal
            title="Thêm loại phòng mới"
            open={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="Thêm mới"
            width={700}
            destroyOnClose
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="name"
                    label="Tên loại phòng"
                    rules={[{ required: true, message: "Vui lòng nhập tên loại phòng!" }]}
                >
                    <Input placeholder="VD: Phòng Standard, Phòng Deluxe..." size="large" />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Mô tả"
                >
                    <Input.TextArea rows={4} placeholder="Nhập mô tả chi tiết..." />
                </Form.Item>

                {/* Giá & sức chứa chung cho loại phòng */}
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="base_price"
                            label="Giá / đêm (VNĐ)"
                            rules={[{ required: true, message: "Vui lòng nhập giá / đêm!" }]}
                        >
                            <InputNumber
                                min={0}
                                style={{ width: "100%" }}
                                formatter={(value) =>
                                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                }
                                parser={(value) => value!.replace(/(,*)/g, "")}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="max_adults"
                            label="Số người lớn tối đa"
                            rules={[{ required: true, message: "Vui lòng nhập số người lớn!" }]}
                        >
                            <InputNumber min={1} max={20} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="max_children"
                            label="Số trẻ em tối đa"
                            initialValue={0}
                        >
                            <InputNumber min={0} max={20} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                </Row>

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
