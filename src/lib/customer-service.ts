import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Types
export interface Address {
  id?: number;
  street: string;
  city: string;
  country: string;
  type: 'HOME' | 'WORK' | 'OTHER';
  isPrimary: boolean;
  active?: boolean;
}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  documentNumber: string;
  documentType: 'CEDULA' | 'PASSPORT' | 'RNC';
  active: boolean;
  addresses: Address[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentNumber: string;
  documentType: 'CEDULA' | 'PASSPORT' | 'RNC';
  addresses: Omit<Address, 'id' | 'active'>[];
}

export interface CustomerStatistics {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers?: number;
  managedCustomers?: number;     // Campo que viene del backend
  customersCreatedThisMonth?: number;
  customersCreatedThisWeek?: number;
  averageAddressesPerCustomer?: number;
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

export const customerService = {

// Agregar también el método updateCustomer que falta:
async updateCustomer(customerId: number, customerData: Partial<CreateCustomerRequest>): Promise<Customer> {
  try {
    const response = await api.put<ApiResponse<Customer>>(`/api/customers/${customerId}`, customerData);
    return response.data.data;
  } catch (error: unknown) {
    let message = 'Error al actualizar cliente';
    if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
      // @ts-expect-error: dynamic access
      message = error.response.data.message || message;
    }
    throw new Error(message);
  }
},

  // Create new customer
  async createCustomer(customerData: CreateCustomerRequest): Promise<Customer> {
    try {
      const response = await api.post<ApiResponse<Customer>>('/api/customers', customerData);
      return response.data.data;
    } catch (error: unknown) {
      let message = 'Error al crear cliente';
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
      ) {
        // @ts-expect-error: dynamic access
        message = error.response.data.message || message;
      }
      throw new Error(message);
    }
  },

  // Get all customers with pagination
  async getCustomers(page = 0, size = 20, sort = 'createdAt'): Promise<PaginatedResponse<Customer>> {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<Customer>>>('/api/customers', {
        params: { page, size, sort }
      });
      return response.data.data;
    } catch (error: unknown) {
      let message = 'Error al obtener clientes';
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
      ) {
        // @ts-expect-error: dynamic access
        message = error.response.data.message || message;
      }
      throw new Error(message);
    }
  },

  // Get customer by ID
  async getCustomerById(customerId: number): Promise<Customer> {
    try {
      const response = await api.get<ApiResponse<Customer>>(`/api/customers/${customerId}`);
      return response.data.data;
    } catch (error: unknown) {
      let message = 'Error al obtener cliente';
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
      ) {
        // @ts-expect-error: dynamic access
        message = error.response.data.message || message;
      }
      throw new Error(message);
    }
  },

  // Search customers
  async searchCustomers(term: string, page = 0, size = 20): Promise<PaginatedResponse<Customer>> {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<Customer>>>('/api/customers/search', {
        params: { term, page, size }
      });
      return response.data.data;
    } catch (error: unknown) {
      let message = 'Error en la búsqueda';
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
      ) {
        // @ts-expect-error: dynamic access
        message = error.response.data.message || message;
      }
      throw new Error(message);
    }
  },

  // Deactivate customer
  async deactivateCustomer(customerId: number): Promise<void> {
    try {
      await api.delete(`/api/customers/${customerId}`);
    } catch (error: unknown) {
      let message = 'Error al desactivar cliente';
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
      ) {
        // @ts-expect-error: dynamic access
        message = error.response.data.message || message;
      }
      throw new Error(message);
    }
  },

  // Activate customer
  async activateCustomer(customerId: number): Promise<void> {
    try {
      await api.post(`/api/customers/${customerId}/activate`);
    } catch (error: unknown) {
      let message = 'Error al activar cliente';
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
      ) {
        // @ts-expect-error: dynamic access
        message = error.response.data.message || message;
      }
      throw new Error(message);
    }
  },

  // Get customer statistics
  async getCustomerStatistics(): Promise<CustomerStatistics> {
    try {
      const response = await api.get<ApiResponse<CustomerStatistics>>('/api/customers/statistics');
      return response.data.data;
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data
          ? error.response.data.message || 'Error al obtener estadísticas'
          : 'Error al obtener estadísticas';
      throw new Error(typeof message === 'string' ? message : 'Error al obtener estadísticas');
    }
  },

  // Get customers by user (SUPERADMIN only)
  async getCustomersByUser(userId: number, page = 0, size = 20): Promise<PaginatedResponse<Customer>> {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<Customer>>>(`/api/customers/by-user/${userId}`, {
        params: { page, size }
      });
      return response.data.data;
    } catch (error: unknown) {
      let message = 'Error al obtener clientes por usuario';
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
      ) {
        // @ts-expect-error: dynamic access
        message = error.response.data.message || message;
      }
      throw new Error(message);
    }
  },

  
};

