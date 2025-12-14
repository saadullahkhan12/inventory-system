import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, TextField, Button, FormControl, InputLabel, Select,
  MenuItem, Snackbar, Alert, Card, CardContent, IconButton, CircularProgress, useMediaQuery, useTheme, Tooltip, Chip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';
import { Link, useNavigate } from 'react-router-dom';
import { axiosApi } from '../utils/api';
import { useNotification } from '../utils/notifications';

const Slips = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ✔ UPDATED — removed backend-removed fields
  const [formData, setFormData] = useState({
    customerName: '',
    items: [{ category: '', product: '', quantity: 1, price: 0, total: 0, subcategory: '', company: '' }]
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
      updatedItems[index] = { category: value, product: '', quantity: 1, price: 0, total: 0, subcategory: '', company: '' };
    } else if (field === 'product') {
      const product = products.find(p => p._id === value);
      updatedItems[index].product = value;
      updatedItems[index].price = product?.price || 0;
      updatedItems[index].category = product?.category || '';
      updatedItems[index].subcategory = product?.subcategory || '';
      updatedItems[index].company = product?.company || '';
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
      items: [...prev.items, { category: '', product: '', quantity: 1, price: 0, total: 0, subcategory: '', company: '' }]
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
          totalPrice: item.total,
          category: item.category || product?.category || '',
          subcategory: item.subcategory || product?.subcategory || '',
          company: item.company || product?.company || ''
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
        items: [{ category: '', product: '', quantity: 1, price: 0, total: 0, subcategory: '', company: '' }]
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
    <Box sx={{ 
      maxWidth: 1200, 
      mx: 'auto', 
      mt: { xs: 0.5, sm: 1, md: 2 }, 
      p: { xs: 1, sm: 1.5, md: 3 },
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f5f7fa 0%, #ffffff 100%)',
      pb: { xs: 2, sm: 3 }
    }}>
      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Typography variant="h4" fontWeight="bold" sx={{ 
          background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 1,
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
        }}>
          Create Sales Slip
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" sx={{
          fontSize: { xs: '0.875rem', sm: '1rem' },
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
        }}>
          Add products and create a new sales slip for your customer
        </Typography>
      </Box>

      <Paper sx={{ 
        p: { xs: 1.5, sm: 2.5, md: 4 }, 
        mt: { xs: 1, sm: 2 },
        borderRadius: { xs: 2, sm: 3 },
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        mx: { xs: 0.5, sm: 0 }
      }} elevation={0}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={{ xs: 2, sm: 3 }}>

            {/* Customer Name */}
            <Grid item xs={12}>
              <Tooltip title="Enter the name of the customer for this slip" arrow placement="top">
                <TextField
                  fullWidth
                  label="Customer Name *"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Required field" arrow>
                        <InfoIcon sx={{ color: 'text.secondary', fontSize: '1rem', ml: 1 }} />
                      </Tooltip>
                    )
                  }}
                />
              </Tooltip>
            </Grid>

            {/* Items */}
            <Grid item xs={12}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: { xs: 'flex-start', sm: 'center' },
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1, sm: 0 },
                mb: 2 
              }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
                }}>
                  Items ({formData.items.length})
                </Typography>
                <Tooltip title="Add another product to this slip" arrow>
                  <Button 
                    variant="outlined" 
                    startIcon={<AddIcon />} 
                    onClick={addItem}
                    sx={{ 
                      borderRadius: 2,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      px: { xs: 1.5, sm: 2 },
                      py: { xs: 0.75, sm: 1 }
                    }}
                  >
                    Add Item
                  </Button>
                </Tooltip>
              </Box>
            </Grid>

            {formData.items.map((item, index) => (
              <Grid item xs={12} key={index}>
                <Card variant="outlined" sx={{
                  borderRadius: 2,
                  border: '1px solid #e0e0e0',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: 'primary.main'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}>
                  <CardContent>
                    <Grid container spacing={2}>

                      {/* Category */}
                      <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
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
                      <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
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
                                  <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                    <Typography variant="body2" fontWeight="bold">
                                      {product.name} - Rs {product.price}
                                    </Typography>
                                    {(product.subcategory || product.company) && (
                                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                                        {product.subcategory && (
                                          <Chip label={product.subcategory} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: '20px' }} />
                                        )}
                                        {product.company && (
                                          <Chip label={product.company} size="small" variant="outlined" color="primary" sx={{ fontSize: '0.65rem', height: '20px' }} />
                                        )}
                                      </Box>
                                    )}
                                  </Box>
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      {/* Quantity */}
                      <Grid item xs={6} sm={4} md={2}>
                        <TextField
                          fullWidth
                          label="Qty *"
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          inputProps={{ min: 1 }}
                          size={isMobile ? 'small' : 'medium'}
                        />
                      </Grid>

                      {/* Total */}
                      <Grid item xs={6} sm={4} md={3}>
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          alignItems: 'flex-start', 
                          justifyContent: 'center',
                          height: '100%',
                          minHeight: { xs: '40px', sm: '56px' }
                        }}>
                          <Typography variant="h6" sx={{ 
                            fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
                            fontWeight: 'bold',
                            color: 'primary.main',
                            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
                          }}>
                            Rs {item.total.toFixed(2)}
                          </Typography>
                          {(item.subcategory || item.company) && (
                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                              {item.subcategory && (
                                <Chip label={item.subcategory} size="small" variant="outlined" sx={{ fontSize: '0.6rem', height: '18px' }} />
                              )}
                              {item.company && (
                                <Chip label={item.company} size="small" variant="outlined" color="primary" sx={{ fontSize: '0.6rem', height: '18px' }} />
                              )}
                            </Box>
                          )}
                        </Box>
                      </Grid>

                      {/* Remove */}
                      <Grid item xs={12} sm={4} md={1}>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: { xs: 'flex-start', sm: 'center' },
                          alignItems: 'center',
                          height: '100%',
                          minHeight: { xs: '40px', sm: '56px' }
                        }}>
                          <IconButton
                            color="error"
                            onClick={() => removeItem(index)}
                            disabled={formData.items.length === 1}
                            size={isMobile ? 'small' : 'medium'}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Grid>

                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            {/* Summary */}
            <Grid item xs={12}>
              <Card sx={{ 
                p: 3, 
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                color: 'white',
                borderRadius: 2,
                boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)'
              }}>
                <Typography variant="h6" sx={{ mb: 1, opacity: 0.9 }}>Total Amount</Typography>
                <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                  Rs {totalAmount.toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Subtotal: Rs {subtotal.toFixed(2)}</Typography>
              </Card>
            </Grid>

            {/* Submit */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Tooltip title="Create and save this sales slip. Inventory will be automatically updated." arrow>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    endIcon={<SendIcon />}
                    disabled={loading.submission}
                    sx={{
                      minWidth: 200,
                      py: 1.5,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                      },
                      boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)'
                    }}
                  >
                    {loading.submission ? <CircularProgress size={24} color="inherit" /> : 'Create Slip'}
                  </Button>
                </Tooltip>
              </Box>
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
