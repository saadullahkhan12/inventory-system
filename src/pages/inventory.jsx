import * as React from 'react';
import PropTypes from 'prop-types';
import {
  Box, Tabs, Tab, Typography, Paper,
  Table, TableBody, TableCell, tableCellClasses,
  TableContainer, TableHead, TableRow, CircularProgress, Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { axiosApi } from '../utils/api';

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
  const [loading, setLoading] = React.useState({
    daily: true,
    weekly: true,
    monthly: true
  });
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    // Fetch daily income data
    axiosApi.income.getToday()
      .then(res => {
        console.log('📊 Daily income response:', res.data);
        // Handle different response formats
        const dailyData = res.data?.records || res.data || [];
        setDaily(Array.isArray(dailyData) ? dailyData : []);
        setLoading(prev => ({ ...prev, daily: false }));
      })
      .catch(err => {
        console.error('Error fetching daily income:', err);
        setError('Failed to load daily income data');
        setLoading(prev => ({ ...prev, daily: false }));
      });
    
    // Fetch weekly income data
    axiosApi.income.getWeekly()
      .then(res => {
        console.log('📊 Weekly income response:', res.data);
        const weeklyData = res.data?.records || res.data || [];
        setWeekly(Array.isArray(weeklyData) ? weeklyData : []);
        setLoading(prev => ({ ...prev, weekly: false }));
      })
      .catch(err => {
        console.error('Error fetching weekly income:', err);
        setError('Failed to load weekly income data');
        setLoading(prev => ({ ...prev, weekly: false }));
      });
    
    // Fetch monthly income data
    axiosApi.income.getMonthly()
      .then(res => {
        console.log('📊 Monthly income response:', res.data);
        const monthlyData = res.data?.records || res.data || [];
        setMonthly(Array.isArray(monthlyData) ? monthlyData : []);
        setLoading(prev => ({ ...prev, monthly: false }));
      })
      .catch(err => {
        console.error('Error fetching monthly income:', err);
        setError('Failed to load monthly income data');
        setLoading(prev => ({ ...prev, monthly: false }));
      });
  }, []);

  // Safe data calculations with fallbacks
  const getTotalIncome = (data) => {
    if (!Array.isArray(data)) return 0;
    return data.reduce((sum, d) => sum + (d.totalIncome || 0), 0);
  };

  const getTotalItems = (data) => {
    if (!Array.isArray(data)) return 0;
    return data.reduce((sum, d) => {
      const products = d.productsSold || [];
      return sum + products.reduce((pSum, p) => pSum + (p.quantity || 0), 0);
    }, 0);
  };

  const renderTable = (data, period) => {
    // Check if still loading
    if (loading.daily && period === 'daily' || 
        loading.weekly && period === 'weekly' || 
        loading.monthly && period === 'monthly') {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading {period} data...</Typography>
        </Box>
      );
    }

    // Check for error
    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      );
    }

    // Check if data is empty
    if (!Array.isArray(data) || data.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            No {period} income records found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Create some sales slips to see income data here.
          </Typography>
        </Box>
      );
    }

    return (
      <>
        <Box sx={{ mb: 4, p: 2, bgcolor: 'primary.main', color: 'white', borderRadius: 1 }}>
          <Typography variant="h6">{period.charAt(0).toUpperCase() + period.slice(1)} Summary</Typography>
          <Typography variant="h5">Total Income: ₹{getTotalIncome(data).toFixed(2)}</Typography>
          <Typography variant="subtitle1">Total Items Sold: {getTotalItems(data)}</Typography>
          <Typography variant="body2">Total Transactions: {data.length}</Typography>
        </Box>

        {data.map((entry, i) => (
          <Box key={i} sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
              Date: {new Date(entry.date || entry.createdAt).toLocaleDateString()}
              {entry.customerName && ` | Customer: ${entry.customerName}`}
              {entry.paymentMethod && ` | Payment: ${entry.paymentMethod}`}
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
                  {(entry.productsSold || []).map((product, j) => (
                    <StyledTableRow key={j}>
                      <StyledTableCell>{product.productName || 'Unknown Product'}</StyledTableCell>
                      <StyledTableCell align="right">{product.quantity || 0}</StyledTableCell>
                      <StyledTableCell align="right">₹{product.unitPrice?.toFixed(2) || '0.00'}</StyledTableCell>
                      <StyledTableCell align="right">₹{product.totalPrice?.toFixed(2) || '0.00'}</StyledTableCell>
                    </StyledTableRow>
                  ))}
                  {/* Total row for this entry */}
                  <StyledTableRow>
                    <StyledTableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
                      Entry Total:
                    </StyledTableCell>
                    <StyledTableCell align="right" sx={{ fontWeight: 'bold' }}>
                      ₹{entry.totalIncome?.toFixed(2) || '0.00'}
                    </StyledTableCell>
                  </StyledTableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))}
      </>
    );
  };

  const handleChange = (event, newValue) => setValue(newValue);

  return (
    <Box sx={{ marginTop: '60px', width: '100%', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Income Reports
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 3 }}>
        View daily, weekly, and monthly income reports
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="Income Tabs">
          <Tab label="Daily Income" {...a11yProps(0)} />
          <Tab label="Weekly Income" {...a11yProps(1)} />
          <Tab label="Monthly Income" {...a11yProps(2)} />
        </Tabs>
      </Box>
      
      <CustomTabPanel value={value} index={0}>
        {renderTable(daily, 'daily')}
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        {renderTable(weekly, 'weekly')}
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        {renderTable(monthly, 'monthly')}
      </CustomTabPanel>
    </Box>
  );
}