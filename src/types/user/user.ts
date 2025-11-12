// User types
export type UserRole = 'admin' | 'user' | 'customer';
export type UserStatus = 'active' | 'inactive' | 'banned';
export type Gender = 'male' | 'female' | 'other';

export interface User {
  id: string | number;
  full_name: string;
  email: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: Gender;
  address?: string;
  role?: UserRole;
  status: UserStatus;
  created_at?: string;
  updated_at?: string;
}
