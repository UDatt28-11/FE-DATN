import { createBrowserRouter } from "react-router-dom";
import { adminRoutes } from "./adminRoutes";
import AppLayout from "../components/Layout/AppLayout";
import AboutPage from "../pages/About/AboutPage";
import HomePage from "../pages/Home/HomePage"

const router = createBrowserRouter([
    {
        element: <AppLayout />,
        children: [
            { path: "/", element: <HomePage /> },
            { path: "/about", element: <AboutPage /> },
        ],
    },
    adminRoutes,
]);

export default router;
