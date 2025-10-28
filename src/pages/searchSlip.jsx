import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl,
  InputLabel, Select, MenuItem, IconButton, Chip, Alert,
  CircularProgress, Stack
} from '@mui/material';
import {
  Search, Refresh, Edit, Visibility,
  Clear, DateRange, Person, LocalOffer
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { axiosApi } from '../utils/api';
import { useNotification } from '../utils/notifications';

const SearchSlip = () => {
  const navigate = useNavigate();
  const { notification, showNotification, hideNotification } = useNotification();

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    customerName: '',
    customerPhone: '',
    paymentMethod: '',
    notes: '',
    products: []
  });

  // Fetch all slips on component mount
  useEffect(() => {
    fetchAllSlips();
  }, []);

  // Fetch all slips
  const fetchAllSlips = async () => {
    setLoading(true);
    try {
      const response = await axiosApi.slips.getAll({ limit: 1000 });
      setSearchResults(response.data.slips || []);
    } catch (error) {
      console.error('Error fetching slips:', error);
      showNotification('error', 'Failed to load slips.');
    } finally {
      setLoading(false);
    }
  };

  // Search function with multiple filters
  const handleSearch = async () => {
    setLoading(true);
    try {
      let filteredSlips = [...searchResults];

      // Text search across multiple fields
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        filteredSlips = filteredSlips.filter(slip =>
          slip.customerName?.toLowerCase().includes(term) ||
          slip.customerPhone?.includes(term) ||
          slip.slipNumber?.toLowerCase().includes(term) ||
          slip.products?.some(p => 
            p.productName?.toLowerCase().includes(term)
          ) ||
          slip._id?.includes(term)
        );
      }

      // Date filter
      if (filters.startDate) {
        filteredSlips = filteredSlips.filter(slip => 
          new Date(slip.date) >= new Date(filters.startDate)
        );
      }
      if (filters.endDate) {
        filteredSlips = filteredSlips.filter(slip => 
          new Date(slip.date) <= new Date(filters.endDate + 'T23:59:59')
        );
      }

      // Customer name filter
      if (filters.customerName) {
        filteredSlips = filteredSlips.filter(slip =>
          slip.customerName?.toLowerCase().includes(filters.customerName.toLowerCase())
        );
      }

      // Product name filter
      if (filters.productName) {
        filteredSlips = filteredSlips.filter(slip =>
          slip.products?.some(p => 
            p.productName?.toLowerCase().includes(filters.productName.toLowerCase())
          )
        );
      }

      // Payment method filter
      if (filters.paymentMethod) {
        filteredSlips = filteredSlips.filter(slip =>
          slip.paymentMethod === filters.paymentMethod
        );
      }

      // Amount range filter
      if (filters.minAmount) {
        filteredSlips = filteredSlips.filter(slip =>
          slip.totalAmount >= parseFloat(filters.minAmount)
        );
      }
      if (filters.maxAmount) {
        filteredSlips = filteredSlips.filter(slip =>
          slip.totalAmount <= parseFloat(filters.maxAmount)
        );
      }

      setSearchResults(filteredSlips);
      
      if (filteredSlips.length === 0) {
        showNotification('info', 'No slips found matching your criteria.');
      }
    } catch (error) {
      console.error('Search error:', error);
      showNotification('error', 'Search failed.');
    } finally {
      setLoading(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      customerName: '',
      productName: '',
      paymentMethod: '',
      minAmount: '',
      maxAmount: ''
    });
    setSearchTerm('');
    fetchAllSlips();
  };

  // Open edit dialog and populate form
  const handleEditClick = (slip) => {
    setSelectedSlip(slip);
    setEditForm({
      customerName: slip.customerName || '',
      customerPhone: slip.customerPhone || '',
      paymentMethod: slip.paymentMethod || 'Cash',
      notes: slip.notes || '',
      products: slip.products?.map(product => ({
        productName: product.productName,
        quantity: product.quantity,
        unitPrice: product.unitPrice,
        totalPrice: product.totalPrice
      })) || []
    });
    setOpenEditDialog(true);
  };

  // Handle form field changes
  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle product field changes
  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...editForm.products];
    
    if (field === 'productName') {
      updatedProducts[index].productName = value;
    } else if (field === 'quantity') {
      const quantity = parseInt(value) || 0;
      updatedProducts[index].quantity = quantity;
      updatedProducts[index].totalPrice = quantity * updatedProducts[index].unitPrice;
    } else if (field === 'unitPrice') {
      const price = parseFloat(value) || 0;
      updatedProducts[index].unitPrice = price;
      updatedProducts[index].totalPrice = updatedProducts[index].quantity * price;
    }
    
    setEditForm(prev => ({
      ...prev,
      products: updatedProducts
    }));
  };

  // Update slip - FIXED VERSION
  const handleUpdateSlip = async () => {
    try {
      setLoading(true);

      // Calculate new totals based on updated products
      const subtotal = editForm.products.reduce((sum, product) => sum + (product.totalPrice || 0), 0);
      const tax = selectedSlip.tax || 0;
      const discount = selectedSlip.discount || 0;
      const totalAmount = subtotal - discount + tax;

      // Prepare the update data
      const updatedData = {
        customerName: editForm.customerName,
        customerPhone: editForm.customerPhone,
        paymentMethod: editForm.paymentMethod,
        notes: editForm.notes,
        products: editForm.products.map(product => ({
          productName: product.productName,
          quantity: product.quantity,
          unitPrice: product.unitPrice,
          totalPrice: product.totalPrice
        })),
        subtotal: subtotal,
        totalAmount: totalAmount,
        // Keep original tax and discount values
        tax: selectedSlip.tax || 0,
        discount: selectedSlip.discount || 0
      };

      console.log('Updating slip with data:', updatedData);

      // Make the API call to update the slip
      const response = await axiosApi.slips.update(selectedSlip._id, updatedData);
      
      console.log('Update response:', response.data);
      
      showNotification('success', 'Slip updated successfully!');
      setOpenEditDialog(false);
      
      // Refresh the list to show updated data
      await fetchAllSlips();
      
    } catch (error) {
      console.error('Update error:', error);
      console.error('Error details:', error.response?.data);
      showNotification('error', `Failed to update slip: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // View slip details
  const handleViewSlip = (slipId) => {
    navigate(`/slips/${slipId}`);
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

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    customerName: '',
    productName: '',
    paymentMethod: '',
    minAmount: '',
    maxAmount: ''
  });

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 2, p: 2 }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Search & Edit Slips
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 3 }}>
        Search and edit slips for corrections (customer details, payment method, products)
      </Typography>

      {/* Search Section */}
      <Paper sx={{ p: 3, mb: 3 }} elevation={2}>
        <Grid container spacing={3}>
          {/* Main Search */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Search by Customer Name, Phone, Product, Slip ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
              }}
            />
          </Grid>

          {/* Filters */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              type="date"
              label="End Date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Customer Name"
              value={filters.customerName}
              onChange={(e) => setFilters(prev => ({ ...prev, customerName: e.target.value }))}
              InputProps={{
                startAdornment: <Person sx={{ color: 'text.secondary', mr: 1 }} />
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Product Name"
              value={filters.productName}
              onChange={(e) => setFilters(prev => ({ ...prev, productName: e.target.value }))}
              InputProps={{
                startAdornment: <LocalOffer sx={{ color: 'text.secondary', mr: 1 }} />
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={filters.paymentMethod}
                onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
                label="Payment Method"
              >
                <MenuItem value="">All Methods</MenuItem>
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="Card">Card</MenuItem>
                <MenuItem value="UPI">UPI</MenuItem>
                <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                <MenuItem value="Credit">Credit</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              type="number"
              label="Min Amount"
              value={filters.minAmount}
              onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              type="number"
              label="Max Amount"
              value={filters.maxAmount}
              onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
            />
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button
                variant="contained"
                startIcon={<Search />}
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Search Slips'}
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchAllSlips}
              >
                Refresh
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={clearFilters}
                color="secondary"
              >
                Clear Filters
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Section */}
      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Slip ID</strong></TableCell>
                <TableCell><strong>Customer</strong></TableCell>
                <TableCell><strong>Date & Time</strong></TableCell>
                <TableCell><strong>Products</strong></TableCell>
                <TableCell><strong>Payment</strong></TableCell>
                <TableCell><strong>Total</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {searchResults.map((slip) => (
                <TableRow key={slip._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {slip.slipNumber || slip._id}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {slip.customerName || 'Walk-in Customer'}
                      </Typography>
                      {slip.customerPhone && (
                        <Typography variant="caption" color="textSecondary">
                          {slip.customerPhone}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(slip.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(slip.date).toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ maxWidth: 200 }}>
                      {slip.products?.slice(0, 2).map((product, index) => (
                        <Typography key={index} variant="body2" noWrap>
                          {product.productName} (x{product.quantity})
                        </Typography>
                      ))}
                      {slip.products?.length > 2 && (
                        <Typography variant="caption" color="textSecondary">
                          +{slip.products.length - 2} more
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={slip.paymentMethod}
                      color={getPaymentMethodColor(slip.paymentMethod)}
                      size="small"
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      Rs {slip.totalAmount?.toLocaleString()}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleViewSlip(slip._id)}
                        title="View Details"
                      >
                        <Visibility />
                      </IconButton>
                      
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => handleEditClick(slip)}
                        title="Edit Slip"
                      >
                        <Edit />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {searchResults.length === 0 && !loading && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              No slips found
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Try adjusting your search criteria or clear filters to see all slips.
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Edit Dialog */}
      <Dialog 
        open={openEditDialog} 
        onClose={() => setOpenEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit Slip - {selectedSlip?.slipNumber}
        </DialogTitle>
        <DialogContent>
          {selectedSlip && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Customer Information
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Customer Name"
                    value={editForm.customerName}
                    onChange={(e) => handleEditFormChange('customerName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Customer Phone"
                    value={editForm.customerPhone}
                    onChange={(e) => handleEditFormChange('customerPhone', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Payment Method</InputLabel>
                    <Select
                      value={editForm.paymentMethod}
                      onChange={(e) => handleEditFormChange('paymentMethod', e.target.value)}
                      label="Payment Method"
                    >
                      <MenuItem value="Cash">Cash</MenuItem>
                      <MenuItem value="Card">Card</MenuItem>
                      <MenuItem value="UPI">UPI</MenuItem>
                      <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                      <MenuItem value="Credit">Credit</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>
                Products
              </Typography>
              {editForm.products.map((product, index) => (
                <Card key={index} sx={{ mb: 2, p: 2 }} variant="outlined">
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Product Name"
                        value={product.productName}
                        onChange={(e) => handleProductChange(index, 'productName', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Quantity"
                        value={product.quantity}
                        onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Unit Price"
                        value={product.unitPrice}
                        onChange={(e) => handleProductChange(index, 'unitPrice', e.target.value)}
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" fontWeight="bold">
                        Total: Rs {product.totalPrice?.toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Card>
              ))}

              <TextField
                fullWidth
                label="Notes"
                value={editForm.notes}
                onChange={(e) => handleEditFormChange('notes', e.target.value)}
                multiline
                rows={2}
                sx={{ mt: 2 }}
              />

              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  <strong>Note:</strong> Use this form to correct mistakes in customer details, 
                  payment method, or product quantities/prices. All changes are logged.
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button 
            variant="contained"
            onClick={handleUpdateSlip}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      {notification.open && (
        <Alert
          severity={notification.severity}
          onClose={hideNotification}
          sx={{ position: 'fixed', bottom: 16, right: 16, minWidth: 300 }}
        >
          {notification.message}
        </Alert>
      )}
    </Box>
  );
};

export default SearchSlip;