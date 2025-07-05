export interface OrderItem {
  product_id: number;
  quantity: number;
}

export interface Order {
  id?: number;
  customer_id: number;
  order_type: 'pickup' | 'delivery';
  payment_status: 'notPaid' | 'paid';
  delivery_status: 'notDelivered' | 'delivered';
  datetime?: string;
  items: OrderItem[];
  total_amount?: number;
}

export interface OrderFormData {
  customer_id: number;
  order_type: 'pickup' | 'delivery';
  payment_status: 'notPaid' | 'paid';
  delivery_status: 'notDelivered' | 'delivered';
  datetime: string;
  items: OrderItem[];
}

export interface OrderStatus {
  payment_status: 'notPaid' | 'paid';
  delivery_status: 'notDelivered' | 'delivered';
}

export interface OrderFilters {
  search?: string;
  payment_status?: 'notPaid' | 'paid';
  delivery_status?: 'notDelivered' | 'delivered';
  order_type?: 'pickup' | 'delivery';
} 