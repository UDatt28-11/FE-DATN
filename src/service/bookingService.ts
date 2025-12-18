import api from "../api/axios";
import type { BookingOrder, Pagination } from "../types/booking/booking";

// Export lại các type để dùng ở component
export type { BookingOrder } from "../types/booking/booking";

export type ListBookingsParams = {
  page?: number;
  per_page?: number;
  keyword?: string;
  status?: string[];
  date_field?: "check_in_date" | "check_out_date" | "created_at";
  date_from?: string;
  date_to?: string;
  room_name?: string;
  min_total?: number;
  max_total?: number;
  sort?:
    | "created_at"
    | "-created_at"
    | "checkin_date"
    | "-checkin_date"
    | "total_amount"
    | "-total_amount";
  include?: string;
};

export interface BookingStatistics {
  total: number;
  by_status: {
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
    [key: string]: number;
  };
  revenue: {
    total: number;
    expected: number;
    cancelled: number;
  };
  cancellation_rate: number;
}

export async function getBookingStatistics(params?: {
  date_from?: string;
  date_to?: string;
  period?: "day" | "week" | "month";
}): Promise<BookingStatistics> {
  const { data } = await api.get("/admin/booking-orders/statistics", {
    params,
  });
  return data.data as BookingStatistics;
}

export async function listBookings(params: ListBookingsParams) {
  const q = { ...params } as any;
  if (Array.isArray(params.status)) q.status = params.status.join(",");

  // Thêm timestamp để tránh cache
  q._t = Date.now();

  const { data } = await api.get("/admin/booking-orders", {
    params: q,
    // Force no-cache
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });

  return {
    data: Array.isArray(data.data) ? (data.data as BookingOrder[]) : [],
    pagination: (data.meta?.pagination as Pagination) ?? undefined,
  };
}

export async function getBooking(id: number, include?: string) {
  const { data } = await api.get(`/admin/booking-orders/${id}`, {
    params: { include },
  });
  return data.data as BookingOrder;
}

export async function updateBookingStatus(
  id: number,
  status: "confirmed" | "completed" | "cancelled"
) {
  const { data } = await api.patch(`/admin/booking-orders/${id}/status`, {
    status,
  });
  return data.data as { id: number; status: BookingOrder["status"] };
}

// Tạo đặt phòng mới
export type CreateBookingData = {
  guest_id?: number; // ID của user nếu khách đã đăng ký
  customer_name: string; // Tên hiển thị (có thể khác tên tài khoản)
  customer_phone: string;
  customer_email?: string;
  total_amount: number;
  payment_method?: string;
  notes?: string;
  details: {
    room_id: number;
    check_in_date: string;
    check_out_date: string;
    num_adults: number;
    num_children: number;
    sub_total: number;
  }[];
};

export async function createBooking(bookingData: CreateBookingData) {
  const { data } = await api.post("/admin/booking-orders", bookingData);
  return data.data as BookingOrder;
}

// Cập nhật đặt phòng
export type UpdateBookingData = {
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  total_amount?: number;
  payment_method?: string;
  notes?: string;
};

export async function updateBooking(
  id: number,
  bookingData: UpdateBookingData
) {
  const { data } = await api.put(`/admin/booking-orders/${id}`, bookingData);
  return data.data as BookingOrder;
}

// Xóa đặt phòng
export async function deleteBooking(id: number) {
  const { data } = await api.delete(`/admin/booking-orders/${id}`);
  return data;
}

// ============================================
// USER BOOKING FUNCTIONS (Lấy bookings của user hiện tại)
// ============================================

/**
 * Lấy danh sách bookings của user hiện tại
 * Filter theo guest_id của user đang đăng nhập
 */
