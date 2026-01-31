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
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { orderApi } from '../../services/api';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import OrderFormDialog from './OrderFormDialog';
import type { Order } from '../../types';

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderApi.getAll();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAddClick = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleOrderCreated = () => {
    fetchOrders();
    handleDialogClose();
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) return <Loading message="Loading orders..." />;

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
          <ShoppingCartIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" fontWeight={600}>
            Orders
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
          Create Order
        </Button>
      </Box>

      {error && <ErrorMessage message={error} />}

      {!error && orders.length === 0 && (
        <Paper
          sx={{
            p: 8,
            textAlign: 'center',
            backgroundColor: 'grey.50',
            borderRadius: 3,
          }}
        >
          <ShoppingCartIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No orders yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Create your first order to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Create Order
          </Button>
        </Paper>
      )}

      {!error && orders.length > 0 && (
        <>
          {isMobile ? (
            // Mobile Card View
            <Stack spacing={2}>
              {orders.map((order) => (
                <Card
                  key={order.productId}
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
                    <Box mb={2}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {order.productName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Order #{order.orderId}
                      </Typography>
                    </Box>
                    <Stack spacing={1}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          Quantity
                        </Typography>
                        <Chip
                          label={`${order.quantity} units`}
                          size="small"
                          color="primary"
                        />
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          Total Price
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {formatPrice(order.totalPrice)}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          Order Date
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(order.orderDate)}
                        </Typography>
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
                      Order ID
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                      Product
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                      Quantity
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                      Total Price
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                      Order Date
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow
                      key={order.orderId}
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
                        <Typography variant="body2" color="text.secondary">
                          #{order.orderId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" fontWeight={500}>
                          {order.productName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${order.quantity} units`}
                          size="small"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" fontWeight={600}>
                          {formatPrice(order.totalPrice)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(order.orderDate)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      <OrderFormDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onCreated={handleOrderCreated}
      />
    </Box>
  );
};

export default OrderList;
