import React, { useState } from 'react';
import axios from 'axios';
import {
  Box, Grid, Paper, Typography, TextField, Button, FormControl, InputLabel, Select,
  MenuItem, Snackbar, Alert, Card, CardContent, IconButton
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const Slips = () => {
  const [customerName, setCustomerName] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [items, setItems] = useState([{ itemName: '', quantity: 1, price: 0, total: 0 }]);
  const [success, setSuccess] = useState(false);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;

    if (field === 'quantity' || field === 'price') {
      const quantity = parseInt(updatedItems[index].quantity) || 0;
      const price = parseFloat(updatedItems[index].price) || 0;
      updatedItems[index].total = quantity * price;
    }

    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([...items, { itemName: '', quantity: 1, price: 0, total: 0 }]);
  };

  const removeItem = (index) => {
    const updatedItems = items.filter((_, idx) => idx !== index);
    setItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const slipData = { customerName, paymentType, items };
      await axios.post('http://localhost:5000/api/slips', slipData);
      setSuccess(true);
      setCustomerName('');
      setPaymentType('');
      setItems([{ itemName: '', quantity: 1, price: 0, total: 0 }]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setSuccess(false);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom>Create Slip</Typography>
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
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Item Name"
                          value={item.itemName}
                          onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                          required
                        />
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Quantity"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          required
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
                        />
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          Total: {item.total}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <IconButton color="error" onClick={() => removeItem(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Button onClick={addItem} startIcon={<AddIcon />} variant="outlined">
                Add Item
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                endIcon={<SendIcon />}
                sx={{
                 backgroundColor: '#1976d2',
    '&:hover': {
      backgroundColor: '#115293', 
                  },
                }}
              >
                Submit Slip
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar open={success} autoHideDuration={4000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" variant="filled" sx={{ width: '100%' }}>
          Slip successfully generated!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Slips;
