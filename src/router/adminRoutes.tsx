import { RouteObject } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";

// Quản lý phòng
import ListRoom from "../pages/Admin/quanliphong/ListRoom";


// Quản lý danh mục
import ListCategory from "../pages/Admin/quanlidanhmuc/listcategory";


// Quản lý tiện ích (Amenities)
import ListAmenity from "../pages/Admin/quanlitienich/listamenity";

// Quản lý lưu trú (Accommodations)
import ListAccommodation from "../pages/Admin/quanliluutru/listaccommodation";

// Các module khác

import ListBooking from "../pages/Admin/quanlidatphong/listbooking";
import AddBooking from "../pages/Admin/quanlidatphong/addbooking";
import EditBooking from "../pages/Admin/quanlidatphong/editbooking";
import ViewBooking from "../pages/Admin/quanlidatphong/viewbooking";
import ListUser from "../pages/Admin/quanlinguoidung/ListUser";

import ListPromotion from "../pages/Admin/quanlimagiamgia/listPromotion";
import AddPromotion from "../pages/Admin/quanlimagiamgia/addPromotion";
import EditPromotion from "../pages/Admin/quanlimagiamgia/editPromotion";
import ListReview from "../pages/Admin/quanlidanhgia/listReview";
import ListMessage from "../pages/Admin/quanlibinhluan/listMessage";
import ListSupplies from "../pages/Admin/quanlivattu/listsupply";

import ListInvoice from "../pages/Admin/quanlihoadon/listInvoice";
import ViewInvoice from "../pages/Admin/quanlihoadon/viewInvoice";

export const adminRoutes: RouteObject = {
  path: "/admin",
  element: <AdminLayout />,
  children: [
    // Quản lý phòng
    { path: "listing", element: <ListRoom /> },
  

    // Quản lý dat phòng
    { path: "booking", element: <ListBooking /> },
    { path: "booking/add", element: <AddBooking /> },
    { path: "booking/edit/:id", element: <EditBooking /> },
    { path: "booking/view/:id", element: <ViewBooking /> },

    // Quản lý danh mục
    { path: "category", element: <ListCategory /> },
  

    // Quản lý tiện ích (Amenities)
    { path: "amenities", element: <ListAmenity /> },
   

    // Quản lý lưu trú
    { path: "accommodations", element: <ListAccommodation /> },
  

    // Quản lý user
    { path: "user", element: <ListUser /> },
    
    // Quản lý mã giảm giá
    { path: "promotion", element: <ListPromotion /> },
    { path: "promotion/add", element: <AddPromotion /> },
    { path: "promotion/edit/:id", element: <EditPromotion /> },

    // 🧱 Quản lý vật tư (Supplies)
    { path: "supplies", element: <ListSupplies /> },
    
    // 🧱 Quản lý hóa đơn (Invoice)
    {
      path: "invoice",
      children: [
        { path: "", element: <ListInvoice /> },
        { path: "view/:id", element: <ViewInvoice /> },
      ]
    },    // Quản lý mã đánh giá
    { path: "review", element: <ListReview /> },

    // Quản lý bình luận
    { path: "message", element: <ListMessage /> },
  ],
};
