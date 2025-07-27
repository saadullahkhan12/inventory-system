import * as React from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();
  const [value, setValue] = React.useState(location.pathname);

  React.useEffect(() => {
    setValue(location.pathname);
  }, [location.pathname]);

  return (
    <Box className="w-full flex justify-center py-4 bg-white shadow-md rounded-xl">
      <Tabs
        value={value}
        onChange={(event, newValue) => setValue(newValue)}
        textColor="primary"
        indicatorColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        className="max-w-screen-md w-full"
      >
        <Tab label="Inventory" value="/Inventory" component={Link} to="/Inventory" />
        <Tab label="Income" value="/Icome" component={Link} to="/Icome" />
        <Tab label="Slips" value="/Slips" component={Link} to="/Slips" />
      </Tabs>
    </Box>
  );
}

export default Header;
