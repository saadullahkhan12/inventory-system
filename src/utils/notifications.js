import { useState } from 'react';

// Material-UI based notification utility
// This works with the Snackbar component from Material-UI

// Simple notification function that can be used with Material-UI Snackbar
export const showNotification = (type, message) => {
  // This function will work with Material-UI Snackbar
  // You'll need to use it with a Snackbar component in your component
  
  // For now, we'll use console notifications as fallback
  const timestamp = new Date().toLocaleTimeString();
  const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
  
  switch (type) {
    case 'success':
      console.log(`✅ ${logMessage}`);
      break;
    case 'error':
      console.error(`❌ ${logMessage}`);
      break;
    case 'warning':
      console.warn(`⚠️ ${logMessage}`);
      break;
    case 'info':
      console.info(`ℹ️ ${logMessage}`);
      break;
    default:
      console.log(logMessage);
  }
  
  // Return the notification data for use with Snackbar
  return {
    open: true,
    message: message,
    severity: type,
  };
};

// Alternative: Direct Snackbar notification hook
export const useNotification = () => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const showNotification = (type, message) => {
    setNotification({
      open: true,
      message: message,
      severity: type,
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return {
    notification,
    showNotification,
    hideNotification
  };
};

// Console notification for debugging
export const showConsoleNotification = (type, message) => {
  const timestamp = new Date().toLocaleTimeString();
  const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
  
  switch (type) {
    case 'success':
      console.log(`✅ ${logMessage}`);
      break;
    case 'error':
      console.error(`❌ ${logMessage}`);
      break;
    case 'warning':
      console.warn(`⚠️ ${logMessage}`);
      break;
    case 'info':
      console.info(`ℹ️ ${logMessage}`);
      break;
    default:
      console.log(logMessage);
  }
};