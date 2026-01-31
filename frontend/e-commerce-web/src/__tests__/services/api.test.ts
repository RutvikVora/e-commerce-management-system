import axios from 'axios';
import { productApi, orderApi } from '../../services/api';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock axios (Vitest)
vi.mock('axios');
const mockedAxios = axios as unknown as any;

describe('API Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAxios.create.mockReturnValue(mockedAxios as any);
  });

  describe('productApi', () => {
    it('getAll returns product list', async () => {
      const mockProducts = [
        { id: 1, name: 'Laptop', price: 999.99, stock: 50 },
        { id: 2, name: 'Mouse', price: 29.99, stock: 200 },
      ];

      mockedAxios.get.mockResolvedValue({ data: mockProducts });

      const result = await productApi.getAll();

      expect(mockedAxios.get).toHaveBeenCalledWith('/products');
      expect(result).toEqual(mockProducts);
    });

    it('create sends POST request with product data', async () => {
      const newProduct = { name: 'Keyboard', price: 79.99, stock: 100 };
      const createdProduct = { id: 3, ...newProduct };

      mockedAxios.post.mockResolvedValue({ data: createdProduct });

      const result = await productApi.create(newProduct);

      expect(mockedAxios.post).toHaveBeenCalledWith('/products', newProduct);
      expect(result).toEqual(createdProduct);
    });

    it('update sends PUT request with product data', async () => {
      const productId = 1;
      const updatedData = { name: 'Updated Laptop', price: 899.99, stock: 45 };
      const updatedProduct = { id: productId, ...updatedData };

      mockedAxios.put.mockResolvedValue({ data: updatedProduct });

      const result = await productApi.update(productId, updatedData);

      expect(mockedAxios.put).toHaveBeenCalledWith(
        `/products/${productId}`,
        updatedData
      );
      expect(result).toEqual(updatedProduct);
    });

    it('handles network errors gracefully', async () => {
      const networkError = {
        request: {},
        message: 'Network Error',
      };

      mockedAxios.get.mockRejectedValue(networkError);

      await expect(productApi.getAll()).rejects.toEqual({
        message: 'No response from server. Please check your connection.',
      });
    });

    it('handles API errors with status codes', async () => {
      const apiError = {
        response: {
          status: 404,
          data: { message: 'Product not found' },
        },
      };

      mockedAxios.get.mockRejectedValue(apiError);

      await expect(productApi.getAll()).rejects.toEqual({
        message: 'Product not found',
        status: 404,
      });
    });
  });

  describe('orderApi', () => {
    it('getAll returns order list', async () => {
      const mockOrders = [
        {
          id: 1,
          productId: 1,
          productName: 'Laptop',
          quantity: 2,
          totalPrice: 1999.98,
          orderDate: '2024-01-15T10:30:00Z',
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: mockOrders });

      const result = await orderApi.getAll();

      expect(mockedAxios.get).toHaveBeenCalledWith('/orders');
      expect(result).toEqual(mockOrders);
    });

    it('create sends POST request with order data', async () => {
      const newOrder = { productId: 1, quantity: 2 };
      const createdOrder = {
        id: 1,
        productId: 1,
        productName: 'Laptop',
        quantity: 2,
        totalPrice: 1999.98,
        orderDate: '2024-01-15T10:30:00Z',
      };

      mockedAxios.post.mockResolvedValue({ data: createdOrder });

      const result = await orderApi.create(newOrder);

      expect(mockedAxios.post).toHaveBeenCalledWith('/orders', newOrder);
      expect(result).toEqual(createdOrder);
    });

    it('handles validation errors', async () => {
      const validationError = {
        response: {
          status: 400,
          data: { message: 'Quantity exceeds available stock' },
        },
      };

      mockedAxios.post.mockRejectedValue(validationError);

      await expect(orderApi.create({ productId: 1, quantity: 1000 })).rejects.toEqual({
        message: 'Quantity exceeds available stock',
        status: 400,
      });
    });
  });
});
