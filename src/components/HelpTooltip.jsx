import React from 'react';
import { Tooltip, IconButton } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

function HelpTooltip({ title, content }) {
  return (
    <Tooltip 
      title={content || title}
      arrow
      placement="top"
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.9)',
            fontSize: '0.875rem',
            maxWidth: 300,
            '& .MuiTooltip-arrow': {
              color: 'rgba(0, 0, 0, 0.9)',
            },
          },
        },
      }}
    >
      <IconButton size="small" sx={{ ml: 0.5, color: 'text.secondary' }}>
        <HelpOutlineIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}

export default HelpTooltip;

