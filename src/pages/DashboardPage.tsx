import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/orders';
import { customersApi } from '../api/customers';
import { productsApi } from '../api/products';

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  loading?: boolean;
}> = ({ title, value, icon, loading = false }) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom>
            {title}
          </Typography>
          {loading ? (
            <CircularProgress size={24} />
          ) : (
            <Typography variant="h4">{value}</Typography>
          )}
        </Box>
        <Box color="primary.main">{icon}</Box>
      </Box>
    </CardContent>
  </Card>
);

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();

  // Fetch data
  const { data: orders = [], isLoading: ordersLoading, error: ordersError } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.getOrders,
  });

  const { data: customers = [], isLoading: customersLoading, error: customersError } = useQuery({
    queryKey: ['customers'],
    queryFn: customersApi.getCustomers,
  });

  const { data: products = [], isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getProducts,
  });

  // Calculate statistics
  const totalSales = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  const totalOrders = orders.length;
  const totalCustomers = customers.length;
  const totalProducts = products.length;

  // Calculate sales by month (last 6 months)
  const getSalesByMonth = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const salesByMonth: { [key: string]: number } = {};
    
    orders.forEach(order => {
      if (order.datetime) {
        const date = new Date(order.datetime);
        const monthKey = months[date.getMonth()];
        const year = date.getFullYear();
        const currentYear = new Date().getFullYear();
        
        // Only include current year data
        if (year === currentYear) {
          salesByMonth[monthKey] = (salesByMonth[monthKey] || 0) + (order.total_amount || 0);
        }
      }
    });

    // Get last 6 months
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const monthName = months[monthIndex];
      last6Months.push({
        name: monthName,
        sales: salesByMonth[monthName] || 0,
      });
    }

    return last6Months;
  };

  // Calculate orders by day of week (last 7 days)
  const getOrdersByDay = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const ordersByDay: { [key: string]: number } = {};
    
    const now = new Date();
    const last7Days: { name: string; orders: number }[] = [];
    
    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayKey = days[date.getDay()];
      last7Days.push({ name: dayKey, orders: 0 });
    }

    // Count orders for each day
    orders.forEach(order => {
      if (order.datetime) {
        const orderDate = new Date(order.datetime);
        const dayDiff = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDiff >= 0 && dayDiff < 7) {
          const dayKey = days[orderDate.getDay()];
          const dayIndex = last7Days.findIndex(day => day.name === dayKey);
          if (dayIndex !== -1) {
            last7Days[dayIndex].orders += 1;
          }
        }
      }
    });

    return last7Days;
  };

  // Calculate order status distribution
  const getOrderStatusDistribution = () => {
    const statusCounts = {
      notPaid: 0,
      paid: 0,
      notDelivered: 0,
      delivered: 0,
    };

    orders.forEach(order => {
      statusCounts[order.payment_status]++;
      statusCounts[order.delivery_status]++;
    });

    return statusCounts;
  };

  const salesData = getSalesByMonth();
  const ordersData = getOrdersByDay();
  const statusDistribution = getOrderStatusDistribution();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const isLoading = ordersLoading || customersLoading || productsLoading;
  const hasError = ordersError || customersError || productsError;

  if (hasError) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          {t('dashboard.title')}
        </Typography>
        <Alert severity="error">
          {t('dashboard.errorLoadingData')}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {t('dashboard.title')}
      </Typography>
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('dashboard.totalSales')}
            value={formatCurrency(totalSales)}
            icon={<Typography variant="h4">💰</Typography>}
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('dashboard.totalOrders')}
            value={totalOrders}
            icon={<Typography variant="h4">📦</Typography>}
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('dashboard.totalCustomers')}
            value={totalCustomers}
            icon={<Typography variant="h4">👥</Typography>}
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('dashboard.totalProducts')}
            value={totalProducts}
            icon={<Typography variant="h4">🏷️</Typography>}
            loading={isLoading}
          />
        </Grid>

        {/* Order Status Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('dashboard.orderStatus')}
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">{t('orders.notPaid')}:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {statusDistribution.notPaid}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">{t('orders.paid')}:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {statusDistribution.paid}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">{t('orders.notDelivered')}:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {statusDistribution.notDelivered}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">{t('orders.delivered')}:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {statusDistribution.delivered}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('dashboard.salesOverview')}
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey="sales" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('dashboard.ordersThisWeek')}
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ordersData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#7c3aed"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 