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
  Grid,
  Divider,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Notes as NotesIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { Customer } from '../../types/customer';

interface CustomerDetailProps {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
}

export const CustomerDetail: React.FC<CustomerDetailProps> = ({
  open,
  onClose,
  customer,
}) => {
  const { t } = useTranslation();

  if (!customer) return null;

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ width: 60, height: 60 }}>
            {getInitials(customer.name || '')}
          </Avatar>
          <Box>
            <Typography variant="h6">
              {customer.name || t('customers.noName')}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              #{customer.id}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <PhoneIcon color="primary" />
              <Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  {t('customers.phone')}
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {customer.phone_number}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          {customer.address && (
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <LocationIcon color="primary" />
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    {t('customers.address')}
                  </Typography>
                  <Typography variant="body1">
                    {customer.address}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}

          {customer.notes && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" alignItems="flex-start" gap={2}>
                <NotesIcon color="primary" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    {t('customers.notes')}
                  </Typography>
                  <Typography variant="body1">
                    {customer.notes}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}

          {!customer.address && !customer.notes && (
            <Grid item xs={12}>
              <Box textAlign="center" py={4}>
                <Typography variant="body2" color="textSecondary">
                  {t('customers.noAdditionalInfo')}
                </Typography>
              </Box>
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