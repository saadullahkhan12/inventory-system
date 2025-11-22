import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tabs, Tab, Chip, CircularProgress, Alert, Stack,
  TextField, IconButton, Tooltip
} from '@mui/material';
import {
  TrendingUp, CalendarToday, DateRange, FilterList,
  Refresh, Search, Clear
} from '@mui/icons-material';
import { axiosApi } from '../utils/api';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`income-tabpanel-${index}`}
      aria-labelledby={`income-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Income() {
  const [tabValue, setTabValue] = useState(0);
  const [data, setData] = useState({
    daily: [],
    weekly: [],
    monthly: []
  });
  const [loading, setLoading] = useState({
    daily: true,
    weekly: true,
    monthly: true
  });
  const [error, setError] = useState(null);
  const [productFilter, setProductFilter] = useState('');

  // Fetch data when component mounts
  useEffect(() => {
    fetchIncomeData();
  }, []);

  const fetchIncomeData = async () => {
    setError(null);
    
    try {
      // Fetch all data in parallel
      const [dailyRes, weeklyRes, monthlyRes] = await Promise.all([
        axiosApi.income.getToday(),
        axiosApi.income.getWeekly(),
        axiosApi.income.getMonthly()
      ]);

      setData({
        daily: Array.isArray(dailyRes.data) ? dailyRes.data : dailyRes.data?.records || [],
        weekly: Array.isArray(weeklyRes.data) ? weeklyRes.data : weeklyRes.data?.records || [],
        monthly: Array.isArray(monthlyRes.data) ? monthlyRes.data : monthlyRes.data?.records || []
      });

    } catch (err) {
      console.error('Error fetching income data:', err);
      setError('Failed to load income data. Please try again.');
    } finally {
      setLoading({ daily: false, weekly: false, monthly: false });
    }
  };

  // Calculate statistics
  const calculateStats = (incomeData) => {
    if (!Array.isArray(incomeData)) return { totalIncome: 0, totalItems: 0, transactionCount: 0, averageSale: 0 };
    
    const totalIncome = incomeData.reduce((sum, entry) => sum + (entry.totalIncome || 0), 0);
    const totalItems = incomeData.reduce((sum, entry) => 
      sum + (entry.productsSold?.reduce((pSum, product) => pSum + (product.quantity || 0), 0) || 0), 0
    );
    const transactionCount = incomeData.length;
    const averageSale = transactionCount > 0 ? totalIncome / transactionCount : 0;

    return { totalIncome, totalItems, transactionCount, averageSale };
  };

  // Filter data by product name
  const getFilteredData = (incomeData) => {
    if (!Array.isArray(incomeData)) return [];
    
    if (!productFilter.trim()) return incomeData;

    const filterTerm = productFilter.toLowerCase().trim();
    
    return incomeData.filter(entry => 
      entry.productsSold?.some(product => 
        product.productName?.toLowerCase().includes(filterTerm)
      )
    );
  };

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (tabValue) {
      case 0: return getFilteredData(data.daily);
      case 1: return getFilteredData(data.weekly);
      case 2: return getFilteredData(data.monthly);
      default: return [];
    }
  };

  const currentData = getCurrentData();
  const stats = calculateStats(currentData);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Clear product filter
  const clearFilter = () => {
    setProductFilter('');
  };

  // Get payment method color
  const getPaymentMethodColor = (method) => {
    const colors = {
      'Cash': 'success',
      'Card': 'primary',
      'UPI': 'secondary',
      'Bank Transfer': 'info',
      'Credit': 'warning',
      'Other': 'default'
    };
    return colors[method] || 'default';
  };

  // Loading component
  const renderLoading = () => (
    <Box className="flex justify-center items-center h-64">
      <CircularProgress />
      <Typography className="ml-4 text-gray-600">Loading income data...</Typography>
    </Box>
  );

  // Error component
  const renderError = () => (
    <Alert 
      severity="error" 
      action={
        <IconButton color="inherit" size="small" onClick={fetchIncomeData}>
          <Refresh />
        </IconButton>
      }
      className="mb-4"
    >
      {error}
    </Alert>
  );

  // Empty state component
  const renderEmptyState = () => (
    <Box className="text-center py-12">
      <TrendingUp className="text-4xl text-gray-400 mb-4 mx-auto" />
      <Typography variant="h6" className="text-gray-600 mb-2">
        {productFilter ? 'No matching products found' : 'No income data found'}
      </Typography>
      <Typography variant="body2" className="text-gray-500">
        {productFilter ? 'Try a different product name' : 'Create some sales slips to see income reports here.'}
      </Typography>
      {productFilter && (
        <Button 
          variant="outlined" 
          onClick={clearFilter}
          className="mt-2"
        >
          Clear Filter
        </Button>
      )}
    </Box>
  );

  // Statistics Cards
  const renderStatsCards = () => (
    <Grid container spacing={3} className="mb-6">
      <Grid item xs={12} sm={6} md={3}>
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
          <CardContent className="p-4">
            <Typography variant="h6" className="font-semibold mb-2">
              Total Income
            </Typography>
            <Typography variant="h4" className="font-bold">
              ₹{stats.totalIncome.toFixed(2)}
            </Typography>
            <Typography variant="body2" className="opacity-90">
              {tabValue === 0 ? 'Today' : tabValue === 1 ? 'This Week' : 'This Month'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg">
          <CardContent className="p-4">
            <Typography variant="h6" className="font-semibold mb-2">
              Items Sold
            </Typography>
            <Typography variant="h4" className="font-bold">
              {stats.totalItems}
            </Typography>
            <Typography variant="body2" className="opacity-90">
              Total units sold
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg">
          <CardContent className="p-4">
            <Typography variant="h6" className="font-semibold mb-2">
              Transactions
            </Typography>
            <Typography variant="h4" className="font-bold">
              {stats.transactionCount}
            </Typography>
            <Typography variant="body2" className="opacity-90">
              Total sales slips
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
          <CardContent className="p-4">
            <Typography variant="h6" className="font-semibold mb-2">
              Average Sale
            </Typography>
            <Typography variant="h4" className="font-bold">
              ₹{stats.averageSale.toFixed(2)}
            </Typography>
            <Typography variant="body2" className="opacity-90">
              Per transaction
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Simple Product Filter
  const renderProductFilter = () => (
    <Paper className="p-4 mb-6 shadow-md">
      <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Typography variant="h6" className="flex items-center gap-2">
          <FilterList />
          Filter by Product Name
        </Typography>
        
        <Stack direction="row" spacing={2} alignItems="center">
          {productFilter && (
            <Chip 
              label={`${currentData.length} records`}
              color="primary"
              variant="outlined"
            />
          )}
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchIncomeData} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Box className="mt-4 flex gap-2">
        <TextField
          fullWidth
          size="small"
          placeholder="Search by product name..."
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          InputProps={{
            startAdornment: <Search className="text-gray-400 mr-2" />
          }}
        />
        {productFilter && (
          <IconButton onClick={clearFilter} color="secondary">
            <Clear />
          </IconButton>
        )}
      </Box>

      {productFilter && (
        <Typography variant="body2" className="text-gray-600 mt-2">
          Showing transactions containing: <strong>"{productFilter}"</strong>
        </Typography>
      )}
    </Paper>
  );

  // Income Table
  const renderIncomeTable = () => (
    <TableContainer component={Paper} className="shadow-lg">
      <Table>
        <TableHead className="bg-gray-50">
          <TableRow>
            <TableCell className="font-bold text-gray-700">Date & Time</TableCell>
            <TableCell className="font-bold text-gray-700">Customer</TableCell>
            <TableCell className="font-bold text-gray-700">Payment</TableCell>
            <TableCell className="font-bold text-gray-700">Products</TableCell>
            <TableCell className="font-bold text-gray-700 text-right">Amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {currentData.map((entry, index) => (
            <TableRow 
              key={index}
              className="hover:bg-gray-50 transition-colors"
            >
              <TableCell>
                <Typography variant="body2" className="font-medium">
                  {new Date(entry.date || entry.createdAt).toLocaleDateString()}
                </Typography>
                <Typography variant="caption" className="text-gray-500">
                  {new Date(entry.date || entry.createdAt).toLocaleTimeString()}
                </Typography>
              </TableCell>
              
              <TableCell>
                <Typography variant="body2" className="font-medium">
                  {entry.customerName || 'Walk-in Customer'}
                </Typography>
                {entry.customerPhone && (
                  <Typography variant="caption" className="text-gray-500">
                    {entry.customerPhone}
                  </Typography>
                )}
              </TableCell>
              
              <TableCell>
                <Chip
                  label={entry.paymentMethod || 'Cash'}
                  color={getPaymentMethodColor(entry.paymentMethod)}
                  size="small"
                />
              </TableCell>
              
              <TableCell>
                <Box className="max-w-xs">
                  {entry.productsSold?.map((product, i) => (
                    <Typography 
                      key={i} 
                      variant="body2" 
                      className={
                        product.productName?.toLowerCase().includes(productFilter.toLowerCase()) 
                          ? 'font-bold text-blue-600' 
                          : ''
                      }
                    >
                      {product.productName} (x{product.quantity})
                    </Typography>
                  ))}
                </Box>
              </TableCell>
              
              <TableCell align="right">
                <Typography variant="body1" className="font-bold text-green-600">
                  ₹{entry.totalIncome?.toFixed(2)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <Box className="mb-6">
        <Typography variant="h4" className="font-bold text-gray-800 mb-2">
          Income Reports
        </Typography>
        <Typography variant="subtitle1" className="text-gray-600">
          Track and analyze your sales performance across different time periods
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper className="mb-6 shadow-md">
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
          className="border-b"
        >
          <Tab 
            icon={<CalendarToday />} 
            label="Daily" 
            className="min-h-16"
          />
          <Tab 
            icon={<DateRange />} 
            label="Weekly" 
            className="min-h-16"
          />
          <Tab 
            icon={<TrendingUp />} 
            label="Monthly" 
            className="min-h-16"
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {loading.daily ? renderLoading() : (
            <>
              {renderStatsCards()}
              {renderProductFilter()}
              {currentData.length > 0 ? renderIncomeTable() : renderEmptyState()}
            </>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {loading.weekly ? renderLoading() : (
            <>
              {renderStatsCards()}
              {renderProductFilter()}
              {currentData.length > 0 ? renderIncomeTable() : renderEmptyState()}
            </>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {loading.monthly ? renderLoading() : (
            <>
              {renderStatsCards()}
              {renderProductFilter()}
              {currentData.length > 0 ? renderIncomeTable() : renderEmptyState()}
            </>
          )}
        </TabPanel>
      </Paper>

      {/* Error Display */}
      {error && renderError()}
    </Box>
  );
}