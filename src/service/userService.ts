import axios from "axios";
import type { User } from "@/types/user/user";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const userService = {
  // Get all users
  async getUsers() {
    const response = await axios.get(`${API_URL}/users`);
    return response.data;
  },

  // Get user by ID
  async getUserById(id: string | number) {
    const response = await axios.get(`${API_URL}/users/${id}`);
    return response.data;
  },

  // Create new user
  async createUser(userData: Partial<User>) {
    const response = await axios.post(`${API_URL}/users`, userData);
    return response.data;
  },

  // Update user
  async updateUser(id: string | number, userData: Partial<User>) {
    const response = await axios.put(`${API_URL}/users/${id}`, userData);
    return response.data;
  },

  // Delete user
  async deleteUser(id: string | number) {
    const response = await axios.delete(`${API_URL}/users/${id}`);
    return response.data;
  },

  // Toggle user status
  async toggleUserStatus(id: string | number) {
    const response = await axios.patch(`${API_URL}/users/${id}/toggle-status`);
    return response.data;
  },
};

export default userService;
