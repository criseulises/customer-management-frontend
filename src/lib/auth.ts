import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: 'SUPERADMIN' | 'ADMIN';
  active: boolean;
  createdAt: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    type: string;
    user: User;
  };
  timestamp: string;
}

export interface AuthResult {
  success: boolean;
  user: User;
  token: string;
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

export const loginUser = async (email: string, password: string): Promise<AuthResult> => {
  try {
    const response = await api.post<LoginResponse>('/api/auth/login', {
      email,
      password,
    });

    if (response.data.success) {
      const { token, user } = response.data.data;
      
      // Store token in cookies
      Cookies.set('token', token, { expires: 1 }); // 1 day
      Cookies.set('user', JSON.stringify(user), { expires: 1 });
      
      return {
        success: true,
        user,
        token,
      };
    } else {
      throw new Error(response.data.message);
    }
  } catch (error: unknown) {
    interface AxiosErrorResponse {
      response?: {
        data?: {
          message?: string;
        };
      };
    }
    const err = error as AxiosErrorResponse;
    if (
      typeof error === 'object' &&
      error !== null &&
      err.response &&
      typeof err.response === 'object' &&
      err.response.data &&
      typeof err.response.data === 'object' &&
      err.response.data.message
    ) {
      throw new Error(err.response.data.message);
    }
    throw new Error('Error de conexión con el servidor');
  }
};

export const logoutUser = () => {
  Cookies.remove('token');
  Cookies.remove('user');
};

export const getCurrentUser = (): User | null => {
  const userStr = Cookies.get('user');
  if (userStr) {
    try {
      // Decode the URL-encoded cookie value
      const decodedUserStr = decodeURIComponent(userStr);
      return JSON.parse(decodedUserStr);
    } catch (error) {
      console.error('Error parsing user cookie:', error);
      // If decoding fails, try parsing directly (fallback)
      try {
        return JSON.parse(userStr);
      } catch (fallbackError) {
        console.error('Error parsing user cookie (fallback):', fallbackError);
        return null;
      }
    }
  }
  return null;
};

export const getToken = (): string | null => {
  return Cookies.get('token') || null;
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};