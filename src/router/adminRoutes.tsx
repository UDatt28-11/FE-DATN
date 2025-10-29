import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import CategoryManagement from "../pages/Admin/CategoryManagement";
import Listings from "../pages/Admin/Listings";
import Amenities from "../pages/Admin/Amenities";
import Accommodations from "../pages/Admin/Accommodations";
import BookingManagement from "../pages/Admin/BookingManagement";
import PromotionManagement from "../pages/Admin/PromotionManagement";

const Dashboard = lazy(() => import("../pages/Admin/Dashboard"));
const UserManagement = lazy(() => import("../pages/Admin/Users"));
export const adminRoutes: RouteObject = {
    path: "/admin",
    element: <AdminLayout />,
    children: [
        { path: "", element: <Dashboard /> },
        { path: "dashboard", element: <Dashboard /> },
        { path: "categoryManagement", element: <CategoryManagement /> },
        { path: "listing", element: <Listings /> },
        { path: "amenities", element: <Amenities /> },
        { path: "accommodations", element: <Accommodations /> },
        { path: "booking", element: <BookingManagement /> },
        { path: "promotionManagement", element: <PromotionManagement /> },





        { path: "user", element: <UserManagement /> },
    ],
};
