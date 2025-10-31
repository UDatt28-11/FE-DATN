import { RouteObject } from "react-router-dom";
import AppLayout from "../components/Layout/AppLayout";

// 🏠 Trang người dùng
import HomePage from "../pages/Clients/Home/HomePage";
import AboutPage from "../pages/Clients/About/AboutPage";
import LoginPage from "../pages/Clients/Auth/LoginPage";
import RegisterPage from "../pages/Clients/Auth/RegisterPage";

// 🧭 Router Client
export const clientRoutes: RouteObject[] = [
    {
        path: "/",
        element: <AppLayout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: "about", element: <AboutPage /> },
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
