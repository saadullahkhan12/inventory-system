import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Inventory from './pages/inventory';
import AddItems from './pages/addItems';
import Header from './pages/header';
import DashboardLayoutBasic from './pages/DashboardLayoutBasic';
import Slips from './pages/slips';
import Income from './pages/icome';
import SlipPage from './pages/slippage';

function App() {
  return (
    <>
      <Router>
        <Header />
        <Routes>
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/additems" element={<AddItems />} />
          <Route path="/income" element={<Income />} />
          <Route path="/slips" element={<Slips />} />
          <Route path="/slippage" element={<SlipPage />} />
          <Route path="/pagecontent" element={<DashboardLayoutBasic />} />
          <Route path="/" element={<Navigate to="/inventory" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;