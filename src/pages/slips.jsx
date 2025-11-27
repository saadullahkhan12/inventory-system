import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, TextField, Button, FormControl, InputLabel, Select,
  MenuItem, Snackbar, Alert, Card, CardContent, IconButton, CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Link, useNavigate } from 'react-router-dom';
import { axiosApi } from '../utils/api';
import { useNotification } from '../utils/notifications';

const Slips = () => {
  const navigate = useNavigate();

  // ✔ UPDATED — removed backend-removed fields
  const [formData, setFormData] = useState({
    customerName: '',
    items: [{ category: '', product: '', quantity: 1, price: 0, total: 0 }]
  });

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState({
    products: true,
    submission: false
  });

  const { notification, showNotification, hideNotification } = useNotification();

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosApi.items.getAll();
        const data = response.data?.items || response.data || [];

        setProducts(Array.isArray(data) ? data : []);
        const uniqueCategories = [...new Set(data.map(p => p.category || 'General'))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching products:', error);
        showNotification('error', 'Failed to load products.');
      } finally {
        setLoading(prev => ({ ...prev, products: false }));
      }
    };
    fetchProducts();
  }, []);

  // Handle general input
  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];

    if (field === 'category') {
      updatedItems[index] = { category: value, product: '', quantity: 1, price: 0, total: 0 };
    } else if (field === 'product') {
      const product = products.find(p => p._id === value);
      updatedItems[index].product = value;
      updatedItems[index].price = product?.price || 0;
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].price;
    } else if (field === 'quantity') {
      const qty = parseInt(value) || 0;
      updatedItems[index].quantity = qty;
      updatedItems[index].total = qty * updatedItems[index].price;
    }

    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { category: '', product: '', quantity: 1, price: 0, total: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updated = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, items: updated }));
    }
  };

  // ✔ UPDATED — only subtotal and totalAmount
  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
    const totalAmount = subtotal;
    return { subtotal, totalAmount };
  };

  // ✔ UPDATED VALIDATION
  const validateForm = () => {
    if (!formData.customerName.trim()) {
      showNotification('error', 'Enter customer name.');
      return false;
    }

    for (const item of formData.items) {
      if (!item.category) {
        showNotification('error', 'Select category for all items.');
        return false;
      }
      if (!item.product) {
        showNotification('error', 'Select product for all items.');
        return false;
      }
      if (item.quantity <= 0) {
        showNotification('error', 'Quantity must be greater than 0.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(prev => ({ ...prev, submission: true }));

    try {
      const productsData = formData.items.map(item => {
        const product = products.find(p => p._id === item.product);
        return {
          productName: product?.name || 'Unknown Product',
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.total
        };
      });

      const { subtotal, totalAmount } = calculateTotals();

      // ✔ UPDATED — ONLY SEND WHAT BACKEND ACCEPTS
      const slipData = {
        customerName: formData.customerName,
        products: productsData,
        subtotal,
        totalAmount
      };

      const response = await axiosApi.slips.create(slipData);
      const createdSlip = response.data;

      showNotification('success', 'Slip created successfully!');
      navigate(`/slips/${createdSlip.slip._id}`);

      // Reset form
      setFormData({
        customerName: '',
        items: [{ category: '', product: '', quantity: 1, price: 0, total: 0 }]
      });

    } catch (err) {
      console.error('Slip creation error:', err);
      const errorMsg = err.response?.data?.error ||
                       err.response?.data?.details ||
                       err.message ||
                       'Failed to create slip';
      showNotification('error', errorMsg);
    } finally {
      setLoading(prev => ({ ...prev, submission: false }));
    }
  };

  const { subtotal, totalAmount } = calculateTotals();

  if (loading.products) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading products...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 2, p: 2 }}>
      <Typography variant="h4" fontWeight="bold">
        Create Sales Slip
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }} elevation={2}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>

            {/* Customer Name */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Customer Name *"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                required
              />
            </Grid>

            {/* Items */}
            <Grid item xs={12}>
              <Typography variant="h6">Items ({formData.items.length})</Typography>
            </Grid>

            {formData.items.map((item, index) => (
              <Grid item xs={12} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Grid container spacing={2}>

                      {/* Category */}
                      <Grid item xs={12} sm={3}>
                        <FormControl fullWidth>
                          <InputLabel>Category *</InputLabel>
                          <Select
                            value={item.category}
                            onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                            label="Category *"
                          >
                            <MenuItem value="">Select Category</MenuItem>
                            {categories.map(category => (
                              <MenuItem key={category} value={category}>{category}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      {/* Product */}
                      <Grid item xs={12} sm={3}>
                        <FormControl fullWidth>
                          <InputLabel>Product *</InputLabel>
                          <Select
                            value={item.product}
                            onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                            label="Product *"
                            disabled={!item.category}
                          >
                            <MenuItem value="">Select Product</MenuItem>
                            {products
                              .filter(p => p.category === item.category)
                              .map(product => (
                                <MenuItem key={product._id} value={product._id}>
                                  {product.name} - ₹{product.price}
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      {/* Quantity */}
                      <Grid item xs={6} sm={2}>
                        <TextField
                          fullWidth
                          label="Qty *"
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          inputProps={{ min: 1 }}
                        />
                      </Grid>

                      {/* Total */}
                      <Grid item xs={6} sm={3}>
                        <Typography variant="h6" sx={{ mt: 1 }}>
                          ₹{item.total.toFixed(2)}
                        </Typography>
                      </Grid>

                      {/* Remove */}
                      <Grid item xs={12} sm={1}>
                        <IconButton
                          color="error"
                          onClick={() => removeItem(index)}
                          disabled={formData.items.length === 1}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>

                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Button startIcon={<AddIcon />} onClick={addItem}>
                Add Item
              </Button>
            </Grid>

            {/* Summary */}
            <Grid item xs={12}>
              <Card sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="h6">Total Amount</Typography>
                <Typography variant="h4" fontWeight="bold">
                  ₹{totalAmount.toFixed(2)}
                </Typography>
                <Typography variant="body2">Subtotal: ₹{subtotal.toFixed(2)}</Typography>
              </Card>
            </Grid>

            {/* Submit */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                endIcon={<SendIcon />}
                disabled={loading.submission}
              >
                {loading.submission ? <CircularProgress size={24} /> : 'Create Slip'}
              </Button>
            </Grid>

          </Grid>
        </form>
      </Paper>

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={hideNotification}
      >
        <Alert severity={notification.severity} onClose={hideNotification}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Slips;