export async function getUserBookings(params?: {
  page?: number;
  per_page?: number;
  status?: string[];
  sort?: string;
  include?: string;
}) {
  const q: any = {
    ...params,
  };

  // Nếu có status array, convert sang string
  if (Array.isArray(params?.status)) {
    q.status = params.status.join(',');
  }

  // Thêm include để lấy details và room info
  if (!q.include) {
    q.include = 'details,details.room';
  }

  // Thêm timestamp để tránh cache
  q._t = Date.now();

  try {
    // Log để debug
    const token = localStorage.getItem("auth_token") || localStorage.getItem("accessToken");
    console.log("getUserBookings - Request:", {
      url: "/user/bookings",
      params: q,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + "..." : null,
    });

    // Dùng user route để lấy bookings của user hiện tại
    const { data } = await api.get("/user/bookings", {
      params: q,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "Accept": "application/json",
      },
    });

    console.log("getUserBookings - Response:", {
      success: data.success,
      dataLength: Array.isArray(data.data) ? data.data.length : 0,
      hasMeta: !!data.meta,
    });

    // Data đã được filter ở BE theo guest_id
    const bookings = Array.isArray(data.data) ? data.data : [];

    return {
      data: bookings as BookingOrder[],
      pagination: (data.meta?.pagination as Pagination) ?? undefined,
    };
  } catch (error: any) {
    console.error("Error fetching user bookings:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: error.config?.baseURL + error.config?.url,
      headers: error.config?.headers,
    });
    throw error;
  }
}

/**
 * Lấy số lượng bookings theo status cho user hiện tại
 */
export async function getUserBookingCounts(): Promise<{
  all: number;
  active: number;
  pending: number;
  confirmed: number;
  checked_in: number;
  partially_checked_in: number;
  checked_out: number;
  partially_checked_out: number;
  completed: number;
  cancelled: number;
}> {
  try {
    const { data } = await api.get("/user/bookings/counts");
    return data.data;
  } catch (error: any) {
    // Nếu chưa đăng nhập hoặc token hết hạn thì trả về 0 để tránh spam lỗi trên Header
    if (error.response?.status === 401) {
      return {
        all: 0,
        active: 0,
        pending: 0,
        confirmed: 0,
        checked_in: 0,
        partially_checked_in: 0,
        checked_out: 0,
        partially_checked_out: 0,
        completed: 0,
        cancelled: 0,
      };
    }
    console.error("Error fetching user booking counts:", error);
    throw error;
  }
}

/**
 * Lấy chi tiết booking của user hiện tại
 */
export async function getUserBooking(id: number, include?: string) {
  try {
    // Dùng user route để lấy booking detail (BE tự verify ownership)
    const { data } = await api.get(`/user/bookings/${id}`, {
      params: include ? { include } : {},
    });
    
    return data.data as BookingOrder;
  } catch (error: any) {
    console.error("Error fetching user booking detail:", error);
    throw error;
  }
}

/**
 * Tạo booking mới cho user hiện tại
 */
export async function createUserBooking(bookingData: CreateBookingData) {
  try {
    const { data } = await api.post("/user/bookings", bookingData);
    return data.data as BookingOrder;
  } catch (error: any) {
    // Không log error cho 401/403 vì axios interceptor sẽ xử lý redirect
    if (error.response?.status !== 401 && error.response?.status !== 403) {
      console.error("Error creating user booking:", error);
    }
    throw error;
  }
}

/**
 * Cập nhật payment_method cho booking của user
 */
export async function updateUserBookingPayment(
  id: number,
  paymentMethod: string
) {
  try {
    const { data } = await api.patch(`/user/bookings/${id}/payment`, {
      payment_method: paymentMethod,
    });
    return data.data as BookingOrder;
  } catch (error: any) {
    console.error("Error updating booking payment:", error);
    throw error;
  }
}

/**
 * Thanh toán tiền cọc cho booking của user
 */
export async function payDeposit(
  id: number,
  paymentMethod: string,
  depositAmount?: number,
  transactionId?: string
) {
  try {
    const { data } = await api.post(`/user/bookings/${id}/deposit`, {
      payment_method: paymentMethod,
      deposit_amount: depositAmount,
      transaction_id: transactionId,
    });
    return data.data as {
      booking: BookingOrder;
      deposit_amount: number;
      paid_amount: number;
      remaining_amount: number;
      payment_status: string;
    };
  } catch (error: any) {
    // Không log error cho 401/403 vì axios interceptor sẽ xử lý redirect
    if (error.response?.status !== 401 && error.response?.status !== 403) {
      console.error("Error paying deposit:", error);
    }
    throw error;
  }
}

