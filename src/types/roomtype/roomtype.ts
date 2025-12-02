export interface RoomType {
  id: number;
  property_id?: number;
  name: string;
  description?: string;
  image_url?: string;
  status: "active" | "inactive";
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  property?: {
    id: number;
    name: string;
  };
  rooms_count?: number;
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

