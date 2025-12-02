import api from "../api/axios";
import type { 
  Listing, 
  Room, 
  RoomsResponse, 
  RoomResponse, 
  ReviewsResponse,
  Review 
} from "../types/room/room";

let listings: Listing[] = [
  {
    key: "1",
    id: 1,
    name: "Villa Biển Xanh",
    location: "Nha Trang",
    price: 2500000,
    capacity: 4,
    propertyId: 1,
    createdAt: "2023-02-01",
    updatedAt: "2024-09-20",
  },
  {
    key: "2",
    id: 2,
    name: "Homestay Gió Biển",
    location: "Phú Quốc",
    price: 1500000,
    capacity: 2,
    propertyId: 2,
    createdAt: "2023-03-10",
    updatedAt: "2024-10-05",
  },
  {
    key: "3",
    id: 3,
    name: "Nhà Gỗ Tây Bắc",
    location: "Sapa",
    price: 800000,
    capacity: 2,
    propertyId: 3,
    createdAt: "2023-04-15",
    updatedAt: "2024-09-25",
  },
];

export const getListings = () => listings;

export const addListing = (listing: Listing) => {
  listings = [listing, ...listings];
};

export const updateListing = (updated: Listing) => {
  listings = listings.map((l) => (l.key === updated.key ? updated : l));
};

export const deleteListing = (key: string) => {
  listings = listings.filter((l) => l.key !== key);
};

// ============================================
// API Functions - Public Routes (không cần auth)
// ============================================

/**
 * Lấy danh sách phòng (public API)
 * @param params Query parameters: property_id, room_type_id, search, min_price, max_price, 
 *               min_rating, max_rating, max_adults, max_children, amenities, sort_by, 
 *               sort_order, page, per_page
 */
export async function getRooms(params?: {
  property_id?: number;
  room_type_id?: number;
  search?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  max_rating?: number;
  max_adults?: number;
  max_children?: number;
  amenities?: number[];
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}): Promise<RoomsResponse> {
  const { data } = await api.get<RoomsResponse>("/rooms", { params });
  return data;
}

/**
 * Lấy chi tiết phòng theo ID (public API)
 * @param id Room ID
 */
export async function getRoomById(id: number | string): Promise<RoomResponse> {
  const { data } = await api.get<RoomResponse>(`/rooms/${id}`);
  return data;
}

/**
 * Lấy danh sách đánh giá của phòng (public API)
 * @param id Room ID
 * @param params Query parameters: page, per_page, rating
 */
export async function getRoomReviews(
  id: number | string,
  params?: {
    page?: number;
    per_page?: number;
    rating?: number;
  }
): Promise<ReviewsResponse> {
  const { data } = await api.get<ReviewsResponse>(`/rooms/${id}/reviews`, { params });
  return data;
}

// ============================================
// Legacy functions (giữ lại để tương thích)
// ============================================

/**
 * @deprecated Sử dụng getRooms() thay thế
 */
export async function listRooms(): Promise<Room[]> {
  try {
    const response = await getRooms();
    return response.data || [];
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return [];
  }
}
