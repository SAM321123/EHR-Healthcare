import {
  Box,
  Container,
  Stack,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { AccountProfileDetails } from '../../sections/account/account-profile-details';

const Account = () => (
  <Box
    component="main"
    sx={{
      flexGrow: 1,
      py: 1,
    }}
  >
    <Container component="main" maxWidth="lg">
      <Stack spacing={3}>
        <div>
          <Grid  spacing={3} sx={{ justifyContent: 'center' }}>
            <Grid xs={12} md={6} lg={8}>
              <AccountProfileDetails />
            </Grid>
          </Grid>
        </div>
      </Stack>
    </Container>
  </Box>
);

export default Account;
