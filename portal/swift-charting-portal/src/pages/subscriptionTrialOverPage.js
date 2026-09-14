import { Helmet } from 'react-helmet-async';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
import { Typography, Container, Box, Paper } from '@mui/material';
import CustomButton from 'src/components/CustomButton';

// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'linear-gradient(135deg, #d4e8fd 0%, #F9FAFB 100%)',
}));

const StyledContent = styled(Paper)(({ theme }) => ({
  maxWidth: 680,
  margin: 'auto',
  padding: theme.spacing(6),
  textAlign: 'center',
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[6],
  backgroundColor: theme.palette.grey[200],
}));

// ----------------------------------------------------------------------

export default function SubscriptionTrialOver() {
 return (
  <>
    <Helmet>
      <title>Trial Period Ended</title>
    </Helmet>

    <StyledRoot>
      <Container>
        <StyledContent>
          <Typography variant="h3" gutterBottom>
            🎉 Your Free Trial Has Ended
          </Typography>

          <Typography sx={{ color: 'text.secondary', mb: 4, fontSize: 16 }}>
            We hope you enjoyed exploring our platform during your trial.  
            To continue accessing all features without interruption, please upgrade to a paid subscription.
          </Typography>

          <CustomButton
            to="/"
            size="large"
            label="Upgrade Now"
            component={RouterLink}
            sx={{
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: (theme) => theme.shadows[4],
              },
            }}
          />
        </StyledContent>
      </Container>
    </StyledRoot>
  </>
);

}
