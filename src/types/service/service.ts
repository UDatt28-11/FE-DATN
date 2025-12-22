export interface Property {
  id: number;
  name: string;
}

export interface Service {
  id: number;
  property_id: number;
  name: string;
  price: number;
  unit: string;
  status?: 'active' | 'disabled';
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  property?: Property;
}

export interface ServiceResponse {
  success: boolean;
  data: Service | Service[];
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

