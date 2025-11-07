import React, { useState, useEffect } from "react";
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
    Spin,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";

import type { Promotion } from "../../../types/promotion/promotion";
import dayjs from "dayjs";
import promotionService from "../../../service/promotionService";

const { TextArea } = Input;
const { RangePicker } = DatePicker;

const EditPromotion: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [discountType, setDiscountType] = useState<"percentage" | "fixed_amount">("percentage");

    useEffect(() => {
        fetchPromotion();
    }, [id]);

    const fetchPromotion = async () => {
        if (!id) return;
        setFetchLoading(true);
        try {
            const data = await promotionService.getById(id);
            setDiscountType(data.discount_type);
            
            form.setFieldsValue({
                code: data.code,
                description: data.description,
                discount_type: data.discount_type,
                discount_value: data.discount_value,
                max_discount_amount: data.max_discount_amount,
                min_purchase_amount: data.min_purchase_amount,
                max_usage_limit: data.max_usage_limit,
                max_usage_per_user: data.max_usage_per_user,
                date_range: [dayjs(data.start_date), dayjs(data.end_date)],
                is_active: data.is_active,
                applicable_to: data.applicable_to,
            });
        } catch (error: any) {
            console.error("Lỗi khi tải mã giảm giá:", error);
            message.error(error.response?.data?.message || "Không thể tải thông tin mã giảm giá!");
            navigate("/admin/promotion");
        } finally {
            setFetchLoading(false);
        }
    };

    const handleSubmit = async (values: any) => {
        if (!id) return;
        setLoading(true);
        try {
            const promotionData: Partial<Promotion> = {
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

            await promotionService.update(id, promotionData);
            message.success("Cập nhật mã giảm giá thành công!");
            navigate("/admin/promotion");
        } catch (error: any) {
            console.error("Lỗi khi cập nhật mã giảm giá:", error);
            message.error(error.response?.data?.message || "Không thể cập nhật mã giảm giá!");
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div style={{ padding: 24, textAlign: "center" }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: 24 }}>
            <Space style={{ marginBottom: 16 }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/admin/promotion")}>
                    Quay lại
                </Button>
            </Space>

            <Card title="Chỉnh sửa mã giảm giá">
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        label="Mã khuyến mãi"
                        name="code"
                        rules={[{ required: true, message: "Vui lòng nhập mã!" }]}
                    >
                        <Input placeholder="VD: SUMMER2025" maxLength={50} />
                    </Form.Item>

                    <Form.Item
                        label="Mô tả"
                        name="description"
                        rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
                    >
                        <TextArea rows={3} />
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
                            <InputNumber min={0} style={{ width: "100%" }} />
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
                        />
                    </Form.Item>

                    <Form.Item
                        label="Giới hạn số lần sử dụng"
                        name="max_usage_limit"
                        rules={[{ required: true }]}
                    >
                        <InputNumber min={1} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item
                        label="Giới hạn sử dụng mỗi người"
                        name="max_usage_per_user"
                        rules={[{ required: true }]}
                    >
                        <InputNumber min={1} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item label="Áp dụng cho" name="applicable_to">
                        <Input />
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
                                Cập nhật
                            </Button>
                            <Button onClick={() => navigate("/admin/promotion")}>Hủy</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default EditPromotion;
