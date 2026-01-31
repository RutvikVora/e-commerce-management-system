import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import ProductList from '../../components/products/ProductList';
import OrderList from '../../components/orders/OrderList';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { productApi, orderApi } from '../../services/api';

// Mock the API services (Vitest)
vi.mock('../../services/api', () => ({
  productApi: {
    getAll: vi.fn(),
  },
  orderApi: {
    getAll: vi.fn(),
  },
}));

describe('Snapshot Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Loading component matches snapshot', () => {
    const { container } = render(<Loading message="Loading data..." />);
    expect(container).toMatchSnapshot();
  });

  it('ErrorMessage component matches snapshot', () => {
    const { container } = render(
      <ErrorMessage message="An error occurred" title="Error" />
    );
    expect(container).toMatchSnapshot();
  });

  it('ProductList loading state matches snapshot', () => {
    vi.mocked(productApi.getAll).mockImplementation(
      () => new Promise(() => {}) // never resolves
    );

    const { container } = render(<ProductList />);
    expect(container).toMatchSnapshot();
  });

  it('OrderList loading state matches snapshot', () => {
    vi.mocked(orderApi.getAll).mockImplementation(
      () => new Promise(() => {})
    );

    const { container } = render(<OrderList />);
    expect(container).toMatchSnapshot();
  });

  it('ProductList with empty data matches snapshot', async () => {
    vi.mocked(productApi.getAll).mockResolvedValue([]);

    const { container, findByText } = render(<ProductList />);
    await findByText(/no products yet/i);

    expect(container).toMatchSnapshot();
  });

  it('OrderList with empty data matches snapshot', async () => {
    vi.mocked(orderApi.getAll).mockResolvedValue([]);

    const { container, findByText } = render(<OrderList />);
    await findByText(/no orders yet/i);

    expect(container).toMatchSnapshot();
  });

  it('ProductList with data matches snapshot', async () => {
    const mockProducts = [
      { productId: 1, name: 'Laptop', price: 999.99, stock: 50 },
      { productId: 2, name: 'Mouse', price: 29.99, stock: 200 },
    ];

    vi.mocked(productApi.getAll).mockResolvedValue(mockProducts);

    const { container, findByText } = render(<ProductList />);
    await findByText('Laptop');

    expect(container).toMatchSnapshot();
  });

  it('OrderList with data matches snapshot', async () => {
    const mockOrders = [
      {
        orderId: 101,
        productId: 1,
        productName: "Laptop",
        quantity: 2,
        totalPrice: 2000,
        orderDate: "2026-01-31",
      },
      {
        orderId: 102,
        productId: 2,
        productName: "Mouse",
        quantity: 5,
        totalPrice: 100,
        orderDate: "2026-01-31",
      },
    ];

    vi.mocked(orderApi.getAll).mockResolvedValue(mockOrders);

    const { container, findByText } = render(<OrderList />);
    await findByText('Laptop');

    expect(container).toMatchSnapshot();
  });
});
