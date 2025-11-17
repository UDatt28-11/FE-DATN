
import api from '../ApiFromBE/axios';
import type { BookingOrder, Pagination } from '../types/booking/booking';


// Export lại các type để dùng ở component
export type { BookingOrder } from '../types/booking/booking';

export type ListBookingsParams = {
  page?: number;
  per_page?: number;
  keyword?: string;
  status?: string[];
  date_field?: 'check_in_date' | 'check_out_date' | 'created_at';
  date_from?: string;
  date_to?: string;
  room_name?: string;
  min_total?: number;
  max_total?: number;
  sort?: 'created_at' | '-created_at' | 'checkin_date' | '-checkin_date' | 'total_amount' | '-total_amount';
  include?: string;
};

export async function listBookings(params: ListBookingsParams) {
  const q = { ...params } as any;
  if (Array.isArray(params.status)) q.status = params.status.join(',');
  
  // Thêm timestamp để tránh cache
  q._t = Date.now();
  
  const { data } = await api.get('/admin/booking-orders', { 
    params: q,
    // Force no-cache
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    }
  });
  
  return {
    data: (data.data as BookingOrder[]) ?? [],
    pagination: (data.meta?.pagination as Pagination) ?? undefined,
  };
}

export async function getBooking(id: number, include?: string) {
  const { data } = await api.get(`/admin/booking-orders/${id}`, { params: { include } });
  return data.data as BookingOrder;
}

export async function updateBookingStatus(id: number, status: 'confirmed' | 'completed' | 'cancelled') {
  const { data } = await api.patch(`/admin/booking-orders/${id}/status`, { status });
  return data.data as { id: number; status: BookingOrder['status'] };
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
  const { data } = await api.post('/admin/booking-orders', bookingData);
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

export async function updateBooking(id: number, bookingData: UpdateBookingData) {
  const { data } = await api.put(`/admin/booking-orders/${id}`, bookingData);
  return data.data as BookingOrder;
}

// Xóa đặt phòng
export async function deleteBooking(id: number) {
  const { data } = await api.delete(`/admin/booking-orders/${id}`);
  return data;
}