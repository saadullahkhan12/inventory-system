import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Correct import from 'react-router-dom'

import './App.css';

import Inventory from './pages/inventory'; // Corrected import path

import Header from './pages/header'; // Fixed typo: 'Hedaer' to 'Header'
import DashboardLayoutBasic from './pages/DashboardLayoutBasic';
import Slips from './pages/slips';
import Income from './pages/icome'; // Corrected import path


function App() {
  return (
    <>
      <Router>
        <Header /> {/* Corrected Header */}
        <Routes>
          <Route path="/Slips" element={<Slips/>} />
          <Route path="/income" element={<Income/>} />

          <Route path="/Inventory" element={<Inventory />} />

        </Routes>
      </Router>
    </>
  );
}

export default App;
