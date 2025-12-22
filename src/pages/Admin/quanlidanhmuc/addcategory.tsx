import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Upload,
  Select,
  Row,
  Col,
  InputNumber,
  message,
  Button,
} from "antd";
import { PictureOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { getProperties } from "../../../service/propertyService";
import serviceService from "../../../service/serviceService";
import supplyService from "../../../service/supplyService";
import type { Service } from "../../../types/service/service";
import type { Supply } from "../../../types/supply/supplies";

interface Property {
  id: number;
  name: string;
}

interface AddCategoryProps {
  visible: boolean;
  onCancel: () => void;
  onAdd: (
    values: any,
    fileList: UploadFile[],
    selectedAmenities: number[]
  ) => void;
}

const AddCategory: React.FC<AddCategoryProps> = ({
  visible,
  onCancel,
  onAdd,
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loadingSupplies, setLoadingSupplies] = useState(false);

  // Load danh sách properties và supplies
  useEffect(() => {
    const loadData = async () => {
      // Load properties
      setLoadingProperties(true);
      try {
        const { properties: propertiesList } = await getProperties({
          per_page: 100,
        });
        if (propertiesList) {
          setProperties(propertiesList);

          // Nếu chỉ có 1 property, tự động chọn và load dịch vụ của property đó
          if (propertiesList.length === 1) {
            const defaultId = propertiesList[0].id;
            form.setFieldValue("property_id", defaultId);
            await handlePropertyChange(defaultId);
          }
        }
      } catch (error: any) {
        console.error("Error loading properties:", error);
        message.error("Không thể tải danh sách cơ sở lưu trú");
      } finally {
        setLoadingProperties(false);
      }

      // Load supplies
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

    if (visible) {
      loadData();
    }
  }, [visible, form]);

  // Khi chọn property, load danh sách dịch vụ của property đó
  const handlePropertyChange = async (propertyId: number) => {
    form.setFieldValue("property_id", propertyId);
    setLoadingServices(true);
    try {
      const serviceList = await serviceService.getAll({
        property_id: propertyId,
      });
      setServices(serviceList);
    } catch (error: any) {
      console.error("Error loading services:", error);
      message.error("Không thể tải danh sách dịch vụ của cơ sở lưu trú");
      setServices([]);
    } finally {
      setLoadingServices(false);
    }
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      // Đảm bảo max_adults có giá trị mặc định nếu undefined
      if (!values.max_adults) {
        values.max_adults = 1;
      }
      // Đảm bảo max_children có giá trị mặc định nếu undefined
      if (values.max_children === undefined || values.max_children === null) {
        values.max_children = 0;
      }
      onAdd(values, fileList, []);
      form.resetFields();
      setFileList([]);
    }).catch((errorInfo) => {
      console.error('Validation failed:', errorInfo);
      // Hiển thị lỗi validation
      if (errorInfo.errorFields && errorInfo.errorFields.length > 0) {
        const firstError = errorInfo.errorFields[0];
        message.error(firstError.errors[0]);
      }
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
          rules={[
            { required: true, message: "Vui lòng nhập tên loại phòng!" },
            { min: 2, message: "Tên loại phòng phải có ít nhất 2 ký tự!" },
            {
              max: 255,
              message: "Tên loại phòng không được vượt quá 255 ký tự!",
            },
            {
              pattern: /^[^\d].*$/,
              message: "Tên loại phòng không được bắt đầu bằng chữ số!",
            },
          ]}
        >
          <Input
            placeholder="VD: Phòng Standard, Phòng Deluxe..."
            size="large"
          />
        </Form.Item>

        <Form.Item name="description" label="Mô tả">
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
              initialValue={1}
              rules={[
                { required: true, message: "Vui lòng nhập số người lớn!" },
              ]}
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
          label="Cơ sở lưu trú"
          rules={[{ required: true, message: "Vui lòng chọn cơ sở lưu trú!" }]}
        >
          <Select
            placeholder="Chọn cơ sở lưu trú"
            loading={loadingProperties}
            disabled={loadingProperties || properties.length === 0}
            onChange={handlePropertyChange}
          >
            {properties.map((property) => (
              <Select.Option key={property.id} value={property.id}>
                {property.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Dịch vụ áp dụng cho loại phòng này */}
        <Form.Item
          name="service_ids"
          label="Dịch vụ áp dụng cho loại phòng"
          extra="Chỉ hiển thị dịch vụ thuộc cùng cơ sở lưu trú (sau khi chọn property)."
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
                {service.name} - {service.price.toLocaleString("vi-VN")}₫ /{" "}
                {service.unit}
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

        {/* Tạo phòng nhanh cho loại phòng này */}
        <Form.List name="quick_rooms">
          {(fields, { add, remove }) => (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontWeight: 500 }}>
                  Tạo phòng nhanh (tuỳ chọn)
                </span>
                <Button type="dashed" size="small" onClick={() => add()}>
                  Thêm phòng
                </Button>
              </div>
              {fields.map((field) => {
                const { key, ...restField } = field;
                return (
                  <div
                    key={key}
                    style={{
                      border: "1px solid #f0f0f0",
                      borderRadius: 8,
                      padding: 8,
                      marginBottom: 8,
                      background: "#fafafa",
                    }}
                  >
                    <Row gutter={8}>
                      <Col span={10}>
                        <Form.Item
                          {...restField}
                          name={[restField.name, "name"]}
                          fieldKey={[restField.fieldKey, "name"]}
                          label="Tên phòng"
                          rules={[
                            { required: true, message: "Nhập tên phòng" },
                          ]}
                        >
                          <Input placeholder="Tên phòng (VD: Phòng 101)" />
                        </Form.Item>
                      </Col>
                      <Col span={14}>
                        <Form.Item
                          {...restField}
                          name={[restField.name, "description"]}
                          fieldKey={[restField.fieldKey, "description"]}
                          label="Mô tả (tuỳ chọn)"
                        >
                          <Input placeholder="Mô tả ngắn cho phòng này..." />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Vật tư nhanh cho từng phòng */}
                    <Form.List name={[restField.name, "supplies"]}>
                      {(
                        supplyFields,
                        { add: addSupply, remove: removeSupply }
                      ) => (
                        <>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              margin: "4px 0 8px",
                            }}
                          >
                            <span style={{ fontSize: 12 }}>
                              Vật tư cho phòng
                            </span>
                            <Button
                              type="link"
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
                                style={{ marginBottom: 4 }}
                              >
                                {/* Hidden field để lưu tên vật tư cho backend */}
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
                                        // Tìm supply được chọn
                                        const selectedSupply = supplies.find(
                                          (s) => s.id === value
                                        );
                                        if (selectedSupply) {
                                          // Lấy giá trị hiện tại của quick_rooms
                                          const quickRooms =
                                            form.getFieldValue("quick_rooms") ||
                                            [];
                                          // Cập nhật unit và unit_price cho supply này
                                          if (quickRooms[field.name]) {
                                            const roomSupplies =
                                              quickRooms[field.name].supplies ||
                                              [];
                                            roomSupplies[sfIndex] = {
                                              ...roomSupplies[sfIndex],
                                              supply_id: value,
                                              name: selectedSupply.name,
                                              unit:
                                                selectedSupply.unit || "cái",
                                              unit_price:
                                                selectedSupply.unit_price || 0,
                                            };
                                            quickRooms[field.name].supplies =
                                              roomSupplies;
                                            form.setFieldsValue({
                                              quick_rooms: quickRooms,
                                            });
                                          }
                                        }
                                      }}
                                    >
                                      {supplies.map((supply) => (
                                        <Select.Option
                                          key={supply.id}
                                          value={supply.id}
                                        >
                                          {supply.name} -{" "}
                                          {(
                                            supply.unit_price || 0
                                          ).toLocaleString("vi-VN")}
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
                                    Xoá
                                  </Button>
                                </Col>
                              </Row>
                            );
                          })}
                        </>
                      )}
                    </Form.List>

                    <div style={{ textAlign: "right" }}>
                      <Button
                        danger
                        type="link"
                        size="small"
                        onClick={() => remove(field.name)}
                      >
                        Xoá phòng
                      </Button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default AddCategory;
