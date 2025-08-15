import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Grid, Paper, Typography, TextField, Button,
  FormControl, InputLabel, Select, MenuItem,
  Snackbar, Alert, Card, CardContent, IconButton, Tooltip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';

const API_URL_SLIPS = "https://inventory-system-back-end-production.up.railway.app/api/slips";
const API_URL_ITEMS = "https://inventory-system-back-end-production.up.railway.app/api/items";

const Slips = () => {
  const [customerName, setCustomerName] = useState('Customer');
  const [paymentType, setPaymentType] = useState('');
  const [items, setItems] = useState([{ _id: '', quantity: 1 }]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [success, setSuccess] = useState(false);

  // Fetch inventory items
  useEffect(() => {
    axios.get(API_URL_ITEMS)
      .then(res => setInventoryItems(res.data))
      .catch(err => console.error("Error fetching items:", err));
  }, []);

  // Handle item/qty change
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  // Add/remove item row
  const addItem = () => setItems([...items, { _id: '', quantity: 1 }]);
  const removeItem = (index) => setItems(items.filter((_, idx) => idx !== index));

  // Submit slip
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const slipData = {
        customerName,
        paymentType,
        items: items.map(i => ({ _id: i._id, quantity: Number(i.quantity) }))
      };

      await axios.post(API_URL_SLIPS, slipData);
      setSuccess(true);

      // Reset form
      setCustomerName('');
      setPaymentType('');
      setItems([{ _id: '', quantity: 1 }]);
    } catch (err) {
      console.error("Error creating slip:", err);
    }
  };

  const handleClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setSuccess(false);
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h4" className='font-serif' gutterBottom>
        Create Slip
      </Typography>

      <Paper sx={{ p: 3 }} elevation={3}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Customer */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </Grid>

            {/* Payment Type */}
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

            {/* Items */}
            {items.map((item, index) => (
              <Grid item xs={12} key={index}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      {/* Item Selector */}
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required>
                          <InputLabel>Item</InputLabel>
                          <Select
                            value={item._id}
                            onChange={(e) => handleItemChange(index, '_id', e.target.value)}
                          >
                            {inventoryItems.map(invItem => (
                              <MenuItem key={invItem._id} value={invItem._id}>
                                {invItem.name} (Stock: {invItem.quantity})
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      {/* Quantity */}
                      <Grid item xs={6} sm={3}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Quantity"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          required
                        />
                      </Grid>

                      {/* Delete */}
                      <Grid item xs={6} sm={3}>
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

            {/* Add Item */}
            <Grid item xs={12}>
              <Tooltip title="Add Item">
                <Button onClick={addItem} startIcon={<AddIcon />} variant="outlined">
                  Add Item
                </Button>
              </Tooltip>
            </Grid>

            {/* Submit */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                endIcon={<SendIcon />}
                sx={{
                  backgroundColor: '#1976d2',
                  '&:hover': { backgroundColor: '#115293' }
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
                      '&:hover': { backgroundColor: '#115293' }
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

      {/* Success message */}
      <Snackbar open={success} autoHideDuration={4000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" variant="filled" sx={{ width: '100%' }}>
          Slip successfully generated!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Slips;
