import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Grid, Paper, Typography, TextField, Button, FormControl, InputLabel, Select,
  MenuItem, Snackbar, Alert, Card, CardContent, IconButton, CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Tooltip from '@mui/material/Tooltip';
import { Link } from 'react-router-dom';

const API_URL_slips = "https://inventory-system-back-end-production.up.railway.app/api/slips/";
const API_URL_PRODUCTS = "https://inventory-system-back-end-production.up.railway.app/api/items";

const Slips = () => {
  const [formData, setFormData] = useState({
    customerName: 'Customer',
    paymentType: '',
    items: [{ category: '', product: '', quantity: 1, price: 0, total: 0 }]
  });
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState({
    products: true,
    submission: false
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(API_URL_PRODUCTS);
        setProducts(response.data);

        // Extract unique categories
        const uniqueCategories = [...new Set(response.data.map(product => product.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching products:', error);
        showNotification('error', 'Failed to load products. Please try again later.');
      } finally {
        setLoading(prev => ({ ...prev, products: false }));
      }
    };

    fetchProducts();
  }, []);

  const showNotification = (severity, message) => {
    setNotification({
      open: true,
      severity,
      message
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];

    if (field === 'category') {
      updatedItems[index] = {
        ...updatedItems[index],
        category: value,
        product: '',
        price: 0,
        total: 0
      };
    }
    else if (field === 'product') {
      const selectedProduct = products.find(p => p._id === value);
      updatedItems[index] = {
        ...updatedItems[index],
        product: value,
        price: selectedProduct?.price || 0,
        total: (updatedItems[index].quantity || 1) * (selectedProduct?.price || 0)
      };
    }
    else if (field === 'quantity') {
      const quantity = parseInt(value) || 0;
      updatedItems[index] = {
        ...updatedItems[index],
        quantity,
        total: quantity * updatedItems[index].price
      };
    }
    else {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };
    }

    setFormData({
      ...formData,
      items: updatedItems
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { category: '', product: '', quantity: 1, price: 0, total: 0 }]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) return;
    const updatedItems = formData.items.filter((_, idx) => idx !== index);
    setFormData({
      ...formData,
      items: updatedItems
    });
  };

  const validateForm = () => {
    if (!formData.customerName.trim()) {
      showNotification('error', 'Please enter customer name');
      return false;
    }

    if (!formData.paymentType) {
      showNotification('error', 'Please select payment type');
      return false;
    }

    for (const item of formData.items) {
      if (!item.category) {
        showNotification('error', 'Please select category for all items');
        return false;
      }

      if (!item.product) {
        showNotification('error', 'Please select product for all items');
        return false;
      }

      if (item.quantity <= 0) {
        showNotification('error', 'Quantity must be greater than 0');
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
      const totalQuantity = formData.items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
      const totalAmount = formData.items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);

      const slipData = {
        customerName: formData.customerName,
        paymentType: formData.paymentType,
        items: formData.items.map(item => ({
          itemName: products.find(p => p._id === item.product)?.name || '',
          quantity: item.quantity,
          price: item.price,
          total: item.total
        })),
        totalQuantity,
        totalAmount
      };

      await axios.post(API_URL_slips, slipData);

      // Reset form on success
      setFormData({
        customerName: 'Customer',
        paymentType: '',
        items: [{ category: '', product: '', quantity: 1, price: 0, total: 0 }]
      });

      showNotification('success', 'Slip successfully generated!');
    } catch (error) {
      console.error('Error generating slip:', error);
      showNotification('error', error.response?.data?.message || 'Failed to generate slip. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, submission: false }));
    }
  };

  if (loading.products) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h4" className='font-serif' gutterBottom>Create Slip</Typography>
      <Paper sx={{ p: 3 }} elevation={3}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Customer Name"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Payment Type</InputLabel>
                <Select
                  name="paymentType"
                  value={formData.paymentType}
                  label="Payment Type"
                  onChange={handleInputChange}
                >
                  <MenuItem value="" disabled>Select Payment Type</MenuItem>
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="pending">Udhaar</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {formData.items.map((item, index) => (
              <Grid item xs={12} key={index}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={3}>
                        <FormControl fullWidth required>
                          <InputLabel>Category</InputLabel>
                          <Select
                            value={item.category}
                            label="Category"
                            onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                          >
                            <MenuItem value="" disabled>Select Category</MenuItem>
                            {categories.map((category) => (
                              <MenuItem key={category} value={category}>
                                {category}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <FormControl fullWidth required>
                          <InputLabel>Product</InputLabel>
                          <Select
                            value={item.product}
                            label="Product"
                            onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                            disabled={!item.category}
                          >
                            <MenuItem value="" disabled>Select Product</MenuItem>
                            {products
                              .filter(product => product.category === item.category)
                              .map((product) => (
                                <MenuItem key={product._id} value={product._id}>
                                  {product.name} (Stock: {product.stock})
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Quantity"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          required
                          inputProps={{ min: 1 }}
                        />
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Price"
                          value={item.price}
                          onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                          required
                          inputProps={{ min: 0, step: "0.01" }}
                          disabled
                        />
                      </Grid>
                      <Grid item xs={6} sm={1}>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          Total: {item.total.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={1}>
                        <Tooltip title="Delete Item">
                          <IconButton
                            color="error"
                            onClick={() => removeItem(index)}
                            disabled={formData.items.length <= 1}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Tooltip title="Add Item">
                <Button
                  onClick={addItem}
                  startIcon={<AddIcon />}
                  variant="outlined"
                >
                  Add Item
                </Button>
              </Tooltip>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                endIcon={<SendIcon />}
                disabled={loading.submission}
                sx={{
                  backgroundColor: '#1976d2',
                  '&:hover': { backgroundColor: '#115293' },
                }}
              >
                {loading.submission ? (
                  <>
                    <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
                    Processing...
                  </>
                ) : 'Submit Slip'}
              </Button>
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Link to="/SlipPage" style={{ textDecoration: 'none' }}>
                  <Button
                    type="button"
                    variant="contained"
                    endIcon={<SendIcon />}
                    sx={{
                      backgroundColor: '#1976d2',
                      '&:hover': { backgroundColor: '#115293' },
                    }}
                  >
                    View Generated Slips
                  </Button>
                </Link>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
          onClose={handleCloseNotification}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Slips;
