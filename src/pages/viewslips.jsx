import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  Button, 
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import { ArrowBack, Download, Print } from '@mui/icons-material';
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { axiosApi } from '../utils/api'; // ✅ Import your axiosApi

// PDF Styles
const styles = StyleSheet.create({
  page: { 
    padding: 30, 
    fontSize: 12,
    fontFamily: 'Helvetica'
  },
  header: { 
    textAlign: 'center', 
    marginBottom: 20,
    borderBottom: '1pt solid #000',
    paddingBottom: 10
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5
  },
  slipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10
  },
  customerInfo: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f5f5f5'
  },
  table: { 
    display: "table", 
    width: "auto", 
    borderStyle: "solid", 
    borderWidth: 1, 
    marginBottom: 20 
  },
  tableRow: { 
    flexDirection: "row" 
  },
  tableColHeader: { 
    width: "25%", 
    borderStyle: "solid", 
    borderWidth: 1, 
    backgroundColor: "#eee", 
    padding: 8,
    fontWeight: 'bold'
  },
  tableCol: { 
    width: "25%", 
    borderStyle: "solid", 
    borderWidth: 1, 
    padding: 8 
  },
  totals: { 
    marginTop: 10, 
    textAlign: "right",
    borderTop: '1pt solid #000',
    paddingTop: 10
  },
  totalAmount: {
    fontSize: 14, 
    fontWeight: 'bold'
  },
  footer: {
    marginTop: 30, 
    textAlign: "center",
    borderTop: '1pt solid #000',
    paddingTop: 10
  }
});

