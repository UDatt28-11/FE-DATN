import { createBrowserRouter } from "react-router-dom";
import { adminRoutes } from "./adminRoutes";
import AppLayout from "../components/Layout/AppLayout";
import HomePage from "../pages/Client/Home/HomePage";
import AboutPage from "../pages/Client/About/AboutPage";


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
