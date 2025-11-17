import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./router/index.tsx";
import { AuthProvider } from "./context/AuthContext";
import "antd/dist/reset.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

console.log("✅ React main.tsx loaded");

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </AuthProvider>
  </React.StrictMode>
);

console.log("✅ React rendered successfully");
