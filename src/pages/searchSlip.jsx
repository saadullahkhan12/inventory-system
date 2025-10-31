import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl,
  InputLabel, Select, MenuItem, IconButton, Chip, Alert,
  CircularProgress, Stack, Divider
} from '@mui/material';
import {
  Search, Refresh, Edit, Visibility, Cancel,
  Clear, LocalOffer, Save, Delete
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
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
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

  // Simple search by product name
  const handleSearch = async () => {
    setLoading(true);
    try {
      if (!searchTerm.trim()) {
        fetchAllSlips();
        return;
      }

      const term = searchTerm.toLowerCase();
      const filteredSlips = searchResults.filter(slip =>
        slip.products?.some(p => 
          p.productName?.toLowerCase().includes(term)
        ) ||
        slip.customerName?.toLowerCase().includes(term) ||
        slip.slipNumber?.toLowerCase().includes(term)
      );

      setSearchResults(filteredSlips);
      
      if (filteredSlips.length === 0) {
        showNotification('info', 'No slips found matching your search.');
      }
    } catch (error) {
      console.error('Search error:', error);
      showNotification('error', 'Search failed.');
    } finally {
      setLoading(false);
    }
  };

  // Clear search
  const clearSearch = () => {
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
        totalPrice: product.totalPrice,
        originalQuantity: product.quantity // Store original for inventory updates
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

  // Add new product row
  const addProduct = () => {
    setEditForm(prev => ({
      ...prev,
      products: [...prev.products, { 
        productName: '', 
        quantity: 1, 
        unitPrice: 0, 
        totalPrice: 0 
      }]
    }));
  };

  // Remove product row
  const removeProduct = (index) => {
    if (editForm.products.length > 1) {
      const updatedProducts = editForm.products.filter((_, i) => i !== index);
      setEditForm(prev => ({
        ...prev,
        products: updatedProducts
      }));
    }
  };

  // Update slip with inventory adjustment
  const handleUpdateSlip = async () => {
    try {
      setLoading(true);

      // Calculate new totals
      const subtotal = editForm.products.reduce((sum, product) => sum + (product.totalPrice || 0), 0);
      const tax = selectedSlip.tax || 0;
      const discount = selectedSlip.discount || 0;
      const totalAmount = subtotal - discount + tax;

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
        tax: selectedSlip.tax || 0,
        discount: selectedSlip.discount || 0
      };

      await axiosApi.slips.update(selectedSlip._id, updatedData);
      showNotification('success', 'Slip updated successfully! Inventory will be adjusted.');
      setOpenEditDialog(false);
      await fetchAllSlips();
      
    } catch (error) {
      console.error('Update error:', error);
      showNotification('error', `Failed to update slip: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Cancel slip (mark as cancelled and adjust inventory)
  const handleCancelSlip = async () => {
    try {
      setLoading(true);

      // Create cancellation record and adjust inventory
      const cancelData = {
        ...selectedSlip,
        status: 'Cancelled',
        notes: `CANCELLED - ${selectedSlip.notes || 'No reason provided'}`,
        cancelledAt: new Date().toISOString()
      };

      await axiosApi.slips.update(selectedSlip._id, cancelData);
      showNotification('success', 'Slip cancelled successfully! Inventory has been adjusted.');
      setOpenCancelDialog(false);
      await fetchAllSlips();
      
    } catch (error) {
      console.error('Cancel error:', error);
      showNotification('error', `Failed to cancel slip: ${error.response?.data?.error || error.message}`);
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

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'Paid': 'success',
      'Pending': 'warning',
      'Cancelled': 'error'
    };
    return colors[status] || 'default';
  };

  // Calculate total for display
  const calculateTotal = () => {
    return editForm.products.reduce((sum, product) => sum + (product.totalPrice || 0), 0);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 2, p: 2 }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Search & Manage Slips
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 3 }}>
        Search by product name, customer, or slip ID. Edit details or cancel slips.
      </Typography>

      {/* Simple Search Section */}
      <Paper sx={{ p: 3, mb: 3 }} elevation={2}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Search by Product Name, Customer, or Slip ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<Search />}
                onClick={handleSearch}
                disabled={loading}
                sx={{ flex: 1 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Search'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchAllSlips}
              >
                Refresh
              </Button>
              {searchTerm && (
                <Button
                  variant="outlined"
                  startIcon={<Clear />}
                  onClick={clearSearch}
                  color="secondary"
                >
                  Clear
                </Button>
              )}
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
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Products</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
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
                    <Chip
                      label={slip.paymentMethod}
                      color={getPaymentMethodColor(slip.paymentMethod)}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
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
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ maxWidth: 200 }}>
                      {slip.products?.map((product, index) => (
                        <Typography key={index} variant="body2" noWrap>
                          {product.productName} (x{product.quantity})
                        </Typography>
                      ))}
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={slip.status || 'Paid'}
                      color={getStatusColor(slip.status)}
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
                        disabled={slip.status === 'Cancelled'}
                      >
                        <Edit />
                      </IconButton>
                      
                      {slip.status !== 'Cancelled' && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setSelectedSlip(slip);
                            setOpenCancelDialog(true);
                          }}
                          title="Cancel Slip"
                        >
                          <Cancel />
                        </IconButton>
                      )}
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
              {searchTerm ? 'Try a different search term' : 'No slips available'}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Edit Dialog */}
      <Dialog 
        open={openEditDialog} 
        onClose={() => setOpenEditDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Edit Slip - {selectedSlip?.slipNumber}
        </DialogTitle>
        <DialogContent>
          {selectedSlip && (
            <Box sx={{ mt: 2 }}>
              {/* Customer Information */}
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

              <Divider sx={{ my: 3 }} />

              {/* Products Section */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Products
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={addProduct}
                  size="small"
                >
                  Add Product
                </Button>
              </Box>

              {editForm.products.map((product, index) => (
                <Card key={index} sx={{ mb: 2, p: 2 }} variant="outlined">
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Product Name"
                        value={product.productName}
                        onChange={(e) => handleProductChange(index, 'productName', e.target.value)}
                        placeholder="Enter product name"
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
                    <Grid item xs={8} sm={3}>
                      <Typography variant="body2" fontWeight="bold">
                        Total: Rs {product.totalPrice?.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={4} sm={1}>
                      {editForm.products.length > 1 && (
                        <IconButton
                          color="error"
                          onClick={() => removeProduct(index)}
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </Grid>
                  </Grid>
                </Card>
              ))}

              {/* Total Display */}
              <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'white', borderRadius: 1, mt: 2 }}>
                <Typography variant="h6" align="center">
                  Grand Total: Rs {calculateTotal().toLocaleString()}
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="Notes"
                value={editForm.notes}
                onChange={(e) => handleEditFormChange('notes', e.target.value)}
                multiline
                rows={2}
                sx={{ mt: 2 }}
                placeholder="Any additional notes or reasons for changes..."
              />

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Note:</strong> Changing product quantities or prices will automatically adjust inventory levels and update income records.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button 
            variant="contained"
            startIcon={<Save />}
            onClick={handleUpdateSlip}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Slip Dialog */}
      <Dialog 
        open={openCancelDialog} 
        onClose={() => setOpenCancelDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Cancel Slip - {selectedSlip?.slipNumber}
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone!
          </Alert>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to cancel this slip? This will:
          </Typography>
          <ul>
            <li>Mark the slip as cancelled</li>
            <li>Return all products to inventory</li>
            <li>Remove the sale from income records</li>
            <li>Create an audit trail</li>
          </ul>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Slip Total: <strong>Rs {selectedSlip?.totalAmount?.toLocaleString()}</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)}>Keep Slip</Button>
          <Button 
            variant="contained"
            color="error"
            startIcon={<Cancel />}
            onClick={handleCancelSlip}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Cancel Slip'}
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