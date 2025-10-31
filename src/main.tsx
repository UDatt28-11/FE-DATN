import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import "antd/dist/reset.css";

// 1. Import AuthProvider
// (Đảm bảo đường dẫn './context/AuthContext' là chính xác)
import { AuthProvider } from "./context/AuthContext";

console.log("✅ React main.tsx loaded");

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    {/* 2. Bọc RouterProvider bằng AuthProvider */}
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);

console.log("✅ React rendered successfully");

