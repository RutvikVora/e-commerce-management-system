import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, test, expect, beforeEach, vi } from 'vitest';

import OrderFormDialog from '../../components/orders/OrderFormDialog';
import { orderApi, productApi } from '../../services/api';

// Mock the API services (Vitest)
vi.mock('../../services/api', () => ({
  orderApi: {
    create: vi.fn(),
  },
  productApi: {
    getAll: vi.fn(),
  },
}));

const mockProducts = [
  { productId: 1, name: 'Laptop', price: 999.99, stock: 50 },
  { productId: 2, name: 'Mouse', price: 29.99, stock: 200 },
];

describe('OrderFormDialog Component', () => {
  const mockOnClose = vi.fn();
  const mockOnCreated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(productApi.getAll).mockResolvedValue(mockProducts);
  });

  test('renders dialog when open', async () => {
    render(
      <OrderFormDialog
        open={true}
        onClose={mockOnClose}
        onCreated={mockOnCreated}
      />
    );

    expect(screen.getByText(/create new order/i)).toBeInTheDocument();
  });

  test('does not render dialog when closed', () => {
    render(
      <OrderFormDialog
        open={false}
        onClose={mockOnClose}
        onCreated={mockOnCreated}
      />
    );

    expect(
      screen.queryByText(/create new order/i)
    ).not.toBeInTheDocument();
  });

  test('loads products on open', async () => {
    render(
      <OrderFormDialog
        open={true}
        onClose={mockOnClose}
        onCreated={mockOnCreated}
      />
    );

    await waitFor(() => {
      expect(productApi.getAll).toHaveBeenCalled();
    });
  });

  test('validates required fields', async () => {
    const user = userEvent.setup();

    render(
      <OrderFormDialog
        open={true}
        onClose={mockOnClose}
        onCreated={mockOnCreated}
      />
    );

    await waitFor(() => {
      expect(productApi.getAll).toHaveBeenCalled();
    });

    const createButton = screen.getByRole('button', {
      name: /create order/i,
    });

    await user.click(createButton);

    await waitFor(() => {
      expect(
        screen.getByText(/please select a product/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/quantity must be greater than 0/i)
      ).toBeInTheDocument();
    });

    expect(orderApi.create).not.toHaveBeenCalled();
  });

  test('validates quantity does not exceed stock', async () => {
    const user = userEvent.setup();

    render(
      <OrderFormDialog
        open={true}
        onClose={mockOnClose}
        onCreated={mockOnCreated}
      />
    );

    await waitFor(() => {
      expect(productApi.getAll).toHaveBeenCalled();
    });

    await user.click(screen.getByLabelText(/select product/i));
    await user.click(await screen.findByText(/laptop/i));

    const quantityInput = screen.getByLabelText(/quantity/i);
    await user.clear(quantityInput);
    await user.type(quantityInput, '100');

    await user.click(
      screen.getByRole('button', { name: /create order/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText(/only 50 units available/i)
      ).toBeInTheDocument();
    });
  });

  test('calculates total price correctly', async () => {
    const user = userEvent.setup();

    render(
      <OrderFormDialog
        open={true}
        onClose={mockOnClose}
        onCreated={mockOnCreated}
      />
    );

    await waitFor(() => {
      expect(productApi.getAll).toHaveBeenCalled();
    });

    await user.click(screen.getByLabelText(/select product/i));
    await user.click(await screen.findByText(/laptop/i));

    const quantityInput = screen.getByLabelText(/quantity/i);
    await user.clear(quantityInput);
    await user.type(quantityInput, '2');

    await waitFor(() => {
      expect(screen.getByText('$1,999.98')).toBeInTheDocument();
    });
  });

  test('submits order successfully', async () => {
    const user = userEvent.setup();

    vi.mocked(orderApi.create).mockResolvedValue({
      orderId: 1,
      productId: 1,
      productName: 'Laptop',
      quantity: 2,
      totalPrice: 1999.98,
      orderDate: new Date().toISOString(),
    });

    render(
      <OrderFormDialog
        open={true}
        onClose={mockOnClose}
        onCreated={mockOnCreated}
      />
    );

    await waitFor(() => {
      expect(productApi.getAll).toHaveBeenCalled();
    });

    await user.click(screen.getByLabelText(/select product/i));
    await user.click(await screen.findByText(/laptop/i));

    const quantityInput = screen.getByLabelText(/quantity/i);
    await user.clear(quantityInput);
    await user.type(quantityInput, '2');

    await user.click(
      screen.getByRole('button', { name: /create order/i })
    );

    await waitFor(() => {
      expect(orderApi.create).toHaveBeenCalledWith({
        productId: 1,
        quantity: 2,
      });
      expect(mockOnCreated).toHaveBeenCalled();
    });
  });

  test('closes dialog when Cancel is clicked', async () => {
    const user = userEvent.setup();

    render(
      <OrderFormDialog
        open={true}
        onClose={mockOnClose}
        onCreated={mockOnCreated}
      />
    );

    await user.click(
      screen.getByRole('button', { name: /cancel/i })
    );

    expect(mockOnClose).toHaveBeenCalled();
  });
});
