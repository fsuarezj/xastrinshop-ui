import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  FormControlLabel,
  Switch,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../api/products';
import { ProductList } from '../components/products/ProductList';
import { ProductForm } from '../components/products/ProductForm';
import { ProductDetail } from '../components/products/ProductDetail';
import type { Product, ProductFormData } from '../types/product';

export const ProductsPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string>('');

  // Queries
  const {
    data: products = [],
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getProducts,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: productsApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsFormOpen(false);
      setEditingProduct(null);
      setError('');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || t('products.errors.createFailed'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductFormData }) =>
      productsApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsFormOpen(false);
      setEditingProduct(null);
      setError('');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || t('products.errors.updateFailed'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: productsApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setError('');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || t('products.errors.deleteFailed'));
    },
  });

  // Filtered products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = !showActiveOnly || product.is_active;
    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleCreate = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = (product: Product) => {
    if (window.confirm(t('products.confirmDelete', { name: product.name }))) {
      deleteMutation.mutate(product.id!);
    }
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  const handleSubmit = async (data: ProductFormData) => {
    if (editingProduct) {
      await updateMutation.mutateAsync({ id: editingProduct.id!, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    setError('');
  };

  const isLoadingMutation = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {t('products.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          disabled={isLoadingMutation}
        >
          {t('products.create')}
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
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            placeholder={t('products.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 200 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
              />
            }
            label={t('products.showActiveOnly')}
          />
        </Box>
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
          {t('products.errors.fetchFailed')}
        </Alert>
      )}

      {/* Products List */}
      {!isLoading && !fetchError && (
        <ProductList
          products={filteredProducts}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          isLoading={isLoadingMutation}
        />
      )}

      {/* Product Form Dialog */}
      <ProductForm
        open={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        product={editingProduct}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Product Detail Dialog */}
      <ProductDetail
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        product={selectedProduct}
      />
    </Box>
  );
}; 