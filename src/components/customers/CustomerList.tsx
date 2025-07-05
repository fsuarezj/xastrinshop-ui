import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Typography,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { Customer } from '../../types/customer';

interface CustomerListProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onView: (customer: Customer) => void;
  isLoading?: boolean;
}

export const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  onEdit,
  onDelete,
  onView,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  if (customers.length === 0 && !isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <Typography variant="h6" color="textSecondary">
          {t('customers.noCustomers')}
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} elevation={1}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('customers.avatar')}</TableCell>
            <TableCell>{t('customers.name')}</TableCell>
            <TableCell>{t('customers.phone')}</TableCell>
            <TableCell>{t('customers.address')}</TableCell>
            <TableCell>{t('customers.notes')}</TableCell>
            <TableCell align="center">{t('app.actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id} hover>
              <TableCell>
                <Avatar sx={{ width: 40, height: 40 }}>
                  {getInitials(customer.name || '')}
                </Avatar>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight="medium">
                  {customer.name || t('customers.noName')}
                </Typography>
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  <PhoneIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {customer.phone_number}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="textSecondary">
                  {truncateText(customer.address || '')}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="textSecondary">
                  {truncateText(customer.notes || '')}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Box display="flex" gap={1} justifyContent="center">
                  <Tooltip title={t('app.view')}>
                    <IconButton
                      size="small"
                      onClick={() => onView(customer)}
                      color="primary"
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('app.edit')}>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(customer)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('app.delete')}>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(customer)}
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