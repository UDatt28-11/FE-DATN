import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Result,
  Button,
  Spin,
  Card,
  Typography,
  Space,
  Divider,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  HomeOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import {
  getUserBooking,
  getUserInvoice,
} from "../../../service/bookingService";
import { useBookingCart } from "../../../context/BookingCartContext";
import type { BookingOrder } from "../../../types/booking/booking";

const { Title, Text, Paragraph } = Typography;

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<BookingOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInvoicePayment, setIsInvoicePayment] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const { clearCart } = useBookingCart();
  const cartCleared = useRef(false);

  const bookingId = searchParams.get("booking_id");
  const invoiceId = searchParams.get("invoice_id");
  const orderCode = searchParams.get("orderCode");
  const status = searchParams.get("status");
  const type = searchParams.get("type"); // For VNPay type param
  const amount = searchParams.get("amount");
  const transactionNo = searchParams.get("transaction_no");

  // Kiểm tra xem thanh toán có thành công không
  const isPaymentSuccess =
    type === "success" ||
    status === "PAID" ||
    (!type && !status && (bookingId || invoiceId));

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Nếu có invoice_id, đây là thanh toán invoice sau checkout
        if (invoiceId) {
          setIsInvoicePayment(true);
          const invoice = await getUserInvoice(Number(invoiceId));

          console.log("Invoice data:", invoice);

          // Invoice có thể có booking_order_id trực tiếp hoặc qua bookingOrder relationship
          const bookingOrderId =
            invoice.booking_order_id ||
            (invoice.bookingOrder && invoice.bookingOrder.id);

          if (bookingOrderId) {
            const bookingData = await getUserBooking(bookingOrderId);
            setBooking(bookingData);
          } else {
            setError("Không tìm thấy thông tin đơn đặt phòng từ hóa đơn");
          }
        }
        // Nếu có booking_id, đây là thanh toán cọc
        else if (bookingId) {
          setIsInvoicePayment(false);
          const bookingData = await getUserBooking(Number(bookingId));
          setBooking(bookingData);

          // Clear cart khi thanh toán cọc thành công
          // Kiểm tra:
          // 1. payment_status là 'partial' (đã đặt cọc) hoặc 'paid' (đã thanh toán đầy đủ)
          // 2. HOẶC status là 'confirmed' (đã được xác nhận sau khi thanh toán cọc)
          // 3. HOẶC có paid_amount > 0 (đã có thanh toán)
          const hasPayment =
            bookingData.payment_status === "partial" ||
            bookingData.payment_status === "paid" ||
            bookingData.status === "confirmed" ||
            (bookingData as any).paid_amount > 0;

          if (hasPayment && !cartCleared.current) {
            cartCleared.current = true;
            clearCart();
            message.success("Đã xóa giỏ hàng sau khi thanh toán thành công");
          }
        } else {
          setError("Không tìm thấy thông tin đơn đặt phòng");
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(
          "Không thể tải thông tin đơn đặt phòng: " +
            (err.response?.data?.message || err.message || "Lỗi không xác định")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookingId, invoiceId, clearCart]);

  // Auto redirect to my-bookings page after countdown
  useEffect(() => {
    if (!loading && !error && booking) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Navigate to my-bookings page
            navigate(
              isInvoicePayment ? "/my-bookings?tab=paid" : "/my-bookings"
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [loading, error, booking, navigate, isInvoicePayment]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "70vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px 20px", maxWidth: 800, margin: "0 auto" }}>
        <Result
          status="error"
          title="Có lỗi xảy ra"
          subTitle={error}
          extra={[
            <Button type="primary" key="home" onClick={() => navigate("/")}>
              Về trang chủ
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 20px", maxWidth: 800, margin: "0 auto" }}>
      <Result
        status="success"
        icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
        title={
          isInvoicePayment
            ? "Thanh toán thành công !"
            : "Thanh toán hóa đơn tiền phòng thành công"
        }
        subTitle={
          <Space direction="vertical" size="small" style={{ marginTop: 16 }}>
            <Paragraph>
              {isInvoicePayment
                ? "Cảm ơn bạn đã thanh toán . Đơn đặt phòng của bạn đã được hoàn tất. "
                : "Cảm ơn bạn đã thanh toán hóa đơn tiền phòng. Đơn đặt phòng của bạn đã được xác nhận."}
            </Paragraph>
            {/* Hiển thị mã giao dịch từ VNPay hoặc PayOS */}
            {(orderCode || transactionNo) && (
              <Paragraph>
                <Text type="secondary">Mã giao dịch: </Text>
                <Text strong>{transactionNo || orderCode}</Text>
              </Paragraph>
            )}
            {/* Hiển thị số tiền thanh toán từ VNPay */}
            {amount && (
              <Paragraph>
                <Text type="secondary">Số tiền thanh toán: </Text>
                <Text strong style={{ color: "#52c41a" }}>
                  {Number(amount).toLocaleString("vi-VN")} VNĐ
                </Text>
              </Paragraph>
            )}
            {status && (
              <Paragraph>
                <Text type="secondary">Trạng thái: </Text>
                <Text strong style={{ color: "#52c41a" }}>
                  {status === "PAID" ? "Đã thanh toán" : status}
                </Text>
              </Paragraph>
            )}
            {/* Countdown redirect */}
            <Paragraph style={{ marginTop: 16 }}>
              <Text type="secondary">
                Tự động chuyển đến trang đơn đặt phòng sau {countdown} giây...
              </Text>
            </Paragraph>
          </Space>
        }
        extra={[
          <Button
            type="primary"
            key="bookings"
            icon={<FileTextOutlined />}
            onClick={() =>
              navigate(
                isInvoicePayment ? "/my-bookings?tab=paid" : "/my-bookings"
              )
            }
            size="large"
          >
            {isInvoicePayment ? "Xem đơn đã thanh toán" : "Xem đơn đặt phòng"} (
            {countdown}s)
          </Button>,
          <Button
            key="home"
            icon={<HomeOutlined />}
            onClick={() => navigate("/")}
            size="large"
          >
            Về trang chủ
          </Button>,
        ]}
      />

      {booking && (
        <Card style={{ marginTop: 24 }}>
          <Title level={4}>Thông tin đơn đặt phòng</Title>
          <Divider />
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div>
              <Text type="secondary">Mã đơn hàng: </Text>
              <Text strong>{booking.order_code}</Text>
            </div>
            {booking.check_in && (
              <div>
                <Text type="secondary">Ngày nhận phòng: </Text>
                <Text strong>
                  {new Date(booking.check_in).toLocaleDateString("vi-VN")}
                </Text>
              </div>
            )}
            {booking.check_out && (
              <div>
                <Text type="secondary">Ngày trả phòng: </Text>
                <Text strong>
                  {new Date(booking.check_out).toLocaleDateString("vi-VN")}
                </Text>
              </div>
            )}
            <div>
              <Text type="secondary">Tổng tiền: </Text>
              <Text strong style={{ fontSize: 18, color: "#cb8670" }}>
                {Number(booking.total_amount).toLocaleString("vi-VN")} VNĐ
              </Text>
            </div>
            {booking.payment_status && (
              <div>
                <Text type="secondary">Trạng thái thanh toán: </Text>
                <Text
                  strong
                  style={{
                    color:
                      booking.payment_status === "paid"
                        ? "#52c41a"
                        : booking.payment_status === "partial"
                        ? "#faad14"
                        : "#ff4d4f",
                  }}
                >
                  {booking.payment_status === "paid"
                    ? "Đã thanh toán tiền phòng"
                    : booking.payment_status === "partial"
                    ? "Đã thanh toán"
                    : "Đã đặt cọc thành công"}
                </Text>
              </div>
            )}
          </Space>
        </Card>
      )}

      <Card
        style={{
          marginTop: 16,
          background: "#f6ffed",
          border: "1px solid #b7eb8f",
        }}
      >
        <Paragraph style={{ margin: 0 }}>
          <Text type="secondary">
            <strong>Lưu ý:</strong> Chúng tôi đã gửi email xác nhận đến địa chỉ
            email của bạn. Vui lòng kiểm tra hộp thư và thanh toán số tiền còn
            lại khi nhận phòng tại khách sạn.
          </Text>
        </Paragraph>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
