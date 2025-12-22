import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, InputNumber, Select, Row, Col } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import axios from "../../../service/axiosConfig";
import roomService from "../../../service/roomService";
import roomtypeService from "../../../service/roomtypeService";
import supplyService from "../../../service/supplyService";
import type { Supply } from "../../../types/supply/supplies";

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
    const [supplies, setSupplies] = useState<Supply[]>([]);
    const [loadingSupplies, setLoadingSupplies] = useState(false);

    // Load supplies và set giá trị mặc định
    useEffect(() => {
        if (visible) {
            loadSupplies();
            // Tự động set giá trị từ props (ẩn field nhưng vẫn cần giá trị)
            const formValues: any = {};
            if (initialPropertyId) {
                formValues.property_id = initialPropertyId;
            } else {
                // Nếu không có initialPropertyId, load property đầu tiên
                loadProperties();
            }
            if (initialRoomTypeId) {
                formValues.room_type_id = initialRoomTypeId;
            }
            if (Object.keys(formValues).length > 0) {
                form.setFieldsValue(formValues);
            }
        } else {
            form.resetFields();
        }
    }, [visible, initialRoomTypeId, initialPropertyId]);

    const loadProperties = async () => {
        try {
            const response = await axios.get(`${API_URL}/admin/properties`);
            if (response.data.success) {
                const propertiesList = Array.isArray(response.data.data) ? response.data.data : [];
                setProperties(propertiesList);
                // Nếu không có initialPropertyId và chỉ có 1 property, tự động set
                if (!initialPropertyId && propertiesList.length === 1) {
                    form.setFieldsValue({ property_id: propertiesList[0].id });
                }
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

    const loadSupplies = async () => {
        setLoadingSupplies(true);
        try {
            const suppliesList = await supplyService.getAll();
            setSupplies(suppliesList);
        } catch (error: any) {
            console.error("Error loading supplies:", error);
            // Không báo lỗi vì supplies là optional
        } finally {
            setLoadingSupplies(false);
        }
    };

    const handleOk = async () => {
        try {
            // Đảm bảo property_id và room_type_id được set trước khi validate
            const currentValues = form.getFieldsValue();
            if (!currentValues.property_id && initialPropertyId) {
                form.setFieldsValue({ property_id: initialPropertyId });
            }
            if (!currentValues.room_type_id && initialRoomTypeId) {
                form.setFieldsValue({ room_type_id: initialRoomTypeId });
            }
            
            const values = await form.validateFields();
            setLoading(true);

            // Đảm bảo có giá trị cho property_id và room_type_id
            const propertyId = values.property_id || initialPropertyId;
            const roomTypeId = values.room_type_id || initialRoomTypeId;
            
            if (!propertyId || !roomTypeId) {
                toast.error("Thiếu thông tin Property hoặc Loại phòng!");
                setLoading(false);
                return;
            }

            const roomData = {
                property_id: propertyId,
                room_type_id: roomTypeId,
                name: values.name,
                description: values.description || "",
                // Giá & sức chứa không nhập ở đây nữa, lấy từ RoomType
                status: values.status || "available",
                verification_status: "verified" as const,
            };

            const response = await roomService.createRoom(roomData);
            if (response.success) {
                const roomId = (response.data as any).id || response.data?.id;
                
                // Xử lý supplies nếu có
                const suppliesData = values.supplies || [];
                if (suppliesData.length > 0 && roomId) {
                    try {
                        for (const supply of suppliesData) {
                            if (supply.supply_id && supply.quantity) {
                                // Lấy thông tin supply gốc để có đầy đủ dữ liệu
                                const originalSupply = supplies.find(s => s.id === supply.supply_id);
                                if (originalSupply) {
                                    // Tạo supply với room_id - cần đầy đủ các field required
                                    await axios.post(`${API_URL}/admin/supplies`, {
                                        name: supply.name || originalSupply.name,
                                        room_id: roomId,
                                        description: supply.description || originalSupply.description || "",
                                        category: supply.category || originalSupply.category || "Vật tư phòng",
                                        unit: supply.unit || originalSupply.unit || "cái",
                                        current_stock: supply.quantity || 1,
                                        min_stock_level: supply.min_stock_level !== undefined ? supply.min_stock_level : (originalSupply.min_stock_level || 0),
                                        max_stock_level: supply.max_stock_level !== undefined ? supply.max_stock_level : (originalSupply.max_stock_level || supply.quantity || 1),
                                        unit_price: supply.unit_price || originalSupply.unit_price || 0,
                                        supplier: supply.supplier || originalSupply.supplier || null,
                                        supplier_contact: supply.supplier_contact || originalSupply.supplier_contact || null,
                                    });
                                }
                            }
                        }
                        toast.success("Thêm phòng và vật tư thành công!");
                    } catch (supplyError: any) {
                        console.error("Error adding supplies to room:", supplyError);
                        const errorMessage = supplyError.response?.data?.message || 
                                           (supplyError.response?.data?.errors ? 
                                            JSON.stringify(supplyError.response.data.errors) : 
                                            "Lỗi không xác định");
                        toast.warning("Phòng đã được tạo nhưng có lỗi khi thêm vật tư: " + errorMessage);
                    }
                } else {
                    toast.success("Thêm phòng mới thành công!");
                }
                
                form.resetFields();
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
                {/* Ẩn Property và Loại phòng - tự động set từ props */}
                <Form.Item
                    name="property_id"
                    hidden
                    rules={[{ required: true, message: "Property là bắt buộc!" }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="room_type_id"
                    hidden
                    rules={[{ required: true, message: "Loại phòng là bắt buộc!" }]}
                >
                    <Input />
                </Form.Item>

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

                {/* Vật tư cho phòng */}
                <Form.List name="supplies">
                    {(supplyFields, { add: addSupply, remove: removeSupply }) => (
                        <>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    margin: "8px 0",
                                }}
                            >
                                <span style={{ fontWeight: 500 }}>Vật tư cho phòng (tùy chọn)</span>
                                <Button
                                    type="dashed"
                                    size="small"
                                    onClick={() => addSupply()}
                                >
                                    + Thêm vật tư
                                </Button>
                            </div>
                            {supplyFields.map((sf, sfIndex) => {
                                const { key: sKey, ...restSupplyField } = sf;
                                return (
                                    <Row
                                        key={sKey}
                                        gutter={8}
                                        align="middle"
                                        style={{ marginBottom: 8 }}
                                    >
                                        <Form.Item
                                            {...restSupplyField}
                                            name={[restSupplyField.name, "name"]}
                                            hidden
                                        >
                                            <Input />
                                        </Form.Item>
                                        <Col span={8}>
                                            <Form.Item
                                                {...restSupplyField}
                                                name={[restSupplyField.name, "supply_id"]}
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: "Chọn vật tư",
                                                    },
                                                ]}
                                            >
                                                <Select
                                                    placeholder="Chọn vật tư có sẵn"
                                                    loading={loadingSupplies}
                                                    showSearch
                                                    optionFilterProp="children"
                                                    filterOption={(input, option) =>
                                                        (option?.children as unknown as string)
                                                            ?.toLowerCase()
                                                            .includes(input.toLowerCase())
                                                    }
                                                    onChange={(value) => {
                                                        const selectedSupply = supplies.find(
                                                            (s) => s.id === value
                                                        );
                                                        if (selectedSupply) {
                                                            const currentSupplies = form.getFieldValue("supplies") || [];
                                                            currentSupplies[sfIndex] = {
                                                                ...currentSupplies[sfIndex],
                                                                supply_id: value,
                                                                name: selectedSupply.name,
                                                                description: selectedSupply.description || "",
                                                                category: selectedSupply.category || "Vật tư phòng",
                                                                unit: selectedSupply.unit || "cái",
                                                                unit_price: selectedSupply.unit_price || 0,
                                                                min_stock_level: selectedSupply.min_stock_level || 0,
                                                                max_stock_level: selectedSupply.max_stock_level || null,
                                                                supplier: selectedSupply.supplier || null,
                                                                supplier_contact: selectedSupply.supplier_contact || null,
                                                            };
                                                            form.setFieldsValue({
                                                                supplies: currentSupplies,
                                                            });
                                                        }
                                                    }}
                                                >
                                                    {supplies.map((supply) => (
                                                        <Select.Option
                                                            key={supply.id}
                                                            value={supply.id}
                                                        >
                                                            {supply.name} -{" "}
                                                            {(supply.unit_price || 0).toLocaleString("vi-VN")}
                                                            ₫/{supply.unit}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={4}>
                                            <Form.Item
                                                {...restSupplyField}
                                                name={[restSupplyField.name, "unit"]}
                                                initialValue="cái"
                                            >
                                                <Input
                                                    placeholder="Đơn vị"
                                                    readOnly
                                                    style={{ backgroundColor: "#f5f5f5" }}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={4}>
                                            <Form.Item
                                                {...restSupplyField}
                                                name={[restSupplyField.name, "quantity"]}
                                                initialValue={1}
                                                rules={[{ required: true, message: "SL" }]}
                                            >
                                                <InputNumber
                                                    min={1}
                                                    style={{ width: "100%" }}
                                                    placeholder="SL"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item
                                                {...restSupplyField}
                                                name={[restSupplyField.name, "unit_price"]}
                                                initialValue={0}
                                            >
                                                <InputNumber
                                                    min={0}
                                                    style={{
                                                        width: "100%",
                                                        backgroundColor: "#f5f5f5",
                                                    }}
                                                    placeholder="Giá (₫)"
                                                    readOnly
                                                    formatter={(value) =>
                                                        `${value}`.replace(
                                                            /\B(?=(\d{3})+(?!\d))/g,
                                                            ","
                                                        )
                                                    }
                                                    parser={(value) =>
                                                        value!.replace(/(,*)/g, "")
                                                    }
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={2}>
                                            <Button
                                                danger
                                                type="link"
                                                size="small"
                                                onClick={() =>
                                                    removeSupply(restSupplyField.name)
                                                }
                                            >
                                                Xóa
                                            </Button>
                                        </Col>
                                    </Row>
                                );
                            })}
                        </>
                    )}
                </Form.List>
            </Form>
        </Modal>
    );
};

export default AddRoom;
