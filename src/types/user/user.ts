export type UserRole = "admin" | "host" | "guest";
export type UserStatus = "active" | "inactive" | "blocked";

export interface User {
  key: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: UserRole;
  status: UserStatus;
  totalBookings: number;
  totalSpent: number;
  joinDate: string;
  lastLogin: string;
}
