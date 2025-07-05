import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Chip,
  Grid,
  Divider,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Product } from '../../types/product';

interface ProductDetailProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  open,
  onClose,
  product,
}) => {
  const { t } = useTranslation();

  if (!product) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          {product.picture_url ? (
            <Avatar
              src={product.picture_url}
              alt={product.name}
              sx={{ width: 60, height: 60 }}
            >
              {product.name.charAt(0).toUpperCase()}
            </Avatar>
          ) : (
            <Avatar sx={{ width: 60, height: 60 }}>
              {product.name.charAt(0).toUpperCase()}
            </Avatar>
          )}
          <Box>
            <Typography variant="h6">{product.name}</Typography>
            <Chip
              label={product.is_active ? t('products.active') : t('products.inactive')}
              color={product.is_active ? 'success' : 'default'}
              size="small"
            />
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              {t('products.price')}
            </Typography>
            <Typography variant="h5" color="primary" fontWeight="bold">
              {formatPrice(product.price)}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              {t('products.id')}
            </Typography>
            <Typography variant="body1">
              #{product.id}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              {t('products.description')}
            </Typography>
            <Typography variant="body1">
              {product.description || t('products.noDescription')}
            </Typography>
          </Grid>
          {product.picture_url && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                {t('products.picture')}
              </Typography>
              <Box
                component="img"
                src={product.picture_url}
                alt={product.name}
                sx={{
                  maxWidth: '100%',
                  maxHeight: 300,
                  borderRadius: 1,
                  objectFit: 'cover',
                }}
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {t('app.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 