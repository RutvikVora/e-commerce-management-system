import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Chip,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { productApi } from '../../services/api';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import ProductFormDialog from './ProductFormDialog';
import type { Product } from '../../types';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productApi.getAll();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddClick = () => {
    setEditingProduct(null);
    setDialogOpen(true);
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingProduct(null);
  };

  const handleProductSaved = () => {
    fetchProducts();
    handleDialogClose();
  };

  const getStockColor = (stock: number): 'success' | 'warning' | 'error' => {
    if (stock > 50) return 'success';
    if (stock > 10) return 'warning';
    return 'error';
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (loading) return <Loading message="Loading products..." />;

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <InventoryIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" fontWeight={600}>
            Products
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
          size={isMobile ? 'medium' : 'large'}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
          }}
        >
          Add Product
        </Button>
      </Box>

      {error && <ErrorMessage message={error} />}

      {!error && products.length === 0 && (
        <Paper
          sx={{
            p: 8,
            textAlign: 'center',
            backgroundColor: 'grey.50',
            borderRadius: 3,
          }}
        >
          <InventoryIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No products yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Start by adding your first product
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Add Product
          </Button>
        </Paper>
      )}

      {!error && products.length > 0 && (
        <>
          {isMobile ? (
            // Mobile Card View
            <Stack spacing={2}>
              {products.map((product) => (
                <Card
                  key={product.productId}
                  elevation={2}
                  sx={{
                    borderRadius: 2,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      mb={2}
                    >
                      <Typography variant="h6" fontWeight={600}>
                        {product.name}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(product)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Box>
                    <Stack spacing={1}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          Price
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {formatPrice(product.price)}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          Stock
                        </Typography>
                        <Chip
                          label={`${product.stock} units`}
                          size="small"
                          color={getStockColor(product.stock)}
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            // Desktop Table View
            <TableContainer
              component={Paper}
              elevation={2}
              sx={{ borderRadius: 3, overflow: 'hidden' }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                      Product Name
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                      Price
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                      Stock
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: 'white', fontWeight: 600 }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product, index) => (
                    <TableRow
                      key={product.productId}
                      sx={{
                        '&:nth-of-type(even)': {
                          backgroundColor: 'grey.50',
                        },
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <TableCell>
                        <Typography variant="body1" fontWeight={500}>
                          {product.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" fontWeight={600}>
                          {formatPrice(product.price)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${product.stock} units`}
                          size="small"
                          color={getStockColor(product.stock)}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleEditClick(product)}
                          color="primary"
                          sx={{
                            '&:hover': {
                              backgroundColor: 'primary.light',
                              color: 'white',
                            },
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      <ProductFormDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSaved={handleProductSaved}
        product={editingProduct}
      />
    </Box>
  );
};

export default ProductList;
