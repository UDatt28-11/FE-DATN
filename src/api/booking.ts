import { api } from './client';
import type { BookingOrder, Pagination } from '../types/booking';

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
  const { data } = await api.get('/admin/booking-orders', { params: q });
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




