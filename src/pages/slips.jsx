import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Grid, Paper, Typography, TextField, Button, FormControl, InputLabel, Select,
  MenuItem, Snackbar, Alert, Card, CardContent, IconButton
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Tooltip from '@mui/material/Tooltip';
import { Link } from 'react-router-dom';

const API_URL_slips = "https://inventory-system-back-end-production.up.railway.app/api/slips";
const API_URL_products = "https://inventory-system-back-end-production.up.railway.app/api/products";

const Slips = () => {
  const [customerName, setCustomerName] = useState('Customer');
  const [paymentType, setPaymentType] = useState('');
  const [items, setItems] = useState([{ category: '', product: '', quantity: 1, price: 0, total: 0 }]);
  const [success, setSuccess] = useState(false);
  const [stockError, setStockError] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  // Fetch categories and products on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsRes = await axios.get(API_URL_products);
        setProducts(productsRes.data);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(productsRes.data.map(product => product.category))];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // Handle category selection
  const handleCategoryChange = (index, category) => {
    const updatedItems = [...items];
    updatedItems[index].category = category;
    updatedItems[index].product = ''; // Reset product when category changes
    setItems(updatedItems);
  };

  // Handle product selection - auto-fill price
  const handleProductChange = (index, productId) => {
    const updatedItems = [...items];
    const selectedProduct = products.find(p => p._id === productId);
    
    if (selectedProduct) {
      updatedItems[index].product = productId;
      updatedItems[index].price = selectedProduct.price;
      updatedItems[index].total = updatedItems[index].quantity * selectedProduct.price;
    }
    
    setItems(updatedItems);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;

    if (field === 'quantity') {
      const quantity = parseInt(value) || 0;
      updatedItems[index].total = quantity * updatedItems[index].price;
    }

    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([...items, { category: '', product: '', quantity: 1, price: 0, total: 0 }]);
  };

  const removeItem = (index) => {
    const updatedItems = items.filter((_, idx) => idx !== index);
    setItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for zero or negative quantities/prices
    const hasInvalidItems = items.some(item => 
      item.quantity <= 0 || 
      item.price <= 0 || 
      !item.category || 
      !item.product
    );

    if (hasInvalidItems) {
      setStockError(true);
      return;
    }

    // Check if any product is out of stock
    const outOfStockItems = await Promise.all(items.map(async (item) => {
      try {
        const response = await axios.get(`${API_URL_products}/${item.product}`);
        return response.data.stock < item.quantity;
      } catch (err) {
        console.error(err);
        return true;
      }
    }));

    if (outOfStockItems.some(outOfStock => outOfStock)) {
      setStockError(true);
      return;
    }

    try {
      const slipData = { 
        customerName, 
        paymentType, 
        items: items.map(item => ({
          productId: item.product,
          itemName: products.find(p => p._id === item.product)?.name || '',
          quantity: item.quantity,
          price: item.price,
          total: item.total
        }))
      };
      
      await axios.post(API_URL_slips, slipData);
      setSuccess(true);
      setCustomerName('');
      setPaymentType('');
      setItems([{ category: '', product: '', quantity: 1, price: 0, total: 0 }]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setSuccess(false);
    setStockError(false);
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h4" className='font-serif' gutterBottom>Create Slip</Typography>
      <Paper sx={{ p: 3 }} elevation={3}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Payment Type</InputLabel>
                <Select
                  value={paymentType}
                  label="Payment Type"
                  onChange={(e) => setPaymentType(e.target.value)}
                >
                  <MenuItem value="" disabled>Select Payment Type</MenuItem>
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="pending">Udhaar</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {items.map((item, index) => (
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
                            onChange={(e) => handleCategoryChange(index, e.target.value)}
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
                            onChange={(e) => handleProductChange(index, e.target.value)}
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
                        />
                      </Grid>
                      <Grid item xs={6} sm={1}>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          Total: {item.total.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={1}>
                        <Tooltip title="Delete">
                          <IconButton color="error" onClick={() => removeItem(index)}>
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
                <Button onClick={addItem} startIcon={<AddIcon />} variant="outlined">
                  Add Item
                </Button>
              </Tooltip>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                endIcon={<SendIcon />}
                sx={{
                  backgroundColor: '#1976d2',
                  '&:hover': { backgroundColor: '#115293' },
                }}
              >
                Submit Slip
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
                    Generated Slip
                  </Button>
                </Link>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Success Snackbar */}
      <Snackbar open={success} autoHideDuration={4000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" variant="filled" sx={{ width: '100%' }}>
          Slip successfully generated!
        </Alert>
      </Snackbar>

      {/* Stock Error Snackbar */}
      <Snackbar open={stockError} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error" variant="filled" sx={{ width: '100%' }}>
          Sorry, you can't generate a slip. Either stock is zero or invalid item data.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Slips;
