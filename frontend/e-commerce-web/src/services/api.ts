import axios, { AxiosError } from 'axios';
import type { ApiError, Order, OrderFormData, Product, ProductFormData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error handler
const handleApiError = (error: AxiosError<ApiError>): ApiError => {
  if (error.response) {
    return {
      message: error.response.data?.message || 'An error occurred',
      status: error.response.status,
    };
  } else if (error.request) {
    return {
      message: 'No response from server. Please check your connection.',
    };
  } else {
    return {
      message: error.message || 'An unexpected error occurred',
    };
  }
};

// Product API
export const productApi = {
  getAll: async (): Promise<Product[]> => {
    try {
      const response = await api.get<Product[]>('/product');
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },

  create: async (product: ProductFormData): Promise<Product> => {
    try {
      const response = await api.post<Product>('/product', product);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },

  update: async (id: number, product: ProductFormData): Promise<Product> => {
    try {
      const response = await api.put<Product>(`/product/${id}`, product);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/product/${id}`);
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },
};

// Order API
export const orderApi = {
  getAll: async (): Promise<Order[]> => {
    try {
      const response = await api.get<Order[]>('/order');
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },

  create: async (order: OrderFormData): Promise<Order> => {
    try {
      const response = await api.post<Order>('/order', order);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },
};
