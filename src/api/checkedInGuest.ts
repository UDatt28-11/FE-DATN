import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/admin';

export interface CheckedInGuest {
  id: number;
  booking_details_id?: number;
  full_name: string;
  date_of_birth?: string;
  identity_type?: 'cccd' | 'passport';
  identity_number?: string;
  identity_image_url?: string;
  check_in_time?: string;
}

export interface CheckedInGuestFormData {
  full_name: string;
  date_of_birth?: string;
  identity_type?: 'cccd' | 'passport';
  identity_number?: string;
  identity_image_url?: string;
  check_in_time?: string;
}

export interface CheckedInGuestsFilter {
  full_name?: string;
  identity_number?: string;
  identity_type?: 'cccd' | 'passport';
  check_in_from?: string;
  check_in_to?: string;
  room_number?: string;
  booking_id?: number;
  per_page?: number;
  page?: number;
}

/**
 * Lấy danh sách khách lưu trú theo booking_detail
 */
export const getGuestsByBookingDetail = async (bookingDetailId: number) => {
  const response = await axios.get(`${API_URL}/booking-details/${bookingDetailId}/guests`);
  return response.data;
};

/**
 * Thêm khách lưu trú cho booking_detail
 */
export const createGuestsForBookingDetail = async (
  bookingDetailId: number,
  guests: CheckedInGuestFormData[]
) => {
  const response = await axios.post(`${API_URL}/booking-details/${bookingDetailId}/guests`, {
    guests,
  });
  return response.data;
};

/**
 * Cập nhật thông tin 1 khách lưu trú
 */
export const updateGuest = async (id: number, data: CheckedInGuestFormData) => {
  const response = await axios.put(`${API_URL}/checked-in-guests/${id}`, data);
  return response.data;
};

/**
 * Xóa 1 khách lưu trú
 */
export const deleteGuest = async (id: number) => {
  const response = await axios.delete(`${API_URL}/checked-in-guests/${id}`);
  return response.data;
};

/**
 * Lấy danh sách tổng khách lưu trú (có filter)
 */
export const getAllGuests = async (params?: CheckedInGuestsFilter) => {
  const response = await axios.get(`${API_URL}/checked-in-guests`, { params });
  return response.data;
};
