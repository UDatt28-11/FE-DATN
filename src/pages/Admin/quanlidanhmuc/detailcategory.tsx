import React from "react";
import { Modal, Row, Col, Typography, Image, Descriptions, Space, Button, Tag } from "antd";
import { EyeOutlined, EditOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import type { RoomType } from "../../../types/roomtype/roomtype";

const { Title, Text, Paragraph } = Typography;

interface DetailCategoryProps {
    visible: boolean;
    roomType: RoomType | null;
    onClose: () => void;
    onEdit: (roomType: RoomType) => void;
}

const DetailCategory: React.FC<DetailCategoryProps> = ({ visible, roomType, onClose, onEdit }) => {
    if (!roomType) return null;

    return (
        <Modal
            title={<Space><EyeOutlined />Chi tiết loại phòng</Space>}
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>Đóng</Button>,
                <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => onEdit(roomType)}>Chỉnh sửa</Button>
            ]}
            width={800}
        >
            <Row gutter={24}>
                <Col span={10}>
                    <Image 
                        src={roomType.image_url || "https://via.placeholder.com/300"} 
                        alt={roomType.name} 
                        style={{ borderRadius: 12, width: "100%" }} 
                    />
                </Col>
                <Col span={14}>
                    <Title level={3}>{roomType.name}</Title>
                    <Paragraph style={{ marginTop: 16 }}>{roomType.description || "Chưa có mô tả"}</Paragraph>
                    <Descriptions column={1} bordered size="small" style={{ marginTop: 20 }}>
                        <Descriptions.Item label="ID">{roomType.id}</Descriptions.Item>
                        <Descriptions.Item label="Property">
                            {roomType.property?.name || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            {roomType.status === "active" ? (
                                <Tag icon={<CheckCircleOutlined />} color="success">
                                    Kích hoạt
                                </Tag>
                            ) : (
                                <Tag icon={<CloseCircleOutlined />} color="default">
                                    Khóa
                                </Tag>
                            )}
                        </Descriptions.Item>
                        {roomType.created_at && (
                            <Descriptions.Item label="Ngày tạo">
                                {new Date(roomType.created_at).toLocaleDateString("vi-VN")}
                            </Descriptions.Item>
                        )}
                        {roomType.updated_at && (
                            <Descriptions.Item label="Cập nhật">
                                {new Date(roomType.updated_at).toLocaleDateString("vi-VN")}
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                </Col>
            </Row>
        </Modal>
    );
};

export default DetailCategory;
