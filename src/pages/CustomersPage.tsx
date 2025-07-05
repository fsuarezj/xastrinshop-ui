import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '../api/customers';
import { CustomerList } from '../components/customers/CustomerList';
import { CustomerForm } from '../components/customers/CustomerForm';
import { CustomerDetail } from '../components/customers/CustomerDetail';
import type { Customer, CustomerFormData } from '../types/customer';

export const CustomersPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState<string>('');

  // Queries
  const {
    data: customers = [],
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ['customers'],
    queryFn: customersApi.getCustomers,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: customersApi.createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsFormOpen(false);
      setEditingCustomer(null);
      setError('');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || t('customers.errors.createFailed'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CustomerFormData }) =>
      customersApi.updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsFormOpen(false);
      setEditingCustomer(null);
      setError('');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || t('customers.errors.updateFailed'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: customersApi.deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setError('');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || t('customers.errors.deleteFailed'));
    },
  });

  // Filtered customers
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = 
      (customer.name && customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      customer.phone_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.address && customer.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.notes && customer.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // Handlers
  const handleCreate = () => {
    setEditingCustomer(null);
    setIsFormOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleDelete = (customer: Customer) => {
    const customerName = customer.name || customer.phone_number;
    if (window.confirm(t('customers.confirmDelete', { name: customerName }))) {
      deleteMutation.mutate(customer.id!);
    }
  };

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
  };

  const handleSubmit = async (data: CustomerFormData) => {
    if (editingCustomer) {
      await updateMutation.mutateAsync({ id: editingCustomer.id!, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCustomer(null);
    setError('');
  };

  const isLoadingMutation = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {t('customers.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          disabled={isLoadingMutation}
        >
          {t('customers.create')}
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
        <TextField
          placeholder={t('customers.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />
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
          {t('customers.errors.fetchFailed')}
        </Alert>
      )}

      {/* Customers List */}
      {!isLoading && !fetchError && (
        <CustomerList
          customers={filteredCustomers}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          isLoading={isLoadingMutation}
        />
      )}

      {/* Customer Form Dialog */}
      <CustomerForm
        open={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        customer={editingCustomer}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Customer Detail Dialog */}
      <CustomerDetail
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        customer={selectedCustomer}
      />
    </Box>
  );
}; 