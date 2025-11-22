import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Chip,
  Paper,
} from "@mui/material";
import { useNotification } from "../utils/notifications";
import { axiosApi } from "../utils/api";

const Income = () => {
  const [loading, setLoading] = useState({ 
    products: true, 
    income: true, 
    submitting: false,
    testing: false 
  });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [incomeSummary, setIncomeSummary] = useState(null);
  const { notification, showNotification, hideNotification } = useNotification();

  // Fetch products and income data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const productsRes = await axiosApi.items.getAll();
        const productsData = productsRes.data?.items || [];
        setProducts(Array.isArray(productsData) ? productsData : []);
        
        const uniqueCategories = [...new Set(productsData.map((p) => p.category || 'Uncategorized'))];
        setCategories(uniqueCategories);

        // Fetch income records
        const incomeRes = await axiosApi.income.getAll({ limit: 50 });
        const incomeData = incomeRes.data?.records || incomeRes.data || [];
        setIncomes(Array.isArray(incomeData) ? incomeData : []);

        // Fetch income summary
        const summaryRes = await axiosApi.income.getSummary();
        setIncomeSummary(summaryRes.data);

      } catch (err) {
        console.error('Error fetching data:', err);
        showNotification("error", "Failed to fetch data: " + (err.response?.data?.error || err.message));
      } finally {
        setLoading({ products: false, income: false, submitting: false, testing: false });
      }
    };

    fetchData();
  }, []);

  const handleProductSelect = (category, productId) => {
    setSelectedProducts((prev) => ({ ...prev, [category]: productId }));
  };

  const handleAddEntry = async (category) => {
    const productId = selectedProducts[category];
    if (!productId) {
      showNotification("error", "Please select a product first");
      return;
    }

    const selectedProduct = products.find((p) => p._id === productId);
    if (!selectedProduct) {
      showNotification("error", "Selected product not found");
      return;
    }

    const incomeData = {
      totalIncome: selectedProduct.price,
      productsSold: [
        {
          productName: selectedProduct.name,
          sku: selectedProduct.sku || "N/A",
          quantity: 1,
          unitPrice: selectedProduct.price,
          totalPrice: selectedProduct.price,
          category: selectedProduct.category || "General",
        },
      ],
      customerName: "Manual Entry",
      paymentMethod: "Cash",
      notes: `Manual income entry for ${selectedProduct.name}`,
    };

    try {
      setLoading((prev) => ({ ...prev, submitting: true }));
      const res = await axiosApi.income.create(incomeData);
      
      if (res.data) {
        showNotification("success", `Income added: ₹${selectedProduct.price} for ${selectedProduct.name}`);
        setSelectedProducts((prev) => ({ ...prev, [category]: "" }));
        
        // Refresh income data
        const incomeRes = await axiosApi.income.getAll({ limit: 50 });
        const incomeData = incomeRes.data?.records || incomeRes.data || [];
        setIncomes(Array.isArray(incomeData) ? incomeData : []);
        
        const summaryRes = await axiosApi.income.getSummary();
        setIncomeSummary(summaryRes.data);
      }
    } catch (err) {
      console.error('Income creation error:', err);
      const errorMsg = err.response?.data?.error || err.message || "Failed to add income entry";
      showNotification("error", errorMsg);
    } finally {
      setLoading((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleTestIncomeAPI = async () => {
    setLoading(prev => ({ ...prev, testing: true }));
    try {
      console.log('🧪 Testing Income API...');
      
      // Test 1: Create test income
      const testIncomeData = {
        totalIncome: 150,
        productsSold: [{
          productName: 'Test Product',
          sku: 'TEST-001',
          quantity: 1,
          unitPrice: 150,
          totalPrice: 150,
          category: 'Test'
        }],
        customerName: 'Test Customer',
        paymentMethod: 'Cash',
        notes: 'Test income entry from frontend'
      };

      const createRes = await axiosApi.income.create(testIncomeData);
      console.log('✅ Create income:', createRes.data);

      // Test 2: Get all incomes
      const getAllRes = await axiosApi.income.getAll({ limit: 5 });
      console.log('✅ Get incomes:', getAllRes.data);

      // Test 3: Get summary
      const summaryRes = await axiosApi.income.getSummary();
      console.log('✅ Income summary:', summaryRes.data);

      showNotification('success', '✅ Income API tests passed! Check console for details.');
    } catch (error) {
      console.error('❌ Income API test failed:', error);
      const errorMsg = error.response?.data?.error || error.message;
      showNotification('error', `Income API test failed: ${errorMsg}`);
    } finally {
      setLoading(prev => ({ ...prev, testing: false }));
    }
  };

  if (loading.products || loading.income) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading income data...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 'bold' }}>
        Income Management
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 4 }}>
        Manage income entries and track sales
      </Typography>

      {/* Income Summary */}
      {incomeSummary && (
        <Card sx={{ mb: 4, bgcolor: 'primary.main', color: 'white' }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="h6">Total Income</Typography>
                <Typography variant="h4">₹{incomeSummary.totalIncome?.toLocaleString() || 0}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="h6">Today's Income</Typography>
                <Typography variant="h4">₹{incomeSummary.todayIncome?.toLocaleString() || 0}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="h6">Monthly Income</Typography>
                <Typography variant="h4">₹{incomeSummary.monthIncome?.toLocaleString() || 0}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="h6">Total Records</Typography>
                <Typography variant="h4">{incomeSummary.totalRecords || 0}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}


      {/* Income Entry by Category */}
      <Typography variant="h5" sx={{ mb: 3 }}>Quick Income Entry</Typography>
      
      {categories.length > 0 ? (
        <Grid container spacing={3}>
          {categories.map((category) => {
            const categoryProducts = products.filter(p => p.category === category);
            return (
              <Grid item xs={12} sm={6} md={4} key={category}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      {category}
                      <Chip 
                        label={`${categoryProducts.length} items`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </Typography>
                    
                    <TextField
                      select
                      label="Select Product"
                      fullWidth
                      size="small"
                      sx={{ mb: 2 }}
                      value={selectedProducts[category] || ""}
                      onChange={(e) => handleProductSelect(category, e.target.value)}
                    >
                      <MenuItem value="">
                        <em>Choose a product...</em>
                      </MenuItem>
                      {categoryProducts.map((product) => (
                        <MenuItem key={product._id} value={product._id}>
                          {product.name} - ₹{product.price} 
                          {product.quantity <= 10 && (
                            <span style={{ color: '#f44336', marginLeft: '8px' }}>
                              (Low stock: {product.quantity})
                            </span>
                          )}
                        </MenuItem>
                      ))}
                    </TextField>

                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleAddEntry(category)}
                      disabled={loading.submitting || !selectedProducts[category]}
                      startIcon={
                        loading.submitting ? <CircularProgress size={16} /> : null
                      }
                    >
                      {loading.submitting ? "Adding..." : `Add ₹${ 
                        products.find(p => p._id === selectedProducts[category])?.price || 0 
                      } Income`}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            No products found. Please add products first.
          </Typography>
        </Box>
      )}

      {/* Recent Income Entries */}
      {incomes.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom>Recent Income Entries</Typography>
          <Grid container spacing={2}>
            {incomes.slice(0, 6).map((income, index) => (
              <Grid item xs={12} sm={6} md={4} key={income._id || index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      {new Date(income.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ₹{income.totalIncome}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {income.productsSold?.[0]?.productName || 'No products'}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      {income.paymentMethod} • {income.customerName}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={hideNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={hideNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Income;