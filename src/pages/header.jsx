  import * as React from 'react';
  import Box from '@mui/material/Box';
  import Avatar from '@mui/material/Avatar';

  import IconButton from '@mui/material/IconButton';
  import Typography from '@mui/material/Typography';
  
  
  import { Link } from 'react-router-dom';



  function Hedaer() {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };
    return (
      <>
      
        <Box  sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
            
        <Link to="/Inventory" > <Typography className='menu-text' sx={{ minWidth: 100 }}>Inventory</Typography> </Link>
        <Link to="/Icome" > <Typography className='menu-text' sx={{ minWidth: 100 }}>Icome</Typography> </Link>
        <Link to="/Slips" > <Typography className='menu-text' sx={{ minWidth: 100 }}>Slip</Typography> </Link>
       
            
        
         
        </Box>
      
      </>
    )
  }

  export default Hedaer
