import { Layout, Menu } from "antd";
import { Link, useLocation } from "react-router-dom";

const { Header } = Layout;

export default function AppHeader() {
    const { pathname } = useLocation();



    return (
        <Header>

        </Header>
    );
}
