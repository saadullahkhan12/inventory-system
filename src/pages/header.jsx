import * as React from 'react';
import { Tabs, Tab, Box, Paper } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();
  const [value, setValue] = React.useState(location.pathname);

  React.useEffect(() => {
    setValue(location.pathname);
  }, [location.pathname]);

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
      <Tabs
        value={value}
        onChange={(event, newValue) => setValue(newValue)}
        textColor="primary"
        indicatorColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        centered
        sx={{
           '& .MuiTabs-indicator': {
      display: 'none', // 🔥 This removes the underline
    },
          '& .MuiTab-root': {
            fontWeight: 500,
            fontSize: '1rem',
            borderRadius: 2,
            mx: 1,
            textTransform: 'none',
          },
          '& .Mui-selected': {
            backgroundColor: 'primary.main',
            color: '#fff !important',
          },
        }}
      >
        <Tab label="Inventory" value="/Inventory" component={Link} to="/Inventory" />
        <Tab label="Income" value="/Income" component={Link} to="/Income" />
        <Tab label="Slips" value="/Slips" component={Link} to="/Slips" />
      </Tabs>
    </Paper>
  );
}

export default Header;
