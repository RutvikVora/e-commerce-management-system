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
} from '@mui/material';
import { productApi } from '../../services/api';
import type { Product, ProductFormData } from '../../types';

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  product: Product | null;
}

const ProductFormDialog: React.FC<ProductFormDialogProps> = ({
  open,
  onClose,
  onSaved,
  product,
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    price: '',
    stock: '',
  });
  const [errors, setErrors] = useState<Partial<ProductFormData>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price,
        stock: product.stock,
      });
    } else {
      setFormData({
        name: '',
        price: '',
        stock: '',
      });
    }
    setErrors({});
    setSubmitError(null);
  }, [product, open]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ProductFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    const price = Number(formData.price);
    if (!formData.price || isNaN(price) || price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    const stock = Number(formData.stock);
    if (formData.stock === '' || isNaN(stock) || stock < 0) {
      newErrors.stock = 'Stock must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof ProductFormData) => (
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
      const productData: ProductFormData = {
        name: formData.name.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
      };

      if (product) {
        await productApi.update(product.productId, productData);
      } else {
        await productApi.create(productData);
      }

      onSaved();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, fontSize: '1.5rem' }}>
        {product ? 'Edit Product' : 'Add New Product'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}
          <Box display="flex" flexDirection="column" gap={2.5}>
            <TextField
              label="Product Name"
              fullWidth
              value={formData.name}
              onChange={handleChange('name')}
              error={!!errors.name}
              helperText={errors.name}
              autoFocus
              required
            />
            <TextField
              label="Price"
              type="number"
              fullWidth
              value={formData.price}
              onChange={handleChange('price')}
              error={!!errors.price}
              helperText={errors.price}
              inputProps={{ min: 0, step: 0.01 }}
              required
            />
            <TextField
              label="Stock"
              type="number"
              fullWidth
              value={formData.stock}
              onChange={handleChange('stock')}
              error={!!errors.stock}
              helperText={errors.stock}
              inputProps={{ min: 0, step: 1 }}
              required
            />
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
            disabled={submitting}
            sx={{ 
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
            }}
          >
            {submitting ? 'Saving...' : product ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProductFormDialog;