// PDF Document Component
const SlipPDFDocument = ({ slip }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.companyName}>Saeed Auto</Text>
        <Text>Contact: +92 300 1234567</Text>
        <Text style={styles.slipTitle}>SALES SLIP</Text>
      </View>

      {/* Customer Info */}
      <View style={styles.customerInfo}>
        <Text>Slip #: {slip.slipNumber || slip._id}</Text>
        <Text>Date: {new Date(slip.date || slip.createdAt).toLocaleString()}</Text>
        <Text>Customer: {slip.customerName}</Text>
        <Text>Phone: {slip.customerPhone}</Text>
      </View>

      {/* Products Table */}
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableColHeader}>Product</Text>
          <Text style={styles.tableColHeader}>Qty</Text>
          <Text style={styles.tableColHeader}>Unit Price</Text>
          <Text style={styles.tableColHeader}>Total Price</Text>
        </View>
        {slip.products.map((p, i) => (
          <View style={styles.tableRow} key={i}>
            <Text style={styles.tableCol}>{p.productName}</Text>
            <Text style={styles.tableCol}>{p.quantity}</Text>
            <Text style={styles.tableCol}>Rs {p.unitPrice?.toLocaleString()}</Text>
            <Text style={styles.tableCol}>Rs {p.totalPrice?.toLocaleString()}</Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totals}>
        <Text>Subtotal: Rs {slip.subtotal?.toLocaleString()}</Text>
        <Text>Tax: Rs {slip.tax?.toLocaleString()}</Text>
        <Text>Discount: Rs {slip.discount?.toLocaleString()}</Text>
        <Text style={styles.totalAmount}>Total: Rs {slip.totalAmount?.toLocaleString()}</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Thank you for your purchase!</Text>
        <Text>Muhammad saad ullah khan 03146074093</Text>
      </View>
    </Page>
  </Document>
);

function SlipPage() {
  const { slipId } = useParams();
  const navigate = useNavigate();
  const [slip, setSlip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch actual slip details using axiosApi
    const fetchSlip = async () => {
      try {
        setLoading(true);
        setError('');
        
        // ✅ FIXED: Use axiosApi instead of direct fetch
        const response = await axiosApi.slips.getById(slipId);
        
        setSlip(response.data);
        
      } catch (error) {
        console.error('Error fetching slip:', error);
        console.error('Error details:', error.response?.data);
        setError(`Failed to load slip data: ${error.response?.data?.error || error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (slipId) {
      fetchSlip();
    }
  }, [slipId]);

  // Download PDF function
  const downloadPDF = async () => {
    if (!slip) return;
    
    setGeneratingPDF(true);
    try {
      const blob = await pdf(<SlipPDFDocument slip={slip} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `slip-${slip.slipNumber || slip._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  // Print function
  const handlePrint = () => {
    if (!slip) return;

    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Slip ${slip.slipNumber || slip._id}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #000;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            .company-name { 
              font-size: 24px; 
              font-weight: bold; 
              margin-bottom: 5px;
            }
            .slip-title {
              font-size: 20px;
              font-weight: bold;
              margin: 10px 0;
            }
            .customer-info {
              margin-bottom: 20px;
              padding: 10px;
              background-color: #f5f5f5;
              border-radius: 5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #eee;
              font-weight: bold;
            }
            .totals {
              text-align: right;
              margin-top: 20px;
              border-top: 2px solid #000;
              padding-top: 10px;
            }
            .total-amount {
              font-size: 18px;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              border-top: 1px solid #000;
              padding-top: 10px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">Saeed Auto</div>
            <div>Contact: +92 300 1234567</div>
            <div class="slip-title">SALES SLIP</div>
          </div>
          
          <div class="customer-info">
            <div><strong>Slip #:</strong> ${slip.slipNumber || slip._id}</div>
            <div><strong>Date:</strong> ${new Date(slip.date || slip.createdAt).toLocaleString()}</div>
            <div><strong>Customer:</strong> ${slip.customerName}</div>
            <div><strong>Phone:</strong> ${slip.customerPhone}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total Price</th>
              </tr>
            </thead>
            <tbody>
              ${slip.products.map(product => `
                <tr>
                  <td>${product.productName}</td>
                  <td>${product.quantity}</td>
                  <td>Rs ${product.unitPrice?.toLocaleString()}</td>
                  <td>Rs ${product.totalPrice?.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <div><strong>Subtotal:</strong> Rs ${slip.subtotal?.toLocaleString()}</div>
            <div><strong>Tax:</strong> Rs ${slip.tax?.toLocaleString()}</div>
            <div><strong>Discount:</strong> Rs ${slip.discount?.toLocaleString()}</div>
            <div class="total-amount"><strong>Total:</strong> Rs ${slip.totalAmount?.toLocaleString()}</div>
          </div>
          
          <div class="footer">
            <div>Software desgin by Saad </div>
            <div><strong>03146074093</strong></div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 100);
            }
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading slip data...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/slips')}>
          Back to Slips
        </Button>
      </Container>
    );
  }

  if (!slip) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">Slip not found</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/slips')} sx={{ mt: 2 }}>
          Back to Slips
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ 
      mt: 4, 
      mb: 4,
      minHeight: '100vh'
    }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/slips')}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Back to Slips
        </Button>
        
        <Stack direction="row" spacing={2}>
          <Button 
            variant="outlined" 
            startIcon={<Print />}
            onClick={handlePrint}
            sx={{ borderRadius: 2 }}
          >
            Print
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Download />}
            onClick={downloadPDF}
            disabled={generatingPDF}
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
              }
            }}
          >
            {generatingPDF ? 'Generating...' : 'Download PDF'}
          </Button>
        </Stack>
      </Stack>
      
      <Paper elevation={0} sx={{ 
        p: 4,
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }} id="slip-content">
        <Typography variant="h4" gutterBottom align="center" sx={{
          background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold',
          mb: 3
        }}>
          Slip Details
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography><strong>Slip #:</strong> {slip.slipNumber || slip._id}</Typography>
          <Typography><strong>Date:</strong> {new Date(slip.date || slip.createdAt).toLocaleString()}</Typography>
          <Typography><strong>Customer:</strong> {slip.customerName}</Typography>
          <Typography><strong>Phone:</strong> {slip.customerPhone}</Typography>
          <Typography><strong>Payment Method:</strong> {slip.paymentMethod}</Typography>
          {slip.status && <Typography><strong>Status:</strong> {slip.status}</Typography>}
        </Box>

        <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ 
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                '& .MuiTableCell-head': {
                  color: 'white',
                  fontWeight: 'bold'
                }
              }}>
                <TableCell><strong>Product</strong></TableCell>
                <TableCell><strong>Qty</strong></TableCell>
                <TableCell><strong>Unit Price</strong></TableCell>
                <TableCell><strong>Total Price</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {slip.products.map((product, index) => (
                <TableRow key={index}>
                  <TableCell>{product.productName}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>Rs {product.unitPrice?.toLocaleString()}</TableCell>
                  <TableCell>Rs {product.totalPrice?.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ 
          mt: 3, 
          p: 3,
          textAlign: 'right',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)',
          borderRadius: 2,
          border: '1px solid #e0e0e0'
        }}>
          <Typography sx={{ mb: 1 }}><strong>Subtotal:</strong> ₹{slip.subtotal?.toLocaleString()}</Typography>
          <Typography sx={{ mb: 1 }}><strong>Tax:</strong> ₹{(slip.tax || 0).toLocaleString()}</Typography>
          <Typography sx={{ mb: 1 }}><strong>Discount:</strong> ₹{(slip.discount || 0).toLocaleString()}</Typography>
          <Typography variant="h5" sx={{ 
            mt: 2,
            color: 'success.main',
            fontWeight: 'bold'
          }}>
            <strong>Total: ₹{slip.totalAmount?.toLocaleString()}</strong>
          </Typography>
        </Box>

        {slip.notes && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>Notes:</strong> {slip.notes}
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default SlipPage;