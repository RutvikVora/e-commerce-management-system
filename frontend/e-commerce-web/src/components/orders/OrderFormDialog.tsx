import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  MenuItem,
  Typography,
  Divider,
} from '@mui/material';
import { orderApi, productApi } from '../../services/api';
import type { OrderFormData, Product } from '../../types';

interface OrderFormDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const OrderFormDialog: React.FC<OrderFormDialogProps> = ({
  open,
  onClose,
  onCreated,
}) => {
  const [formData, setFormData] = useState<OrderFormData>({
    productId: '',
    quantity: '',
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [errors, setErrors] = useState<Partial<OrderFormData>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch products when dialog opens
  useEffect(() => {
    if (open) {
      fetchProducts();
      setFormData({ productId: '', quantity: '' });
      setErrors({});
      setSubmitError(null);
    }
  }, [open]);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await productApi.getAll();
      setProducts(data);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to fetch products');
    } finally {
      setLoadingProducts(false);
    }
  };

  const selectedProduct = products.find(
    (p) => p.productId === Number(formData.productId)
  );

  const calculateTotalPrice = (): number => {
    if (!selectedProduct || !formData.quantity) return 0;
    return selectedProduct.price * Number(formData.quantity);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<OrderFormData> = {};

    if (!formData.productId) {
      newErrors.productId = 'Please select a product';
    }

    const quantity = Number(formData.quantity);
    if (!formData.quantity || isNaN(quantity) || quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    } else if (selectedProduct && quantity > selectedProduct.stock) {
      newErrors.quantity = `Only ${selectedProduct.stock} units available`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof OrderFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: event.target.value });
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const orderData: OrderFormData = {
        productId: Number(formData.productId),
        quantity: Number(formData.quantity),
      };

      await orderApi.create(orderData);
      onCreated();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, fontSize: '1.5rem' }}>
        Create New Order
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          {loadingProducts && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Loading products...
            </Alert>
          )}

          <Box display="flex" flexDirection="column" gap={2.5}>
            <TextField
              select
              label="Select Product"
              fullWidth
              value={formData.productId}
              onChange={handleChange('productId')}
              error={!!errors.productId}
              helperText={errors.productId}
              disabled={loadingProducts || products.length === 0}
              required
            >
              {products.length === 0 && !loadingProducts && (
                <MenuItem value="" disabled>
                  No products available
                </MenuItem>
              )}
              {products.map((product) => (
                <MenuItem key={product.productId} value={product.productId}>
                  {product.name} - {formatPrice(product.price)} ({product.stock}{' '}
                  in stock)
                </MenuItem>
              ))}
            </TextField>

            {selectedProduct && (
              <Box
                sx={{
                  p: 2,
                  backgroundColor: 'grey.50',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'grey.200',
                }}
              >
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Product Details
                </Typography>
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Typography variant="body2">Price per unit:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatPrice(selectedProduct.price)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Available stock:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {selectedProduct.stock} units
                  </Typography>
                </Box>
              </Box>
            )}

            <TextField
              label="Quantity"
              type="number"
              fullWidth
              value={formData.quantity}
              onChange={handleChange('quantity')}
              error={!!errors.quantity}
              helperText={errors.quantity}
              inputProps={{ min: 1, step: 1 }}
              required
            />

            {selectedProduct && formData.quantity && Number(formData.quantity) > 0 && (
              <>
                <Divider />
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: 'primary.light',
                    borderRadius: 2,
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={600}>
                      Total Price:
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="primary.dark">
                      {formatPrice(calculateTotalPrice())}
                    </Typography>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={onClose}
            disabled={submitting}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || loadingProducts}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
            }}
          >
            {submitting ? 'Creating...' : 'Create Order'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default OrderFormDialog;
