import React from 'react';
import { Alert, Box, Typography, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { DEMO_CONFIG } from '../../config/productionDemo';

/**
 * Demo Mode Banner Component
 * Shows a prominent banner when the app is running in demo mode
 */
const DemoBanner = ({ onDismiss }) => {
  const [dismissed, setDismissed] = React.useState(false);

  if (!DEMO_CONFIG.showBanner || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) onDismiss();
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        width: '100%'
      }}
    >
      <Alert
        severity="info"
        sx={{
          borderRadius: 0,
          backgroundColor: '#1976d2',
          color: 'white',
          '& .MuiAlert-icon': {
            color: 'white'
          },
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
        action={
          <IconButton
            size="small"
            onClick={handleDismiss}
            sx={{ color: 'white' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '100%'
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {DEMO_CONFIG.bannerText}
          </Typography>
        </Box>
      </Alert>
    </Box>
  );
};

export default DemoBanner;
