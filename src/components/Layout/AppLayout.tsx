import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";

const { Content } = Layout;

export default function AppLayout() {
    return (
        <Layout style={{ minHeight: "100vh" }}>
            <AppHeader />

            <Content
                style={{
                    marginTop: 64,
                    marginBottom: 64,
                    padding: "24px 48px",
                    background: "#fff",
                }}
            >
                <Outlet />
            </Content>

            <AppFooter />
        </Layout>
    );
}
