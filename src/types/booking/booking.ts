export type BookingDetail = {
  id: number;
  room_id: number;
  room_name?: string | null;
  check_in_date: string;
  check_out_date: string;
  num_adults: number;
  num_children: number;
  sub_total: number;
  status: 'active' | 'cancelled' | 'checked_in' | 'checked_out';
  guests?: CheckedInGuest[];
};

export type CheckedInGuest = {
  id: number;
  full_name: string;
  date_of_birth?: string | null;
  identity_type?: 'cccd' | 'passport' | null;
  identity_number?: string | null;
  identity_image_url?: string | null;
  check_in_time?: string | null;
};

export type BookingOrder = {
  id: number;
  code: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  total_amount: number;
  payment_method?: string | null;
  notes?: string | null;
  checkin_date?: string | null;
  checkout_date?: string | null;
  details_count: number;
  created_at: string;
  details?: BookingDetail[];
};

export type Pagination = {
  page: number;
  per_page: number;
  total: number;
  last_page: number;
};




