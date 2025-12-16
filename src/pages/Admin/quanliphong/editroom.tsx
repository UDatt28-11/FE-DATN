import React, { useState, useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, Row, Col, Button, Space, Tag, Upload, Image, Popconfirm } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { toast } from "react-toastify";
import axios from "../../../service/axiosConfig";
import roomService from "../../../service/roomService";
import roomtypeService from "../../../service/roomtypeService";
import type { Room } from "../../../types/room/room";
import type { RoomTypeImage } from "../../../types/roomtype/roomtype";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface EditRoomProps {
    visible: boolean;
    room: Room;
    onClose: () => void;
}

interface Property {
    id: number;
    name: string;
}

interface RoomType {
    id: number;
    name: string;
}

const EditRoom: React.FC<EditRoomProps> = ({ visible, room, onClose }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [properties, setProperties] = useState<Property[]>([]);
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [existingImages, setExistingImages] = useState<RoomTypeImage[]>([]);

    // Load data và set form values
    useEffect(() => {
        if (visible && room) {
            loadProperties();
            loadRoomTypes();
            setFormValues();
        } else if (!visible) {
            form.resetFields();
            setFileList([]);
            setExistingImages([]);
        }
    }, [visible, room]);

    const setFormValues = () => {
        if (room) {
            form.setFieldsValue({
                property_id: room.property_id,
                room_type_id: room.room_type_id,
                name: room.name,
                description: room.description,
                max_adults: room.max_adults,
                // max_children, price_per_night hiện lấy từ RoomType
                status: room.status,
            });
            // Load existing images from roomType instead of room
            if (room.roomType?.images && room.roomType.images.length > 0) {
                setExistingImages(room.roomType.images);
            } else if (room.images && room.images.length > 0) {
                // Fallback: nếu vẫn có images trong room (backward compatibility)
                setExistingImages(room.images as any);
            } else {
                setExistingImages([]);
            }
            setFileList([]);
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
                // Giá & sức chứa giờ lấy từ RoomType nên không cập nhật ở đây
                status: values.status,
            };

            const response = await roomService.updateRoom(room.id, roomData);
            if (response.success) {
                // Upload images mới cho roomType nếu có
                if (fileList.length > 0 && values.room_type_id) {
                    try {
                        const formData = new FormData();
                        fileList.forEach((file) => {
                            if (file.originFileObj) {
                                formData.append('images[]', file.originFileObj);
                            }
                        });
                        
                        await roomtypeService.uploadImages(values.room_type_id, formData);
                        toast.success("Cập nhật phòng và upload hình ảnh thành công!");
                    } catch (uploadError: any) {
                        console.error("Error uploading images:", uploadError);
                        toast.warning("Phòng đã được cập nhật nhưng có lỗi khi upload hình ảnh: " + (uploadError.response?.data?.message || "Lỗi không xác định"));
                    }
                } else {
                    toast.success("Cập nhật phòng thành công!");
                }
                onClose();
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

    const handleVerify = async () => {
        try {
            const response = await roomService.verifyRoom(room.id);
            if (response.success) {
                toast.success("Đã xác minh phòng!");
                onClose();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi xác minh");
        }
    };

    const handleReject = async () => {
        Modal.confirm({
            title: "Từ chối phòng",
            content: "Bạn có chắc muốn từ chối phòng này?",
            okText: "Từ chối",
            okType: "danger",
            cancelText: "Hủy",
            async onOk() {
                try {
                    const response = await roomService.rejectRoom(room.id);
                    if (response.success) {
                        toast.success("Đã từ chối phòng!");
                        onClose();
                    }
                } catch (error: any) {
                    toast.error(error.response?.data?.message || "Có lỗi xảy ra");
                }
            },
        });
    };

    const handleDeleteImage = async (imageId: number) => {
        try {
            const response = await roomtypeService.deleteImage(imageId);
            if (response.success) {
                toast.success("Đã xóa hình ảnh!");
                setExistingImages(existingImages.filter(img => img.id !== imageId));
            } else {
                toast.error(response.message || "Có lỗi xảy ra khi xóa");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi xóa");
        }
    };

    return (
        <Modal
            title="Chỉnh sửa phòng"
            open={visible}
            onCancel={onClose}
            onOk={handleOk}
            okText="Cập nhật"
            cancelText="Hủy"
            width={800}
            confirmLoading={loading}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Hủy
                </Button>,
                room.verification_status === 'pending' && (
                    <>
                        <Button key="reject" danger onClick={handleReject}>
                            Từ chối
                        </Button>
                        <Button key="verify" type="primary" onClick={handleVerify}>
                            Xác minh
                        </Button>
                    </>
                ),
                <Button key="update" type="primary" loading={loading} onClick={handleOk}>
                    Cập nhật
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical">
                {room.verification_status && (
                    <Form.Item label="Trạng thái xác minh">
                        <Tag color={
                            room.verification_status === 'verified' ? 'success' :
                            room.verification_status === 'pending' ? 'warning' : 'error'
                        }>
                            {room.verification_status === 'verified' ? 'Đã xác minh' :
                             room.verification_status === 'pending' ? 'Chờ xác minh' : 'Từ chối'}
                        </Tag>
                    </Form.Item>
                )}

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

                {/* Giá và sức chứa hiện đã là dữ liệu chung trên RoomType nên không chỉnh ở đây */}

                <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
                    <Select>
                        <Select.Option value="available">Có sẵn</Select.Option>
                        <Select.Option value="maintenance">Bảo trì</Select.Option>
                        <Select.Option value="occupied">Đã thuê</Select.Option>
                    </Select>
                </Form.Item>

                {/* Hình ảnh hiện có */}
                {existingImages.length > 0 && (
                    <Form.Item label="Hình ảnh hiện có">
                        <Row gutter={[8, 8]}>
                            {existingImages.map((image) => (
                                <Col key={image.id} span={6}>
                                    <div style={{ position: 'relative' }}>
                                        <Image
                                            src={image.image_url}
                                            alt="Room image"
                                            width="100%"
                                            height={100}
                                            style={{ objectFit: 'cover', borderRadius: 4 }}
                                            preview={false}
                                        />
                                        {image.is_primary && (
                                            <Tag color="gold" style={{ position: 'absolute', top: 4, left: 4 }}>
                                                Chính
                                            </Tag>
                                        )}
                                        <Popconfirm
                                            title="Xóa hình ảnh này?"
                                            onConfirm={() => handleDeleteImage(image.id)}
                                            okText="Xóa"
                                            cancelText="Hủy"
                                            okType="danger"
                                        >
                                            <Button
                                                type="primary"
                                                danger
                                                icon={<DeleteOutlined />}
                                                size="small"
                                                style={{ position: 'absolute', top: 4, right: 4 }}
                                            />
                                        </Popconfirm>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </Form.Item>
                )}

                {/* Upload hình ảnh mới */}
                <Form.Item label="Thêm hình ảnh mới">
                    <Upload
                        listType="picture-card"
                        fileList={fileList}
                        onChange={({ fileList }) => setFileList(fileList)}
                        beforeUpload={() => false}
                        accept="image/*"
                        multiple
                    >
                        {(fileList.length + existingImages.length) >= 10 ? null : (
                            <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                        )}
                    </Upload>
                    <div style={{ marginTop: 8, fontSize: 12, color: "#999" }}>
                        Tải lên thêm hình ảnh cho phòng. Tối đa 10 hình ảnh tổng cộng.
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditRoom;
