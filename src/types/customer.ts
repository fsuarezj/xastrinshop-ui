export interface Customer {
  id?: number;
  name?: string;
  phone_number: string;
  address?: string;
  notes?: string;
}

export interface CustomerFormData {
  name: string;
  phone_number: string;
  address: string;
  notes: string;
}

export interface CustomerFilters {
  search?: string;
} 