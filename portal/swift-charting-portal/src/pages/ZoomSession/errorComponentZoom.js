import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import logoIcon from 'src/assets/images/logoMain.png'; // replace with the path to your default logo icon
import { getImageUrl } from 'src/lib/utils'; // adjust the import path as needed
import palette from 'src/theme/palette';
import { getInitialRoute } from 'src/routes';

const ErrorComponent = ({ practiceSetting }={}) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    const loginUserRole = localStorage.getItem('userRole');
    if(loginUserRole){
    navigate(getInitialRoute(loginUserRole));
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: palette.background.paper }}>
      
      {/* Header */}
      <Box sx={{ height: 80, display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid #ddd' }}>
        <img
          src={practiceSetting?.logo?.file ? getImageUrl(practiceSetting?.logo?.file) : logoIcon}
          style={{ width: '90px', height: '60px' }}
          alt="logo"
        />
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <Typography variant="h4" fontWeight="bold" color="textPrimary" gutterBottom>
          You are not authorized
        </Typography>
        <Typography variant="body1" color="textSecondary" mb={3}>
          Please connect to your clinic to join the session.
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleGoHome}
        >
          Go Home
        </Button>
      </Box>
    </Box>
  );
};

export default ErrorComponent;
