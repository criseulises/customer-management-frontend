import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Types
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: 'SUPERADMIN' | 'ADMIN';
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password?: string; // Optional for updates
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers?: number;
  adminUsers?: number;
  superAdminUsers?: number;
  admins?: number;          // Campo que viene del backend
  superAdmins?: number;     // Campo que viene del backend
  usersCreatedThisMonth?: number;
  usersCreatedThisWeek?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

// Configure axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('token');
      Cookies.remove('user');
      window.location.href = '/login';
    }
    throw error;
  }
);

export const userService = {
  // Create new user (ADMIN only)
  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      console.log(userData);
      
      const response = await api.post<ApiResponse<User>>('/api/admin/users', userData);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al crear usuario';
      throw new Error(message);
    }
  },

  // Get all users with pagination
  async getUsers(page = 0, size = 20, sort = 'createdAt'): Promise<PaginatedResponse<User>> {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<User>>>('/api/admin/users', {
        params: { page, size, sort }
      });
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al obtener usuarios';
      throw new Error(message);
    }
  },

  // Get active admin users only
  async getActiveAdmins(): Promise<User[]> {
    try {
      const response = await api.get<ApiResponse<User[]>>('/api/admin/users/admins');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al obtener administradores';
      throw new Error(message);
    }
  },

  // Get user by ID
  async getUserById(userId: number): Promise<User> {
    try {
      const response = await api.get<ApiResponse<User>>(`/api/admin/users/${userId}`);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al obtener usuario';
      throw new Error(message);
    }
  },

  // Update user
  async updateUser(userId: number, userData: UpdateUserRequest): Promise<User> {
    try {
      const response = await api.put<ApiResponse<User>>(`/api/admin/users/${userId}`, userData);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al actualizar usuario';
      throw new Error(message);
    }
  },

  // Search users
  async searchUsers(term: string): Promise<User[]> {
    try {
      const response = await api.get<ApiResponse<User[]>>('/api/admin/users/search', {
        params: { term }
      });
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error en la búsqueda';
      throw new Error(message);
    }
  },

  // Deactivate user
  async deactivateUser(userId: number): Promise<void> {
    try {
      await api.delete(`/api/admin/users/${userId}`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al desactivar usuario';
      throw new Error(message);
    }
  },

  // Activate user
  async activateUser(userId: number): Promise<void> {
    try {
      await api.post(`/api/admin/users/${userId}/activate`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al activar usuario';
      throw new Error(message);
    }
  },

  // Get user statistics
  async getUserStatistics(): Promise<UserStatistics> {
    try {
      const response = await api.get<ApiResponse<UserStatistics>>('/api/admin/users/statistics');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al obtener estadísticas';
      throw new Error(message);
    }
  },
};