import type { RouteObject } from "react-router-dom";
import AppLayout from "../components/Layout/AppLayout";

// 🏠 Trang người dùng
import Home from "../pages/Clients/Home/Home";
import AboutPage from "../pages/Clients/About/AboutPage";
import LoginPage from "../pages/Clients/Auth/LoginPage";
import RegisterPage from "../pages/Clients/Auth/RegisterPage";

// --- Sửa đường dẫn cho nhất quán ---
import HomestayListPage from "../pages/Clients/Homestay/HomestayListPage";
// --- Import trang chi tiết (từ Canvas) ---
import HomestayDetailPage from "../pages/Clients/Homestay/HomestayDetailPage";
import PromotionsPage from "../pages/Clients/Promotions/PromotionsPage";
import ContactPage from "../pages/Clients/Contact/ContactPage";

// --- Import trang phòng ---
import Rooms from "../pages/Clients/Rooms/Rooms";
import RoomDetailPage from "../pages/Clients/Rooms/RoomDetailPage";


// 🧭 Router Client
export const clientRoutes: RouteObject[] = [
    {
        path: "/",
        element: <AppLayout />,
        children: [
            { index: true, element: <Home /> },
            { path: "about", element: <AboutPage /> },
            { path: "homestay", element: <HomestayListPage /> },
            { path: "promotion", element: <PromotionsPage /> },
            { path: "contact", element: <ContactPage /> },

            // --- Route cho phòng ---
            { path: "rooms", element: <Rooms /> },
            { path: "rooms/:id", element: <RoomDetailPage /> },

            // --- THÊM MỚI: Route cho trang chi tiết ---
            // Nó sử dụng :id để lấy tham số từ URL
            { path: "homestay/:id", element: <HomestayDetailPage /> }
        ],
    },
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/register",
        element: <RegisterPage />,
    },
];
