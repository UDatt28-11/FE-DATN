export type UserRole = "admin" | "staff" | "user";
export type UserStatus = "active" | "locked";

// Backend User type (từ UserResource)
export interface BackendUser {
  id: number;
  full_name: string;
  email: string;
  phone_number?: string;
  avatar_url?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
  address?: string;
  status: UserStatus;
  role: UserRole;
  preferred_language?: string;
  identity_verified?: boolean;
  identity_type?: string;
  identity_number?: string;
  identity_image_url?: string;
  verified_at?: string;
  verifier?: {
    id: number;
    full_name: string;
  };
  email_verified_at?: string;
  created_at?: string;
  updated_at?: string;
}

// Frontend User type (để tương thích với component hiện tại)
export interface User {
  key: string;
  id: string | number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: UserRole;
  status: UserStatus;
  totalBookings?: number;
  totalSpent?: number;
  joinDate?: string;
  lastLogin?: string;
  // Thêm các field từ backend
  full_name?: string;
  phone_number?: string;
  avatar_url?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
  address?: string;
  identity_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}
