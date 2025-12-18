import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Upload, Space, Switch, Select, Row, Col, Image, Popconfirm, Button, Tag, Spin, Checkbox, InputNumber, message } from "antd";
import { PictureOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import type { RoomType, RoomTypeImage } from "../../../types/roomtype/roomtype";
import roomtypeService from "../../../service/roomtypeService";
import serviceService from "../../../service/serviceService";
import type { Service } from "../../../types/service/service";
import { toast } from "react-toastify";
import axios from "../../../service/axiosConfig";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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
  const [existingImages, setExistingImages] = useState<RoomTypeImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImageIds, setSelectedImageIds] = useState<number[]>([]);
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  useEffect(() => {
    if (visible && roomType) {
      loadRoomTypeImages();
      loadRoomTypeServices();
      form.setFieldsValue({
        name: roomType.name,
        description: roomType.description,
        property_id: roomType.property_id,
        base_price: roomType.base_price,
        max_adults: roomType.max_adults,
        max_children: roomType.max_children,
        service_ids: roomType.services?.map(s => s.id) || [],
      });
      setStatus(roomType.status);
    }
  }, [roomType, visible, form]);

  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setFileList([]);
      setExistingImages([]);
      setSelectedImageIds([]);
    }
  }, [visible, form]);

  const loadRoomTypeImages = async () => {
    if (!roomType) return;

    setLoadingImages(true);
    try {
      const response = await axios.get(`${API_URL}/admin/room-types/${roomType.id}`);
      if (response.data.success && response.data.data) {
        const roomTypeData = response.data.data;
        if (roomTypeData.images && Array.isArray(roomTypeData.images)) {
          setExistingImages(roomTypeData.images);
        } else {
          setExistingImages([]);
        }
      }
    } catch (error) {
      console.error("Error loading room type images:", error);
    } finally {
      setLoadingImages(false);
    }
  };

  const loadRoomTypeServices = async () => {
    if (!roomType || !roomType.property_id) return;

    setLoadingServices(true);
    try {
      const serviceList = await serviceService.getAll({ property_id: roomType.property_id });
      setServices(serviceList);
    } catch (error: any) {
      console.error('Error loading services:', error);
      message.error('Không thể tải danh sách dịch vụ của cơ sở lưu trú');
      setServices([]);
    } finally {
      setLoadingServices(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    try {
      const response = await roomtypeService.deleteImage(imageId);
      if (response.success) {
        toast.success("Đã xóa hình ảnh!");
        setExistingImages(existingImages.filter(img => img.id !== imageId));
        setSelectedImageIds(selectedImageIds.filter(id => id !== imageId));
      } else {
        toast.error(response.message || "Có lỗi xảy ra khi xóa");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi xóa");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedImageIds.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một hình ảnh để xóa");
      return;
    }

    try {
      const response = await roomtypeService.bulkDeleteImages(selectedImageIds);
      if (response.success) {
        toast.success(`Đã xóa ${selectedImageIds.length} hình ảnh!`);
        setExistingImages(existingImages.filter(img => !selectedImageIds.includes(img.id)));
        setSelectedImageIds([]);
      } else {
        toast.error(response.message || "Có lỗi xảy ra khi xóa");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi xóa");
    }
  };

  const handleSelectImage = (imageId: number, checked: boolean) => {
    if (checked) {
      setSelectedImageIds([...selectedImageIds, imageId]);
    } else {
      setSelectedImageIds(selectedImageIds.filter(id => id !== imageId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedImageIds(existingImages.map(img => img.id));
    } else {
      setSelectedImageIds([]);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const updatedValues = {
        ...values,
        status, // thêm trạng thái vào dữ liệu gửi ra ngoài
      };

      // Upload images mới nếu có
      if (fileList.length > 0 && roomType) {
        setUploading(true);
        try {
          const formData = new FormData();
          fileList.forEach((file) => {
            if (file.originFileObj) {
              formData.append('images[]', file.originFileObj);
            }
          });

          await roomtypeService.uploadImages(roomType.id, formData);
          toast.success("Cập nhật loại phòng và upload hình ảnh thành công!");
          // Reload images after upload
          await loadRoomTypeImages();
          // Clear fileList after successful upload
          setFileList([]);
        } catch (uploadError: any) {
          console.error("Error uploading images:", uploadError);
          if (uploadError.code === 'ECONNABORTED') {
            toast.error("Upload ảnh bị timeout. Vui lòng thử lại với ít ảnh hơn hoặc ảnh nhỏ hơn.");
          } else {
            toast.warning("Loại phòng đã được cập nhật nhưng có lỗi khi upload hình ảnh: " + (uploadError.response?.data?.message || uploadError.message || "Lỗi không xác định"));
          }
        } finally {
          setUploading(false);
        }
      }

      onUpdate(updatedValues, fileList, []);
    } catch (error: any) {
      if (error.errorFields) {
        // Validation errors
        return;
      }
      toast.error("Có lỗi xảy ra khi cập nhật");
    }
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
      width={900}
      confirmLoading={uploading}
    >
      <Form form={form} layout="vertical">
        {/* --- Tên loại phòng --- */}
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

        {/* --- Mô tả --- */}
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
            >
              <InputNumber min={0} max={20} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

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

        {/* Dịch vụ áp dụng cho loại phòng này */}
        <Form.Item
          name="service_ids"
          label="Dịch vụ áp dụng cho loại phòng"
          extra="Chỉ hiển thị dịch vụ thuộc cùng cơ sở lưu trú."
        >
          <Select
            mode="multiple"
            placeholder="Chọn các dịch vụ có thể sử dụng cho loại phòng này"
            loading={loadingServices}
            optionFilterProp="children"
            allowClear
          >
            {services.map((service) => (
              <Select.Option key={service.id} value={service.id}>
                {service.name} - {service.price.toLocaleString("vi-VN")}₫ / {service.unit}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Hình ảnh hiện có */}
        <Form.Item label="Hình ảnh hiện có">
          <Spin spinning={loadingImages}>
            {existingImages.length > 0 ? (
              <>
                <Space style={{ marginBottom: 12, width: '100%', justifyContent: 'space-between' }}>
                  <Checkbox
                    checked={selectedImageIds.length === existingImages.length && existingImages.length > 0}
                    indeterminate={selectedImageIds.length > 0 && selectedImageIds.length < existingImages.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  >
                    Chọn tất cả ({selectedImageIds.length}/{existingImages.length})
                  </Checkbox>
                  {selectedImageIds.length > 0 && (
                    <Popconfirm
                      title={`Xóa ${selectedImageIds.length} hình ảnh đã chọn?`}
                      onConfirm={handleBulkDelete}
                      okText="Xóa"
                      cancelText="Hủy"
                      okType="danger"
                    >
                      <Button
                        type="primary"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                      >
                        Xóa đã chọn ({selectedImageIds.length})
                      </Button>
                    </Popconfirm>
                  )}
                </Space>
                <Row gutter={[8, 8]}>
                  {existingImages.map((image) => (
                    <Col key={image.id} span={6}>
                      <div style={{ position: 'relative' }}>
                        <Checkbox
                          checked={selectedImageIds.includes(image.id)}
                          onChange={(e) => handleSelectImage(image.id, e.target.checked)}
                          style={{ position: 'absolute', top: 8, left: 8, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 4 }}
                        />
                        <Image
                          src={image.image_url}
                          alt="Room type image"
                          width="100%"
                          height={100}
                          style={{ objectFit: 'cover', borderRadius: 4 }}
                          preview={false}
                        />
                        {image.is_primary && (
                          <Tag color="gold" style={{ position: 'absolute', top: 4, right: 4, margin: 0 }}>
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
                            style={{ position: 'absolute', bottom: 4, right: 4 }}
                          />
                        </Popconfirm>
                      </div>
                    </Col>
                  ))}
                </Row>
              </>
            ) : (
              <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>
                Chưa có hình ảnh
              </div>
            )}
          </Spin>
        </Form.Item>

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
            Tải lên thêm hình ảnh cho loại phòng. Tối đa 10 hình ảnh tổng cộng.
          </div>
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
