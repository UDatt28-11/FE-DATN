export type BookingStatus =
  | "Đang chờ"
  | "Đã xác nhận"
  | "Đã thanh toán"
  | "Đã hủy"
  | "Hoàn thành";

export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  homestayName: string;
  homestayId: number;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  staff: string;
  paymentMethod: string;
  notes?: string;
  cancellationReason?: string;
}

export type BookingDetail = {
  id: number;
  room_id: number;
  room_name?: string | null;
  room?: {
    id: number;
    name: string;
    roomType?: {
      id: number;
      name: string;
    };
    images?: Array<{
      id: number;
      image_url: string;
      is_primary: boolean;
    }>;
    property?: {
      id: number;
      name: string;
    };
  };
  check_in_date: string;
  check_out_date: string;
  num_adults: number;
  num_children: number;
  sub_total: number;
  status: "active" | "cancelled" | "checked_in" | "checked_out";
  guests?: CheckedInGuest[];
};

export type CheckedInGuest = {
  id: number;
  full_name: string;
  date_of_birth?: string | null;
  identity_type?: "cccd" | "passport" | null;
  identity_number?: string | null;
  identity_image_url?: string | null;
  check_in_time?: string | null;
};

export type CheckInRequest = {
  id: number;
  booking_order_id: number;
  booking_detail_id: number;
  full_name: string;
  date_of_birth?: string | null;
  identity_type: "cccd" | "passport";
  identity_number: string;
  identity_image_url?: string | null;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string | null;
  reviewed_by?: number | null;
  reviewed_at?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
};

export type BookingOrder = {
  id: number;
  code?: string; // Alias cho order_code
  order_code?: string; // Từ BE
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "checked_in" | "partially_checked_in" | "checked_out" | "partially_checked_out";
  total_amount: number;
  payment_method?: string | null;
  notes?: string | null;
  checkin_date?: string | null;
  checkout_date?: string | null;
  details_count: number;
  created_at: string;
  updated_at?: string;
  guest_id?: number;
  guest?: {
    id: number;
    full_name: string;
    email: string;
    phone_number?: string;
  };
  details?: BookingDetail[];
  check_in_requests?: CheckInRequest[]; // Yêu cầu check-in từ user
  paid_amount?: number; // Tiền đã thanh toán
  deposit_amount?: number; // Tiền cọc
  payment_status?: string; // Trạng thái thanh toán
  invoices?: Array<{
    id: number;
    total_amount: number;
    status: string;
    paid_amount?: number;
    remaining_amount?: number;
    payments?: Array<{
      id: number;
      amount: number;
      status: string;
    }>;
  }>; // Danh sách hóa đơn
  remaining_amount?: number; // Số tiền còn phải thanh toán (từ backend)
};

export type Pagination = {
  page: number;
  per_page: number;
  total: number;
  last_page: number;
};
