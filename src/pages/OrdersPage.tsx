import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/orders';
import { OrderList } from '../components/orders/OrderList';
import { OrderForm } from '../components/orders/OrderForm';
import { OrderDetail } from '../components/orders/OrderDetail';
import type { Order, OrderFormData, OrderFilters } from '../types/order';

export const OrdersPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  // State
  const [filters, setFilters] = useState<OrderFilters>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string>('');

  // Queries
  const {
    data: orders = [],
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.getOrders,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: ordersApi.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setIsFormOpen(false);
      setError('');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || t('orders.errors.createFailed'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ordersApi.deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setError('');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || t('orders.errors.deleteFailed'));
    },
  });

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = !filters.search || 
      order.id?.toString().includes(filters.search) ||
      order.customer_id.toString().includes(filters.search);
    
    const matchesPaymentStatus = !filters.payment_status || 
      order.payment_status === filters.payment_status;
    
    const matchesDeliveryStatus = !filters.delivery_status || 
      order.delivery_status === filters.delivery_status;
    
    const matchesOrderType = !filters.order_type || 
      order.order_type === filters.order_type;

    return matchesSearch && matchesPaymentStatus && matchesDeliveryStatus && matchesOrderType;
  });

  // Handlers
  const handleCreate = () => {
    setIsFormOpen(true);
  };

  const handleDelete = (order: Order) => {
    if (window.confirm(t('orders.confirmDelete', { id: order.id }))) {
      deleteMutation.mutate(order.id!);
    }
  };

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleSubmit = async (data: OrderFormData) => {
    await createMutation.mutateAsync(data);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setError('');
  };

  const isLoadingMutation = createMutation.isPending || deleteMutation.isPending;

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {t('orders.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          disabled={isLoadingMutation}
        >
          {t('orders.create')}
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              placeholder={t('orders.searchPlaceholder')}
              value={filters.search || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>{t('orders.paymentStatus')}</InputLabel>
              <Select
                value={filters.payment_status || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, payment_status: e.target.value as any }))}
                label={t('orders.paymentStatus')}
              >
                <MenuItem value="">{t('orders.all')}</MenuItem>
                <MenuItem value="notPaid">{t('orders.notPaid')}</MenuItem>
                <MenuItem value="paid">{t('orders.paid')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>{t('orders.deliveryStatus')}</InputLabel>
              <Select
                value={filters.delivery_status || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, delivery_status: e.target.value as any }))}
                label={t('orders.deliveryStatus')}
              >
                <MenuItem value="">{t('orders.all')}</MenuItem>
                <MenuItem value="notDelivered">{t('orders.notDelivered')}</MenuItem>
                <MenuItem value="delivered">{t('orders.delivered')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>{t('orders.orderType')}</InputLabel>
              <Select
                value={filters.order_type || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, order_type: e.target.value as any }))}
                label={t('orders.orderType')}
              >
                <MenuItem value="">{t('orders.all')}</MenuItem>
                <MenuItem value="pickup">{t('orders.pickup')}</MenuItem>
                <MenuItem value="delivery">{t('orders.delivery')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Loading State */}
      {isLoading && (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {fetchError && (
        <Alert severity="error">
          {t('orders.errors.fetchFailed')}
        </Alert>
      )}

      {/* Orders List */}
      {!isLoading && !fetchError && (
        <OrderList
          orders={filteredOrders}
          onDelete={handleDelete}
          onView={handleView}
          isLoading={isLoadingMutation}
        />
      )}

      {/* Order Form Dialog */}
      <OrderForm
        open={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        order={null}
        isLoading={createMutation.isPending}
      />

      {/* Order Detail Dialog */}
      <OrderDetail
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        order={selectedOrder}
      />
    </Box>
  );
}; 