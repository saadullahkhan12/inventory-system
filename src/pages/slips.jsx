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

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    paymentMethod: 'Cash',
    discount: 0,
    tax: 0,
    notes: '',
    items: [{ category: '', product: '', quantity: 1, price: 0, total: 0 }]
  });

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState({
    products: true,
    submission: false
  });

  const { notification, showNotification, hideNotification } = useNotification();

  // ✅ Fetch all products
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

  // 🔹 Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];

    if (field === 'category') {
      updatedItems[index] = { category: value, product: '', quantity: 1, price: 0, total: 0 };
    } else if (field === 'product') {
      const product = products.find(p => p._id === value);
      updatedItems[index].product = value;
      updatedItems[index].price = product?.price || 0;
      updatedItems[index].total = updatedItems[index].quantity * (product?.price || 0);
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

  // 🔹 Calculate totals
  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
    const discount = Number(formData.discount) || 0;
    const tax = Number(formData.tax) || 0;
    const totalAmount = subtotal - discount + tax;
    return { subtotal, discount, tax, totalAmount };
  };

  // 🔹 Validate form
  const validateForm = () => {
    if (!formData.customerName.trim()) {
      showNotification('error', 'Enter customer name.');
      return false;
    }
    if (!formData.paymentMethod) {
      showNotification('error', 'Select payment method.');
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

  // ✅ Submit Slip (creates slip and redirects to print page)
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

      const { subtotal, discount, tax, totalAmount } = calculateTotals();

      const slipData = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        products: productsData,
        subtotal,
        discount,
        tax,
        totalAmount,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      };

      const response = await axiosApi.slips.create(slipData);
      const createdSlip = response.data;

      showNotification('success', 'Slip created successfully! Inventory updated.');
      navigate(`/slips/${createdSlip.slip._id}`);

      // Reset form
      setFormData({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        paymentMethod: 'Cash',
        discount: 0,
        tax: 0,
        notes: '',
        items: [{ category: '', product: '', quantity: 1, price: 0, total: 0 }]
      });

    } catch (err) {
      console.error('❌ Slip creation error:', err);
      const errorMsg = err.response?.data?.error ||
                       err.response?.data?.details ||
                       err.message ||
                       'Failed to create slip';
      showNotification('error', errorMsg);
    } finally {
      setLoading(prev => ({ ...prev, submission: false }));
    }
  };

  const { subtotal, discount, tax, totalAmount } = calculateTotals();

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
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Create Sales Slip
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 3 }}>
        Create a new sales slip and automatically update inventory
      </Typography>

      <Paper sx={{ p: 3 }} elevation={2}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Customer Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1 }}>
                Customer Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Customer Name *"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                placeholder="Enter customer name"
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Customer Phone"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Customer Email"
                name="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={handleInputChange}
                placeholder="Enter email address"
              />
            </Grid>

            {/* Payment Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1, mt: 2 }}>
                Payment Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Method *</InputLabel>
                <Select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  label="Payment Method *"
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

            {/* Items Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1, mt: 2 }}>
                Items ({formData.items.length})
              </Typography>
            </Grid>

            {formData.items.map((item, index) => (
              <Grid item xs={12} key={index}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
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
                              <MenuItem key={category} value={category}>
                                {category}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <FormControl fullWidth>
                          <InputLabel>Product *</InputLabel>
                          <Select
                            value={item.product}
                            onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                            disabled={!item.category}
                            label="Product *"
                          >
                            <MenuItem value="">Select Product</MenuItem>
                            {products
                              .filter(p => p.category === item.category)
                              .map(product => (
                                <MenuItem key={product._id} value={product._id}>
                                  {product.name} - ₹{product.price}
                                  {product.quantity <= 10 && (
                                    <span style={{ color: '#f44336', marginLeft: '8px' }}>
                                      (Low stock: {product.quantity})
                                    </span>
                                  )}
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={6} sm={2}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Quantity *"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                          inputProps={{ min: 1 }}
                        />
                      </Grid>

                      <Grid item xs={6} sm={2}>
                        <TextField fullWidth label="Price" value={`₹${item.price}`} disabled />
                      </Grid>

                      <Grid item xs={6} sm={1}>
                        <Typography variant="body1" fontWeight="bold">
                          ₹{item.total.toFixed(2)}
                        </Typography>
                      </Grid>

                      <Grid item xs={6} sm={1}>
                        <IconButton
                          color="error"
                          onClick={() => removeItem(index)}
                          disabled={formData.items.length <= 1}
                          title="Remove item"
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
              <Button onClick={addItem} startIcon={<AddIcon />} variant="outlined" color="primary">
                Add Another Item
              </Button>
            </Grid>

            {/* Totals Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1, mt: 2 }}>
                Order Summary
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Discount (₹)"
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleInputChange}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Tax (₹)"
                type="number"
                name="tax"
                value={formData.tax}
                onChange={handleInputChange}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Final Amount
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    ₹{totalAmount.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    Subtotal: ₹{subtotal.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                multiline
                rows={3}
                placeholder="Any additional notes..."
              />
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  endIcon={<SendIcon />}
                  disabled={loading.submission}
                  sx={{ minWidth: 150 }}
                >
                  {loading.submission ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    'Create Slip'
                  )}
                </Button>

                <Link to="/SlipPage" style={{ textDecoration: 'none' }}>
                  <Button variant="outlined" size="large">
                    View All Slips
                  </Button>
                </Link>

                <Link to="/income" style={{ textDecoration: 'none' }}>
                  <Button variant="outlined" size="large">
                    View Income
                  </Button>
                </Link>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={hideNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={notification.severity}
          variant="filled"
          onClose={hideNotification}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Slips;
