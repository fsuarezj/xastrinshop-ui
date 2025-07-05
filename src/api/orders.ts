import { apiClient } from './client';
import type { Order, OrderFormData, OrderStatus } from '../types/order';

export const ordersApi = {
  // Get all orders
  getOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get('/api/orders');
    return response.data;
  },

  // Get a single order by ID
  getOrder: async (id: number): Promise<Order> => {
    const response = await apiClient.get(`/api/orders/${id}`);
    return response.data;
  },

  // Create a new order
  createOrder: async (order: OrderFormData): Promise<Order> => {
    const response = await apiClient.post('/api/orders', order);
    return response.data;
  },

  // Update order payment status
  updateOrderPaymentStatus: async (id: number, payment_status: 'notPaid' | 'paid'): Promise<void> => {
    await apiClient.put(`/api/orders/${id}/payment_status`, { payment_status });
  },

  // Update order delivery status
  updateOrderDeliveryStatus: async (id: number, delivery_status: 'notDelivered' | 'delivered'): Promise<void> => {
    await apiClient.put(`/api/orders/${id}/delivery_status`, { delivery_status });
  },

  // Update order type
  updateOrderType: async (id: number, order_type: 'pickup' | 'delivery'): Promise<void> => {
    await apiClient.put(`/api/orders/${id}/order_type`, { order_type });
  },

  // Delete an order
  deleteOrder: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/orders/${id}`);
  },
}; 