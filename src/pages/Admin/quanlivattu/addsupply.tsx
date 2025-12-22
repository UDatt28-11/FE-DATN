import React, { useState, useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, Row, Col } from "antd";
import { toast } from "react-toastify";
import type { Supply } from "../../../types/supply/supplies";
import supplyService from "../../../service/supplyService";

interface AddSupplyProps {
  visible: boolean;
  onCancel: () => void;
  onAdd: (supply: Supply) => void; // callback khi thêm thành công
  /** Nếu truyền roomId, vật tư sẽ được gán trực tiếp cho phòng đó */
  roomId?: number;
}

const AddSupply: React.FC<AddSupplyProps> = ({ visible, onCancel, onAdd, roomId }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingSupplies, setLoadingSupplies] = useState(false);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [selectedSupply, setSelectedSupply] = useState<Supply | null>(null);

  // Load danh sách vật tư khi có roomId (chế độ chọn vật tư có sẵn)
  useEffect(() => {
    if (visible && roomId) {
      loadSupplies();
    }
  }, [visible, roomId]);

  const loadSupplies = async () => {
    setLoadingSupplies(true);
    try {
      const suppliesList = await supplyService.getAll();
      setSupplies(suppliesList || []);
    } catch (error: any) {
      console.error("Error loading supplies:", error);
      toast.error("Không thể tải danh sách vật tư");
    } finally {
      setLoadingSupplies(false);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Kiểm tra nếu có roomId thì phải có selectedSupply
      if (roomId && !selectedSupply) {
        toast.error("Vui lòng chọn vật tư");
        return;
      }
      
      setLoading(true);

      let payload: any;

      // Nếu có roomId (chế độ chọn vật tư có sẵn), tạo bản copy vật tư đã chọn
      if (roomId && selectedSupply) {
        payload = {
          name: selectedSupply.name,
          description: values.description || selectedSupply.description || "",
          category: selectedSupply.category || "Vật tư phòng",
          unit: selectedSupply.unit || "cái",
          unit_price: selectedSupply.unit_price || 0,
          current_stock: values.quantity || 1,
          min_stock_level: selectedSupply.min_stock_level || 0,
          max_stock_level: selectedSupply.max_stock_level || null,
          supplier: selectedSupply.supplier || null,
          supplier_contact: selectedSupply.supplier_contact || null,
          room_id: roomId,
          status: "active",
        };
      } else {
        // Chế độ tạo vật tư mới hoàn toàn
        payload = {
          ...values,
          room_id: roomId ?? values.room_id,
          current_stock: values.current_stock ?? 0,
          min_stock_level: values.min_stock_level ?? 0,
          max_stock_level: values.max_stock_level ?? values.current_stock ?? 0,
          status: values.status ?? "active",
        };
      }

      // gọi API tạo vật tư (service đã xử lý response)
      let newSupply: Supply = await supplyService.create(payload);

      // Nếu có ID, gọi lại API để lấy đầy đủ thông tin (bao gồm created_at, updated_at, etc.)
      if (newSupply?.id) {
        try {
          const fullSupply = await supplyService.getById(newSupply.id);
          newSupply = fullSupply;
        } catch (err) {
          console.warn("Không thể lấy đầy đủ thông tin, sử dụng dữ liệu từ response tạo mới");
        }
      }

      toast.success("Thêm vật tư thành công!");
      form.resetFields();
      setSelectedSupply(null);
      onCancel();
      
      // Truyền lên parent để cập nhật table và mở modal xem chi tiết
      onAdd(newSupply);
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.message) {
        toast.error(`Lỗi: ${err.response.data.message}`);
      } else {
        toast.error("Không thể thêm vật tư!");
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset form khi đóng modal
  const handleCancel = () => {
    form.resetFields();
    setSelectedSupply(null);
    onCancel();
  };

  return (
    <Modal
      title={roomId ? "Thêm vật tư cho phòng" : "Thêm vật tư mới"}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Lưu"
      cancelText="Hủy"
      confirmLoading={loading}
      width={roomId ? 700 : 600}
    >
      <Form form={form} layout="vertical">
        {roomId ? (
          // Chế độ chọn vật tư có sẵn (như ảnh 2)
          <>
            <Row gutter={16}>
              <Col span={16}>
                <Form.Item
                  label="Chọn vật tư có sẵn"
                  name="supply_id"
                  rules={[{ required: true, message: "Vui lòng chọn vật tư" }]}
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
                      const supply = supplies.find((s) => s.id === value);
                      if (supply) {
                        setSelectedSupply(supply);
                        form.setFieldsValue({
                          unit: supply.unit || "cái",
                          quantity: 1,
                        });
                      }
                    }}
                  >
                    {supplies.map((supply) => (
                      <Select.Option key={supply.id} value={supply.id}>
                        {supply.name} -{" "}
                        {(supply.unit_price || 0).toLocaleString("vi-VN")}₫
                        {supply.unit ? `/${supply.unit}` : ""}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Đơn vị"
                  name="unit"
                  initialValue="cái"
                >
                  <Input
                    readOnly
                    style={{ backgroundColor: "#f5f5f5" }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Mô tả (tùy chọn)"
              name="description"
            >
              <Input.TextArea
                rows={2}
                placeholder="Mô tả ngắn cho phòng này..."
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Số lượng"
                  name="quantity"
                  rules={[
                    { required: true, message: "Vui lòng nhập số lượng" },
                    { type: "number", min: 1, message: "Số lượng phải lớn hơn 0" },
                  ]}
                  initialValue={1}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={1}
                    placeholder="Số lượng"
                  />
                </Form.Item>
              </Col>
            </Row>
          </>
        ) : (
          // Chế độ tạo vật tư mới hoàn toàn
          <>
            <Form.Item label="ID phòng (tuỳ chọn)" name="room_id">
              <InputNumber
                min={1}
                style={{ width: "100%" }}
                placeholder="Nhập ID phòng nếu là vật tư trong phòng"
              />
            </Form.Item>
            <Form.Item label="Tên vật tư" name="name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item label="Mô tả" name="description">
              <Input.TextArea rows={2} />
            </Form.Item>

            <Form.Item label="Loại" name="category" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item label="Đơn vị" name="unit" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item
              label="Số lượng"
              name="current_stock"
              rules={[
                { required: true, message: "Vui lòng nhập số lượng" },
                { type: "number", min: 1, message: "Số lượng phải lớn hơn 0" },
              ]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label="Giá nhập (₫)"
              name="unit_price"
              rules={[
                { required: true, message: "Vui lòng nhập giá nhập" },
                { type: "number", min: 1, message: "Giá nhập phải lớn hơn 0" },
              ]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item label="Nhà cung cấp" name="supplier">
              <Input />
            </Form.Item>

            <Form.Item label="Liên hệ NCC" name="supplier_contact">
              <Input />
            </Form.Item>

            <Form.Item label="Trạng thái" name="status" initialValue="active">
              <Select>
                <Select.Option value="active">Hoạt động</Select.Option>
                <Select.Option value="inactive">Ngưng hoạt động</Select.Option>
                <Select.Option value="discontinued">Ngưng sản xuất</Select.Option>
              </Select>
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default AddSupply;
