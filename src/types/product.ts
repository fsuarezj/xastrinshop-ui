export interface Product {
  id?: number;
  name: string;
  price: number;
  description?: string;
  picture_url?: string;
  is_active?: boolean;
}

export interface ProductFormData {
  name: string;
  price: number;
  description: string;
  picture_url: string;
  is_active: boolean;
}

export interface ProductFilters {
  search?: string;
  is_active?: boolean;
} 