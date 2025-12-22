import type { RouteObject } from "react-router-dom";
import { RoleBasedRoute } from "../components/Auth";
import AdminLayout from "../components/Layout/AdminLayout";

// Dashboard
import Dashboard from "../pages/Admin/Dashboard";

// Quản lý phòng
import ListRoom from "../pages/Admin/quanliphong/ListRoom";
import AddRoom from "../pages/Admin/quanliphong/addroom";
import EditRoom from "../pages/Admin/quanliphong/editroom";
import ViewRoom from "../pages/Admin/quanliphong/viewroom";

// Quản lý danh mục
import ListCategory from "../pages/Admin/quanlidanhmuc/listcategory";
import AddCategory from "../pages/Admin/quanlidanhmuc/addcategory";
import EditCategory from "../pages/Admin/quanlidanhmuc/editcategory";

// Quản lý tiện ích (Amenities)
import ListAmenity from "../pages/Admin/quanlitienich/listamenity";
import AddAmenity from "../pages/Admin/quanlitienich/addamenity";
import EditAmenity from "../pages/Admin/quanlitienich/editamenity";
import VariantAmenity from "../pages/Admin/quanlitienich/variantamenity";

// Quản lý lưu trú (Accommodations)
import ListAccommodation from "../pages/Admin/quanliluutru/listaccommodation";
import AddAccommodation from "../pages/Admin/quanliluutru/addaccommodation";
import EditAccommodation from "../pages/Admin/quanliluutru/editaccommodation";
import ViewAccommodation from "../pages/Admin/quanliluutru/viewaccommodation";

// Các module khác
import ListBooking from "../pages/Admin/quanlidatphong/listbooking";
import AddBooking from "../pages/Admin/quanlidatphong/addbooking";
import EditBooking from "../pages/Admin/quanlidatphong/editbooking";
import ViewBooking from "../pages/Admin/quanlidatphong/viewbooking";
import ListUser from "../pages/Admin/quanlinguoidung/ListUser";
import AddUser from "../pages/Admin/quanlinguoidung/AddUser";
import EditUser from "../pages/Admin/quanlinguoidung/EditUser";
import BlockedUsers from "../pages/Admin/quanlinguoidung/BlockedUsers";
import ListReview from "../pages/Admin/quanlidanhgia/listReview";
import ListMessage from "../pages/Admin/quanlibinhluan/listMessage";
import AdminMessages from "../pages/Admin/quanlibinhluan/AdminMessages";

// Invoice pages đã được gộp vào quản lý đặt phòng
// import ListInvoice from "../pages/Admin/quanlihoadon/listInvoice";
// import ViewInvoice from "../pages/Admin/quanlihoadon/viewInvoice";
// import AddInvoice from "../pages/Admin/quanlihoadon/addInvoice";
// import EditInvoice from "../pages/Admin/quanlihoadon/editInvoice";
import ListSupply from "../pages/Admin/quanlivattu/listsupply";
import AddSupply from "../pages/Admin/quanlivattu/addsupply";
import EditSupply from "../pages/Admin/quanlivattu/editsupply";
import ViewSupply from "../pages/Admin/quanlivattu/viewsupply";
import SupplyLogs from "../pages/Admin/quanlivattu/supplyLogs";
import ListCheckInRequests from "../pages/Admin/quanlidatphong/listCheckInRequests";
import ListCheckoutRequests from "../pages/Admin/quanlidatphong/listCheckoutRequests";
import ListServiceRequests from "../pages/Admin/quanlidatphong/listServiceRequests";
import ListAmenityRequests from "../pages/Admin/quanlidatphong/listAmenityRequests";
import ListService from "../pages/Admin/quanlidichvu/ListService";

// Quản lý voucher
import ListVoucher from "../pages/Admin/quanlivoucher/ListVoucher";
import AddVoucher from "../pages/Admin/quanlivoucher/AddVoucher";
import EditVoucher from "../pages/Admin/quanlivoucher/EditVoucher";

/**
 * Admin Routes - Được bảo vệ bởi RoleBasedRoute
 * Chỉ user với role 'admin' hoặc 'staff' mới có thể truy cập
 *
 * Phân quyền:
 * - Dashboard, Rooms, Bookings: Admin + Staff
 * - User Management: Chỉ Admin
 * - Promotions, Reviews: Admin + Staff
 */
