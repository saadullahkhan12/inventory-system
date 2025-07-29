import React, { useRef } from 'react';
import { Button, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useReactToPrint } from 'react-to-print';

const SlipInvoice = ({ slip }) => {
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  if (!slip) return <p className="text-center py-10">Loading invoice...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md print:shadow-none print:p-0 print:rounded-none">
      <div ref={componentRef} className="text-sm print:text-xs">
        {/* Header */}
        <div className="text-center mb-6">
          <Typography variant="h5" className="font-bold">Customer Invoice</Typography>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-2 gap-y-2 mb-4 text-gray-700">
          <div><strong>Customer:</strong> {slip.customerName}</div>
          <div><strong>Payment:</strong> {slip.paymentType}</div>
          <div><strong>Slip #:</strong> {slip.slipNumber}</div>
          <div><strong>Date:</strong> {new Date(slip.date).toLocaleDateString()}</div>
          <div><strong>Time:</strong> {slip.time}</div>
        </div>

        {/* Table */}
        <Table size="small">
          <TableHead>
            <TableRow className="bg-gray-100">
              <TableCell><strong>Item</strong></TableCell>
              <TableCell><strong>Qty</strong></TableCell>
              <TableCell><strong>Price</strong></TableCell>
              <TableCell><strong>Total</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {slip.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.itemName}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.price}</TableCell>
                <TableCell>{item.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Totals */}
        <div className="mt-6 flex justify-end text-right text-gray-800">
          <div className="space-y-1">
            <div><strong>Total Quantity:</strong> {slip.totalQuantity}</div>
            <div><strong>Total Amount:</strong> Rs. {slip.totalAmount}</div>
          </div>
        </div>
      </div>

      {/* Print Button */}
      <div className="mt-8 text-center print:hidden">
        <Button onClick={handlePrint} variant="contained" color="primary">
          Print Invoice
        </Button>
      </div>
    </div>
  );
};

export default SlipInvoice;
