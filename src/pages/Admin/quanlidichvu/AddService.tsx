import React, { useState, useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, Button } from "antd";
import { toast } from "react-toastify";
import axios from "../../../service/axiosConfig";
import serviceService from "../../../service/serviceService";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface AddServiceProps {
    visible: boolean;
    onCancel: () => void;
    onAdd: () => void;
}

interface Property {
    id: number;
    name: string;
}

const AddService: React.FC<AddServiceProps> = ({ visible, onCancel, onAdd }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [properties, setProperties] = useState<Property[]>([]);

    useEffect(() => {
        if (visible) {
            loadProperties();
        } else {
            form.resetFields();
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

            const serviceData = {
                property_id: values.property_id,
                name: values.name,
                price: values.price,
                unit: values.unit,
            };

            const response = await serviceService.createService(serviceData);
            if (response.success) {
                toast.success("Thêm dịch vụ mới thành công!");
                form.resetFields();
                onAdd();
            } else {
                toast.error(response.message || "Có lỗi xảy ra khi thêm dịch vụ");
            }
        } catch (error: any) {
            if (error.errorFields) {
                // Validation errors
                return;
            }
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi thêm dịch vụ");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Thêm dịch vụ mới"
            open={visible}
            onCancel={onCancel}
            onOk={handleOk}
            okText="Thêm mới"
            cancelText="Hủy"
            width={600}
            confirmLoading={loading}
        >
            <Form form={form} layout="vertical">
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

                <Form.Item
                    name="name"
                    label="Tên dịch vụ"
                    rules={[{ required: true, message: "Vui lòng nhập tên dịch vụ!" }]}
                >
                    <Input placeholder="VD: Dọn phòng, Giặt ủi, Đưa đón sân bay..." />
                </Form.Item>

                <Form.Item
                    name="price"
                    label="Giá (VNĐ)"
                    rules={[
                        { required: true, message: "Vui lòng nhập giá!" },
                        { type: 'number', min: 1, message: "Giá phải lớn hơn 0!" }
                    ]}
                >
                    <InputNumber
                        formatter={(value) => `${value}`.replace(/\B(?=(\ d{3})+(?!\d))/g, ',')}
                        parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                        style={{ width: "100%" }}
                        placeholder="Nhập giá dịch vụ"
                    />
                </Form.Item>

                <Form.Item
                    name="unit"
                    label="Đơn vị"
                    rules={[{ required: true, message: "Vui lòng nhập đơn vị!" }]}
                >
                    <Input placeholder="VD: lần, giờ, ngày, kg..." />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddService;

