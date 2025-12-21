// Types từ BE
export interface Property {
  id: number;
  name: string;
  address?: string;
}

export interface RoomType {
  id: number;
  name: string;
}

export interface Amenity {
  id: number;
  name: string;
}

export interface RoomImage {
  id: number;
  room_id: number;
  image_url: string;
  web_view_link?: string;
  is_primary: boolean;
  drive_file_id?: string;
  mime_type?: string;
  size_bytes?: number;
}

export interface Review {
  id: number;
  room_id: number;
  user_id: number;
  rating: number;
  title?: string;
  comment?: string;
  status?: string;
  reviewed_at?: string;
  user?: {
    id: number;
    full_name: string;
    avatar?: string;
  };
  property?: {
    id: number;
    name: string;
  };
}

export type Room = {
  id: number;
  name: string;
  property_id: number;
  room_type_id: number;
  description?: string;
  floor_number?: number;
  floor_category?: string;
  max_adults: number;
  max_children: number;
  price_per_night: number;
  status: 'available' | 'maintenance' | 'occupied';
  verification_status?: 'pending' | 'verified' | 'rejected';
  verification_notes?: string;
  verified_at?: string;
  verified_by?: number;
  created_at?: string;
  updated_at?: string;
  // Relationships
  property?: Property;
  roomType?: RoomType & { images?: any[] };
  amenities?: Amenity[];
  images?: RoomImage[];
  reviews?: Review[];
  verifier?: {
    id: number;
    full_name: string;
  };
  // Calculated fields from API
  rating?: number;
  reviews_count?: number;
};

export interface Listing {
  id?: number;              // ID sẽ được server tạo ra
  name: string;             // Tên listing
  description?: string;     // Mô tả
  price: number;            // Giá
  capacity: number;         // Sức chứa
  propertyId: number;       // ID property
  photos?: string[];        // Ảnh
  createdAt?: string;
  updatedAt?: string;
}

// API Response types
export interface RoomsResponse {
  success: boolean;
  data: Room[];
  meta?: {
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  };
}

export interface RoomResponse {
  success: boolean;
  data: Room;
}

export interface ReviewsResponse {
  success: boolean;
  data: Review[];
  meta?: {
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  };
}


