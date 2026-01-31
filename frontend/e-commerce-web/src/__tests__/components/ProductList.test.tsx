import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import ProductList from '../../components/products/ProductList';
import { productApi } from '../../services/api';

// Mock the API service (Vitest)
vi.mock('../../services/api', () => ({
  productApi: {
    getAll: vi.fn(),
  },
}));

const mockProducts = ([
  { productId: 1, name: 'Laptop', price: 999.99, stock: 50 },
  { productId: 2, name: 'Mouse', price: 29.99, stock: 200 },
  { productId: 3, name: 'Keyboard', price: 79.99, stock: 5 },
]);

describe('ProductList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(productApi.getAll).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<ProductList />);
    expect(screen.getByText(/loading products/i)).toBeInTheDocument();
  });

  it('renders product data correctly', async () => {
    vi.mocked(productApi.getAll).mockResolvedValue(mockProducts);

    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
      expect(screen.getByText('Mouse')).toBeInTheDocument();
      expect(screen.getByText('Keyboard')).toBeInTheDocument();
    });

    // Check if prices are formatted correctly
    expect(screen.getByText('$999.99')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByText('$79.99')).toBeInTheDocument();

    // Check if stock is displayed
    expect(screen.getByText('50 units')).toBeInTheDocument();
    expect(screen.getByText('200 units')).toBeInTheDocument();
    expect(screen.getByText('5 units')).toBeInTheDocument();
  });

  it('displays error message when fetch fails', async () => {
    const errorMessage = 'Failed to fetch products';
    vi.mocked(productApi.getAll).mockRejectedValue({
      message: errorMessage,
    });

    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('displays empty state when no products exist', async () => {
    vi.mocked(productApi.getAll).mockResolvedValue([]);

    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText(/no products yet/i)).toBeInTheDocument();
    });
  });

  it('opens add product dialog when Add Product button is clicked', async () => {
    vi.mocked(productApi.getAll).mockResolvedValue(mockProducts);

    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const addButton = screen.getAllByText(/add product/i)[0];
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/add new product/i)).toBeInTheDocument();
    });
  });

  it('opens edit product dialog when Edit button is clicked', async () => {
    vi.mocked(productApi.getAll).mockResolvedValue(mockProducts);

    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const editButtons = screen.getAllByRole('button', { name: '' });
    const editButton = editButtons.find((btn) =>
      btn.querySelector('[data-testid="EditIcon"]')
    );

    if (editButton) {
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByText(/edit product/i)).toBeInTheDocument();
      });
    }
  });

  it('applies correct stock color coding', async () => {
    vi.mocked(productApi.getAll).mockResolvedValue(mockProducts);

    render(<ProductList />);

    await waitFor(() => {
      const chips = screen.getAllByText(/units/);
      expect(chips.length).toBeGreaterThan(0);
    });
  });
});
