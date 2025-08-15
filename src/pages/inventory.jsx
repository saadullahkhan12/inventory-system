import * as React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {
  Box, Tabs, Tab, Typography, Paper,
  Table, TableBody, TableCell, tableCellClasses,
  TableContainer, TableHead, TableRow
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled table cells & rows
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
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

// Tab panel component
function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`income-tabpanel-${index}`}
      aria-labelledby={`income-tab-${index}`}
      {...other}
    >
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

export default function Inventory() {
  const [value, setValue] = React.useState(0);
  const [daily, setDaily] = React.useState([]);
  const [weekly, setWeekly] = React.useState([]);
  const [monthly, setMonthly] = React.useState([]);

  React.useEffect(() => {
    axios.get('http://localhost:5000/api/icomes/today').then(res => setDaily(res.data));
    axios.get('http://localhost:5000/api/icomes/weekly').then(res => setWeekly(res.data));
    axios.get('http://localhost:5000/api/icomes/monthly').then(res => setMonthly(res.data));
  }, []);

  const getTotalIncome = (data) => data.reduce((sum, d) => sum + d.totalIncome, 0);
  const getTotalItems = (data) => data.reduce((sum, d) => sum + d.productsSold.reduce((s, p) => s + p.quantity, 0), 0);

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

  const handleChange = (event, newValue) => setValue(newValue);

  return (
    <Box sx={{ marginTop: '60px', width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="Income Tabs">
          <Tab label="Daily Income" {...a11yProps(0)} />
          <Tab label="Weekly Income" {...a11yProps(1)} />
          <Tab label="Monthly Income" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>{renderTable(daily)}</CustomTabPanel>
      <CustomTabPanel value={value} index={1}>{renderTable(weekly)}</CustomTabPanel>
      <CustomTabPanel value={value} index={2}>{renderTable(monthly)}</CustomTabPanel>
    </Box>
  );
}
import DeleteIcon from '@mui/icons-material/Delete';