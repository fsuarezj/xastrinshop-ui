import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Customer, CustomerFormData } from '../../types/customer';

interface CustomerFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (customer: CustomerFormData) => Promise<void>;
  customer?: Customer | null;
  isLoading?: boolean;
}

const initialFormData: CustomerFormData = {
  name: '',
  phone_number: '',
  address: '',
  notes: '',
};

export const CustomerForm: React.FC<CustomerFormProps> = ({
  open,
  onClose,
  onSubmit,
  customer,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CustomerFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        phone_number: customer.phone_number || '',
        address: customer.address || '',
        notes: customer.notes || '',
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [customer, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = t('customers.errors.phoneRequired');
    } else if (formData.phone_number.length < 6 || formData.phone_number.length > 20) {
      newErrors.phone_number = t('customers.errors.phoneInvalid');
    }

    if (formData.name && formData.name.length > 80) {
      newErrors.name = t('customers.errors.nameTooLong');
    }

    if (formData.address && formData.address.length > 255) {
      newErrors.address = t('customers.errors.addressTooLong');
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, phone_number: e.target.value }));
    if (errors.phone_number) setErrors(prev => ({ ...prev, phone_number: '' }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, address: e.target.value }));
    if (errors.address) setErrors(prev => ({ ...prev, address: '' }));
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, notes: e.target.value }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {customer ? t('customers.edit') : t('customers.create')}
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            margin="dense"
            label={t('customers.name')}
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleNameChange}
            error={!!errors.name}
            helperText={errors.name}
            disabled={isLoading}
            placeholder={t('customers.namePlaceholder')}
          />
          <TextField
            autoFocus
            margin="dense"
            label={t('customers.phone')}
            fullWidth
            variant="outlined"
            value={formData.phone_number}
            onChange={handlePhoneChange}
            error={!!errors.phone_number}
            helperText={errors.phone_number}
            disabled={isLoading}
            required
            placeholder="+1234567890"
          />
          <TextField
            margin="dense"
            label={t('customers.address')}
            fullWidth
            variant="outlined"
            value={formData.address}
            onChange={handleAddressChange}
            error={!!errors.address}
            helperText={errors.address}
            disabled={isLoading}
            placeholder={t('customers.addressPlaceholder')}
          />
          <TextField
            margin="dense"
            label={t('customers.notes')}
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={formData.notes}
            onChange={handleNotesChange}
            disabled={isLoading}
            placeholder={t('customers.notesPlaceholder')}
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