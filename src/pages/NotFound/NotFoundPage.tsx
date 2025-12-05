import React, { useEffect } from "react";
import { Button } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Tự động quay về trang chủ sau 3 giây
    const timer = setTimeout(() => {
      navigate("/");
    }, 3000);

    // Cleanup timer khi component unmount
    return () => {
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: "calc(100vh - 200px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        background: "#fff",
      }}
    >
      {/* Số 404 */}
      <h1
        style={{
          fontSize: 72,
          fontWeight: 700,
          color: "#363636",
          margin: 0,
          marginBottom: 24,
          letterSpacing: "-2px",
        }}
      >
        404
      </h1>

      {/* Thông báo chính */}
      <p
        style={{
          fontSize: 20,
          color: "#7d7d7d",
          margin: 0,
          marginBottom: 12,
          fontWeight: 500,
        }}
      >
        Trang bạn tìm kiếm không tồn tại
      </p>

      {/* Giải thích */}
      <p
        style={{
          fontSize: 16,
          color: "#999",
          margin: 0,
          marginBottom: 32,
          textAlign: "center",
        }}
      >
        Có thể trang đã bị xóa hoặc địa chỉ URL không chính xác
      </p>

      {/* Nút Về Trang Chủ */}
      <Button
        type="primary"
        size="large"
        icon={<HomeOutlined />}
        onClick={() => navigate("/")}
        style={{
          height: 48,
          fontSize: 16,
          fontWeight: 600,
          backgroundColor: "#cb8670",
          borderColor: "#cb8670",
          borderRadius: 6,
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        Về Trang Chủ
      </Button>
    </div>
  );
};

export default NotFoundPage;
