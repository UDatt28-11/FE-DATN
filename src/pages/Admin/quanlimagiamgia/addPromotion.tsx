import React, { useState } from "react";
import {
    Form,
    Input,
    InputNumber,
    DatePicker,
    Button,
    Card,
    message,
    Space,
    Radio,
} from "antd";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";

import type { Promotion } from "../../../types/promotion/promotion";
import promotionService from "../../../service/promotionService";

const { TextArea } = Input;
const { RangePicker } = DatePicker;

const AddPromotion: React.FC = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [discountType, setDiscountType] = useState<"percentage" | "fixed_amount">("percentage");

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            const promotionData: Partial<Promotion> = {
                property_id: 1,
                code: values.code.toUpperCase(),
                description: values.description,
                discount_type: values.discount_type,
                discount_value: values.discount_value,
                max_discount_amount: values.max_discount_amount || null,
                min_purchase_amount: values.min_purchase_amount,
                max_usage_limit: values.max_usage_limit,
                max_usage_per_user: values.max_usage_per_user,
                start_date: values.date_range[0].format("YYYY-MM-DD HH:mm:ss"),
                end_date: values.date_range[1].format("YYYY-MM-DD HH:mm:ss"),
                is_active: values.is_active,
                applicable_to: values.applicable_to || null,
            };

            await promotionService.create(promotionData);
            message.success("Thêm mã giảm giá thành công!");
            navigate("/admin/promotion");
        } catch (error: any) {
            console.error("Lỗi khi thêm mã giảm giá:", error);
            message.error(error.response?.data?.message || "Không thể thêm mã giảm giá!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <Space style={{ marginBottom: 16 }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/admin/promotion")}>
                    Quay lại
                </Button>
            </Space>

            <Card title="Thêm mã giảm giá mới">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        discount_type: "percentage",
                        is_active: 1,
                        max_usage_per_user: 1,
                    }}
                >
                    <Form.Item
                        label="Mã khuyến mãi"
                        name="code"
                        rules={[
{ required: true, message: "Vui lòng nhập mã!" },
                        ]}
                    >
                        <Input placeholder="VD: SUMMER2025" maxLength={50} />
                    </Form.Item>

                    <Form.Item
                        label="Mô tả"
                        name="description"
                        rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
                    >
                        <TextArea rows={3} placeholder="Mô tả chi tiết về chương trình khuyến mãi" />
                    </Form.Item>

                    <Form.Item
                        label="Loại giảm giá"
                        name="discount_type"
                        rules={[{ required: true }]}
                    >
                        <Radio.Group onChange={(e) => setDiscountType(e.target.value)}>
                            <Radio value="percentage">Phần trăm (%)</Radio>
                            <Radio value="fixed_amount">Số tiền cố định (₫)</Radio>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item
                        label={discountType === "percentage" ? "Giá trị giảm (%)" : "Số tiền giảm (₫)"}
                        name="discount_value"
                        rules={[{ required: true, message: "Vui lòng nhập giá trị giảm!" }]}
                    >
                        <InputNumber
                            min={0}
                            max={discountType === "percentage" ? 100 : undefined}
                            style={{ width: "100%" }}
                        />
                    </Form.Item>

                    {discountType === "percentage" && (
                        <Form.Item label="Giảm tối đa (₫)" name="max_discount_amount">
                            <InputNumber
                                min={0}
                                style={{ width: "100%" }}
                                placeholder="Để trống nếu không giới hạn"
                            />
                        </Form.Item>
                    )}

                    <Form.Item
                        label="Giá trị đơn hàng tối thiểu (₫)"
                        name="min_purchase_amount"
                        rules={[{ required: true, message: "Vui lòng nhập giá trị tối thiểu!" }]}
                    >
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item
                        label="Thời gian áp dụng"
                        name="date_range"
                        rules={[{ required: true, message: "Vui lòng chọn thời gian!" }]}
                    >
                        <RangePicker
                            showTime
                            format="DD/MM/YYYY HH:mm"
style={{ width: "100%" }}
                            placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Giới hạn số lần sử dụng"
                        name="max_usage_limit"
                        rules={[{ required: true, message: "Vui lòng nhập giới hạn!" }]}
                    >
                        <InputNumber min={1} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item
                        label="Giới hạn sử dụng mỗi người"
                        name="max_usage_per_user"
                        rules={[{ required: true, message: "Vui lòng nhập giới hạn!" }]}
                    >
                        <InputNumber min={1} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item label="Áp dụng cho" name="applicable_to">
                        <Input placeholder="VD: specific_rooms, all" />
                    </Form.Item>

                    <Form.Item label="Trạng thái" name="is_active" rules={[{ required: true }]}>
                        <Radio.Group>
                            <Radio value={1}>Kích hoạt</Radio>
                            <Radio value={0}>Vô hiệu hóa</Radio>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                                Lưu mã giảm giá
                            </Button>
                            <Button onClick={() => navigate("/admin/promotion")}>Hủy</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default AddPromotion;