/**
 * Tạo VietQR payment cho booking (trả về URL ảnh QR và thông tin chuyển khoản)
 */
export async function createVietQRPayment(
  bookingId: number,
  amount: number
) {
  try {
    const { data } = await api.post("/user/vietqr/create", {
      booking_id: bookingId,
      amount,
    });

    if (!data.success || !data.data) {
      throw new Error(
        data.message || "Không thể tạo mã thanh toán VietQR, vui lòng thử lại."
      );
    }

    return data.data as {
      qr_url: string;
      bank_id: string;
      account_no: string;
      account_name: string;
      amount: number;
      add_info: string;
      payment_id: number;
      booking_id: number;
    };
  } catch (error: any) {
    // Không log error cho 401/403 vì axios interceptor sẽ xử lý redirect
    if (error.response?.status !== 401 && error.response?.status !== 403) {
      console.error("Error creating VietQR payment:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
    throw error;
  }
}

/**
 * User xác nhận đã chuyển khoản VietQR cho booking
 */
export async function confirmVietQRTransfer(
  bookingId: number
) {
  try {
    const { data } = await api.post(`/user/bookings/${bookingId}/confirm-vietqr`);
    return data.data as {
      booking: BookingOrder;
    };
  } catch (error: any) {
    if (error.response?.status !== 401 && error.response?.status !== 403) {
      console.error("Error confirming VietQR transfer:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
    throw error;
  }
}

/**
 * User hủy booking của mình
 */
/**
 * Lấy chính sách hủy phòng
 * - Hủy trước 7 ngày: hoàn 100% tiền cọc
 * - Hủy trong vòng 3-6 ngày: hoàn 50% tiền cọc
 * - Hủy trong vòng 0-2 ngày: mất 100% tiền cọc
 */
export interface CancellationPolicy {
  days_until_checkin: number;
  refund_percentage: number;
  refund_amount: number;
  deposit_amount: number;
  forfeited_amount: number;
  policy_text: string;
  check_in_date: string;
  can_cancel: boolean;
  booking_status: string;
  cancel_reason?: string;
}

export async function getCancellationPolicy(bookingId: number): Promise<CancellationPolicy> {
  try {
    const { data } = await api.get(`/user/bookings/${bookingId}/cancellation-policy`);
    return data.data as CancellationPolicy;
  } catch (error: any) {
    if (error.response?.status !== 401 && error.response?.status !== 403) {
      console.error("Error fetching cancellation policy:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
    throw error;
  }
}

export async function cancelUserBooking(bookingId: number, reason?: string) {
  try {
    const { data } = await api.post(`/user/bookings/${bookingId}/cancel`, {
      reason: reason || null,
    });
    return {
      booking: data.data as BookingOrder,
      message: data.message as string,
      refund_info: data.refund_info as CancellationPolicy,
    };
  } catch (error: any) {
    if (error.response?.status !== 401 && error.response?.status !== 403) {
      console.error("Error cancelling booking:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
    throw error;
  }
}

/**
 * Đổi ngày đặt phòng (1 lần miễn phí)
 */
export interface DateChangeInfo {
  old_total_amount: number;
  new_total_amount: number;
  difference: number;
  new_check_in_date: string;
  new_check_out_date: string;
  nights: number;
  date_changes_remaining: number;
}

export async function changeDates(
  bookingId: number,
  newCheckInDate: string,
  newCheckOutDate: string
) {
  try {
    const { data } = await api.post(`/user/bookings/${bookingId}/change-dates`, {
      new_check_in_date: newCheckInDate,
      new_check_out_date: newCheckOutDate,
    });
    return {
      booking: data.data as BookingOrder,
      message: data.message as string,
      change_info: data.change_info as DateChangeInfo,
    };
  } catch (error: any) {
    if (error.response?.status !== 401 && error.response?.status !== 403) {
      console.error("Error changing dates:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
    throw error;
  }
}

/**
 * Admin xác nhận đã cọc cho booking
 */
export async function confirmDeposit(
  bookingId: number,
  depositAmount?: number,
  transactionId?: string
) {
  try {
    const { data } = await api.post(`/admin/booking-orders/${bookingId}/confirm-deposit`, {
      deposit_amount: depositAmount,
      transaction_id: transactionId,
    });
    if (!data.success) {
      throw new Error(data.message || "Không thể xác nhận đã cọc.");
    }
    return data.data as BookingOrder;
  } catch (error: any) {
    if (error.response?.status !== 401 && error.response?.status !== 403) {
      console.error("Error confirming deposit:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
    throw error;
  }
}

/**
 * Tạo PayOS payment link cho booking
 */
export async function createPayOSPaymentLink(
  bookingId: number,
  amount: number,
  description?: string
) {
  try {
    const { data } = await api.post('/user/payos/create-payment-link', {
      booking_id: bookingId,
      amount: amount,
      description: description,
    });
    
    // Log response để debug
    console.log('PayOS createPaymentLink response:', {
      success: data.success,
      has_data: !!data.data,
      data_keys: data.data ? Object.keys(data.data) : [],
      payment_link: data.data?.payment_link,
    });
    
    // Kiểm tra response format
    if (!data.success) {
      throw new Error(data.message || 'Không thể tạo link thanh toán PayOS');
    }
    
    if (!data.data || !data.data.payment_link) {
      console.error('PayOS response missing payment_link:', data);
      throw new Error('PayOS không trả về link thanh toán');
    }
    
    return data.data as {
      payment_link: string;
      payment_link_id: string;
      order_code: number;
      booking_id: number;
    };
  } catch (error: any) {
    // Không log error cho 401/403 vì axios interceptor sẽ xử lý redirect
    if (error.response?.status !== 401 && error.response?.status !== 403) {
      console.error("Error creating PayOS payment link:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
    throw error;
  }
}

/**
 * Check-in booking của user
 */
export type CheckInGuestData = {
  full_name: string;
  date_of_birth?: string;
  identity_type: "cccd" | "passport";
  identity_number: string;
  identity_image?: File;
  booking_detail_id: number;
};

export type CheckInData = {
  guests: CheckInGuestData[];
  notes?: string;
};

export async function checkInUserBooking(
  id: number,
  checkInData: CheckInData
) {
  try {
    const formData = new FormData();
    
    // Thêm guests data
    checkInData.guests.forEach((guest, index) => {
      formData.append(`guests[${index}][full_name]`, guest.full_name);
      if (guest.date_of_birth) {
        formData.append(`guests[${index}][date_of_birth]`, guest.date_of_birth);
      }
      formData.append(`guests[${index}][identity_type]`, guest.identity_type);
      formData.append(`guests[${index}][identity_number]`, guest.identity_number);
      formData.append(`guests[${index}][booking_detail_id]`, guest.booking_detail_id.toString());
      
      // Thêm file nếu có
      if (guest.identity_image) {
        formData.append(`guests[${index}][identity_image]`, guest.identity_image);
      }
    });
    
    if (checkInData.notes) {
      formData.append('notes', checkInData.notes);
    }

    const { data } = await api.post(`/user/bookings/${id}/check-in`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return data.data as BookingOrder;
  } catch (error: any) {
    console.error("Error checking in booking:", error);
    throw error;
  }
}

// ============================================
// CHECK-IN REQUESTS FUNCTIONS (Admin/Staff)
// ============================================

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
  booking_order?: BookingOrder;
  booking_detail?: any;
  reviewer?: any;
};

export type ListCheckInRequestsParams = {
  page?: number;
  per_page?: number;
  status?: "pending" | "approved" | "rejected";
  booking_id?: number;
  include_ready_bookings?: boolean; // Bao gồm các booking đã confirmed và sẵn sàng check-in
};

export async function getCheckInRequests(params?: ListCheckInRequestsParams) {
  const { data } = await api.get("/admin/check-in-requests", {
    params: {
      ...params,
      _t: Date.now(),
    },
  });
  
  return {
    data: Array.isArray(data.data) ? (data.data as CheckInRequest[]) : [],
    pagination: data.meta?.pagination,
  };
}

export async function getCheckInRequest(id: number) {
  const { data } = await api.get(`/admin/check-in-requests/${id}`);
  return data.data as CheckInRequest;
}

export async function approveCheckInRequest(id: number) {
  const { data } = await api.post(`/admin/check-in-requests/${id}/approve`);
  return data.data as CheckInRequest;
}

export async function rejectCheckInRequest(id: number, rejectionReason: string) {
  const { data } = await api.post(`/admin/check-in-requests/${id}/reject`, {
    rejection_reason: rejectionReason,
  });
  return data.data as CheckInRequest;
}

// Checkout Requests
export type CheckoutRequest = {
  id: number;
  booking_order_id: number;
  booking_detail_id: number;
  notes?: string | null;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string | null;
  reviewed_by?: number | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at?: string;
  booking_order?: BookingOrder;
  booking_detail?: any;
  reviewer?: any;
};

export type ListCheckoutRequestsParams = {
  page?: number;
  per_page?: number;
  status?: "pending" | "approved" | "rejected" | "all";
  booking_id?: number;
};

export async function getCheckoutRequests(params?: ListCheckoutRequestsParams) {
  const { data } = await api.get("/admin/checkout-requests", {
    params: {
      ...params,
      _t: Date.now(),
    },
  });
  
  return {
    data: Array.isArray(data.data) ? (data.data as CheckoutRequest[]) : [],
    pagination: data.meta?.pagination,
  };
}

export interface DamagedSupply {
  supply_id: number;
  quantity: number;
  unit_price: number;
  notes?: string;
}

export interface ApproveCheckoutRequestParams {
  room_status?: 'available' | 'maintenance';
  notes?: string;
  damaged_supplies?: DamagedSupply[];
}

export async function approveCheckoutRequest(
  id: number, 
  params?: ApproveCheckoutRequestParams
) {
  const { data } = await api.post(`/admin/checkout-requests/${id}/approve`, params || {});
  return {
    data: data.data as CheckoutRequest,
    damage_summary: data.damage_summary,
    invoice: data.invoice,
  };
}

export async function rejectCheckoutRequest(id: number, rejectionReason: string) {
  const { data } = await api.post(`/admin/checkout-requests/${id}/reject`, {
    rejection_reason: rejectionReason,
  });
  return data.data as CheckoutRequest;
}

export async function checkInDirect(
  bookingId: number,
  checkInData: CheckInData
) {
  try {
    const formData = new FormData();
    
    // Thêm guests data
    checkInData.guests.forEach((guest, index) => {
      formData.append(`guests[${index}][full_name]`, guest.full_name);
      if (guest.date_of_birth) {
        formData.append(`guests[${index}][date_of_birth]`, guest.date_of_birth);
      }
      formData.append(`guests[${index}][identity_type]`, guest.identity_type);
      formData.append(`guests[${index}][identity_number]`, guest.identity_number);
      formData.append(`guests[${index}][booking_detail_id]`, guest.booking_detail_id.toString());
      
      // Thêm file nếu có
      if (guest.identity_image) {
        formData.append(`guests[${index}][identity_image]`, guest.identity_image);
      }
    });
    
    if (checkInData.notes) {
      formData.append('notes', checkInData.notes);
    }

    const { data } = await api.post(`/admin/booking-orders/${bookingId}/check-in-direct`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return data.data as BookingOrder;
  } catch (error: any) {
    console.error("Error checking in booking directly:", error);
    throw error;
  }
}

/**
 * User gửi yêu cầu checkout
 */
export async function requestCheckOut(
  bookingId: number,
  bookingDetailIds: number[],
  notes?: string
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const response = await api.post(`/user/bookings/${bookingId}/request-checkout`, {
      booking_detail_ids: bookingDetailIds,
      notes,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error requesting checkout:', error);
    throw error;
  }
}

/**
 * Check-out booking của user
 */
export async function checkOutUserBooking(bookingId: number) {
  try {
    const { data } = await api.post(`/user/bookings/${bookingId}/check-out`);
    return {
      booking: data.data.booking as BookingOrder,
      invoice: data.data.invoice as {
        id: number;
        total_amount: number;
        status: string;
        issue_date: string;
        due_date: string;
      } | null,
    };
  } catch (error: any) {
    console.error('Error checking out booking:', error);
    throw error;
  }
}

/**
 * Thanh toán invoice
 */
export async function payInvoice(
  invoiceId: number,
  paymentMethod: 'cash' | 'bank' | 'momo' | 'card',
  paymentNotes?: string
) {
  try {
    const { data } = await api.post(`/user/invoices/${invoiceId}/pay`, {
      payment_method: paymentMethod,
      payment_notes: paymentNotes,
    });
    return {
      invoice: data.data.invoice,
      booking: data.data.booking as BookingOrder | null,
    };
  } catch (error: any) {
    console.error('Error paying invoice:', error);
    throw error;
  }
}

/**
 * Lấy danh sách invoices của user
 */
export async function getUserInvoices(params?: {
  page?: number;
  per_page?: number;
}) {
  try {
    const { data } = await api.get('/user/invoices', { params });
    return {
      data: data.data || [],
      pagination: data.meta?.pagination,
    };
  } catch (error: any) {
    console.error('Error fetching user invoices:', error);
    throw error;
  }
}

/**
 * Lấy chi tiết invoice của user
 */
export async function getUserInvoice(invoiceId: number) {
  try {
    const { data } = await api.get(`/user/invoices/${invoiceId}`);
    return data.data;
  } catch (error: any) {
    console.error('Error fetching user invoice:', error);
    throw error;
  }
}

/**
 * Tạo PayOS payment link cho invoice (thanh toán sau checkout)
 */
export async function createPayOSInvoicePaymentLink(
  invoiceId: number,
  amount: number,
  description?: string
) {
  try {
    const { data } = await api.post('/user/payos/create-invoice-payment-link', {
      invoice_id: invoiceId,
      amount: amount,
      description: description,
    });
    
    // Log response để debug
    console.log('PayOS createInvoicePaymentLink response:', {
      success: data.success,
      has_data: !!data.data,
      data_keys: data.data ? Object.keys(data.data) : [],
      checkout_url: data.data?.checkoutUrl || data.data?.checkout_url,
    });
    
    // Kiểm tra response format
    if (!data.success) {
      throw new Error(data.message || 'Không thể tạo link thanh toán PayOS');
    }
    
    // PayOS có thể trả về checkoutUrl hoặc checkout_url
    const checkoutUrl = data.data?.checkoutUrl || data.data?.checkout_url || data.data?.payment_link;
    
    if (!checkoutUrl) {
      console.error('PayOS response missing checkoutUrl:', data);
      throw new Error('PayOS không trả về link thanh toán');
    }
    
    return {
      checkoutUrl: checkoutUrl,
      payment_link_id: data.data?.payment_link_id || data.data?.paymentLinkId,
      order_code: data.data?.order_code || data.data?.orderCode,
      invoice_id: invoiceId,
    };
  } catch (error: any) {
    // Không log error cho 401/403 vì axios interceptor sẽ xử lý redirect
    if (error.response?.status !== 401 && error.response?.status !== 403) {
      console.error("Error creating PayOS invoice payment link:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
    throw error;
  }
}

// ============================================
// VNPAY PAYMENT FUNCTIONS
// ============================================

/**
 * Lấy danh sách ngân hàng hỗ trợ VNPAY
 */
export async function getVNPayBanks() {
  try {
    const { data } = await api.get('/vnpay/banks');
    return data.data as Record<string, string>;
  } catch (error: any) {
    console.error("Error fetching VNPay banks:", error);
    throw error;
  }
}

/**
 * Tạo URL thanh toán VNPAY cho booking
 */
export async function createVNPayPaymentLink(
  bookingId: number,
  amount: number,
  description?: string,
  bankCode?: string
) {
  try {
    const { data } = await api.post('/user/vnpay/create-payment', {
      booking_id: bookingId,
      amount: amount,
      description: description,
      bank_code: bankCode,
    });
    
    console.log('VNPay createPaymentLink response:', {
      success: data.success,
      has_data: !!data.data,
      payment_url: data.data?.payment_url,
    });
    
    if (!data.success) {
      throw new Error(data.message || 'Không thể tạo link thanh toán VNPAY');
    }
    
    if (!data.data || !data.data.payment_url) {
      console.error('VNPay response missing payment_url:', data);
      throw new Error('VNPAY không trả về link thanh toán');
    }
    
    return data.data as {
      payment_url: string;
      order_code: string;
      amount: number;
      booking_id: number;
      expire_date?: string;
    };
  } catch (error: any) {
    if (error.response?.status !== 401 && error.response?.status !== 403) {
      console.error("Error creating VNPay payment link:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
    throw error;
  }
}

/**
 * Tạo URL thanh toán VNPAY cho invoice (thanh toán sau checkout)
 */
export async function createVNPayInvoicePaymentLink(
  invoiceId: number,
  amount: number,
  description?: string,
  bankCode?: string
) {
  try {
    const { data } = await api.post('/user/vnpay/create-invoice-payment', {
      invoice_id: invoiceId,
      amount: amount,
      description: description,
      bank_code: bankCode,
    });
    
    console.log('VNPay createInvoicePaymentLink response:', {
      success: data.success,
      has_data: !!data.data,
      payment_url: data.data?.payment_url,
    });
    
    if (!data.success) {
      throw new Error(data.message || 'Không thể tạo link thanh toán VNPAY');
    }
    
    const paymentUrl = data.data?.payment_url;
    
    if (!paymentUrl) {
      console.error('VNPay response missing payment_url:', data);
      throw new Error('VNPAY không trả về link thanh toán');
    }
    
    return {
      payment_url: paymentUrl,
      order_code: data.data?.order_code,
      amount: data.data?.amount,
      invoice_id: invoiceId,
    };
  } catch (error: any) {
    if (error.response?.status !== 401 && error.response?.status !== 403) {
      console.error("Error creating VNPay invoice payment link:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
    throw error;
  }
}

// Get checked-in guests (Quản lý lưu trú)
export async function getCheckedInGuests(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  booking_id?: number;
  room_id?: number;
}) {
  const { data } = await api.get("/admin/checked-in-guests", {
    params: {
      ...params,
      _t: Date.now(),
    },
  });
  
  return {
    data: Array.isArray(data.data) ? data.data : [],
    pagination: data.meta?.pagination,
  };
}

// Request service for a booking
export async function requestService(
  bookingId: number,
  serviceData: {
    booking_detail_id: number;
    service_id: number;
    quantity: number;
    notes?: string;
  }
) {
  const { data } = await api.post(`/user/bookings/${bookingId}/request-service`, serviceData);
  return data;
}

// Admin: Get service requests
export async function getServiceRequests(params?: {
  status?: 'pending' | 'approved' | 'rejected';
  booking_id?: number;
  page?: number;
  per_page?: number;
}) {
  const { data } = await api.get('/admin/service-requests', {
    params: {
      ...params,
      _t: Date.now(),
    },
  });
  return {
    data: Array.isArray(data.data) ? data.data : [],
    pagination: data.meta?.pagination,
  };
}

// Admin: Approve service request
export async function approveServiceRequest(
  serviceRequestId: number,
  adminNotes?: string
) {
  const { data } = await api.post(`/admin/service-requests/${serviceRequestId}/approve`, {
    admin_notes: adminNotes,
  });
  return data;
}

// Admin: Reject service request
export async function rejectServiceRequest(
  serviceRequestId: number,
  rejectionReason: string
) {
  const { data } = await api.post(`/admin/service-requests/${serviceRequestId}/reject`, {
    rejection_reason: rejectionReason,
  });
  return data;
}

// =========================================================================
// AMENITY REQUESTS - Yêu cầu tiện ích
// =========================================================================

// User: Request amenity for a booking
export async function requestAmenity(
  bookingId: number,
  amenityData: {
    booking_detail_id: number;
    amenity_id: number;
    quantity: number;
    notes?: string;
  }
) {
  const { data } = await api.post(`/user/bookings/${bookingId}/request-amenity`, amenityData);
  return data;
}

// Admin: Get amenity requests
export async function getAmenityRequests(params?: {
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
  booking_id?: number;
  page?: number;
  per_page?: number;
}) {
  const { data } = await api.get('/admin/amenity-requests', {
    params: {
      ...params,
      _t: Date.now(),
    },
  });
  return {
    data: Array.isArray(data.data) ? data.data : [],
    pagination: data.meta?.pagination,
  };
}

// Admin: Approve amenity request
export async function approveAmenityRequest(
  amenityRequestId: number,
  adminNotes?: string
) {
  const { data } = await api.post(`/admin/amenity-requests/${amenityRequestId}/approve`, {
    admin_notes: adminNotes,
  });
  return data;
}

// Admin: Reject amenity request
export async function rejectAmenityRequest(
  amenityRequestId: number,
  adminNotes?: string
) {
  const { data } = await api.post(`/admin/amenity-requests/${amenityRequestId}/reject`, {
    admin_notes: adminNotes,
  });
  return data;
}

// Admin: Complete amenity request
export async function completeAmenityRequest(
  amenityRequestId: number,
  adminNotes?: string
) {
  const { data } = await api.post(`/admin/amenity-requests/${amenityRequestId}/complete`, {
    admin_notes: adminNotes,
  });
  return data;
}

// ========================================
// ADMIN CHECKOUT WITH DAMAGE ITEMS
// ========================================

/**
 * Get supplies available for checkout (to record damages)
 */
export async function getSuppliesForCheckout(bookingId: number) {
  const { data } = await api.get(`/staff/check-out/${bookingId}/supplies`);
  return data;
}

/**
 * Preview checkout with damage items
 */
export async function previewCheckout(
  bookingId: number,
  checkoutData: {
    damaged_supplies?: {
      supply_id: number;
      quantity: number;
      unit_price?: number;
    }[];
    additional_services?: {
      service_id: number;
      quantity: number;
    }[];
  }
) {
  const { data } = await api.post(`/staff/check-out/${bookingId}/preview`, checkoutData);
  return data;
}

/**
 * Admin/Staff checkout with damage items
 */
export async function checkOutDirect(
  bookingId: number,
  checkoutData: {
    booking_detail_ids?: number[];
    room_status: 'available' | 'maintenance';
    notes?: string;
    damaged_supplies?: {
      supply_id: number;
      quantity: number;
      unit_price?: number;
      notes?: string;
    }[];
    additional_services?: {
      service_id: number;
      quantity: number;
    }[];
    create_invoice?: boolean;
  }
) {
  try {
    const { data } = await api.post(`/staff/check-out/${bookingId}`, checkoutData);
    return {
      booking: data.data as BookingOrder,
      damage_summary: data.damage_summary as {
        total_damage_fee: number;
        items: {
          supply: string;
          quantity: number;
          unit_price: number;
          total: number;
          notes?: string;
        }[];
      },
      invoice: data.invoice,
    };
  } catch (error: any) {
    if (error.response?.status !== 401 && error.response?.status !== 403) {
      console.error("Error checking out (admin):", error);
    }
    throw error;
  }
}
