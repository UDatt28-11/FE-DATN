import type { RouteObject } from "react-router-dom";
import { Layout } from "antd";
import { ProtectedRoute } from "../components/Auth";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import ScrollToTop from "../components/shared/ScrollToTop";

// Pages
import Home from "../pages/Clients/Home";
import About from "../pages/About";
import Services from "../pages/Clients/Services/Services";
import RoomList from "../pages/Clients/Rooms/RoomList";
import RoomDetailPage from "../pages/Clients/Rooms/RoomDetailPage";
import RoomTypeDetailPage from "../pages/Clients/Rooms/RoomTypeDetailPage";
import BookingInfoPage from "../pages/Clients/Booking/BookingInfoPage";
import PaymentPage from "../pages/Clients/Booking/PaymentPage";
import PaymentSuccessPage from "../pages/Clients/Booking/PaymentSuccessPage";
import PaymentCancelPage from "../pages/Clients/Booking/PaymentCancelPage";
import MyBookingsPage from "../pages/Clients/Booking/MyBookingsPage";
import MyVouchersPage from "../pages/Clients/Vouchers/MyVouchersPage";
import Promotions from "../pages/Clients/Promotions/Promotions";
import Blog from "../pages/Blog";
import Contact from "../pages/Clients/Contact/Contact";
import Profile from "../pages/Clients/Profile";
import Settings from "../pages/Clients/Settings";
import ResetPasswordPage from "../pages/Clients/Auth/ResetPasswordPage";
import ForgotPasswordPage from "../pages/Clients/Auth/ForgotPasswordPage";
import EmailVerifiedPage from "../pages/Clients/Auth/EmailVerifiedPage";
import GoogleCallback from "../pages/Auth/GoogleCallback";
import HomestayPolicyPage from "../pages/Clients/Policy";

const { Content } = Layout;

/**
 * Client Layout Wrapper
 * Bọc tất cả client routes với Header + Footer
 */
const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <ScrollToTop />
      <Header />
      <Content style={{ marginTop: "0" }}>
        {children}
      </Content>
      <Footer />
    </Layout>
  );
};

/**
 * Client Routes
 * Tất cả routes dành cho khách hàng (user)
 */
export const clientRoutes: RouteObject[] = [
  // Routes không có Header/Footer
  {
    path: "/auth/google/callback",
    element: <GoogleCallback />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/verified",
    element: <ClientLayout><EmailVerifiedPage /></ClientLayout>,
  },
  
  // Routes có Header/Footer
  {
    path: "/",
    element: <ClientLayout><Home /></ClientLayout>,
  },
  {
    path: "/about",
    element: <ClientLayout><About /></ClientLayout>,
  },
  {
    path: "/services",
    element: <ClientLayout><Services /></ClientLayout>,
  },
  {
    path: "/rooms",
    element: <ClientLayout><RoomList /></ClientLayout>,
  },
  {
    path: "/rooms/:id",
    element: <ClientLayout><RoomDetailPage /></ClientLayout>,
  },
  {
    path: "/room-types/:id",
    element: <ClientLayout><RoomTypeDetailPage /></ClientLayout>,
  },
  {
    path: "/booking/info",
    element: (
      <ClientLayout>
        <ProtectedRoute>
          <BookingInfoPage />
        </ProtectedRoute>
      </ClientLayout>
    ),
  },
  {
    path: "/booking/payment",
    element: (
      <ClientLayout>
        <ProtectedRoute>
          <PaymentPage />
        </ProtectedRoute>
      </ClientLayout>
    ),
  },
  {
    path: "/payment/success",
    element: (
      <ClientLayout>
        <ProtectedRoute>
          <PaymentSuccessPage />
        </ProtectedRoute>
      </ClientLayout>
    ),
  },
  {
    path: "/payment/cancel",
    element: (
      <ClientLayout>
        <ProtectedRoute>
          <PaymentCancelPage />
        </ProtectedRoute>
      </ClientLayout>
    ),
  },
  {
    // Route cho payment error - sử dụng lại PaymentCancelPage với thông báo lỗi
    path: "/payment/error",
    element: (
      <ClientLayout>
        <ProtectedRoute>
          <PaymentCancelPage />
        </ProtectedRoute>
      </ClientLayout>
    ),
  },
  {
    path: "/my-bookings",
    element: (
      <ClientLayout>
        <ProtectedRoute>
          <MyBookingsPage />
        </ProtectedRoute>
      </ClientLayout>
    ),
  },
  {
    path: "/my-vouchers",
    element: (
      <ClientLayout>
        <ProtectedRoute>
          <MyVouchersPage />
        </ProtectedRoute>
      </ClientLayout>
    ),
  },
  {
    path: "/promotions",
    element: <ClientLayout><Promotions /></ClientLayout>,
  },
  {
    path: "/blog",
    element: <ClientLayout><Blog /></ClientLayout>,
  },
  {
    path: "/contact",
    element: <ClientLayout><Contact /></ClientLayout>,
  },
  {
    path: "/policy",
    element: <ClientLayout><HomestayPolicyPage /></ClientLayout>,
  },
  {
    path: "/reset-password/:token",
    element: <ClientLayout><ResetPasswordPage /></ClientLayout>,
  },
  {
    path: "/profile",
    element: (
      <ClientLayout>
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </ClientLayout>
    ),
  },
  {
    path: "/settings",
    element: (
      <ClientLayout>
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      </ClientLayout>
    ),
  },
];
