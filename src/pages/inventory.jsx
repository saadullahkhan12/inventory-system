import * as React from 'react';
import {
  Box, Tabs, Tab, Typography, Paper,
  Table, TableBody, TableCell, tableCellClasses,
  TableContainer, TableHead, TableRow
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';

// Styled MUI components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 'bold'
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
  '&:last-child td, &:last-child th': { border: 0 },
}));

function CustomTabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}
CustomTabPanel.propTypes = {
  children: PropTypes.node, value: PropTypes.number.isRequired, index: PropTypes.number.isRequired,
};
function a11yProps(index) {
  return {
    id: `income-tab-${index}`,
    'aria-controls': `income-tabpanel-${index}`,
  };
}

// Sample static data
const sampleData = [
  {
    date: '2025-08-05',
    totalIncome: 1200,
    productsSold: [
      { productName: 'Blue Pen', quantity: 10, unitPrice: 10, totalPrice: 100 },
      { productName: 'Notebook', quantity: 5, unitPrice: 40, totalPrice: 200 },
    ]
  },
  {
    date: '2025-08-04',
    totalIncome: 900,
    productsSold: [
      { productName: 'Marker', quantity: 3, unitPrice: 50, totalPrice: 150 },
      { productName: 'Eraser', quantity: 20, unitPrice: 15, totalPrice: 300 },
    ]
  }
];

export default function IcomePage() {
  const [value, setValue] = React.useState(0);

  const getTotalIncome = (data) => data.reduce((sum, d) => sum + d.totalIncome, 0);
  const getTotalItems = (data) => data.reduce((sum, d) =>
    sum + d.productsSold.reduce((s, p) => s + p.quantity, 0), 0
  );

  const renderTable = (data) => (
    <>
      <Box className="mb-4">
        <Typography variant="h6">Total Income: Rs {getTotalIncome(data).toFixed(2)}</Typography>
        <Typography variant="subtitle1">Total Items Sold: {getTotalItems(data)}</Typography>
      </Box>

      {data.map((entry, i) => (
        <Box key={i} className="mb-6">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Date: {new Date(entry.date).toLocaleDateString()}
          </Typography>
          <TableContainer component={Paper} elevation={2}>
            <Table sx={{ minWidth: 600 }} aria-label="products sold table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Product Name</StyledTableCell>
                  <StyledTableCell align="right">Quantity</StyledTableCell>
                  <StyledTableCell align="right">Unit Price</StyledTableCell>
                  <StyledTableCell align="right">Total Price</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entry.productsSold.map((product, j) => (
                  <StyledTableRow key={j}>
                    <StyledTableCell>{product.productName}</StyledTableCell>
                    <StyledTableCell align="right">{product.quantity}</StyledTableCell>
                    <StyledTableCell align="right">Rs {product.unitPrice}</StyledTableCell>
                    <StyledTableCell align="right">Rs {product.totalPrice}</StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}
    </>
  );

  return (
    <Box sx={{ marginTop: '60px', width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={(e, newVal) => setValue(newVal)} aria-label="Income Tabs">
          <Tab label="Daily Income" {...a11yProps(0)} />
          <Tab label="Weekly Income" {...a11yProps(1)} />
          <Tab label="Monthly Income" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>{renderTable(sampleData)}</CustomTabPanel>
      <CustomTabPanel value={value} index={1}>{renderTable(sampleData)}</CustomTabPanel>
      <CustomTabPanel value={value} index={2}>{renderTable(sampleData)}</CustomTabPanel>
    </Box>
  );
}