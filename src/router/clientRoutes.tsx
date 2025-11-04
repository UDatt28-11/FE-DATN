import { RouteObject } from "react-router-dom";
import AppLayout from "../components/Layout/AppLayout";
import HomePage from "../pages/Client/Home/HomePage";
import AboutPage from "../pages/Client/About/AboutPage";
import HomestayListPage from "../pages/Client/Homestay/HomestayListPage";
import PromotionsPage from "../pages/Client/Promotions/PromotionsPage";
import ContactPage from "../pages/Client/Contact/ContactPage";
import HomestayDetailPage from "../pages/Client/Homestay/HomestayDetailPage";
import LoginPage from "../pages/Client/Auth/LoginPage";
import RegisterPage from "../pages/Client/Auth/RegisterPage";

// 🏠 Trang người dùng



// 🧭 Router Client
export const clientRoutes: RouteObject[] = [
    {
        path: "/",
        element: <AppLayout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: "about", element: <AboutPage /> },
            { path: "homestay", element: <HomestayListPage /> },
            { path: "promotion", element: <PromotionsPage /> },
            { path: "contact", element: <ContactPage /> },

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