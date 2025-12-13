import React, { useState } from 'react';
import {
  Box, Paper, Typography, Button, List, ListItem, ListItemIcon, ListItemText,
  Collapse, IconButton
} from '@mui/material';
import {
  CheckCircle, ExpandMore, ExpandLess, Close, Inventory2, Receipt, TrendingUp, Add
} from '@mui/icons-material';

function GettingStarted({ onClose }) {
  const [open, setOpen] = useState(true);
  const [dismissed, setDismissed] = useState(
    localStorage.getItem('gettingStartedDismissed') === 'true'
  );

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('gettingStartedDismissed', 'true');
    if (onClose) onClose();
  };

  if (dismissed) return null;

  const steps = [
    {
      icon: <Inventory2 />,
      title: 'Add Your First Item',
      description: 'Go to "Add Items" to add products to your inventory',
      completed: false
    },
    {
      icon: <Receipt />,
      title: 'Create a Sales Slip',
      description: 'Create a slip when you make a sale',
      completed: false
    },
    {
      icon: <TrendingUp />,
      title: 'View Analytics',
      description: 'Check the Dashboard to see your sales and inventory stats',
      completed: false
    },
    {
      icon: <Add />,
      title: 'Manage Inventory',
      description: 'Edit items, update stock, and adjust prices from the Inventory page',
      completed: false
    }
  ];

  return (
    <Collapse in={open}>
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          position: 'relative'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Getting Started
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Welcome! Here's a quick guide to get you started with your inventory system.
            </Typography>
          </Box>
          <IconButton
            onClick={handleDismiss}
            sx={{ color: 'white' }}
            size="small"
          >
            <Close />
          </IconButton>
        </Box>

        <List sx={{ color: 'white' }}>
          {steps.map((step, index) => (
            <ListItem key={index} sx={{ px: 0 }}>
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                {step.completed ? (
                  <CheckCircle />
                ) : (
                  <Box sx={{ 
                    width: 24, 
                    height: 24, 
                    borderRadius: '50%', 
                    border: '2px solid white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 'bold'
                  }}>
                    {index + 1}
                  </Box>
                )}
              </ListItemIcon>
              <ListItemText
                primary={step.title}
                secondary={step.description}
                primaryTypographyProps={{ fontWeight: 'medium' }}
                secondaryTypographyProps={{ sx: { opacity: 0.9, fontSize: '0.875rem' } }}
              />
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.9)',
              }
            }}
            onClick={handleDismiss}
          >
            Got it!
          </Button>
        </Box>
      </Paper>
    </Collapse>
  );
}

export default GettingStarted;

