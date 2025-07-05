import { apiClient } from './client';
import type { Customer, CustomerFormData } from '../types/customer';

export const customersApi = {
  // Get all customers
  getCustomers: async (): Promise<Customer[]> => {
    const response = await apiClient.get('/api/customers');
    return response.data;
  },

  // Get a single customer by ID
  getCustomer: async (id: number): Promise<Customer> => {
    const response = await apiClient.get(`/api/customers/${id}`);
    return response.data;
  },

  // Create a new customer
  createCustomer: async (customer: CustomerFormData): Promise<Customer> => {
    const response = await apiClient.post('/api/customers', customer);
    return response.data;
  },

  // Update an existing customer
  updateCustomer: async (id: number, customer: CustomerFormData): Promise<Customer> => {
    const response = await apiClient.put(`/api/customers/${id}`, customer);
    return response.data;
  },

  // Delete a customer
  deleteCustomer: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/customers/${id}`);
  },
}; 