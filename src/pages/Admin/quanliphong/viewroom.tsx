import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Card,
    Descriptions,
    Button,
    Space,
    Spin,
    message,
    Image,
    Tag,
    Divider,
    Row,
    Col,
} from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import roomService from "../../../service/roomService";
import type { Room } from "../../../types/room/room";

const ViewRoom: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        loadRoom();
    }, [id]);

    const loadRoom = async () => {
        if (!id) {
            message.error("ID phòng không hợp lệ");
            navigate("/admin/listing");
            return;
        }

        try {
            setLoading(true);
            const response = await roomService.getRoomById(parseInt(id), "property,roomType,amenities,verifier");

            if (response.success && response.data) {
                setRoom(response.data);
            } else {
                message.error("Không tìm thấy phòng");
                navigate("/admin/listing");
            }
        } catch (error: any) {
            console.error("Error loading room:", error);
            if (error.response?.status === 404) {
                message.error("Phòng không tồn tại");
            } else {
                message.error("Lỗi khi tải thông tin phòng");
            }
            navigate("/admin/listing");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Spin size="large" />;
    }

    if (!room) {
        return (
            <Card>
                <p>Không tìm thấy phòng</p>
                <Button type="primary" onClick={() => navigate("/admin/listing")}>
                    Quay lại danh sách
                </Button>
            </Card>
        );
    }

    return (
        <div style={{ padding: "24px" }}>
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/admin/listing")}
                style={{ marginBottom: "16px" }}
            >
                Quay lại
            </Button>

            <Card title={`Chi tiết phòng: ${room.name}`} style={{ marginBottom: "24px" }}>
                <Space direction="vertical" style={{ width: "100%" }} size="large">
                    {/* Hình ảnh phòng */}
                    {room.roomType?.images && room.roomType.images.length > 0 && (
                        <>
                            <div>
                                <h3>Hình ảnh phòng</h3>
                                <Image.PreviewGroup>
                                    <Row gutter={[16, 16]}>
                                        {room.roomType.images.map((image: any, index: number) => (
                                            <Col key={index} xs={24} sm={12} md={8}>
                                                <Image
                                                    src={image.image_url || ""}
                                                    alt={`Image ${index + 1}`}
                                                    style={{
                                                        width: "100%",
                                                        height: "200px",
                                                        objectFit: "cover",
                                                        borderRadius: "4px",
                                                    }}
                                                />
                                            </Col>
                                        ))}
                                    </Row>
                                </Image.PreviewGroup>
                            </div>
                            <Divider />
                        </>
                    )}

                    {/* Thông tin cơ bản */}
                    <div>
                        <h3>Thông tin cơ bản</h3>
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Tên phòng" span={2}>
                                {room.name}
                            </Descriptions.Item>
                            <Descriptions.Item label="Homestay" span={2}>
                                {room.property?.name || "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Loại phòng" span={2}>
                                {room.roomType?.name || "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Mô tả" span={2}>
                                {room.description || "Không có mô tả"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số người tối đa">
                                {room.max_adults || 0} người
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={room.status === "available" ? "green" : room.status === "maintenance" ? "orange" : "red"}>
                                    {room.status}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái xác minh" span={2}>
                                <Tag
                                    color={
                                        room.verification_status === "verified"
                                            ? "green"
                                            : room.verification_status === "rejected"
                                                ? "red"
                                                : "blue"
                                    }
                                >
                                    {room.verification_status || "Chưa xác minh"}
                                </Tag>
                            </Descriptions.Item>
                            {room.verification_notes && (
                                <Descriptions.Item label="Ghi chú xác minh" span={2}>
                                    {room.verification_notes}
                                </Descriptions.Item>
                            )}
                            {room.verifier && (
                                <Descriptions.Item label="Người xác minh" span={2}>
                                    {room.verifier.full_name || "N/A"}
                                </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Ngày tạo" span={2}>
                                {room.created_at ? new Date(room.created_at).toLocaleString("vi-VN") : "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Cập nhật lần cuối" span={2}>
                                {room.updated_at ? new Date(room.updated_at).toLocaleString("vi-VN") : "N/A"}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>

                    {/* Tiện ích */}
                    {room.amenities && room.amenities.length > 0 && (
                        <>
                            <Divider />
                            <div>
                                <h3>Tiện ích</h3>
                                <Space wrap>
                                    {room.amenities.map((amenity) => (
                                        <Tag key={amenity.id} color="blue">
                                            {amenity.name}
                                        </Tag>
                                    ))}
                                </Space>
                            </div>
                        </>
                    )}

                    {/* Nút hành động */}
                    <Divider />
                    <Space>
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/admin/listing/edit/${room.id}`)}
                        >
                            Chỉnh sửa
                        </Button>
                        <Button onClick={() => navigate("/admin/listing")}>
                            Quay lại danh sách
                        </Button>
                    </Space>
                </Space>
            </Card>
        </div>
    );
};

export default ViewRoom;