export const adminRoutes: RouteObject[] = [
  {
    path: "/admin",
    element: (
      <RoleBasedRoute allowedRoles={["admin", "staff"]}>
        <AdminLayout />
      </RoleBasedRoute>
    ),
    children: [
      { path: "", element: <Dashboard /> },
      { path: "dashboard", element: <Dashboard /> },

      // Quản lý phòng (Admin + Staff)
      { path: "listing", element: <ListRoom /> },
      { path: "listing/add", element: <AddRoom /> },
      { path: "listing/edit/:id", element: <EditRoom /> },
      { path: "listing/view/:id", element: <ViewRoom /> },

      // Quản lý đặt phòng (Admin + Staff)
      { path: "booking", element: <ListBooking /> },
      { path: "booking/add", element: <AddBooking /> },
      { path: "booking/edit/:id", element: <EditBooking /> },
      { path: "booking/view/:id", element: <ViewBooking /> },
      { path: "check-in-requests", element: <ListCheckInRequests /> },
      { path: "checkout-requests", element: <ListCheckoutRequests /> },
      { path: "service-requests", element: <ListServiceRequests /> },
      { path: "amenity-requests", element: <ListAmenityRequests /> },

      // Quản lý danh mục (Admin + Staff)
      { path: "category", element: <ListCategory /> },
      { path: "category/add", element: <AddCategory /> },
      { path: "category/edit/:id", element: <EditCategory /> },

      // Quản lý tiện ích (Admin + Staff)
      { path: "amenities", element: <ListAmenity /> },
      { path: "amenities/add", element: <AddAmenity /> },
      { path: "amenities/edit/:id", element: <EditAmenity /> },
      { path: "amenities/variant/:id", element: <VariantAmenity /> },

      // Quản lý lưu trú (Admin + Staff)
      { path: "accommodations", element: <ListAccommodation /> },
      { path: "accommodations/add", element: <AddAccommodation /> },
      { path: "accommodations/edit/:id", element: <EditAccommodation /> },
      { path: "accommodations/view/:id", element: <ViewAccommodation /> },

      // Quản lý user (CHỈ ADMIN)
      {
        path: "user",
        element: (
          <RoleBasedRoute allowedRoles={["admin"]}>
            <ListUser />
          </RoleBasedRoute>
        ),
      },
      {
        path: "user/add",
        element: (
          <RoleBasedRoute allowedRoles={["admin"]}>
            <AddUser />
          </RoleBasedRoute>
        ),
      },
      {
        path: "user/edit/:id",
        element: (
          <RoleBasedRoute allowedRoles={["admin"]}>
            <EditUser />
          </RoleBasedRoute>
        ),
      },
      {
        path: "user/blocked",
        element: (
          <RoleBasedRoute allowedRoles={["admin"]}>
            <BlockedUsers />
          </RoleBasedRoute>
        ),
      },

      // Quản lý mã giảm giá (Admin + Staff)
      // Quản lý đánh giá (Admin + Staff)
      { path: "review", element: <ListReview /> },

      // Quản lý bình luận (Admin + Staff)
      { path: "message", element: <ListMessage /> },

      // Quản lý tin nhắn (Admin + Staff) - Bao gồm AI Chat
      { path: "messages", element: <AdminMessages /> },

      // Quản lý hóa đơn đã được gộp vào quản lý đặt phòng
      // Xem hóa đơn trong booking/view/:id

      // Quản lý vật tư (Admin + Staff)
      { path: "supplies", element: <ListSupply /> },
      { path: "supplies/add", element: <AddSupply /> },
      { path: "supplies/edit/:id", element: <EditSupply /> },
      { path: "supplies/view/:id", element: <ViewSupply /> },
      { path: "supply-logs", element: <SupplyLogs /> },

      // Quản lý dịch vụ (Admin + Staff)
      { path: "services", element: <ListService /> },

      // Quản lý voucher (Admin + Staff)
      { path: "vouchers", element: <ListVoucher /> },
      { path: "vouchers/add", element: <AddVoucher /> },
      { path: "vouchers/edit/:id", element: <EditVoucher /> },
    ],
  },
];
