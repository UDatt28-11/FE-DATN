import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, InputNumber, Select, Row, Col, Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { toast } from "react-toastify";
import axios from "../../../service/axiosConfig";
import roomService from "../../../service/roomService";
import roomtypeService from "../../../service/roomtypeService";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface AddRoomProps {
    visible: boolean;
    onClose: () => void;
    initialRoomTypeId?: number;
    initialPropertyId?: number;
}

interface Property {
    id: number;
    name: string;
}

interface RoomType {
    id: number;
    name: string;
}

const AddRoom: React.FC<AddRoomProps> = ({ visible, onClose, initialRoomTypeId, initialPropertyId }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [properties, setProperties] = useState<Property[]>([]);
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    // Load properties, room types
    useEffect(() => {
        if (visible) {
            loadProperties();
            loadRoomTypes();
            // Set initial values if provided
            if (initialRoomTypeId || initialPropertyId) {
                form.setFieldsValue({
                    room_type_id: initialRoomTypeId,
                    property_id: initialPropertyId,
                });
            }
        } else {
            form.resetFields();
            setFileList([]);
           
        }
    }, [visible, initialRoomTypeId, initialPropertyId]);

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

    const loadRoomTypes = async () => {
        try {
            const response = await roomtypeService.getRoomTypes({ per_page: 50 });
            if (response.success) {
                setRoomTypes(Array.isArray(response.data) ? response.data : []);
            }
        } catch (error) {
            console.error("Error loading room types:", error);
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const roomData = {
                property_id: values.property_id,
                room_type_id: values.room_type_id,
                name: values.name,
                description: values.description || "",
                // Giá & sức chứa không nhập ở đây nữa, lấy từ RoomType
                status: values.status || "available",
            };

            const response = await roomService.createRoom(roomData);
            if (response.success) {
                const roomId = (response.data as any).id || response.data?.id;
                
                // Upload images nếu có
                if (fileList.length > 0 && roomId) {
                    try {
                        const formData = new FormData();
                        fileList.forEach((file) => {
                            if (file.originFileObj) {
                                formData.append('images[]', file.originFileObj);
                            }
                        });
                        
                        // Upload images cho roomType thay vì room
                        if (values.room_type_id) {
                            await roomtypeService.uploadImages(values.room_type_id, formData);
                        }
                        toast.success("Thêm phòng và upload hình ảnh thành công!");
                    } catch (uploadError: any) {
                        console.error("Error uploading images:", uploadError);
                        toast.warning("Phòng đã được tạo nhưng có lỗi khi upload hình ảnh: " + (uploadError.response?.data?.message || "Lỗi không xác định"));
                    }
                } else {
                    toast.success("Thêm phòng mới thành công!");
                }
                
                form.resetFields();
                setFileList([]);
                onClose();
            } else {
                toast.error(response.message || "Có lỗi xảy ra khi thêm phòng");
            }
        } catch (error: any) {
            if (error.errorFields) {
                // Validation errors
                return;
            }
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi thêm phòng");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Thêm phòng mới"
            open={visible}
            onCancel={onClose}
            onOk={handleOk}
            okText="Thêm mới"
            cancelText="Hủy"
            width={800}
            confirmLoading={loading}
        >
            <Form form={form} layout="vertical">
                <Row gutter={16}>
                    <Col span={12}>
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
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="room_type_id"
                            label="Loại phòng"
                            rules={[{ required: true, message: "Vui lòng chọn loại phòng!" }]}
                        >
                            <Select placeholder="Chọn loại phòng" showSearch optionFilterProp="children">
                                {roomTypes.map((rt) => (
                                    <Select.Option key={rt.id} value={rt.id}>
                                        {rt.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="name"
                    label="Tên phòng"
                    rules={[{ required: true, message: "Vui lòng nhập tên phòng!" }]}
                >
                    <Input placeholder="VD: Phòng 101, Phòng Deluxe..." />
                </Form.Item>

                <Form.Item name="description" label="Mô tả">
                    <Input.TextArea rows={4} placeholder="Nhập mô tả chi tiết về phòng..." />
                </Form.Item>

                {/* Giá và sức chứa hiện đã là dữ liệu chung trên RoomType nên không cần nhập ở đây */}

                <Form.Item name="status" label="Trạng thái" initialValue="available">
                    <Select>
                        <Select.Option value="available">Có sẵn</Select.Option>
                        <Select.Option value="maintenance">Bảo trì</Select.Option>
                        <Select.Option value="occupied">Đã thuê</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item label="Hình ảnh phòng">
                    <Upload
                        listType="picture-card"
                        fileList={fileList}
                        onChange={({ fileList }) => setFileList(fileList)}
                        beforeUpload={() => false}
                        accept="image/*"
                        multiple
                    >
                        {fileList.length >= 10 ? null : (
                            <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                        )}
                    </Upload>
                    <div style={{ marginTop: 8, fontSize: 12, color: "#999" }}>
                        Tải lên tối đa 10 hình ảnh cho phòng. Hình ảnh đầu tiên sẽ được đặt làm ảnh chính.
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddRoom;
