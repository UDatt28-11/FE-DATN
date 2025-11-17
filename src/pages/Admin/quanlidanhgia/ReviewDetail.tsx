import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Spin, Rate, Image, Tag, Button } from "antd";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import reviewService from "../../../service/reviewService";
import { Review } from "../../../types/review/review";
import { ArrowLeftOutlined } from "@ant-design/icons";

const ReviewDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Lấy chi tiết review từ API
  const fetchReviewDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await reviewService.getById(id); // gọi API
      setReview(data);
    } catch (error: any) {
      toast.error("Lỗi khi tải chi tiết đánh giá: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewDetail();
  }, [id]);

  if (loading) return <Spin size="large" style={{ display: "block", margin: "50px auto" }} />;

  if (!review) return <div>Không tìm thấy đánh giá</div>;

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        Quay lại
      </Button>

      <Card title={`Chi tiết đánh giá #${review.id}`}>
        <p>
          <strong>Người đánh giá:</strong> {review.userId}
        </p>
        <p>
          <strong>Cơ sở lưu trú:</strong> {review.propertyId}
        </p>
        <p>
          <strong>Phòng:</strong> {review.roomId || "-"}
        </p>
        <p>
          <strong>Đánh giá:</strong> <Rate disabled defaultValue={review.rating} />
        </p>
        <p>
          <strong>Nhận xét:</strong> {review.comment || "-"}
        </p>
        <p>
          <strong>Trạng thái:</strong>{" "}
          <Tag
            color={
              review.status === "approved"
                ? "green"
                : review.status === "pending"
                ? "orange"
                : "red"
            }
          >
            {review.status === "approved"
              ? "Hiển thị"
              : review.status === "pending"
              ? "Chờ duyệt"
              : "Ẩn"}
          </Tag>
        </p>
        <p>
          <strong>Ngày tạo:</strong> {dayjs(review.createdAt).format("DD/MM/YYYY HH:mm")}
        </p>
        <p>
          <strong>Ngày duyệt:</strong>{" "}
          {review.reviewedAt ? dayjs(review.reviewedAt).format("DD/MM/YYYY HH:mm") : "-"}
        </p>

        {review.photos && review.photos.length > 0 && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
            {review.photos.map((p, index) => (
              <Image key={index} width={150} height={100} src={p} style={{ borderRadius: 6 }} />
            ))}
          </div>
        )}

        {review.adminNotes && (
          <p style={{ marginTop: 16 }}>
            <strong>Ghi chú admin:</strong> {review.adminNotes}
          </p>
        )}
      </Card>
    </div>
  );
};

export default ReviewDetail;
