import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  Layout,
  Row,
  Col,
  Typography,
  Card,
  Rate,
  Button,
  Divider,
  Space,
  Image as AntImage,
  Avatar,
  List,
  message,
  Spin,
  Empty,
  InputNumber,
  Tag,
  Progress,
} from "antd";
import {
  HomeOutlined,
  WifiOutlined,
  UserOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  CheckCircleFilled,
  CoffeeOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  ArrowLeftOutlined,
  ShoppingCartOutlined,
  StarFilled,
  ClockCircleOutlined,
  TeamOutlined,
  BankOutlined,
  ShopOutlined,
  CompassOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "../../../utils/dayjs";
import { useAuth } from "../../../context/AuthContext";
import { useBookingCart } from "../../../context/BookingCartContext";
import BookingFilterSidebar from "../../../components/Booking/BookingFilterSidebar";
import { LoginModal, RegisterModal } from "../../../components/Auth";
import {
  getRoomTypeByIdWithDetails,
  getRoomTypeReviews,
  type RoomTypeWithDetails,
} from "../../../service/roomType";
import { formatVND, formatVNDWithUnit } from "../../../utils/currency";
import "./RoomDetail.css";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

// Helper function để map amenities thành format UI
const mapAmenitiesToUI = (amenities?: { id: number; name: string }[]) => {
  if (!amenities || amenities.length === 0) return [];

  return amenities.map((amenity) => {
    const name = amenity.name.toLowerCase();
    let icon = <CheckCircleFilled style={{ color: "#52c41a" }} />;

    if (name.includes("wifi") || name.includes("internet")) {
      icon = <WifiOutlined />;
    } else if (
      name.includes("coffee") ||
      name.includes("cà phê") ||
      name.includes("minibar")
    ) {
      icon = <CoffeeOutlined />;
    } else if (name.includes("safe") || name.includes("két")) {
      icon = <SafetyOutlined />;
    } else if (name.includes("tv") || name.includes("tivi")) {
      icon = <ThunderboltOutlined />;
    }

    return {
      icon,
      text: amenity.name,
    };
  });
};

// Helper function để format bed type
const getBedType = (roomType: RoomTypeWithDetails): string => {
  if (!roomType.max_adults) return "N/A";
  if (roomType.max_adults <= 1) return "1 giường đơn";
  if (roomType.max_adults <= 2) return "1 giường King";
  if (roomType.max_adults <= 4) return "1 giường King + 1 giường Queen";
  return "2 giường King";
};

// Helper function để format room size
const getRoomSize = (roomType: RoomTypeWithDetails): string => {
  if (!roomType.max_adults) return "N/A";
  if (roomType.max_adults <= 1) return "20 m²";
  if (roomType.max_adults <= 2) return "35 m²";
  if (roomType.max_adults <= 4) return "65 m²";
  return "85 m²";
};

// Helper function để phân loại amenities theo filter_category
const categorizeAmenities = (
  amenities?: { id: number; name: string; filter_category?: string | null }[]
) => {
  if (!amenities || amenities.length === 0) {
    return {
      keyAmenities: [],
      views: [],
      floors: [],
      others: [],
    };
  }

  return {
    keyAmenities: amenities.filter((a) => a.filter_category === "key_amenity"),
    views: amenities.filter((a) => a.filter_category === "view"),
    floors: amenities.filter((a) => a.filter_category === "floor"),
    others: amenities.filter(
      (a) =>
        !a.filter_category ||
        (a.filter_category !== "key_amenity" &&
          a.filter_category !== "view" &&
          a.filter_category !== "floor")
    ),
  };
};

const RoomTypeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { 
    dateRange: cartDateRange, 
    setDateRange: setCartDateRange,
    addRoomTypeToCart,
    setCartVisible
  } = useBookingCart();

  // State cho dữ liệu
  const [roomType, setRoomType] = useState<RoomTypeWithDetails | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsPage, setReviewsPage] = useState<number>(1);
  const [reviewsTotal, setReviewsTotal] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);

  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  // State cho Login/Register Modal
  const [isLoginModalVisible, setIsLoginModalVisible] =
    useState<boolean>(false);
  const [isRegisterModalVisible, setIsRegisterModalVisible] =
    useState<boolean>(false);

  // Fetch room type detail với date range
  const fetchRoomTypeWithDates = async (showLoading: boolean = true) => {
    if (!id) return;

    if (showLoading) setLoading(true);
    try {
      const options: { check_in?: string; check_out?: string } = {};
      if (cartDateRange && cartDateRange[0] && cartDateRange[1]) {
        if (cartDateRange[1].isAfter(cartDateRange[0], "day")) {
          options.check_in = cartDateRange[0].format("YYYY-MM-DD");
          options.check_out = cartDateRange[1].format("YYYY-MM-DD");
        }
      }

      const roomTypeResponse = await getRoomTypeByIdWithDetails(id, options);

      if (roomTypeResponse.success && roomTypeResponse.data) {
        setRoomType(roomTypeResponse.data);
      } else if (showLoading) {
        message.error(roomTypeResponse.message || "Không tìm thấy loại phòng");
        navigate("/rooms");
      }
    } catch (error: any) {
      console.error("Error fetching room type detail:", error);
      if (showLoading) {
        message.error("Không thể tải thông tin loại phòng");
        navigate("/rooms");
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Fetch room type detail và reviews song song
  useEffect(() => {
    const fetchRoomTypeDetail = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const options: { check_in?: string; check_out?: string } = {};
        if (cartDateRange && cartDateRange[0] && cartDateRange[1]) {
          if (cartDateRange[1].isAfter(cartDateRange[0], "day")) {
            options.check_in = cartDateRange[0].format("YYYY-MM-DD");
            options.check_out = cartDateRange[1].format("YYYY-MM-DD");
          }
        }

        const [roomTypeResponse, reviewsResponse] = await Promise.all([
          getRoomTypeByIdWithDetails(id, options),
          getRoomTypeReviews(Number(id), { page: 1, per_page: 10 }),
        ]);

        if (roomTypeResponse.success && roomTypeResponse.data) {
          setRoomType(roomTypeResponse.data);
        } else {
          message.error(
            roomTypeResponse.message || "Không tìm thấy loại phòng"
          );
          navigate("/rooms");
          return;
        }

        if (reviewsResponse.success && reviewsResponse.data) {
          setReviews(reviewsResponse.data);
          if (reviewsResponse.meta) {
            setReviewsTotal(reviewsResponse.meta.pagination?.total || 0);
            setAverageRating(reviewsResponse.meta.average_rating || 0);
          }
        }
      } catch (error: any) {
        console.error("Error fetching room type detail:", error);
        message.error("Không thể tải thông tin loại phòng");
        navigate("/rooms");
      } finally {
        setLoading(false);
      }
    };

    fetchRoomTypeDetail();
  }, [id, navigate]);

  // Re-fetch room type khi date range thay đổi
  useEffect(() => {
    if (
      id &&
      roomType &&
      cartDateRange &&
      cartDateRange[0] &&
      cartDateRange[1]
    ) {
      fetchRoomTypeWithDates(false);
    }
  }, [cartDateRange?.[0]?.valueOf(), cartDateRange?.[1]?.valueOf()]);

  // Reset quantity khi roomType thay đổi
  useEffect(() => {
    if (roomType) {
      setQuantity(1);
    }
  }, [roomType?.id]);
  // Handle scroll to update active tab and scrolled state
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);

      const sections = [
        "overview",
        "rooms",
        "location",
        "amenities",
        "policy",
        "reviews",
      ];
      const scrollPosition = currentScrollY + 150;

      let foundSection = false;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop } = element;
          if (scrollPosition >= offsetTop) {
            setActiveTab(section);
            foundSection = true;
            break;
          }
        }
      }

      if (!foundSection) {
        setActiveTab("overview");
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch reviews
  const fetchReviews = async (roomTypeId: number, page: number = 1) => {
    setLoadingReviews(true);
    try {
      const response = await getRoomTypeReviews(roomTypeId, {
        page,
        per_page: 10,
      });
      if (response.success && response.data) {
        setReviews(response.data);
        setReviewsPage(page);
        if (response.meta) {
          setReviewsTotal(response.meta.pagination?.total || 0);
          setAverageRating(response.meta.average_rating || 0);
        }
      }
    } catch (error: any) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Tính số đêm
  const numNights =
    cartDateRange && cartDateRange[0] && cartDateRange[1]
      ? cartDateRange[1].diff(cartDateRange[0], "day")
      : 0;

  // Tính tổng tiền
  const totalPrice =
    roomType?.price_per_night && numNights > 0
      ? roomType.price_per_night * numNights * quantity
      : 0;

  // Xử lý đặt phòng - thêm vào cart và chuyển đến trang booking/info
  const handleBookNow = () => {
    if (!isLoggedIn) {
      message.warning("Vui lòng đăng nhập để đặt phòng!");
      setIsLoginModalVisible(true);
      return;
    }

    if (!cartDateRange || !cartDateRange[0] || !cartDateRange[1]) {
      message.warning("Vui lòng chọn ngày nhận và trả phòng!");
      return;
    }

    if (!roomType) return;

    if ((roomType.available_count || 0) === 0) {
      message.error(
        `Loại phòng "${roomType.name}" đã hết phòng trong khoảng thời gian này. Vui lòng chọn ngày khác!`
      );
      return;
    }

    // Kiểm tra số lượng phòng không vượt quá số phòng còn trống
    if (quantity > (roomType.available_count || 0)) {
      message.error(
        `Chỉ còn ${roomType.available_count} phòng trống. Vui lòng chọn số lượng phù hợp!`
      );
      return;
    }

    if (quantity < 1) {
      message.warning("Số lượng phòng phải lớn hơn 0!");
      return;
    }

    const checkInDate = cartDateRange[0].format("DD/MM/YYYY");
    const checkOutDate = cartDateRange[1].format("DD/MM/YYYY");
    const pricePerNight = roomType.price_per_night || 0;
    const maxAdults = roomType.max_adults || 2;
    const maxChildren = roomType.max_children || 0;

    // Thêm vào cart trước (không hiển thị thông báo)
    addRoomTypeToCart(
      roomType,
      quantity,
      checkInDate,
      checkOutDate,
      numNights,
      pricePerNight,
      maxAdults,
      maxChildren,
      false // Không hiển thị thông báo
    );

    // Sau đó chuyển đến trang booking/info
    navigate("/booking/info");
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!roomType) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Empty description="Không tìm thấy loại phòng" />
        <Button type="primary" onClick={() => navigate("/rooms")}>
          Quay lại danh sách phòng
        </Button>
      </div>
    );
  }

  const galleryImages =
    roomType.images && roomType.images.length > 0
      ? roomType.images.map((img) => img.image_url)
      : roomType.image_url
      ? [roomType.image_url]
      : ["/img/bg-img/1.jpg"];

  const pageTitle = `${roomType.name} - BookStay`;
  const pageDescription =
    roomType.description || `Đặt phòng ${roomType.name} tại BookStay`;
  const pageImage = galleryImages[0];

  // Calculate review statistics
  const reviewStats = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  return (
    <div className="room-detail-page traveloka-style">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={pageImage} />
      </Helmet>

      {/* Hero Section */}
      <section
        style={{
          position: "relative",
          height: 350,
          backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(26,26,26,0.75) 100%), url('${galleryImages[0]}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            padding: "0 20px",
            maxWidth: 900,
          }}
        >
          <div
            style={{
              width: 60,
              height: 3,
              background: "linear-gradient(90deg, #cb8670, #e0a090)",
              margin: "0 auto 20px",
              borderRadius: 2,
            }}
          />
          <Title
            level={1}
            style={{
              color: "#fff",
              fontSize: 42,
              fontWeight: 400,
              marginBottom: 15,
            }}
          >
            {roomType.name}
          </Title>
          <Space size="large" style={{ marginBottom: 20 }}>
            {averageRating > 0 && (
              <Space>
                <Rate
                  disabled
                  value={averageRating}
                  allowHalf
                  style={{ fontSize: 18 }}
                />
                <Text strong style={{ color: "#fff", fontSize: 16 }}>
                  {averageRating.toFixed(1)}
                </Text>
              </Space>
            )}
          </Space>
        </div>
      </section>

      <Content style={{ background: "#f5f5f5", minHeight: "80vh" }}>
        <div
          className="container"
          style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 15px" }}
        >
          {/* Header Section */}
          <div
            style={{
              background: "#fff",
              padding: "24px",
              borderRadius: "8px",
              marginBottom: "16px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              style={{
                marginBottom: 16,
                color: "#cb8670",
                fontWeight: 500,
              }}
            >
              Trở về
            </Button>

            <Title
              level={2}
              style={{
                marginBottom: 12,
                fontSize: 28,
                fontWeight: 600,
                color: "#1a1a1a",
              }}
            >
              {roomType.name}
            </Title>

            <Space size={16} wrap style={{ marginBottom: 12 }}>
              {averageRating > 0 && (
                <div
                  style={{
                    background: "#cb8670",
                    color: "#fff",
                    padding: "4px 12px",
                    borderRadius: "4px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontWeight: 600,
                  }}
                >
                  <StarFilled />
                  <span>{averageRating.toFixed(1)}/5</span>
                </div>
              )}
              <Text type="secondary">{reviewsTotal} đánh giá</Text>
            </Space>
            {roomType.property && (
              <div>
                <Space style={{ color: "#666" }}>
                  <EnvironmentOutlined />
                  <Text>{roomType.property.name}</Text>
                </Space>
              </div>
            )}
          </div>

          {/* Gallery Images */}
          <div
            style={{
              background: "#fff",
              padding: "0",
              borderRadius: "8px",
              marginBottom: "16px",
              overflow: "hidden",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <AntImage.PreviewGroup>
              <Row gutter={[8, 8]}>
                {galleryImages.slice(0, 5).map((img, idx) => (
                  <Col span={idx === 0 ? 12 : 6} key={idx}>
                    <AntImage
                      src={img}
                      alt={`${roomType.name} ${idx + 1}`}
                      style={{
                        width: "100%",
                        height: idx === 0 ? 380 : 185,
                        objectFit: "cover",
                        borderRadius:
                          idx === 0
                            ? "8px 0 0 8px"
                            : idx === 2
                            ? "0 8px 0 0"
                            : idx === 4
                            ? "0 0 8px 0"
                            : 0,
                      }}
                    />
                  </Col>
                ))}
              </Row>
            </AntImage.PreviewGroup>
          </div>

          {/* Sticky Navigation Tabs */}
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 100,
              background: isScrolled ? "rgba(255, 255, 255, 0.98)" : "#fff",
              backdropFilter: isScrolled ? "blur(10px)" : "none",
              borderRadius: isScrolled ? "0" : "8px",
              marginBottom: "16px",
              boxShadow: isScrolled
                ? "0 4px 20px rgba(0,0,0,0.12)"
                : "0 2px 8px rgba(0,0,0,0.05)",
              borderBottom: isScrolled ? "1px solid rgba(0,0,0,0.08)" : "none",
              padding: "0 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <Space size={0} style={{ flex: 1 }}>
              <Button
                type="text"
                onClick={() =>
                  document
                    .getElementById("overview")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                style={{
                  borderBottom:
                    activeTab === "overview" ? "3px solid #cb8670" : "none",
                  borderRadius: 0,
                  padding: "16px 20px",
                  fontWeight: 600,
                  fontSize: "16px",
                  color: activeTab === "overview" ? "#cb8670" : "#666",
                }}
              >
                Tổng quan
              </Button>
              <Button
                type="text"
                onClick={() =>
                  document
                    .getElementById("rooms")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                style={{
                  borderBottom:
                    activeTab === "rooms" ? "3px solid #cb8670" : "none",
                  borderRadius: 0,
                  padding: "16px 20px",
                  fontWeight: 600,
                  fontSize: "16px",
                  color: activeTab === "rooms" ? "#cb8670" : "#666",
                }}
              >
                Phòng
              </Button>
              <Button
                type="text"
                onClick={() =>
                  document
                    .getElementById("location")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                style={{
                  borderBottom:
                    activeTab === "location" ? "3px solid #cb8670" : "none",
                  borderRadius: 0,
                  padding: "16px 20px",
                  fontWeight: 600,
                  fontSize: "16px",
                  color: activeTab === "location" ? "#cb8670" : "#666",
                }}
              >
                Vị trí
              </Button>
              <Button
                type="text"
                onClick={() =>
                  document
                    .getElementById("amenities")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                style={{
                  borderBottom:
                    activeTab === "amenities" ? "3px solid #cb8670" : "none",
                  borderRadius: 0,
                  padding: "16px 20px",
                  fontWeight: 600,
                  fontSize: "16px",
                  color: activeTab === "amenities" ? "#cb8670" : "#666",
                }}
              >
                Tiện ích
              </Button>
              <Button
                type="text"
                onClick={() =>
                  document
                    .getElementById("policy")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                style={{
                  borderBottom:
                    activeTab === "policy" ? "3px solid #cb8670" : "none",
                  borderRadius: 0,
                  padding: "16px 20px",
                  fontWeight: 600,
                  fontSize: "16px",
                  color: activeTab === "policy" ? "#cb8670" : "#666",
                }}
              >
                Chính sách
              </Button>
              <Button
                type="text"
                onClick={() =>
                  document
                    .getElementById("reviews")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                style={{
                  borderBottom:
                    activeTab === "reviews" ? "3px solid #cb8670" : "none",
                  borderRadius: 0,
                  padding: "16px 20px",
                  fontWeight: 600,
                  fontSize: "16px",
                  color: activeTab === "reviews" ? "#cb8670" : "#666",
                }}
              >
                Đánh giá
              </Button>
            </Space>
          </div>

          <Row gutter={[16, 16]}>
            {/* Left Column - All Content */}
            <Col xs={24} lg={16}>
              <div
                style={{
                  background: "#fff",
                  borderRadius: "8px",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  padding: "24px",
                }}
              >
                {/* Rating Overview */}
                <div id="overview"></div>
                {averageRating > 0 && (
                  <div
                    style={{
                      marginBottom: 32,
                      padding: 24,
                      background:
                        "linear-gradient(135deg, #fff8f6 0%, #fff 100%)",
                      borderRadius: 8,
                      border: "1px solid rgba(203, 134, 112, 0.1)",
                    }}
                  >
                    <Space size={24} align="start" style={{ width: "100%" }}>
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontSize: 48,
                            fontWeight: 700,
                            color: "#cb8670",
                            lineHeight: 1,
                          }}
                        >
                          {(averageRating * 2).toFixed(1)}
                        </div>
                        <div
                          style={{ fontSize: 14, color: "#666", marginTop: 8 }}
                        >
                          /10
                        </div>
                        <Rate
                          disabled
                          value={averageRating}
                          allowHalf
                          style={{ fontSize: 16, marginTop: 8 }}
                        />
                        <div
                          style={{ fontSize: 12, color: "#999", marginTop: 4 }}
                        >
                          {reviewsTotal} đánh giá
                        </div>
                      </div>
                      <Divider
                        type="vertical"
                        style={{ height: "auto", margin: 0 }}
                      />
                      <div style={{ flex: 1 }}>
                        <Text
                          strong
                          style={{
                            fontSize: 16,
                            display: "block",
                            marginBottom: 12,
                          }}
                        >
                          Phân bố đánh giá
                        </Text>
                        {[5, 4, 3, 2, 1].map((star) => (
                          <div
                            key={star}
                            style={{
                              marginBottom: 8,
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            <Text style={{ width: 60 }}>{star} sao</Text>
                            <Progress
                              percent={
                                reviewsTotal > 0
                                  ? (reviewStats[
                                      star as keyof typeof reviewStats
                                    ] /
                                      reviewsTotal) *
                                    100
                                  : 0
                              }
                              strokeColor="#cb8670"
                              showInfo={false}
                              style={{ flex: 1 }}
                            />
                            <Text
                              type="secondary"
                              style={{ width: 40, textAlign: "right" }}
                            >
                              {reviewStats[star as keyof typeof reviewStats]}
                            </Text>
                          </div>
                        ))}
                      </div>
                    </Space>
                  </div>
                )}

                {/* Room Description */}
                <div style={{ marginBottom: 24 }}>
                  <Title level={4} style={{ marginBottom: 16 }}>
                    Mô tả phòng
                  </Title>
                  <Paragraph
                    style={{ fontSize: 15, lineHeight: 1.8, color: "#555" }}
                  >
                    {roomType.description ||
                      "Phòng đẹp, tiện nghi đầy đủ, view đẹp"}
                  </Paragraph>
                </div>

                {/* Room Details Grid */}
                <div style={{ marginBottom: 32 }}>
                  <Title level={4} style={{ marginBottom: 16 }}>
                    Thông tin phòng
                  </Title>
                  <Row gutter={[16, 16]}>
                    <Col xs={12} sm={6}>
                      <Card
                        size="small"
                        style={{ textAlign: "center", background: "#fafafa" }}
                      >
                        <CompassOutlined
                          style={{
                            fontSize: 24,
                            color: "#cb8670",
                            marginBottom: 8,
                          }}
                        />
                        <div
                          style={{
                            fontSize: 12,
                            color: "#999",
                            marginBottom: 4,
                          }}
                        >
                          Diện tích
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 600 }}>
                          {getRoomSize(roomType)}
                        </div>
                      </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Card
                        size="small"
                        style={{ textAlign: "center", background: "#fafafa" }}
                      >
                        <BankOutlined
                          style={{
                            fontSize: 24,
                            color: "#cb8670",
                            marginBottom: 8,
                          }}
                        />
                        <div
                          style={{
                            fontSize: 12,
                            color: "#999",
                            marginBottom: 4,
                          }}
                        >
                          Loại giường
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>
                          {getBedType(roomType)}
                        </div>
                      </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Card
                        size="small"
                        style={{ textAlign: "center", background: "#fafafa" }}
                      >
                        <TeamOutlined
                          style={{
                            fontSize: 24,
                            color: "#cb8670",
                            marginBottom: 8,
                          }}
                        />
                        <div
                          style={{
                            fontSize: 12,
                            color: "#999",
                            marginBottom: 4,
                          }}
                        >
                          Số khách
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>
                          {roomType.max_adults || 2} người lớn
                          {roomType.max_children
                            ? ` + ${roomType.max_children} trẻ em`
                            : ""}
                        </div>
                      </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Card
                        size="small"
                        style={{ textAlign: "center", background: "#fafafa" }}
                      >
                        <ShopOutlined
                          style={{
                            fontSize: 24,
                            color: "#52c41a",
                            marginBottom: 8,
                          }}
                        />
                        <div
                          style={{
                            fontSize: 12,
                            color: "#999",
                            marginBottom: 4,
                          }}
                        >
                          Còn trống
                        </div>
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 600,
                            color: "#52c41a",
                          }}
                        >
                          {roomType.available_count || 0} phòng
                        </div>
                      </Card>
                    </Col>
                  </Row>
                </div>

                {/* Phòng còn trống */}
                <div
                  id="rooms"
                  style={{ marginBottom: 32, scrollMarginTop: "80px" }}
                >
                  <Title level={4} style={{ marginBottom: 16 }}>
                    Những phòng còn trống
                  </Title>
                  <div
                    style={{
                      padding: 20,
                      background:
                        "linear-gradient(135deg, #e8f5e9 0%, #fff 100%)",
                      borderRadius: 8,
                      border: "1px solid #52c41a",
                    }}
                  >
                    <Space
                      direction="vertical"
                      size={12}
                      style={{ width: "100%" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <Text
                            strong
                            style={{ fontSize: 18, display: "block" }}
                          >
                            {roomType.name}
                          </Text>
                          <Text type="secondary">
                            {getBedType(roomType)} • {getRoomSize(roomType)}
                          </Text>
                        </div>
                        <Tag
                          color="success"
                          style={{ fontSize: 14, padding: "4px 12px" }}
                        >
                          Còn {roomType.available_count || 0} phòng
                        </Tag>
                      </div>
                      <Divider style={{ margin: "12px 0" }} />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: 600,
                              color: "#cb8670",
                            }}
                          >
                            {formatVNDWithUnit(
                              roomType.price_per_night || 0,
                              "/đêm"
                            )}
                          </Text>
                          <Text
                            type="secondary"
                            style={{ display: "block", fontSize: 12 }}
                          >
                            Chưa bao gồm thuế và phí
                          </Text>
                        </div>
                      </div>
                    </Space>
                  </div>
                </div>

                {/* Vị trí */}
                <div
                  id="location"
                  style={{ marginBottom: 32, scrollMarginTop: "80px" }}
                >
                  <Title level={4} style={{ marginBottom: 16 }}>
                    Xung quanh {roomType.name} có gì
                  </Title>
                  {roomType.property && (
                    <div style={{ marginBottom: 16 }}>
                      <Space style={{ marginBottom: 16 }}>
                        <EnvironmentOutlined
                          style={{ color: "#cb8670", fontSize: 18 }}
                        />
                        <Text strong style={{ fontSize: 16 }}>
                          {roomType.property.name}
                        </Text>
                      </Space>
                      {roomType.property.address && (
                        <Text
                          type="secondary"
                          style={{ display: "block", paddingLeft: 26 }}
                        >
                          {roomType.property.address}
                        </Text>
                      )}
                    </div>
                  )}

                  <Divider />

                  {/* Google Maps */}
                  <div
                    style={{
                      width: "100%",
                      height: "400px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      marginBottom: "24px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.325493665163!2d106.66423931533506!3d10.786834992314442!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752ed23c80767d%3A0x5a981a5efee9fd7d!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBLaG9hIGjhu41jIFThu7Egbmhpw6puIC0gxJBIUUctSENNVVM!5e0!3m2!1svi!2s!4v1639732800000!5m2!1svi!2s"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={true}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>

                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Card
                        size="small"
                        title={<Text strong>Địa điểm lân cận</Text>}
                      >
                        <Space direction="vertical" style={{ width: "100%" }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text>Bệnh viện</Text>
                            <Text type="secondary">915 m</Text>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text>Chợ</Text>
                            <Text type="secondary">833 m</Text>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text>Siêu thị</Text>
                            <Text type="secondary">757 m</Text>
                          </div>
                        </Space>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card
                        size="small"
                        title={<Text strong>Trung tâm giao thông</Text>}
                      >
                        <Space direction="vertical" style={{ width: "100%" }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text>Sân bay quốc tế</Text>
                            <Text type="secondary">2.46 km</Text>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text>Ga tàu</Text>
                            <Text type="secondary">1.37 km</Text>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text>Bến xe</Text>
                            <Text type="secondary">2.02 km</Text>
                          </div>
                        </Space>
                      </Card>
                    </Col>
                  </Row>
                </div>

                {/* Tiện ích */}
                <div
                  id="amenities"
                  style={{ marginBottom: 32, scrollMarginTop: "80px" }}
                >
                  <Title level={4} style={{ marginBottom: 16 }}>
                    Tiện ích
                  </Title>
                  {roomType.amenities && roomType.amenities.length > 0 ? (
                    (() => {
                      const categorized = categorizeAmenities(
                        roomType.amenities
                      );
                      return (
                        <Space
                          direction="vertical"
                          size={24}
                          style={{ width: "100%" }}
                        >
                          {/* Các tiện ích lân cận */}
                          {categorized.keyAmenities.length > 0 && (
                            <div>
                              <Text
                                strong
                                style={{
                                  fontSize: 16,
                                  display: "block",
                                  marginBottom: 16,
                                }}
                              >
                                Các tiện ích lân cận
                              </Text>
                              <Row gutter={[12, 12]}>
                                {mapAmenitiesToUI(categorized.keyAmenities).map(
                                  (amenity, index) => (
                                    <Col xs={12} sm={8} key={index}>
                                      <Space>
                                        {amenity.icon}
                                        <Text>{amenity.text}</Text>
                                      </Space>
                                    </Col>
                                  )
                                )}
                              </Row>
                            </div>
                          )}

                          {/* Tiện nghị công cộng */}
                          {categorized.views.length > 0 && (
                            <div>
                              <Text
                                strong
                                style={{
                                  fontSize: 16,
                                  display: "block",
                                  marginBottom: 16,
                                }}
                              >
                                Tiện nghi công cộng
                              </Text>
                              <Row gutter={[12, 12]}>
                                {mapAmenitiesToUI(categorized.views).map(
                                  (amenity, index) => (
                                    <Col xs={12} sm={8} key={index}>
                                      <Space>
                                        {amenity.icon}
                                        <Text>{amenity.text}</Text>
                                      </Space>
                                    </Col>
                                  )
                                )}
                              </Row>
                            </div>
                          )}

                          {/* Tiện nghi phòng */}
                          {categorized.floors.length > 0 && (
                            <div>
                              <Text
                                strong
                                style={{
                                  fontSize: 16,
                                  display: "block",
                                  marginBottom: 16,
                                }}
                              >
                                Tiện nghi phòng
                              </Text>
                              <Row gutter={[12, 12]}>
                                {mapAmenitiesToUI(categorized.floors).map(
                                  (amenity, index) => (
                                    <Col xs={12} sm={8} key={index}>
                                      <Space>
                                        {amenity.icon}
                                        <Text>{amenity.text}</Text>
                                      </Space>
                                    </Col>
                                  )
                                )}
                              </Row>
                            </div>
                          )}

                          {/* Dịch vụ khách sạn */}
                          {categorized.others.length > 0 && (
                            <div>
                              <Text
                                strong
                                style={{
                                  fontSize: 16,
                                  display: "block",
                                  marginBottom: 16,
                                }}
                              >
                                Dịch vụ khách sạn
                              </Text>
                              <Row gutter={[12, 12]}>
                                {mapAmenitiesToUI(categorized.others).map(
                                  (amenity, index) => (
                                    <Col xs={12} sm={8} key={index}>
                                      <Space>
                                        {amenity.icon}
                                        <Text>{amenity.text}</Text>
                                      </Space>
                                    </Col>
                                  )
                                )}
                              </Row>
                            </div>
                          )}
                        </Space>
                      );
                    })()
                  ) : (
                    <Empty description="Không có thông tin tiện ích" />
                  )}
                </div>

                {/* Chính sách */}
                <div
                  id="policy"
                  style={{ marginBottom: 32, scrollMarginTop: "80px" }}
                >
                  <Title level={4} style={{ marginBottom: 16 }}>
                    Chính sách và những thông tin liên quan
                  </Title>

                  {/* Check-in/Check-out Time */}
                  <Card size="small" style={{ marginBottom: 16 }}>
                    <Space
                      direction="vertical"
                      size={12}
                      style={{ width: "100%" }}
                    >
                      <div>
                        <Text
                          strong
                          style={{
                            fontSize: 16,
                            display: "block",
                            marginBottom: 8,
                          }}
                        >
                          <ClockCircleOutlined
                            style={{ marginRight: 8, color: "#cb8670" }}
                          />
                          Thời gian nhận/trả phòng
                        </Text>
                        <div style={{ paddingLeft: 32 }}>
                          <div style={{ marginBottom: 8 }}>
                            <Text type="secondary">Giờ nhận phòng: </Text>
                            <Text strong>Từ 14:00</Text>
                          </div>
                          <div>
                            <Text type="secondary">Giờ trả phòng: </Text>
                            <Text strong>Trước 12:00</Text>
                          </div>
                        </div>
                      </div>
                    </Space>
                  </Card>

                  {/* Required Documents */}
                  <Card size="small" style={{ marginBottom: 16 }}>
                    <div>
                      <Text
                        strong
                        style={{
                          fontSize: 16,
                          display: "block",
                          marginBottom: 8,
                        }}
                      >
                        <SafetyOutlined
                          style={{ marginRight: 8, color: "#cb8670" }}
                        />
                        Giấy Tờ Bắt Buộc
                      </Text>
                      <Paragraph style={{ paddingLeft: 32, marginBottom: 0 }}>
                        Khi nhận phòng, bạn cần cung cấp CMND/CCCD. Các giấy tờ
                        cần thiết có thể ở dạng bản mềm.
                      </Paragraph>
                    </div>
                  </Card>

                  {/* Check-in Directions */}
                  <Card size="small" style={{ marginBottom: 16 }}>
                    <div>
                      <Text
                        strong
                        style={{
                          fontSize: 16,
                          display: "block",
                          marginBottom: 8,
                        }}
                      >
                        <HomeOutlined
                          style={{ marginRight: 8, color: "#cb8670" }}
                        />
                        Hướng Dẫn Nhận Phòng Chung
                      </Text>
                      <Paragraph style={{ paddingLeft: 32, marginBottom: 0 }}>
                        Khi làm thủ tục nhận phòng, quý khách cần xuất trình thẻ
                        căn cước công dân hoặc giấy tờ tùy thân có gắn ảnh; và
                        có thể xuất trình thẻ tín dụng hoặc đặt cọc tiền mặt để
                        thanh toán chi phí phát sinh nếu có.
                      </Paragraph>
                    </div>
                  </Card>

                  {/* General Info */}
                  <Card size="small">
                    <Space
                      direction="vertical"
                      size={16}
                      style={{ width: "100%" }}
                    >
                      <div>
                        <Text
                          strong
                          style={{
                            fontSize: 16,
                            display: "block",
                            marginBottom: 12,
                          }}
                        >
                          Thông tin chung
                        </Text>
                        <Space
                          direction="vertical"
                          size={8}
                          style={{ width: "100%", paddingLeft: 0 }}
                        >
                          <Text>• Lễ tân 24h, Chỗ đậu xe, Thang máy, WiFi</Text>
                          <Text>
                            • Thời gian nhận/trả phòng: Từ 14:00 - đến 12:00
                          </Text>
                          <Text>
                            • Khoảng cách đến trung tâm thành phố: 915 m
                          </Text>
                        </Space>
                      </div>

                      <Divider style={{ margin: 0 }} />

                      <div>
                        <Text
                          strong
                          style={{
                            fontSize: 16,
                            display: "block",
                            marginBottom: 12,
                          }}
                        >
                          Điểm đến phổ biến
                        </Text>
                        <Space
                          direction="vertical"
                          size={8}
                          style={{ width: "100%" }}
                        >
                          <Text>• Bệnh viện Da khoa: 915 m</Text>
                          <Text>• Trung tâm mua sắm: 2,02 km</Text>
                          <Text>• Sân bay quốc tế: 2,46 km</Text>
                        </Space>
                      </div>
                    </Space>
                  </Card>
                </div>

                {/* Đánh giá */}
                <div
                  id="reviews"
                  style={{ marginBottom: 32, scrollMarginTop: "80px" }}
                >
                  <Title level={4} style={{ marginBottom: 16 }}>
                    Đánh giá của khách hàng ({reviewsTotal})
                  </Title>
                  {loadingReviews ? (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                      <Spin size="large" />
                    </div>
                  ) : reviews.length > 0 ? (
                    <>
                      <List
                        dataSource={reviews}
                        renderItem={(review: any) => (
                          <List.Item
                            style={{
                              padding: "16px 0",
                              borderBottom: "1px solid #f0f0f0",
                            }}
                          >
                            <List.Item.Meta
                              avatar={
                                <Avatar
                                  size={48}
                                  src={review.user?.avatar}
                                  icon={<UserOutlined />}
                                  style={{ background: "#cb8670" }}
                                />
                              }
                              title={
                                <Space
                                  direction="vertical"
                                  size={4}
                                  style={{ width: "100%" }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Text strong style={{ fontSize: 16 }}>
                                      {review.user?.full_name || "Khách hàng"}
                                    </Text>
                                    <div
                                      style={{
                                        background: "#cb8670",
                                        color: "#fff",
                                        padding: "2px 8px",
                                        borderRadius: "4px",
                                        fontSize: 14,
                                        fontWeight: 600,
                                      }}
                                    >
                                      {review.rating.toFixed(1)}/5
                                    </div>
                                  </div>
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: 12 }}
                                  >
                                    Đánh giá cách đây 4 ngày
                                  </Text>
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: 12 }}
                                  >
                                    Kỳ nghỉ tại chỗ
                                  </Text>
                                </Space>
                              }
                              description={
                                <div style={{ marginTop: 12 }}>
                                  {review.title && (
                                    <Text
                                      strong
                                      style={{
                                        display: "block",
                                        marginBottom: 8,
                                        fontSize: 15,
                                      }}
                                    >
                                      {review.title}
                                    </Text>
                                  )}
                                  {review.comment && (
                                    <Paragraph
                                      style={{
                                        marginBottom: 0,
                                        color: "#555",
                                        fontSize: 14,
                                        lineHeight: 1.6,
                                      }}
                                    >
                                      {review.comment}
                                    </Paragraph>
                                  )}
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                      {reviewsTotal > 10 && reviews.length < reviewsTotal && (
                        <div style={{ textAlign: "center", marginTop: 24 }}>
                          <Button
                            size="large"
                            onClick={() =>
                              fetchReviews(Number(id!), reviewsPage + 1)
                            }
                            disabled={loadingReviews}
                            style={{
                              borderColor: "#cb8670",
                              color: "#cb8670",
                            }}
                          >
                            Xem thêm đánh giá
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <Empty description="Chưa có đánh giá nào" />
                  )}
                </div>
              </div>
            </Col>

            {/* Right Column - Booking Card */}
            <Col xs={24} lg={8}>
              <div
                style={{
                  position: "sticky",
                  top: 20,
                }}
              >
                <Card
                  style={{
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    border: "1px solid #e8e8e8",
                  }}
                >
                  <Space
                    direction="vertical"
                    size="large"
                    style={{ width: "100%" }}
                  >
                    {/* Price Display */}
                    <div
                      style={{
                        textAlign: "center",
                        padding: "16px",
                        background:
                          "linear-gradient(135deg, #fff8f6 0%, #fff 100%)",
                        borderRadius: "8px",
                        border: "1px solid rgba(203, 134, 112, 0.1)",
                      }}
                    >
                      <Text
                        type="secondary"
                        style={{
                          fontSize: 14,
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        Giá/phòng/đêm từ
                      </Text>
                      <Text
                        strong
                        style={{
                          fontSize: 28,
                          color: "#cb8670",
                          display: "block",
                        }}
                      >
                        {roomType.price_per_night
                          ? formatVND(roomType.price_per_night)
                          : "N/A"}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Chưa bao gồm thuế và phí
                      </Text>
                    </div>

                    <Divider style={{ margin: 0 }} />

                    {/* Date Picker */}
                    <div>
                      <Text
                        strong
                        style={{
                          display: "block",
                          marginBottom: 12,
                          fontSize: 16,
                        }}
                      >
                        <CalendarOutlined
                          style={{ marginRight: 8, color: "#cb8670" }}
                        />
                        Chọn ngày nhận và trả phòng
                      </Text>

                      <BookingFilterSidebar
                        dateRange={cartDateRange}
                        onDateChange={(dates) => {
                          if (dates && dates[0] && dates[1]) {
                            if (dates[0].isSame(dates[1], "day")) {
                              message.warning(
                                "Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 ngày!"
                              );
                              return;
                            }
                            if (!dates[1].isAfter(dates[0], "day")) {
                              message.warning(
                                "Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 ngày!"
                              );
                              return;
                            }
                            setCartDateRange([dates[0], dates[1]]);
                          } else {
                            setCartDateRange(null);
                          }
                        }}
                        disabledDate={(current) => {
                          if (!current) return false;
                          const today = dayjs().startOf("day");
                          const currentDate = current.startOf("day");

                          // Chỉ disable ngày quá khứ, cho phép chọn lại ngày nhận
                          return currentDate.isBefore(today);
                        }}
                        showButton={false}
                      />
                    </div>

                    {/* Chọn số lượng phòng */}
                    <div style={{ marginBottom: 16 }}>
                      <Text
                        strong
                        style={{ display: "block", marginBottom: 8 }}
                      >
                        Số lượng phòng
                      </Text>
                      <InputNumber
                        min={1}
                        max={roomType?.available_count || 1}
                        value={quantity}
                        onChange={(value) => setQuantity(value || 1)}
                        style={{ width: "100%" }}
                        addonAfter="phòng"
                        disabled={
                          !cartDateRange ||
                          !cartDateRange[0] ||
                          !cartDateRange[1] ||
                          (roomType?.available_count || 0) === 0
                        }
                      />
                      {roomType && roomType.available_count > 0 && (
                        <Text
                          type="secondary"
                          style={{
                            fontSize: 12,
                            display: "block",
                            marginTop: 4,
                          }}
                        >
                          Còn {roomType.available_count} phòng trống
                        </Text>
                      )}
                    </div>

                    {/* Total Price */}
                    {numNights > 0 && (
                      <div
                        style={{
                          padding: "16px",
                          background: "#f5f5f5",
                          borderRadius: "8px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 8,
                          }}
                        >
                          <Text>{numNights} đêm</Text>
                          <Text strong style={{ fontSize: 16 }}>
                            {formatVND(totalPrice)}
                          </Text>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Tổng giá
                          </Text>
                          <Text
                            strong
                            style={{ fontSize: 18, color: "#cb8670" }}
                          >
                            {formatVND(totalPrice)}
                          </Text>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <Button
                      type="primary"
                      block
                      size="large"
                      icon={<ShoppingCartOutlined />}
                      onClick={handleBookNow}
                      disabled={
                        !cartDateRange ||
                        !cartDateRange[0] ||
                        !cartDateRange[1] ||
                        (roomType.available_count || 0) === 0
                      }
                      style={{
                        height: 48,
                        fontSize: 16,
                        fontWeight: 600,
                        background: "#cb8670",
                        borderColor: "#cb8670",
                        boxShadow: "0 2px 8px rgba(203, 134, 112, 0.3)",
                      }}
                    >
                      Đặt Phòng
                    </Button>

                    {roomType.available_count === 0 && (
                      <div
                        style={{
                          padding: "12px",
                          background: "#fff2e8",
                          borderRadius: "8px",
                          border: "1px solid #ffbb96",
                          textAlign: "center",
                        }}
                      >
                        <Text type="danger" style={{ fontSize: 14 }}>
                          Loại phòng này hiện đã hết phòng trong khoảng thời
                          gian đã chọn
                        </Text>
                      </div>
                    )}
                  </Space>
                </Card>
              </div>
            </Col>
          </Row>
        </div>
      </Content>

      {/* Login Modal */}
      <LoginModal
        open={isLoginModalVisible}
        onClose={() => setIsLoginModalVisible(false)}
        onSwitchToRegister={() => {
          setIsLoginModalVisible(false);
          setIsRegisterModalVisible(true);
        }}
        skipRedirect={true}
      />

      {/* Register Modal */}
      <RegisterModal
        open={isRegisterModalVisible}
        onClose={() => setIsRegisterModalVisible(false)}
        onSwitchToLogin={() => {
          setIsRegisterModalVisible(false);
          setIsLoginModalVisible(true);
        }}
      />
    </div>
  );
};

export default RoomTypeDetailPage;
