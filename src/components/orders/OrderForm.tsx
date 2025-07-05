import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { customersApi } from '../../api/customers';
import { productsApi } from '../../api/products';
import type { Order, OrderFormData, OrderItem } from '../../types/order';
import type { Customer } from '../../types/customer';
import type { Product } from '../../types/product';

interface OrderFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (order: OrderFormData) => Promise<void>;
  order?: Order | null;
  isLoading?: boolean;
}

const initialFormData: OrderFormData = {
  customer_id: 0,
  order_type: 'pickup',
  payment_status: 'notPaid',
  delivery_status: 'notDelivered',
  datetime: new Date().toISOString().slice(0, 16),
  items: [],
};

export const OrderForm: React.FC<OrderFormProps> = ({
  open,
  onClose,
  onSubmit,
  order,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<OrderFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newItem, setNewItem] = useState<OrderItem>({ product_id: 0, quantity: 1 });

  // Fetch customers and products
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: customersApi.getCustomers,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getProducts,
  });

  useEffect(() => {
    if (order) {
      setFormData({
        customer_id: order.customer_id,
        order_type: order.order_type,
        payment_status: order.payment_status,
        delivery_status: order.delivery_status,
        datetime: order.datetime ? new Date(order.datetime).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        items: [...order.items],
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [order, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_id) {
      newErrors.customer_id = t('orders.errors.customerRequired');
    }

    if (formData.items.length === 0) {
      newErrors.items = t('orders.errors.itemsRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleAddItem = () => {
    if (newItem.product_id && newItem.quantity > 0) {
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, { ...newItem }],
      }));
      setNewItem({ product_id: 0, quantity: 1 });
    }
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const getProductName = (productId: number) => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'Unknown Product';
  };

  const getCustomerName = (customerId: number) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || customer?.phone_number || 'Unknown Customer';
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      const product = products.find(p => p.id === item.product_id);
      return total + (product?.price || 0) * item.quantity;
    }, 0);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {order ? t('orders.edit') : t('orders.create')}
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            {/* Customer Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.customer_id}>
                <InputLabel>{t('orders.customer')}</InputLabel>
                <Select
                  value={formData.customer_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_id: e.target.value as number }))}
                  disabled={isLoading}
                  required
                >
                  {customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name || customer.phone_number}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Order Type */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{t('orders.orderType')}</InputLabel>
                <Select
                  value={formData.order_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, order_type: e.target.value as 'pickup' | 'delivery' }))}
                  disabled={isLoading}
                >
                  <MenuItem value="pickup">{t('orders.pickup')}</MenuItem>
                  <MenuItem value="delivery">{t('orders.delivery')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Payment Status */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{t('orders.paymentStatus')}</InputLabel>
                <Select
                  value={formData.payment_status}
                  onChange={(e) => setFormData(prev => ({ ...prev, payment_status: e.target.value as 'notPaid' | 'paid' }))}
                  disabled={isLoading}
                >
                  <MenuItem value="notPaid">{t('orders.notPaid')}</MenuItem>
                  <MenuItem value="paid">{t('orders.paid')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Delivery Status */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{t('orders.deliveryStatus')}</InputLabel>
                <Select
                  value={formData.delivery_status}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_status: e.target.value as 'notDelivered' | 'delivered' }))}
                  disabled={isLoading}
                >
                  <MenuItem value="notDelivered">{t('orders.notDelivered')}</MenuItem>
                  <MenuItem value="delivered">{t('orders.delivered')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* DateTime */}
            <Grid item xs={12}>
              <TextField
                label={t('orders.datetime')}
                type="datetime-local"
                fullWidth
                value={formData.datetime}
                onChange={(e) => setFormData(prev => ({ ...prev, datetime: e.target.value }))}
                disabled={isLoading}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Order Items */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {t('orders.items')}
              </Typography>
              
              {/* Add Item */}
              <Box display="flex" gap={2} mb={2}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>{t('orders.product')}</InputLabel>
                  <Select
                    value={newItem.product_id}
                    onChange={(e) => setNewItem(prev => ({ ...prev, product_id: e.target.value as number }))}
                    disabled={isLoading}
                  >
                    {products.map((product) => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label={t('orders.quantity')}
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  disabled={isLoading}
                  inputProps={{ min: 1 }}
                  sx={{ width: 100 }}
                />
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddItem}
                  disabled={isLoading || !newItem.product_id}
                >
                  {t('orders.addItem')}
                </Button>
              </Box>

              {/* Items Table */}
              {formData.items.length > 0 && (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('orders.product')}</TableCell>
                        <TableCell align="right">{t('orders.quantity')}</TableCell>
                        <TableCell align="right">{t('orders.price')}</TableCell>
                        <TableCell align="right">{t('orders.subtotal')}</TableCell>
                        <TableCell align="center">{t('app.actions')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.items.map((item, index) => {
                        const product = products.find(p => p.id === item.product_id);
                        const subtotal = (product?.price || 0) * item.quantity;
                        return (
                          <TableRow key={index}>
                            <TableCell>{product?.name || 'Unknown Product'}</TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">
                              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product?.price || 0)}
                            </TableCell>
                            <TableCell align="right">
                              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(subtotal)}
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveItem(index)}
                                color="error"
                                disabled={isLoading}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Total */}
              {formData.items.length > 0 && (
                <Box display="flex" justifyContent="flex-end" mt={2}>
                  <Typography variant="h6">
                    {t('orders.total')}: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateTotal())}
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            {t('app.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? t('app.loading') : t('app.save')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}; 