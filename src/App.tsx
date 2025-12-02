import { RouterProvider } from "react-router-dom";
import { ConfigProvider, App as AntdApp } from "antd";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./context/AuthContext";
import { BookingCartProvider } from "./context/BookingCartContext";
import router from "./router"; // Import router đã cấu hình sẵn
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <HelmetProvider>
      <AuthProvider>
        <BookingCartProvider>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: "#cb8670",
                colorLink: "#cb8670",
                colorLinkHover: "#a96d5a",
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              },
            }}
          >
            <AntdApp>
              <RouterProvider router={router} />
            </AntdApp>
          </ConfigProvider>
        </BookingCartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
