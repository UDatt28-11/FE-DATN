import { createBrowserRouter } from "react-router-dom";
import { adminRoutes } from "./adminRoutes";
import { clientRoutes } from "./clientRoutes";
import NotFoundPage from "../pages/NotFound/NotFoundPage";
import { Layout } from "antd";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import ScrollToTop from "../components/shared/ScrollToTop";

const { Content } = Layout;

/**
 * Client Layout Wrapper cho 404 page
 */
const NotFoundLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <ScrollToTop />
      <Header />
      <Content style={{ marginTop: "0" }}>{children}</Content>
      <Footer />
    </Layout>
  );
};

const router = createBrowserRouter([
  ...adminRoutes,

  ...clientRoutes,

  {
    path: "*",
    element: (
      <NotFoundLayout>
        <NotFoundPage />
      </NotFoundLayout>
    ),
  },
]);

export default router;
