import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Descriptions,
  Tag,
  Space,
  Button,
  Spin,
  Table,
  Divider,
} from "antd";
import { toast } from "react-toastify";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  PhoneOutlined,
  CalendarOutlined,
  DollarOutlined,
  HomeOutlined,
  UserOutlined,
  MailOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import { Alert } from "antd";
import dayjs from "dayjs";

import type {
  BookingOrder,
  BookingDetail,
} from "../../../types/booking/booking";
import { getBooking, confirmDeposit } from "../../../service/bookingService";
import AdminCheckInModal from "../../../components/Booking/AdminCheckInModal";

const ViewBooking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkInModalVisible, setCheckInModalVisible] = useState(false);
  const [confirmDepositLoading, setConfirmDepositLoading] = useState(false);

  // Load dữ liệu booking khi component mount hoặc id thay đổi
  useEffect(() => {
    if (id) {
      fetchBookingDetail(parseInt(id));
    }
  }, [id]); // Dependency array: re-run khi id thay đổi

  const fetchBookingDetail = async (bookingId: number) => {
    try {
      setLoading(true);
      // Include thêm room và roomType
      const data = await getBooking(
        bookingId,
        "details,details.room,details.room.roomType,details.guests"
      );
      
      // Đảm bảo details được set đúng
      if (data.bookingDetails && !data.details) {
        data.details = data.bookingDetails;
      }
      
      setBooking(data);
    } catch (error: any) {
      console.error("Error fetching booking:", error);
      toast.error("Không thể tải thông tin đặt phòng");
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy màu sắc và icon cho trạng thái
  const getStatusConfig = (status: BookingOrder["status"]) => {
    const configs: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
      pending: {
        color: "warning",
        icon: <ClockCircleOutlined />,
        text: "Chờ xác nhận",
      },
      confirmed: {
        color: "processing",
        icon: <CheckCircleOutlined />,
        text: "Đã xác nhận",
      },
      checked_in: {
        color: "success",
        icon: <CheckCircleOutlined />,
        text: "Đã check-in",
      },
      partially_checked_in: {
        color: "orange",
        icon: <ExclamationCircleOutlined />,
        text: "Check-in một phần",
      },
      checked_out: {
        color: "blue",
        icon: <ClockCircleOutlined />,
        text: "Đã check-out",
      },
      partially_checked_out: {
        color: "cyan",
        icon: <ExclamationCircleOutlined />,
        text: "Check-out một phần",
      },
      completed: {
        color: "success",
        icon: <CheckCircleOutlined />,
        text: "Hoàn thành",
      },
      cancelled: {
        color: "error",
        icon: <CloseCircleOutlined />,
        text: "Đã hủy",
      },
    };
    return configs[status] || {
      color: "default",
      icon: <ClockCircleOutlined />,
      text: status || "Không xác định",
    };
  };

  // Columns cho bảng chi tiết phòng
  const detailColumns = [
    {
      title: "Tên phòng",
      key: "room_name",
      render: (_: any, record: BookingDetail) => (
        <Space direction="vertical" size={0}>
          <Space>
            <HomeOutlined style={{ color: "#1890ff" }} />
            <strong>{record.room?.name || record.room_name || "N/A"}</strong>
          </Space>
          {record.room?.description && (
            <span style={{ fontSize: 12, color: "#8c8c8c", marginLeft: 20 }}>
              {record.room.description}
            </span>
          )}
        </Space>
      ),
    },
    {
      title: "Loại phòng",
      key: "room_type",
      render: (_: any, record: BookingDetail) => (
        <Space direction="vertical" size={0}>
          <Tag color="blue">{record.room?.roomType?.name || "N/A"}</Tag>
          {record.room?.price_per_night && (
            <span style={{ fontSize: 12, color: "#52c41a" }}>
              {record.room.price_per_night.toLocaleString("vi-VN")} đ/đêm
            </span>
          )}
        </Space>
      ),
    },
    {
      title: "Check-in",
      dataIndex: "check_in_date",
      key: "check_in_date",
      render: (date: string) => (
        <Space>
          <CalendarOutlined style={{ color: "#1890ff" }} />
          <strong>{dayjs(date).format("DD/MM/YYYY")}</strong>
        </Space>
      ),
    },
    {
      title: "Check-out",
      dataIndex: "check_out_date",
      key: "check_out_date",
      render: (date: string) => (
        <Space>
          <CalendarOutlined style={{ color: "#ff4d4f" }} />
          <strong>{dayjs(date).format("DD/MM/YYYY")}</strong>
        </Space>
      ),
    },
    {
      title: "Số đêm",
      key: "nights",
      align: "center" as const,
      render: (_: any, record: BookingDetail) => {
        const checkIn = dayjs(record.check_in_date);
        const checkOut = dayjs(record.check_out_date);
        const nights = checkOut.diff(checkIn, "day");
        return (
          <Tag color="orange" style={{ fontSize: 14, padding: "4px 12px" }}>
            {nights} đêm
          </Tag>
        );
      },
    },
    {
      title: "Số khách",
      key: "guests",
      render: (_: any, record: BookingDetail) => (
        <Space direction="vertical" size={0}>
          <Space>
            <UserOutlined style={{ color: "#1890ff" }} />
            <span><strong>{record.num_adults}</strong> người lớn</span>
          </Space>
          {record.num_children > 0 && (
            <Space style={{ marginLeft: 20 }}>
              <span><strong>{record.num_children}</strong> trẻ em</span>
            </Space>
          )}
          {record.room?.max_adults && (
            <span style={{ fontSize: 11, color: "#8c8c8c" }}>
              Tối đa: {record.room.max_adults} người lớn, {record.room.max_children || 0} trẻ em
            </span>
          )}
        </Space>
      ),
    },
    {
      title: "Giá phòng",
      dataIndex: "sub_total",
      key: "sub_total",
      align: "right" as const,
      render: (amount: number) => (
        <Space direction="vertical" size={0} align="end">
          <span style={{ fontSize: 16, fontWeight: "bold", color: "#52c41a" }}>
            {(amount || 0).toLocaleString("vi-VN")} đ
          </span>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusMap: any = {
          active: { color: "success", text: "Đang hoạt động" },
          cancelled: { color: "error", text: "Đã hủy" },
          checked_in: { color: "processing", text: "Đã check-in" },
          checked_out: { color: "default", text: "Đã check-out" },
        };
        const config = statusMap[status] || { color: "default", text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          padding: 24,
          textAlign: "center",
          minHeight: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" tip="Đang tải thông tin đặt phòng...">
          <div style={{ padding: "50px" }} />
        </Spin>
      </div>
    );
  }

  if (!booking) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <p>Không tìm thấy thông tin đặt phòng</p>
        <Button onClick={() => navigate("/admin/booking")}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const statusConfig = getStatusConfig(booking.status);

  return (
    <div style={{ padding: 24 }}>
      {/* Nút quay lại */}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/admin/booking")}
        style={{ marginBottom: 16 }}
      >
        Quay lại danh sách
      </Button>

      {/* Card thông tin chính */}
      <Card
        title={
          <Space>
            <CalendarOutlined style={{ fontSize: 20, color: "#1890ff" }} />
            <span>Chi tiết đặt phòng #{booking.code}</span>
          </Space>
        }
        extra={
          <Space>
            {booking.status === 'pending' && booking.payment_status === 'unpaid' && (
              <Button
                type="primary"
                icon={<DollarOutlined />}
                loading={confirmDepositLoading}
                onClick={async () => {
                  if (!booking) return;
                  try {
                    setConfirmDepositLoading(true);
                    // Tính 30% của total_amount làm deposit
                    const depositAmount = booking.total_amount * 0.3;
                    await confirmDeposit(booking.id, depositAmount);
                    toast.success('Xác nhận đã cọc thành công!');
                    // Refresh booking data
                    fetchBookingDetail(booking.id);
                  } catch (error: any) {
                    console.error('Error confirming deposit:', error);
                    toast.error(error?.response?.data?.message || 'Không thể xác nhận đã cọc.');
                  } finally {
                    setConfirmDepositLoading(false);
                  }
                }}
                style={{
                  backgroundColor: '#1890ff',
                  borderColor: '#1890ff',
                }}
              >
                Xác nhận đã cọc
              </Button>
            )}
            {(booking.status === 'confirmed' || booking.status === 'pending' || booking.status === 'partially_checked_in') && (
              <Button
                type="primary"
                icon={<LoginOutlined />}
                onClick={() => setCheckInModalVisible(true)}
                style={{
                  backgroundColor: '#52c41a',
                  borderColor: '#52c41a',
                }}
              >
                Check-in trực tiếp
              </Button>
            )}
            <Tag
              icon={statusConfig.icon}
              color={statusConfig.color}
              style={{ fontSize: 14, padding: "4px 12px" }}
            >
              {statusConfig.text}
            </Tag>
          </Space>
        }
      >
        <Descriptions bordered column={2}>
          {/* Row 1: Mã đơn và Ngày tạo */}
          <Descriptions.Item label="Mã đơn" span={1}>
            <strong style={{ fontSize: 15 }}>{booking.code}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo" span={1}>
            {dayjs(booking.created_at).format("DD/MM/YYYY HH:mm")}
          </Descriptions.Item>

          {/* Row 2: Tên khách hàng và SĐT */}
          <Descriptions.Item label="Tên khách hàng" span={1}>
            <Space>
              <UserOutlined style={{ color: "#1890ff" }} />
              <strong>{booking.customer_name || "N/A"}</strong>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại" span={1}>
            <Space>
              <PhoneOutlined style={{ color: "#52c41a" }} />
              {booking.customer_phone || "N/A"}
            </Space>
          </Descriptions.Item>

          {/* Row 3: Email (full width) */}
          <Descriptions.Item label="Email" span={2}>
            <Space>
              <MailOutlined style={{ color: "#fa8c16" }} />
              {booking.customer_email || "N/A"}
            </Space>
          </Descriptions.Item>

          {/* Row 4: Check-in và Check-out */}
          <Descriptions.Item label="Check-in" span={1}>
            <Space>
              <CalendarOutlined style={{ color: "#1890ff" }} />
              <strong>
                {booking.checkin_date
                  ? dayjs(booking.checkin_date).format("DD/MM/YYYY")
                  : "N/A"}
              </strong>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Check-out" span={1}>
            <Space>
              <CalendarOutlined style={{ color: "#ff4d4f" }} />
              <strong>
                {booking.checkout_date
                  ? dayjs(booking.checkout_date).format("DD/MM/YYYY")
                  : "N/A"}
              </strong>
            </Space>
          </Descriptions.Item>

          {/* Row 5: Tổng tiền (full width, nổi bật) */}
          <Descriptions.Item label="Tổng tiền" span={1}>
            <Space>
              <DollarOutlined style={{ color: "#52c41a", fontSize: 20 }} />
              <span
                style={{ fontSize: 20, fontWeight: "bold", color: "#52c41a" }}
              >
                {booking.total_amount.toLocaleString("vi-VN")} đ
              </span>
            </Space>
          </Descriptions.Item>

          {/* Row 6: Số phòng đặt */}
          <Descriptions.Item label="Số phòng đặt" span={1}>
            <Space>
              <HomeOutlined style={{ color: "#1890ff" }} />
              <strong>{booking.details_count} phòng</strong>
            </Space>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Bảng chi tiết phòng */}
      {(() => {
        const rawDetails = booking.details || (booking as any).bookingDetails;
        const details = Array.isArray(rawDetails) ? rawDetails : [];
        console.log("Details to render:", details);
        
        if (details.length === 0) {
          return (
            <Card>
              <div style={{ textAlign: "center", padding: "40px" }}>
                <HomeOutlined style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }} />
                <p style={{ color: "#8c8c8c" }}>Chưa có thông tin phòng đặt</p>
              </div>
            </Card>
          );
        }
        
        return (
          <>
            <Divider orientation="left">
              <Space>
                <HomeOutlined style={{ color: "#1890ff" }} />
                <span style={{ fontSize: 16, fontWeight: 500 }}>
                  Chi tiết phòng đặt ({details.length} phòng)
                </span>
              </Space>
            </Divider>
            <Card>
              <Table
                columns={detailColumns}
                dataSource={details}
                rowKey="id"
                pagination={false}
                bordered
                size="middle"
              />
            </Card>
          </>
        );
      })()}

          {/* Hiển thị thông tin khách đã check-in nếu có */}
          {(() => {
            const rawDetails = booking.details || (booking as any).bookingDetails;
            const details = Array.isArray(rawDetails) ? rawDetails : [];
            return details.some((detail: BookingDetail) => 
              detail.guests && detail.guests.length > 0
            );
          })() && (
            <>
              <Divider orientation="left">
                <Space>
                  <UserOutlined style={{ color: "#1890ff" }} />
                  <span style={{ fontSize: 16, fontWeight: 500 }}>
                    Danh sách khách đã check-in
                  </span>
                </Space>
              </Divider>
              <Card>
                {((booking.details || (booking as any).bookingDetails) || []).map((detail: BookingDetail) => {
                  if (!detail.guests || detail.guests.length === 0) return null;
                  
                  return (
                    <Card
                      key={detail.id}
                      type="inner"
                      title={
                        <Space>
                          <HomeOutlined />
                          <span>{detail.room?.name || detail.room_name || `Phòng #${detail.id}`}</span>
                        </Space>
                      }
                      style={{ marginBottom: 16 }}
                    >
                      <Table
                        columns={[
                          {
                            title: "Họ tên",
                            dataIndex: "full_name",
                            key: "full_name",
                          },
                          {
                            title: "Ngày sinh",
                            dataIndex: "date_of_birth",
                            key: "date_of_birth",
                            render: (date: string) => date ? dayjs(date).format("DD/MM/YYYY") : "N/A",
                          },
                          {
                            title: "Loại giấy tờ",
                            dataIndex: "identity_type",
                            key: "identity_type",
                            render: (type: string) => {
                              const typeMap: any = {
                                cccd: "CCCD",
                                passport: "Hộ chiếu",
                              };
                              return typeMap[type] || type || "N/A";
                            },
                          },
                          {
                            title: "Số giấy tờ",
                            dataIndex: "identity_number",
                            key: "identity_number",
                          },
                          {
                            title: "Thời gian check-in",
                            dataIndex: "check_in_time",
                            key: "check_in_time",
                            render: (time: string) => time ? dayjs(time).format("DD/MM/YYYY HH:mm") : "N/A",
                          },
                        ]}
                        dataSource={Array.isArray(detail.guests) ? detail.guests : []}
                        rowKey="id"
                        pagination={false}
                        size="small"
                      />
                    </Card>
                  );
                })}
              </Card>
            </>
          )}

      {/* Modal check-in trực tiếp */}
      <AdminCheckInModal
        open={checkInModalVisible}
        booking={booking}
        onCancel={() => {
          setCheckInModalVisible(false);
        }}
        onSuccess={() => {
          // Refresh booking data
          if (id) {
            fetchBookingDetail(parseInt(id));
          }
          setCheckInModalVisible(false);
        }}
      />
    </div>
  );
};

export default ViewBooking;
