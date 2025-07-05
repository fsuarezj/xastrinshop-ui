import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import {
  LocalShipping as DeliveryIcon,
  Store as PickupIcon,
  Person as CustomerIcon,
  Schedule as DateTimeIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { customersApi } from '../../api/customers';
import { productsApi } from '../../api/products';
import type { Order } from '../../types/order';
import type { Customer } from '../../types/customer';
import type { Product } from '../../types/product';

interface OrderDetailProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
}

export const OrderDetail: React.FC<OrderDetailProps> = ({
  open,
  onClose,
  order,
}) => {
  const { t } = useTranslation();

  // Fetch customers and products for display
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: customersApi.getCustomers,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getProducts,
  });

  if (!order) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCustomer = (customerId: number): Customer | undefined => {
    return customers.find(c => c.id === customerId);
  };

  const getProduct = (productId: number): Product | undefined => {
    return products.find(p => p.id === productId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'delivered':
        return 'success';
      case 'not_paid':
      case 'not_delivered':
        return 'warning';
      default:
        return 'default';
    }
  };

  const customer = getCustomer(order.customer_id);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Box>
              <Typography variant="h6">
                {t('orders.order')} #{order.id}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {order.datetime ? formatDate(order.datetime) : t('orders.noDate')}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* Order Info */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              {t('orders.orderInfo')}
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  {order.order_type === 'delivery' ? <DeliveryIcon /> : <PickupIcon />}
                  <Chip
                    label={t(`orders.${order.order_type}`)}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  {t('orders.paymentStatus')}
                </Typography>
                <Chip
                  label={t(`orders.${order.payment_status}`)}
                  color={getStatusColor(order.payment_status)}
                  size="small"
                />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  {t('orders.deliveryStatus')}
                </Typography>
                <Chip
                  label={t(`orders.${order.delivery_status}`)}
                  color={getStatusColor(order.delivery_status)}
                  size="small"
                />
              </Box>
            </Box>
          </Grid>

          {/* Customer Info */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              {t('orders.customerInfo')}
            </Typography>
            {customer && (
              <Box display="flex" flexDirection="column" gap={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CustomerIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {customer.name || t('customers.noName')}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  📞 {customer.phone_number}
                </Typography>
                {customer.address && (
                  <Typography variant="body2" color="textSecondary">
                    📍 {customer.address}
                  </Typography>
                )}
                {customer.notes && (
                  <Typography variant="body2" color="textSecondary">
                    📝 {customer.notes}
                  </Typography>
                )}
              </Box>
            )}
          </Grid>

          {/* Order Items */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              {t('orders.items')}
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('orders.product')}</TableCell>
                    <TableCell align="right">{t('orders.quantity')}</TableCell>
                    <TableCell align="right">{t('orders.price')}</TableCell>
                    <TableCell align="right">{t('orders.subtotal')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item, index) => {
                    const product = getProduct(item.product_id);
                    const subtotal = (product?.price || 0) * item.quantity;
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {product?.name || 'Unknown Product'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {item.quantity}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatPrice(product?.price || 0)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium">
                            {formatPrice(subtotal)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Total */}
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end">
              <Typography variant="h5" fontWeight="bold" color="primary">
                {t('orders.total')}: {formatPrice(order.total_amount || 0)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}; 