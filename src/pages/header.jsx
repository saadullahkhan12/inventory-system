import * as React from 'react';
import { Tabs, Tab, Paper } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import saeedLogo from '../assets/ChatGPT Image Aug 6, 2025, 02_36_45 AM.png';

function Header() {
  const location = useLocation();
  
  // Function to determine the active tab value
  const getActiveTabValue = () => {
    const path = location.pathname;
    
    // If path starts with /slips/ (individual slip pages), highlight "View Slips" tab
    if (path.startsWith('/slips/')) {
      return '/slippage';
    }
    
    // For exact matches
    const validPaths = ['/inventory', '/additems', '/income', '/slips', '/slippage'];
    if (validPaths.includes(path)) {
      return path;
    }
    
    // Default to inventory if no match
    return false; // Return false instead of a path to avoid MUI warning
  };

  const value = getActiveTabValue();

  return (
    <Paper 
      elevation={4}
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backdropFilter: 'blur(8px)',
        bgcolor: 'rgba(255,255,255,0.8)',
        borderRadius: 3,
        mx: 'auto',
        my: 2,
        px: 2,
        py: 1,
        width: '100%',
        maxWidth: '1000px',
      }}
    >
      <div className="header-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}> 
        <Tabs
          value={value}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTabs-indicator': {
              display: 'none',
            },
            '& .MuiTab-root': {
              fontWeight: 500,
              fontSize: '1rem',
              borderRadius: 2,
              mx: 1,
              textTransform: 'none',
              minHeight: '48px',
            },
            '& .Mui-selected': {
              backgroundColor: 'primary.main',
              color: '#fff !important',
            },
          }}
        >
          <Tab 
            label="Inventory" 
            value="/inventory" 
            component={Link} 
            to="/inventory" 
          />
          <Tab 
            label="Add Items" 
            value="/additems" 
            component={Link} 
            to="/additems" 
          />
          <Tab 
            label="Income" 
            value="/income" 
            component={Link} 
            to="/income" 
          />
          <Tab 
            label="Create Slip" 
            value="/slips" 
            component={Link} 
            to="/slips" 
          />
          <Tab 
            label="View Slips" 
            value="/slippage" 
            component={Link} 
            to="/slippage" 
          />
           <Tab 
            label="Search Slips" 
            value="/search-slips" 
            component={Link} 
            to="/search-slips" 
          />
        </Tabs>

        <img src={saeedLogo} alt="Saeed Autos and Bike" style={{ width: 70, marginRight: 2 }} />
      </div>
    </Paper>
  );
}

export default Header;