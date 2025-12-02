export interface Amenity {
  id: number;
  property_id?: number;
  name: string;
  icon_url?: string;
  type: "basic" | "advanced" | "safety";
  category?: string;
  filter_category?: "key_amenity" | "view" | "floor" | null; // NEW: For filtering
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  property?: {
    id: number;
    name: string;
  };
}

export interface AmenityResponse {
  success: boolean;
  data: Amenity | Amenity[];
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
