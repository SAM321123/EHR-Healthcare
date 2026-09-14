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

export default function SubscriptionNotExists() {
  return (
    <>
      <Helmet>
        <title>Subscription Inactive</title>
      </Helmet>

      <StyledRoot>
        <Container>
          <StyledContent>
            <Typography variant="h3" gutterBottom>
              🚫 Subscription Deactivated!
            </Typography>

            <Typography sx={{ color: 'text.secondary', mb: 4 }}>
              Your subscription is currently inactive. Please activate your plan to continue accessing the platform's features.
            </Typography>

            <CustomButton
              to="/"
              size="large"
              label="Activate Subscription"
              component={RouterLink}
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 'bold',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: theme => theme.shadows[4],
                },
              }}
            />
          </StyledContent>
        </Container>
      </StyledRoot>
    </>
  );
}
