import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  Typography,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { Product } from '../../types/product';

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onView: (product: Product) => void;
  isLoading?: boolean;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  onEdit,
  onDelete,
  onView,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  if (products.length === 0 && !isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <Typography variant="h6" color="textSecondary">
          {t('products.noProducts')}
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} elevation={1}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('products.image')}</TableCell>
            <TableCell>{t('products.name')}</TableCell>
            <TableCell>{t('products.price')}</TableCell>
            <TableCell>{t('products.description')}</TableCell>
            <TableCell>{t('products.status')}</TableCell>
            <TableCell align="center">{t('app.actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} hover>
              <TableCell>
                {product.picture_url ? (
                  <Avatar
                    src={product.picture_url}
                    alt={product.name}
                    sx={{ width: 40, height: 40 }}
                  >
                    {product.name.charAt(0).toUpperCase()}
                  </Avatar>
                ) : (
                  <Avatar sx={{ width: 40, height: 40 }}>
                    {product.name.charAt(0).toUpperCase()}
                  </Avatar>
                )}
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight="medium">
                  {product.name}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight="medium" color="primary">
                  {formatPrice(product.price)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="textSecondary">
                  {truncateText(product.description || '')}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={product.is_active ? t('products.active') : t('products.inactive')}
                  color={product.is_active ? 'success' : 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell align="center">
                <Box display="flex" gap={1} justifyContent="center">
                  <Tooltip title={t('app.view')}>
                    <IconButton
                      size="small"
                      onClick={() => onView(product)}
                      color="primary"
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('app.edit')}>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(product)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('app.delete')}>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(product)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}; 