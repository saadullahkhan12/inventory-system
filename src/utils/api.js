import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const axiosApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Request interceptor for logging
axiosApi.interceptors.request.use(
  (config) => {
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Test backend connection
axiosApi.testConnection = () => axiosApi.get('/test');

// Items API
axiosApi.items = {
  getAll: (params = {}) => axiosApi.get('/items', { params }),
  getById: (id) => axiosApi.get(`/items/${id}`),
  create: (data) => axiosApi.post('/items', data),
  update: (id, data) => axiosApi.put(`/items/${id}`, data),
  delete: (id) => axiosApi.delete(`/items/${id}`),
  updateStock: (id, data) => axiosApi.patch(`/items/${id}/stock`, data),
  getLowStock: () => axiosApi.get('/items/low-stock'),
  getOutOfStock: () => axiosApi.get('/items/out-of-stock'),
};

// Slips API
axiosApi.slips = {
  getAll: (params = {}) => axiosApi.get('/slips', { params }),
  getById: (id) => axiosApi.get(`/slips/${id}`),
  create: (data) => axiosApi.post('/slips', data),
  update: (id, data) => axiosApi.put(`/slips/${id}`, data),
  delete: (id) => axiosApi.delete(`/slips/${id}`),
};

// Income API - FIXED: Added all income endpoints
axiosApi.income = {
  getAll: (params = {}) => axiosApi.get('/income', { params }),
  getById: (id) => axiosApi.get(`/income/${id}`),
  create: (data) => axiosApi.post('/income', data),
  update: (id, data) => axiosApi.put(`/income/${id}`, data),
  delete: (id) => axiosApi.delete(`/income/${id}`),
  getSummary: () => axiosApi.get('/income/summary/overview'),
  getToday: () => axiosApi.get('/income/today'), // Fixed: Changed from getDaily to getToday
  getWeekly: () => axiosApi.get('/income/weekly'),
  getMonthly: () => axiosApi.get('/income/monthly'),
  getTopProducts: (params = {}) => axiosApi.get('/income/top-products', { params }),
};

// Analytics API
axiosApi.analytics = {
  getDashboard: () => axiosApi.get('/analytics/dashboard'),
  getSalesTrends: (params = {}) => axiosApi.get('/analytics/sales-trends', { params }),
};

// Test all endpoints quickly
export const testAllEndpoints = async () => {
  const tests = [
    { name: 'Backend Connection', fn: axiosApi.testConnection },
    { name: 'Items', fn: () => axiosApi.items.getAll({ limit: 1 }) },
    { name: 'Income', fn: () => axiosApi.income.getAll({ limit: 1 }) },
    { name: 'Slips', fn: () => axiosApi.slips.getAll({ limit: 1 }) },
    { name: 'Analytics', fn: axiosApi.analytics.getDashboard },
  ];

  const results = [];
  for (const test of tests) {
    try {
      const res = await test.fn();
      results.push({
        name: test.name,
        status: '✅ OK',
        data: res.data,
      });
    } catch (err) {
      results.push({ 
        name: test.name, 
        status: '❌ Failed', 
        error: err.response?.data?.error || err.message 
      });
    }
  }
  return results;
};

export default axiosApi;