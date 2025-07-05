import { apiClient } from './client';
import type { Product, ProductFormData } from '../types/product';

export const productsApi = {
  // Get all products
  getProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get('/api/products');
    return response.data;
  },

  // Get a single product by ID
  getProduct: async (id: number): Promise<Product> => {
    const response = await apiClient.get(`/api/products/${id}`);
    return response.data;
  },

  // Create a new product
  createProduct: async (product: ProductFormData): Promise<Product> => {
    const response = await apiClient.post('/api/products', product);
    return response.data;
  },

  // Update an existing product
  updateProduct: async (id: number, product: ProductFormData): Promise<Product> => {
    const response = await apiClient.put(`/api/products/${id}`, product);
    return response.data;
  },

  // Delete a product
  deleteProduct: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/products/${id}`);
  },
}; 