import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  Typography,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  LocalShipping as DeliveryIcon,
  Store as PickupIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '../../api/customers';
import { productsApi } from '../../api/products';
import { ordersApi } from '../../api/orders';
import type { Order } from '../../types/order';
import type { Customer } from '../../types/customer';
import type { Product } from '../../types/product';

interface OrderListProps {
  orders: Order[];
  onDelete: (order: Order) => void;
  onView: (order: Order) => void;
  isLoading?: boolean;
}

interface EditingOrder {
  id: number;
  order_type: 'pickup' | 'delivery';
  payment_status: 'notPaid' | 'paid';
  delivery_status: 'notDelivered' | 'delivered';
}

export const OrderList: React.FC<OrderListProps> = ({
  orders,
  onDelete,
  onView,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [editingOrder, setEditingOrder] = useState<EditingOrder | null>(null);

  // Fetch customers and products for display
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: customersApi.getCustomers,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getProducts,
  });

  // Mutations for updating order fields
  const updatePaymentStatusMutation = useMutation({
    mutationFn: ({ id, payment_status }: { id: number; payment_status: 'notPaid' | 'paid' }) =>
      ordersApi.updateOrderPaymentStatus(id, payment_status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setEditingOrder(null);
    },
  });

  const updateDeliveryStatusMutation = useMutation({
    mutationFn: ({ id, delivery_status }: { id: number; delivery_status: 'notDelivered' | 'delivered' }) =>
      ordersApi.updateOrderDeliveryStatus(id, delivery_status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setEditingOrder(null);
    },
  });

  const updateOrderTypeMutation = useMutation({
    mutationFn: ({ id, order_type }: { id: number; order_type: 'pickup' | 'delivery' }) =>
      ordersApi.updateOrderType(id, order_type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setEditingOrder(null);
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCustomerName = (customerId: number) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || customer?.phone_number || 'Unknown Customer';
  };

  const getOrderTypeIcon = (orderType: string) => {
    return orderType === 'delivery' ? <DeliveryIcon /> : <PickupIcon />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'delivered':
        return 'success';
      case 'notPaid':
      case 'notDelivered':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleStartEdit = (order: Order) => {
    setEditingOrder({
      id: order.id!,
      order_type: order.order_type,
      payment_status: order.payment_status,
      delivery_status: order.delivery_status,
    });
  };

  const handleCancelEdit = () => {
    setEditingOrder(null);
  };

  const handleSaveEdit = () => {
    if (!editingOrder) return;

    const originalOrder = orders.find(o => o.id === editingOrder.id);
    if (!originalOrder) return;

    // Update only changed fields
    if (originalOrder.order_type !== editingOrder.order_type) {
      updateOrderTypeMutation.mutate({ id: editingOrder.id, order_type: editingOrder.order_type });
    }
    if (originalOrder.payment_status !== editingOrder.payment_status) {
      updatePaymentStatusMutation.mutate({ id: editingOrder.id, payment_status: editingOrder.payment_status });
    }
    if (originalOrder.delivery_status !== editingOrder.delivery_status) {
      updateDeliveryStatusMutation.mutate({ id: editingOrder.id, delivery_status: editingOrder.delivery_status });
    }
  };

  const isEditing = (orderId: number) => editingOrder?.id === orderId;
  const isUpdating = updatePaymentStatusMutation.isPending || updateDeliveryStatusMutation.isPending || updateOrderTypeMutation.isPending;

  if (orders.length === 0 && !isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <Typography variant="h6" color="textSecondary">
          {t('orders.noOrders')}
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} elevation={1}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('orders.id')}</TableCell>
            <TableCell>{t('orders.customer')}</TableCell>
            <TableCell>{t('orders.orderType')}</TableCell>
            <TableCell>{t('orders.paymentStatus')}</TableCell>
            <TableCell>{t('orders.deliveryStatus')}</TableCell>
            <TableCell>{t('orders.datetime')}</TableCell>
            <TableCell align="right">{t('orders.total')}</TableCell>
            <TableCell align="center">{t('app.actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => {
            const editing = isEditing(order.id!);
            const orderData = editing ? editingOrder! : order;

            return (
              <TableRow key={order.id} hover>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="medium">
                    #{order.id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {getCustomerName(order.customer_id)}
                  </Typography>
                </TableCell>
                <TableCell>
                  {editing ? (
                    <FormControl size="small" fullWidth>
                      <Select
                        value={orderData.order_type}
                        onChange={(e) => setEditingOrder(prev => prev ? { ...prev, order_type: e.target.value as 'pickup' | 'delivery' } : null)}
                        disabled={isUpdating}
                      >
                        <MenuItem value="pickup">{t('orders.pickup')}</MenuItem>
                        <MenuItem value="delivery">{t('orders.delivery')}</MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    <Box display="flex" alignItems="center" gap={1}>
                      {getOrderTypeIcon(order.order_type)}
                      <Chip
                        label={t(`orders.${order.order_type}`)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  {editing ? (
                    <FormControl size="small" fullWidth>
                      <Select
                        value={orderData.payment_status}
                        onChange={(e) => setEditingOrder(prev => prev ? { ...prev, payment_status: e.target.value as 'notPaid' | 'paid' } : null)}
                        disabled={isUpdating}
                      >
                        <MenuItem value="notPaid">{t('orders.notPaid')}</MenuItem>
                        <MenuItem value="paid">{t('orders.paid')}</MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    <Chip
                      label={t(`orders.${order.payment_status}`)}
                      color={getStatusColor(order.payment_status)}
                      size="small"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {editing ? (
                    <FormControl size="small" fullWidth>
                      <Select
                        value={orderData.delivery_status}
                        onChange={(e) => setEditingOrder(prev => prev ? { ...prev, delivery_status: e.target.value as 'notDelivered' | 'delivered' } : null)}
                        disabled={isUpdating}
                      >
                        <MenuItem value="notDelivered">{t('orders.notDelivered')}</MenuItem>
                        <MenuItem value="delivered">{t('orders.delivered')}</MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    <Chip
                      label={t(`orders.${order.delivery_status}`)}
                      color={getStatusColor(order.delivery_status)}
                      size="small"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    {order.datetime ? formatDate(order.datetime) : '-'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="medium" color="primary">
                    {formatPrice(order.total_amount || 0)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" gap={1} justifyContent="center">
                    <Tooltip title={t('app.view')}>
                      <IconButton
                        size="small"
                        onClick={() => onView(order)}
                        color="primary"
                        disabled={editing}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    {editing ? (
                      <>
                        <Tooltip title={t('app.save')}>
                          <IconButton
                            size="small"
                            onClick={handleSaveEdit}
                            color="success"
                            disabled={isUpdating}
                          >
                            {isUpdating ? <CircularProgress size={16} /> : <SaveIcon />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('app.cancel')}>
                          <IconButton
                            size="small"
                            onClick={handleCancelEdit}
                            color="default"
                            disabled={isUpdating}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      <Tooltip title={t('app.edit')}>
                        <IconButton
                          size="small"
                          onClick={() => handleStartEdit(order)}
                          color="primary"
                          disabled={isUpdating}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title={t('app.delete')}>
                      <IconButton
                        size="small"
                        onClick={() => onDelete(order)}
                        color="error"
                        disabled={editing || isUpdating}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}; 