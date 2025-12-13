import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography, Fade } from '@mui/material';
import { keyframes } from '@emotion/react';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

function StartupAnimation({ children, isLoading = false }) {
  const [showContent, setShowContent] = useState(false);
  const [skipAnimation, setSkipAnimation] = useState(false);

  useEffect(() => {
    // Check if animation was skipped before
    const wasSkipped = sessionStorage.getItem('animationSkipped');
    
    if (wasSkipped || skipAnimation) {
      setShowContent(true);
      return;
    }

    // Show loading animation for max 1.2s
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, [skipAnimation]);

  const handleSkip = () => {
    setSkipAnimation(true);
    sessionStorage.setItem('animationSkipped', 'true');
  };

  if (skipAnimation || showContent) {
    return <>{children}</>;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        animation: `${fadeIn} 0.5s ease-in`,
      }}
      role="status"
      aria-live="polite"
      aria-label="Loading application"
    >
      <Fade in={true} timeout={500}>
        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              animation: `${pulse} 1.5s ease-in-out infinite`,
              mb: 3
            }}
          >
            <CircularProgress 
              size={60} 
              thickness={4}
              sx={{
                color: 'primary.main'
              }}
            />
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2,
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold'
            }}
          >
            Loading Inventory System...
          </Typography>
          <Typography 
            variant="body2" 
            color="textSecondary"
            sx={{ cursor: 'pointer', textDecoration: 'underline' }}
            onClick={handleSkip}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSkip();
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Skip loading animation"
          >
            Skip
          </Typography>
        </Box>
      </Fade>
    </Box>
  );
}

export default StartupAnimation;

