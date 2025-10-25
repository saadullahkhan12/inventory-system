import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Chip
} from '@mui/material';

const SlipInvoice = ({ slip }) => {
  // Safe data access with comprehensive fallbacks
  if (!slip) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">No slip data available</Typography>
      </Paper>
    );
  }

  const {
    slipNumber = 'N/A',
    customerName = 'Walk-in Customer',
    customerPhone = '',
    customerEmail = '',
    products = [],
    items = [], // Support both products and items
    subtotal = 0,
    tax = 0,
    discount = 0,
    totalAmount = 0,
    paymentMethod = 'Cash',
    notes = '',
    date = new Date(),
    createdAt = new Date(),
    status = 'Paid'
  } = slip;

  // Use products or items array, whichever is available and valid
  const safeProducts = Array.isArray(products) && products.length > 0 ? products : 
                     Array.isArray(items) && items.length > 0 ? items : [];

  // Calculate actual total from products if available
  const calculatedTotal = safeProducts.reduce((sum, product) => 
    sum + (product.totalPrice || product.total || 0), 0
  );

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            INVOICE
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Slip #: {slipNumber}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Date: {new Date(date || createdAt).toLocaleDateString()}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Time: {new Date(date || createdAt).toLocaleTimeString()}
          </Typography>
        </Box>
        <Chip 
          label={status} 
          color={status === 'Paid' ? 'success' : status === 'Pending' ? 'warning' : 'error'}
          variant="outlined"
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Customer Info */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>Customer Information</Typography>
        <Typography><strong>Name:</strong> {customerName}</Typography>
        {customerPhone && <Typography><strong>Phone:</strong> {customerPhone}</Typography>}
        {customerEmail && <Typography><strong>Email:</strong> {customerEmail}</Typography>}
        <Typography><strong>Payment Method:</strong> {paymentMethod}</Typography>
      </Box>

      {/* Products Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Product</strong></TableCell>
              <TableCell align="right"><strong>Qty</strong></TableCell>
              <TableCell align="right"><strong>Unit Price</strong></TableCell>
              <TableCell align="right"><strong>Total</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {safeProducts.length > 0 ? (
              safeProducts.map((product, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {product.productName || product.itemName || product.name || 'Unknown Product'}
                  </TableCell>
                  <TableCell align="right">{product.quantity || 0}</TableCell>
                  <TableCell align="right">
                    ₹{product.unitPrice?.toFixed(2) || product.price?.toFixed(2) || '0.00'}
                  </TableCell>
                  <TableCell align="right">
                    ₹{product.totalPrice?.toFixed(2) || product.total?.toFixed(2) || '0.00'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="textSecondary">
                    No products found in this slip
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Totals */}
      <Box sx={{ mt: 3, textAlign: 'right' }}>
        <Typography variant="body1">
          <strong>Subtotal:</strong> ₹{subtotal?.toFixed(2) || calculatedTotal.toFixed(2)}
        </Typography>
        {discount > 0 && (
          <Typography variant="body1">
            <strong>Discount:</strong> ₹{discount?.toFixed(2) || '0.00'}
          </Typography>
        )}
        {tax > 0 && (
          <Typography variant="body1">
            <strong>Tax:</strong> ₹{tax?.toFixed(2) || '0.00'}
          </Typography>
        )}
        <Divider sx={{ my: 1 }} />
        <Typography variant="h6">
          <strong>Total Amount: ₹{totalAmount?.toFixed(2) || (calculatedTotal - discount + tax).toFixed(2)}</strong>
        </Typography>
      </Box>

      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="caption" color="textSecondary">
            <strong>Debug Info:</strong> Products: {safeProducts.length} | 
            Slip ID: {slip._id || 'N/A'} | 
            Has products: {!!slip.products} | 
            Has items: {!!slip.items}
          </Typography>
        </Box>
      )}

      {/* Notes */}
      {notes && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2"><strong>Notes:</strong></Typography>
          <Typography variant="body2" color="textSecondary">
            {notes}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default SlipInvoice;