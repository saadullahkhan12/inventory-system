import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Inventory from './pages/inventory';
import AddItems from './pages/addItems';
import Header from './pages/header';
import DashboardLayoutBasic from './pages/DashboardLayoutBasic';
import Dashboard from './pages/Dashboard';
import Slips from './pages/slips';
import Income from './pages/icome';
import SearchSlip from './pages/searchSlip';
import ViewSlips from './pages/viewslips';
import StartupAnimation from './components/StartupAnimation';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Router>
        <StartupAnimation isLoading={isLoading}>
          <Header />
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/additems" element={<AddItems />} />
            <Route path="/income" element={<Income />} />
            <Route path="/slips/:slipId" element={<ViewSlips />} />
            <Route path="/slips" element={<Slips />} />
            <Route path="/slippage" element={<ViewSlips />} />
            <Route path="/pagecontent" element={<DashboardLayoutBasic />} />
            <Route path="/search-slips" element={<SearchSlip />} />
            <Route path="/" element={<Navigate to="/inventory" replace />} />
          </Routes>
        </StartupAnimation>
      </Router>
    </>
  );
}

export default App;