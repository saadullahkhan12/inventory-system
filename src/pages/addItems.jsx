import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Grid, 
  Snackbar, Alert, CircularProgress, Card, CardContent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { axiosApi } from '../utils/api';

const AddItems = () => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
    description: '',
    sku: '',
    supplier: ''
  });

  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Check server status on component mount
  React.useEffect(() => {
    const checkServerStatus = async () => {
      try {
        // First, try a simple ping to the server
        console.log('Testing server connection...');
        const pingResponse = await fetch('https://inventory-system-back-end.onrender.com');
        console.log('Ping response:', pingResponse.status);
        
        // Then try the API endpoint
        const response = await axiosApi.items.getAll();
        setServerStatus('online');
        console.log('Server is online, items loaded:', response.data);
      } catch (error) {
        setServerStatus('offline');
        console.error('Server connection failed:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          response: error.response?.data,
          status: error.response?.status
        });
      }
    };
    
    checkServerStatus();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showNotification = (severity, message) => {
    setNotification({ open: true, severity, message });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      showNotification('error', 'Product name is required');
      return false;
    }
    if (!formData.category.trim()) {
      showNotification('error', 'Category is required');
      return false;
    }
    if (!formData.price || formData.price <= 0) {
      showNotification('error', 'Valid price is required');
      return false;
    }
    if (!formData.quantity || formData.quantity <= 0) {
      showNotification('error', 'Valid quantity is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const itemData = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        description: formData.description.trim(),
        sku: formData.sku.trim(),
        supplier: formData.supplier.trim()
      };

      console.log('Sending item data:', itemData);
      console.log('API endpoint:', 'https://inventory-system-back-end.onrender.com/api/items');
      
      const response = await axiosApi.items.create(itemData);
      
      console.log('API response:', response);
      
      if (response.data) {
        showNotification('success', 'Item added successfully!');
        // Reset form
        setFormData({
          name: '',
          category: '',
          price: '',
          quantity: '',
          description: '',
          sku: '',
          supplier: ''
        });
      } else {
        showNotification('error', 'No data returned from server');
      }
    } catch (error) {
      console.error('Detailed error:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to add item. Please try again.';
      
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please make sure your backend server is running on https://inventory-system-back-end.onrender.com/';
      } else if (error.response) {
        errorMessage = `Server error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`;
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ marginTop: '60px', padding: 3, maxWidth: '1400px', mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
          Add New Item to Inventory
        </Typography>
        
       
          
          
       
        
        <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Fill in the details below to add a new item to your inventory
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Product Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Product Name *"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g., Honda Civic Oil Filter"
              />
            </Grid>

            {/* Category */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Category *"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                placeholder="e.g., Oil Filters, Brake Pads, Engine Parts"
              />
            </Grid>

            {/* Price */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price (Rs) *"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                required
                inputProps={{ min: 0, step: "0.01" }}
                placeholder="0.00"
              />
            </Grid>

            {/* Quantity */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity *"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange}
                required
                inputProps={{ min: 1 }}
                placeholder="1"
              />
            </Grid>

            {/* SKU */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="SKU/Product Code"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                placeholder="e.g., HC-OF-001"
              />
            </Grid>

           

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                  disabled={loading || serverStatus === 'offline'}
                  sx={{ minWidth: 200, py: 1.5 }}
                >
                  {loading ? 'Adding Item...' : serverStatus === 'offline' ? 'Server Offline' : 'Add Item to Inventory'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>

        
      </Paper>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddItems;
