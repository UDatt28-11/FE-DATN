export interface RoomTypeImage {
  id: number;
  room_type_id: number;
  image_url: string;
  is_primary: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RoomType {
  id: number;
  property_id?: number;
  name: string;
  description?: string;
  image_url?: string;
  /** Giá cơ bản theo đêm cho loại phòng */
  base_price?: number;
  /** Số người lớn tối đa cho loại phòng */
  max_adults?: number;
  /** Số trẻ em tối đa cho loại phòng */
  max_children?: number;
  status: "active" | "inactive";
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  property?: {
    id: number;
    name: string;
  };
  rooms_count?: number;
  images?: RoomTypeImage[];
}

export interface RoomTypeResponse {
  success: boolean;
  data: RoomType | RoomType[];
  meta?: {
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  };
  message?: string;
}

