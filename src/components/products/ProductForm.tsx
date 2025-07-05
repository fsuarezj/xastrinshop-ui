import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Box,
  CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Product, ProductFormData } from '../../types/product';

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (product: ProductFormData) => Promise<void>;
  product?: Product | null;
  isLoading?: boolean;
}

const initialFormData: ProductFormData = {
  name: '',
  price: 0,
  description: '',
  picture_url: '',
  is_active: true,
};

export const ProductForm: React.FC<ProductFormProps> = ({
  open,
  onClose,
  onSubmit,
  product,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || 0,
        description: product.description || '',
        picture_url: product.picture_url || '',
        is_active: product.is_active ?? true,
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [product, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('products.errors.nameRequired');
    } else if (formData.name.length > 80) {
      newErrors.name = t('products.errors.nameTooLong');
    }

    if (formData.price < 0) {
      newErrors.price = t('products.errors.priceInvalid');
    }

    if (formData.description && formData.description.length > 255) {
      newErrors.description = t('products.errors.descriptionTooLong');
    }

    if (formData.picture_url && formData.picture_url.length > 255) {
      newErrors.picture_url = t('products.errors.pictureUrlTooLong');
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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, name: e.target.value }));
    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setFormData(prev => ({ ...prev, price: value }));
    if (errors.price) setErrors(prev => ({ ...prev, price: '' }));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, description: e.target.value }));
    if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
  };

  const handlePictureUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, picture_url: e.target.value }));
    if (errors.picture_url) setErrors(prev => ({ ...prev, picture_url: '' }));
  };

  const handleActiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, is_active: e.target.checked }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {product ? t('products.edit') : t('products.create')}
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('products.name')}
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleNameChange}
            error={!!errors.name}
            helperText={errors.name}
            disabled={isLoading}
            required
          />
          <TextField
            margin="dense"
            name="price"
            label={t('products.price')}
            type="number"
            fullWidth
            variant="outlined"
            value={formData.price}
            onChange={handlePriceChange}
            error={!!errors.price}
            helperText={errors.price}
            disabled={isLoading}
            required
            inputProps={{ min: 0, step: 0.01 }}
          />
          <TextField
            margin="dense"
            label={t('products.description')}
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={formData.description}
            onChange={handleDescriptionChange}
            error={!!errors.description}
            helperText={errors.description}
            disabled={isLoading}
          />
          <TextField
            margin="dense"
            label={t('products.picture')}
            fullWidth
            variant="outlined"
            value={formData.picture_url}
            onChange={handlePictureUrlChange}
            error={!!errors.picture_url}
            helperText={errors.picture_url}
            disabled={isLoading}
            placeholder="https://example.com/image.jpg"
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_active}
                onChange={handleActiveChange}
                disabled={isLoading}
              />
            }
            label={t('products.active')}
            sx={{ mt: 1 }}
          />
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