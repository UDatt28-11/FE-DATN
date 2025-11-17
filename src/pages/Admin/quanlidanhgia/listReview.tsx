import React, { useState, useEffect } from "react";
import {
  Table,
  Space,
  Button,
  Tooltip,
  Rate,
  Image,
  Modal,
  Select,
  Input,
  Spin,
} from "antd";
import { toast } from "react-toastify";
import {
  EyeOutlined,
  DeleteOutlined,
  SearchOutlined,
  StarOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import { Review } from "../../../types/review/review";
import reviewService from "../../../service/reviewService";

const { Option } = Select;
const { Search } = Input;

const ListReview: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filtered, setFiltered] = useState<Review[]>([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Review["status"]>(
    "all"
  );
  const [modalReview, setModalReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch danh sách review từ API
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await reviewService.getAll({ per_page: 50 });
      const reviewList: Review[] = Array.isArray(res?.data)
        ? res.data
        : res?.data?.data || [];
      setReviews(reviewList);
      setFiltered(reviewList);
    } catch (error: any) {
      toast.error("Lỗi khi tải danh sách đánh giá: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // 🔹 Filter search & status
  const applyFilters = (text: string, status: "all" | Review["status"]) => {
    let data = reviews;
    if (text) {
      const lower = text.toLowerCase();
      data = data.filter(
        (r) =>
          r.userId.toLowerCase().includes(lower) ||
          r.propertyId.toLowerCase().includes(lower) ||
          r.comment?.toLowerCase().includes(lower)
      );
    }
    if (status !== "all") {
      data = data.filter((r) => r.status === status);
    }
    setFiltered(data);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    applyFilters(value, statusFilter);
  };

  const handleStatusChange = async (
    id: string,
    newStatus: Review["status"]
  ) => {
    try {
      await reviewService.update(id, { status: newStatus });
      toast.success("Đã cập nhật trạng thái đánh giá!");
      fetchReviews();
    } catch (error: any) {
      toast.error("Cập nhật trạng thái thất bại: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: "Xóa đánh giá này?",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          // Gọi API xóa review
          await reviewService.remove(id);
          toast.success("Đã xóa đánh giá!");
          // Load lại danh sách sau khi xóa
          fetchReviews();
        } catch (error: any) {
          toast.error("Xóa thất bại: " + error.message);
        }
      },
    });
  };

  // 🔹 Columns cho Table
  const columns: ColumnsType<Review> = [
    {
      title: "Người đánh giá",
      dataIndex: "userId",
      key: "user",
      render: (_, record) => (
        <Space>
          <StarOutlined style={{ fontSize: 20, color: "#faad14" }} />
          <span>{record.userId}</span>
        </Space>
      ),
    },
    {
      title: "Cơ sở lưu trú",
      dataIndex: "propertyId",
      key: "property",
      render: (_, record) => record.propertyId,
    },
    {
      title: "Sao",
      dataIndex: "rating",
      key: "rating",
      render: (rating) => <Rate disabled defaultValue={rating} />,
      sorter: (a, b) => a.rating - b.rating,
    },
    {
      title: "Nhận xét",
      dataIndex: "comment",
      key: "comment",
      ellipsis: true,
    },
    {
      title: "Ngày tạo",
      dataIndex: "reviewedAt",
      key: "reviewedAt",
      render: (_, record) =>
        dayjs(record.reviewedAt || record.createdAt).format("DD/MM/YYYY HH:mm"),
      sorter: (a, b) =>
        dayjs(a.reviewedAt || a.createdAt).unix() -
        dayjs(b.reviewedAt || b.createdAt).unix(),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Select
          value={status}
          onChange={(value) =>
            handleStatusChange(record.id, value as Review["status"])
          }
          style={{ width: 120 }}
        >
          <Option value="pending">Chờ duyệt</Option>
          <Option value="approved">Hiển thị</Option>
          <Option value="rejected">Ẩn</Option>
        </Select>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              onClick={() => setModalReview(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <Search
          placeholder="Tìm người dùng, cơ sở, nhận xét..."
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          allowClear
          enterButton={<SearchOutlined />}
          style={{ width: 300 }}
        />
        <Select
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value);
            applyFilters(searchText, value);
          }}
          style={{ width: 160 }}
        >
          <Option value="all">Tất cả</Option>
          <Option value="approved">Hiển thị</Option>
          <Option value="pending">Chờ duyệt</Option>
          <Option value="rejected">Ẩn</Option>
        </Select>
      </Space>

      {loading ? (
        <Spin size="large" style={{ display: "block", margin: "50px auto" }} />
      ) : (
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      )}

      <Modal
        open={!!modalReview}
        onCancel={() => setModalReview(null)}
        footer={null}
        title="Chi tiết đánh giá"
        width={700}
      >
        {modalReview && (
          <div>
            <h3 style={{ marginBottom: 8 }}>
              {modalReview.userId} –{" "}
              <Rate disabled defaultValue={modalReview.rating} />
            </h3>
            <p>
              <strong>Chỗ ở:</strong> {modalReview.propertyId}
            </p>
            <p>
              <strong>Nhận xét:</strong> {modalReview.comment || "-"}
            </p>
            {modalReview.photos && modalReview.photos.length > 0 && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {modalReview.photos.map((p, index) => (
                  <Image
                    key={index}
                    width={120}
                    height={90}
                    src={p}
                    style={{ borderRadius: 6 }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ListReview;
